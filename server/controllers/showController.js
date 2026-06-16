import Show from '../models/Show.js';
import Movie from '../models/Movie.js';

// @desc    Create new show(s) (supports single or bulk)
// @route   POST /api/shows
// @access  Private/Admin
export const createShow = async (req, res) => {
    try {
        const { shows } = req.body; // Expects an array or single show under body

        if (shows && Array.isArray(shows)) {
            // Bulk insertion
            const createdShows = await Show.insertMany(shows);
            return res.status(201).json(createdShows);
        }

        const { movie, showDateTime, showPrice, theater } = req.body;
        
        // Find if movie exists
        const movieExists = await Movie.findById(movie);
        if (!movieExists) {
            return res.status(404).json({ message: 'Movie not found.' });
        }

        const show = await Show.create({
            movie,
            showDateTime,
            showPrice,
            theater
        });

        res.status(201).json(show);
    } catch (error) {
        console.error('Create Show Error:', error);
        res.status(500).json({ message: 'Error creating show.' });
    }
};

// @desc    Get all shows
// @route   GET /api/shows
// @access  Public
export const getAllShows = async (req, res) => {
    try {
        const shows = await Show.find({}).populate('movie');
        res.json(shows);
    } catch (error) {
        console.error('Get All Shows Error:', error);
        res.status(500).json({ message: 'Error fetching shows.' });
    }
};

// @desc    Get show by ID (including populated movie info)
// @route   GET /api/shows/:id
// @access  Public
export const getShowById = async (req, res) => {
    try {
        const show = await Show.findById(req.params.id).populate('movie');
        if (!show) {
            return res.status(404).json({ message: 'Show not found.' });
        }
        res.json(show);
    } catch (error) {
        console.error('Get Show By ID Error:', error);
        res.status(500).json({ message: 'Error fetching show details.' });
    }
};

// @desc    Update a show
// @route   PUT /api/shows/:id
// @access  Private/Admin
export const updateShow = async (req, res) => {
    try {
        const show = await Show.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!show) {
            return res.status(404).json({ message: 'Show not found.' });
        }
        res.json(show);
    } catch (error) {
        console.error('Update Show Error:', error);
        res.status(500).json({ message: 'Error updating show.' });
    }
};

// @desc    Delete a show
// @route   DELETE /api/shows/:id
// @access  Private/Admin
export const deleteShow = async (req, res) => {
    try {
        const show = await Show.findByIdAndDelete(req.params.id);
        if (!show) {
            return res.status(404).json({ message: 'Show not found.' });
        }
        res.json({ message: 'Show deleted successfully.' });
    } catch (error) {
        console.error('Delete Show Error:', error);
        res.status(500).json({ message: 'Error deleting show.' });
    }
};
