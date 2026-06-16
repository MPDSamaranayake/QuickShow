import Movie from '../models/Movie.js';
import Show from '../models/Show.js';

// @desc    Create a new movie
// @route   POST /api/movies
// @access  Private/Admin
export const createMovie = async (req, res) => {
    try {
        const movie = await Movie.create(req.body);
        res.status(201).json(movie);
    } catch (error) {
        console.error('Create Movie Error:', error);
        res.status(500).json({ message: 'Error creating movie.' });
    }
};

// @desc    Get all movies with filters & search
// @route   GET /api/movies
// @access  Public
export const getAllMovies = async (req, res) => {
    try {
        const { search, genre, language, status } = req.query;
        let query = {};

        // Search by title (case-insensitive)
        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        // Filter by genre name
        if (genre) {
            query['genres.name'] = { $regex: new RegExp(`^${genre}$`, 'i') };
        }

        // Filter by language
        if (language) {
            query.original_language = { $regex: new RegExp(`^${language}$`, 'i') };
        }

        // Filter by status (upcoming, running, ended)
        if (status) {
            query.status = status;
        }

        const movies = await Movie.find(query).sort({ release_date: -1 });
        res.json(movies);
    } catch (error) {
        console.error('Get All Movies Error:', error);
        res.status(500).json({ message: 'Error fetching movies.' });
    }
};

// @desc    Get movie details + shows grouped by date
// @route   GET /api/movies/:id
// @access  Public
export const getMovieById = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found.' });
        }

        // Fetch all shows for this movie
        const shows = await Show.find({ movie: movie._id });

        // Group shows by date (YYYY-MM-DD)
        const dateTime = {};
        shows.forEach(show => {
            const dateStr = show.showDateTime.toISOString().split('T')[0];
            if (!dateTime[dateStr]) {
                dateTime[dateStr] = [];
            }
            dateTime[dateStr].push({
                time: show.showDateTime.toISOString(),
                showId: show._id.toString()
            });
        });

        // Sort times chronologically for each date
        Object.keys(dateTime).forEach(date => {
            dateTime[date].sort((a, b) => new Date(a.time) - new Date(b.time));
        });

        res.json({
            movie,
            dateTime
        });
    } catch (error) {
        console.error('Get Movie By ID Error:', error);
        res.status(500).json({ message: 'Error fetching movie details.' });
    }
};

// @desc    Update a movie
// @route   PUT /api/movies/:id
// @access  Private/Admin
export const updateMovie = async (req, res) => {
    try {
        const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found.' });
        }
        res.json(movie);
    } catch (error) {
        console.error('Update Movie Error:', error);
        res.status(500).json({ message: 'Error updating movie.' });
    }
};

// @desc    Delete a movie
// @route   DELETE /api/movies/:id
// @access  Private/Admin
export const deleteMovie = async (req, res) => {
    try {
        const movie = await Movie.findByIdAndDelete(req.params.id);
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found.' });
        }
        // Delete shows associated with this movie
        await Show.deleteMany({ movie: movie._id });
        res.json({ message: 'Movie and its associated shows deleted successfully.' });
    } catch (error) {
        console.error('Delete Movie Error:', error);
        res.status(500).json({ message: 'Error deleting movie.' });
    }
};
