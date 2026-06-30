import dotenv from "dotenv";
import { MongoClient } from "mongodb";
dotenv.config();

const url = process.env.db_uri;
const dbName = "job-collection";

const connectOptions = {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  tls: true,
  maxPoolSize: 10,
  minPoolSize: 0,        // Let idle connections close in serverless
  maxIdleTimeMS: 10000,  // Close idle connections after 10s (Vercel freezes at ~15s)
};

/**
 * Cache the MongoClient *promise* (not the resolved client) on `globalThis`.
 * - In development: survives HMR module reloads.
 * - In production/serverless: survives across warm invocations of the same container.
 *
 * The driver's built-in connection pool handles reconnection on stale sockets,
 * so we never need to manually check topology state.
 */
if (!globalThis._mongoClientPromise) {
  const client = new MongoClient(url, connectOptions);
  globalThis._mongoClientPromise = client.connect();
}

const clientPromise = globalThis._mongoClientPromise;

const getDB = async () => {
  const client = await clientPromise;
  return client.db(dbName);
};

// Only used for graceful shutdown (e.g. SIGTERM handler), not in request paths.
const closeDB = async () => {
  const client = await clientPromise;
  await client.close();
  globalThis._mongoClientPromise = null;
};

export { closeDB, getDB };
