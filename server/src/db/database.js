const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
dotenv.config();
const url = process.env.db_uri;
const dbName = "job-collection";

const connectOptions = {
  serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds if no server is available
  connectTimeoutMS: 10000, // Timeout for initial connection
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  tls: true, // Use TLS for secure connection
};

let cachedClient = null;
let cachedDb = null;

const connectDB = async () => {
  // If we have a cached connection, use it
  if (cachedDb) {
    console.log("Using cached database connection");
    return cachedDb;
  }

  // No cached connection, create a new one
  if (!cachedClient) {
    cachedClient = new MongoClient(url, connectOptions);
    try {
      await cachedClient.connect();
      console.log("Connected to MongoDB");
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
      throw error;
    }
  }

  cachedDb = cachedClient.db(dbName);
  return cachedDb;
};

const getDB = async () => {
  if (!cachedDb) {
    return connectDB();
  }
  return cachedDb;
};

module.exports = {
  connectDB,
  getDB,
};
