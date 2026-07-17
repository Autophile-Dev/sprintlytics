import { connectDB } from "../utils/db";

export default defineNitroPlugin(async (nitroApp) => {
  console.log("[Nitro Plugin] Initializing MongoDB connection at startup...");
  try {
    await connectDB();
  } catch (error) {
    console.error("[Nitro Plugin] Failed to connect to MongoDB during server startup:", error.message);
  }
});
