import Movie from '../models/Movie.js';
import Show from '../models/Show.js';
import Rating from '../models/Rating.js';

// @desc    Create a new movie
// @route   POST /api/movies
// @access  Private/Admin
export const createMovie = async (req, res) => {
    try {
        const movieData = { ...req.body };

        // Handle uploaded image file
        if (req.file) {
            movieData.posterUrl = `${req.protocol}://${req.get('host')}/uploads/movies/${req.file.filename}`;
            movieData.poster_path = movieData.posterUrl;
            movieData.backdrop_path = movieData.posterUrl;
        } else if (movieData.posterUrl) {
            movieData.poster_path = movieData.posterUrl;
            movieData.backdrop_path = movieData.posterUrl;
        }

        // Map fields for backward compatibility
        if (movieData.description) {
            movieData.overview = movieData.description;
        }
        if (movieData.genre) {
            movieData.genres = [{ id: Date.now(), name: movieData.genre }];
        }
        if (movieData.duration) {
            movieData.runtime = Number(movieData.duration);
        }
        if (movieData.releaseDate) {
            movieData.release_date = new Date(movieData.releaseDate).toISOString().split('T')[0];
        }

        // Map status
        if (movieData.status) {
            if (movieData.status === 'running') {
                movieData.status = 'now_showing';
            } else if (movieData.status === 'upcoming') {
                movieData.status = 'coming_soon';
            }
        } else {
            movieData.status = 'now_showing';
        }

        // Fallbacks
        if (!movieData.casts) {
            movieData.casts = [];
        }
        if (!movieData.original_language) {
            movieData.original_language = 'en';
        }

        const movie = await Movie.create(movieData);
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

        // Filter by genre name (supports both new single string genre and array genres)
        if (genre) {
            query.$or = [
                { 'genres.name': { $regex: new RegExp(`^${genre}$`, 'i') } },
                { genre: { $regex: new RegExp(`^${genre}$`, 'i') } }
            ];
        }

        // Filter by language
        if (language) {
            query.original_language = { $regex: new RegExp(`^${language}$`, 'i') };
        }

        // Filter by status (upcoming, running, ended, now_showing, coming_soon)
        if (status) {
            if (status === 'now_showing' || status === 'running') {
                query.status = { $in: ['now_showing', 'running'] };
            } else if (status === 'coming_soon' || status === 'upcoming') {
                query.status = { $in: ['coming_soon', 'upcoming'] };
            } else {
                query.status = status;
            }
        }

        const movies = await Movie.find(query).sort({ release_date: -1 });
        const movieIds = movies.map((movie) => movie._id);
        const shows = await Show.find({ movie: { $in: movieIds } }).sort({ createdAt: -1 });

        const latestShowByMovieId = new Map();
        shows.forEach((show) => {
            const movieId = show.movie.toString();
            if (!latestShowByMovieId.has(movieId)) {
                latestShowByMovieId.set(movieId, show);
            }
        });

        const enrichedMovies = movies.map((movie) => {
            const latestShow = latestShowByMovieId.get(movie._id.toString());

            return {
                ...movie.toObject(),
                showName: latestShow?.showName || movie.title,
                showArtwork: latestShow?.showArtwork || movie.backdrop_path,
            };
        });

        res.json(enrichedMovies);
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

        const latestShow = await Show.findOne({ movie: movie._id }).sort({ createdAt: -1 });

        res.json({
            movie: {
                ...movie.toObject(),
                showName: latestShow?.showName || movie.title,
                showArtwork: latestShow?.showArtwork || movie.backdrop_path,
            },
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
        await Rating.deleteMany({ movie: movie._id });
        res.json({ message: 'Movie and its associated shows deleted successfully.' });
    } catch (error) {
        console.error('Delete Movie Error:', error);
        res.status(500).json({ message: 'Error deleting movie.' });
    }
};

// @desc    Rate a movie (create or update user rating)
// @route   POST /api/movies/:id/rate
// @access  Private
export const rateMovie = async (req, res) => {
    try {
        const { rating } = req.body;
        const userId = req.user._id;
        const movieId = req.params.id;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
        }

        const movie = await Movie.findById(movieId);
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found.' });
        }

        // Upsert the user's rating
        await Rating.findOneAndUpdate(
            { user: userId, movie: movieId },
            { rating },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // Recalculate average from all ratings for this movie
        const allRatings = await Rating.find({ movie: movieId });
        const totalRatings = allRatings.length;
        const avgRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings;

        movie.vote_average = Math.round(avgRating * 10) / 10;
        movie.vote_count = totalRatings;
        await movie.save();

        res.json({
            message: 'Rating submitted successfully.',
            userRating: rating,
            vote_average: movie.vote_average,
            vote_count: movie.vote_count
        });
    } catch (error) {
        console.error('Rate Movie Error:', error);
        res.status(500).json({ message: 'Error submitting rating.' });
    }
};

// @desc    Get current user's rating for a movie
// @route   GET /api/movies/:id/my-rating
// @access  Private
export const getMyRating = async (req, res) => {
    try {
        const userId = req.user._id;
        const movieId = req.params.id;

        const ratingDoc = await Rating.findOne({ user: userId, movie: movieId });
        res.json({ userRating: ratingDoc ? ratingDoc.rating : null });
    } catch (error) {
        console.error('Get My Rating Error:', error);
        res.status(500).json({ message: 'Error fetching rating.' });
    }
};
