const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
dotenv.config();
const url = process.env.db_uri;
const dbName = "job-collection";

const connectOptions = {
  serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds if no server is available
  connectTimeoutMS: 10000, // Timeout for initial connection
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
};

let db;

const connectDB = async () => {
  const client = new MongoClient(url, connectOptions);
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    db = client.db(dbName);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

const getDB = () => {
  if (!db) {
    throw new Error("Database not initialized. Call connectDB first.");
  }
  return db;
};

module.exports = {
  connectDB,
  getDB,
};
