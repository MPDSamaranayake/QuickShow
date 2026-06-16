import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      console.warn("MONGODB_URI is not set; starting server without a database connection");
      return false;
    }

    await mongoose.connect(mongoUri);

    console.log("MongoDB Connected");
    return true;
  } catch (error) {
    console.log("Failed to connect to MongoDB:", error.message);
    console.warn("Starting server without a database connection");
    return false;
  }
};

export default connectDB;