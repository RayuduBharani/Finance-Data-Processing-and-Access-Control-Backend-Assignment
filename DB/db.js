const mongoose = require('mongoose');

// DB connection asyncronously
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/Zorvyn");
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1); 
    }
};

module.exports = { connectDB };