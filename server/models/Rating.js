import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
    user: { type: String, required: true }, // Clerk or custom user ID
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 }
}, { timestamps: true });

// Each user can only rate a movie once
ratingSchema.index({ user: 1, movie: 1 }, { unique: true });

const Rating = mongoose.model('Rating', ratingSchema);

export default Rating;
