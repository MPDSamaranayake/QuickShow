import Theater from '../models/Theater.js';

// @desc    Create a new theater
// @route   POST /api/theaters
// @access  Private/Admin
export const createTheater = async (req, res) => {
    try {
        const theater = await Theater.create(req.body);
        res.status(201).json(theater);
    } catch (error) {
        console.error('Create Theater Error:', error);
        res.status(500).json({ message: 'Error creating theater.' });
    }
};

// @desc    Get all theaters
// @route   GET /api/theaters
// @access  Public
export const getAllTheaters = async (req, res) => {
    try {
        const theaters = await Theater.find({});
        res.json(theaters);
    } catch (error) {
        console.error('Get All Theaters Error:', error);
        res.status(500).json({ message: 'Error fetching theaters.' });
    }
};

// @desc    Get theater details
// @route   GET /api/theaters/:id
// @access  Public
export const getTheaterById = async (req, res) => {
    try {
        const theater = await Theater.findById(req.params.id);
        if (!theater) {
            return res.status(404).json({ message: 'Theater not found.' });
        }
        res.json(theater);
    } catch (error) {
        console.error('Get Theater By ID Error:', error);
        res.status(500).json({ message: 'Error fetching theater details.' });
    }
};

// @desc    Update a theater
// @route   PUT /api/theaters/:id
// @access  Private/Admin
export const updateTheater = async (req, res) => {
    try {
        const theater = await Theater.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!theater) {
            return res.status(404).json({ message: 'Theater not found.' });
        }
        res.json(theater);
    } catch (error) {
        console.error('Update Theater Error:', error);
        res.status(500).json({ message: 'Error updating theater.' });
    }
};

// @desc    Delete a theater
// @route   DELETE /api/theaters/:id
// @access  Private/Admin
export const deleteTheater = async (req, res) => {
    try {
        const theater = await Theater.findByIdAndDelete(req.params.id);
        if (!theater) {
            return res.status(404).json({ message: 'Theater not found.' });
        }
        res.json({ message: 'Theater deleted successfully.' });
    } catch (error) {
        console.error('Delete Theater Error:', error);
        res.status(500).json({ message: 'Error deleting theater.' });
    }
};
