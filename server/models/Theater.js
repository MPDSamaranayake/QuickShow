import mongoose from 'mongoose';

const screenSchema = new mongoose.Schema({
    name: { type: String, required: true },
    rows: { type: [String], default: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'] }, // Row letters
    seatCount: { type: Number, default: 90 } // e.g. 10 rows of 9 seats
});

const theaterSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    screens: { type: [screenSchema], default: [{ name: 'Screen 1', seatCount: 90 }] }
}, { timestamps: true });

const Theater = mongoose.model('Theater', theaterSchema);

export default Theater;
