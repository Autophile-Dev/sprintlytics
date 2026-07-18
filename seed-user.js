import dns from "dns";
import fs from "fs";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Force IPv4-first DNS to fix MongoDB Atlas SRV lookups on Node.js v17+
dns.setDefaultResultOrder("ipv4first");
// Force Google's public DNS to bypass ISP/router DNS issues
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);


// Load .env manually
const envPath = "./.env";
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf8");
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const parts = trimmed.split("=");
      const key = parts[0].trim();
      const val = parts.slice(1).join("=").trim().replace(/(^"|"$)/g, "");
      process.env[key] = val;
    }
  });
}

import User from "./server/models/User.js";

const EMAIL = "waleed.zaheer55@gmail.com";
const PASSWORD = "Test@123";

async function seed() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("❌ MONGODB_URI is not set in .env");
    process.exit(1);
  }

  console.log("🔗 Connecting to MongoDB...");
  await mongoose.connect(mongoUri, {
    family: 4,
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
  });
  console.log("✅ Connected!\n");

  try {
    // Remove any existing account with this email first
    const existing = await User.findOne({ email: EMAIL });
    if (existing) {
      await User.deleteOne({ email: EMAIL });
      console.log(`🗑️  Removed existing account for ${EMAIL}`);
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(PASSWORD, 12);

    // Create user with isVerified: true so no OTP needed
    const user = await User.create({
      email: EMAIL,
      password: hashedPassword,
      isVerified: true,
      roles: ["user"],
    });

    console.log(`\n✅ Account created successfully!`);
    console.log(`   Email    : ${user.email}`);
    console.log(`   Verified : ${user.isVerified}`);
    console.log(`   Roles    : ${user.roles.join(", ")}`);
    console.log(`\n🎉 You can now login with:`);
    console.log(`   Email   : ${EMAIL}`);
    console.log(`   Password: ${PASSWORD}`);
  } catch (err) {
    console.error("❌ Error creating user:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB.");
  }
}

seed();
