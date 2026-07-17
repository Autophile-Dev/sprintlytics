import mongoose from "mongoose";

let cachedConnection = null;

export async function connectDB() {
  if (cachedConnection) {
    return cachedConnection;
  }

  // Get MONGODB_URI from process.env or Nuxt runtimeConfig
  let uri = process.env.MONGODB_URI;
  try {
    const config = useRuntimeConfig();
    if (!uri && config && config.mongodbUri) {
      uri = config.mongodbUri;
    }
  } catch (e) {
    // Ignore runtime config errors if run outside Nuxt context (like in test scripts)
  }

  if (!uri) {
    throw new Error("MONGODB_URI environment variable is missing.");
  }

  const state = mongoose.connection.readyState;
  if (state === 1) { // Connected
    cachedConnection = mongoose.connection;
    return cachedConnection;
  }
  if (state === 2) { // Connecting
    await new Promise((resolve) => {
      mongoose.connection.once("open", resolve);
    });
    cachedConnection = mongoose.connection;
    return cachedConnection;
  }

  try {
    const conn = await mongoose.connect(uri);
    cachedConnection = conn.connection;
    console.log("[MongoDB] Connected successfully.");
    return cachedConnection;
  } catch (error) {
    console.error("[MongoDB] Connection failed:", error);
    throw error;
  }
}
