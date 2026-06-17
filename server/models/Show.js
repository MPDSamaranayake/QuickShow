import mongoose from 'mongoose';

const lockedSeatSchema = new mongoose.Schema({
    seatNumber: { type: String, required: true },
    userId: { type: String, required: true },
    lockedAt: { type: Date, default: Date.now, expires: 300 } // 5 minutes expiration (Mongoose TTL index)
});

const showSchema = new mongoose.Schema({
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    showName: { type: String, required: true },
    showArtwork: { type: String, required: true },
    theater: { type: mongoose.Schema.Types.ObjectId, ref: 'Theater' },
    showDateTime: { type: Date, required: true },
    showPrice: { type: Number, required: true },
    occupiedSeats: { type: Map, of: String, default: {} }, // seatNumber -> userId / bookingId
    lockedSeats: { type: [lockedSeatSchema], default: [] }
}, { timestamps: true });

const Show = mongoose.model('Show', showSchema);

export default Show;
