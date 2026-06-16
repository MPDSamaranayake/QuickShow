import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    bookingId: { type: String, required: true, unique: true },
    user: { type: String, required: true }, // Clerk ID or Custom User ID
    show: { type: mongoose.Schema.Types.ObjectId, ref: 'Show', required: true },
    bookedSeats: { type: [String], required: true },
    amount: { type: Number, required: true },
    isPaid: { type: Boolean, default: false },
    paymentDetails: {
        transactionId: { type: String },
        status: { type: String },
        paidAt: { type: Date }
    },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' }
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
