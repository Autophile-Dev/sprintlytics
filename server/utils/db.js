import dns from "dns";
import mongoose from "mongoose";

// Node.js v17+ changed default DNS resolution to 'verbatim' (IPv6-first),
// which breaks MongoDB Atlas SRV lookups. Force IPv4-first to fix ECONNREFUSED.
dns.setDefaultResultOrder("ipv4first");
// Force Google's public DNS to bypass ISP/router DNS that blocks Atlas SRV records
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);


let uri;
try {
  const config = useRuntimeConfig();
  uri = process.env.MONGODB_URI || (config && config.mongodbUri);
} catch (e) {
  uri = process.env.MONGODB_URI;
}

if (!uri) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env"
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global._mongooseCache;

if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      // Force IPv4 at the socket level - prevents IPv6 SRV lookup failures
      family: 4,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    };

    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      console.log("[MongoDB] Connected successfully.");
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error("[MongoDB] Connection failed:", e.message);
    if (e.message && (e.message.includes("querySrv") || e.message.includes("ECONNREFUSED") || e.message.includes("ENOTFOUND"))) {
      console.error(
        "[MongoDB] HINT: DNS/network error — check the following:\n" +
        "  1. https://cloud.mongodb.com → Resume your cluster if it is paused\n" +
        "  2. Network Access → Add your IP (or 0.0.0.0/0 for dev)\n" +
        "  3. Verify MONGODB_URI in your .env file"
      );
    }
    throw e;
  }

  return cached.conn;
}

export { dbConnect as connectDB };
export default dbConnect;
