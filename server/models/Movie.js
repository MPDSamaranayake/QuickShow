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
    overview: { type: String },
    description: { type: String },
    poster_path: { type: String },
    posterUrl: { type: String },
    backdrop_path: { type: String },
    genre: { type: String },
    genres: { type: [genreSchema], default: [] },
    casts: { type: [castSchema], default: [] },
    release_date: { type: String },
    releaseDate: { type: Date },
    original_language: { type: String, default: 'en' },
    tagline: { type: String, default: '' },
    vote_average: { type: Number, default: 0 },
    vote_count: { type: Number, default: 0 },
    runtime: { type: Number },
    duration: { type: Number },
    status: { 
        type: String, 
        enum: ['upcoming', 'running', 'ended', 'now_showing', 'coming_soon'], 
        default: 'now_showing' 
    }
}, { timestamps: true });

const Movie = mongoose.model('Movie', movieSchema);

export default Movie;
