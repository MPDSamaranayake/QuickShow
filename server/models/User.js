import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    _id: {type: String, required: true},
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    image: {type: String, default: ''},
    password: {type: String}, // Hashed password, only if custom auth is used
    role: {type: String, enum: ['user', 'admin'], default: 'user'},
    favourites: {type: [String], default: []}, // Array of movie IDs
    resetPasswordToken: {type: String},
    resetPasswordExpire: {type: Date}
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;