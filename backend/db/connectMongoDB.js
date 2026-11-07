import mongoose from "mongoose";

// Returns true when connected, false otherwise (the server keeps running either way,
// so public pages like profile search still work without a database).
export default async function connectMongoDB() {
  if (!process.env.MONGO_URL) {
    console.log("⚠️  MONGO_URL is not set in .env - login, likes and bookmarks are disabled.");
    return false;
  }

  try {
    await mongoose.connect(process.env.MONGO_URL, {
      serverSelectionTimeoutMS: 10000, // fail fast instead of hanging for 30s
    });
    console.log("MongoDB connected successfully.");
    return true;
  } catch (error) {
    console.log("Error connecting to MongoDB:", error.message);
    console.log(
      "   Check MONGO_URL in .env and, on MongoDB Atlas, allow your IP under Network Access."
    );
    return false;
  }
}
