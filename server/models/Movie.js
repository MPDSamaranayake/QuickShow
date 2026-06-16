import mongoose from 'mongoose';

const castSchema = new mongoose.Schema({
    name: { type: String, required: true },
    profile_path: { type: String, required: true }
});

const genreSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    name: { type: String, required: true }
});

const movieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    overview: { type: String, required: true },
    poster_path: { type: String, required: true },
    backdrop_path: { type: String, required: true },
    genres: { type: [genreSchema], required: true },
    casts: { type: [castSchema], required: true },
    release_date: { type: String, required: true },
    original_language: { type: String, required: true },
    tagline: { type: String, default: '' },
    vote_average: { type: Number, default: 0 },
    vote_count: { type: Number, default: 0 },
    runtime: { type: Number, required: true },
    status: { type: String, enum: ['upcoming', 'running', 'ended'], default: 'running' }
}, { timestamps: true });

const Movie = mongoose.model('Movie', movieSchema);

export default Movie;
