import dns from "dns";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// Force IPv4-first DNS to fix MongoDB Atlas SRV lookups on Node.js v17+
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

// Load environment variables from the project's .env file
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

// Import models
import User from "./server/models/User.js";
import OTP from "./server/models/OTP.js";
import RateLimit from "./server/models/RateLimit.js";

const TEST_EMAIL = "test_secure_user@sprintlytics.com";
const TEST_PASSWORD = "Password123!";

async function runTests() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("Error: MONGODB_URI is not set in .env");
    process.exit(1);
  }

  console.log(`Connecting to MongoDB at: ${mongoUri}...`);
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB successfully.\n");

  try {
    // Cleanup previous test state
    console.log("Cleaning up previous test data...");
    await User.deleteMany({ email: TEST_EMAIL });
    await OTP.deleteMany({ email: TEST_EMAIL });
    console.log("Cleanup complete.\n");

    // --- TEST 1: User Registration Logic ---
    console.log("--- TEST 1: Creating User (Registration) ---");
    const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 12);
    const user = await User.create({
      email: TEST_EMAIL,
      password: hashedPassword,
      isVerified: false,
    });
    console.log(`User created successfully: ${user.email}`);
    console.log(`Is Verified (Should be false): ${user.isVerified}`);
    if (user.isVerified !== false) throw new Error("Test 1 Failed: User should not be verified on creation");
    console.log("Test 1 Passed!\n");

    // --- TEST 2: OTP Generation, Hashing, and Storage ---
    console.log("--- TEST 2: OTP Verification Flow ---");
    const rawOtp = crypto.randomInt(100000, 999999).toString();
    const codeHash = await bcrypt.hash(rawOtp, 8);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const otpDoc = await OTP.create({
      email: TEST_EMAIL,
      codeHash,
      purpose: "email_verification",
      expiresAt,
    });
    console.log(`OTP document stored. Code Hash: ${otpDoc.codeHash}`);

    // Verify correct OTP matching
    const isCorrectOtp = await bcrypt.compare(rawOtp, otpDoc.codeHash);
    console.log(`Comparing correct OTP code: ${rawOtp} -> Match: ${isCorrectOtp}`);
    if (!isCorrectOtp) throw new Error("Test 2 Failed: OTP comparison failed on correct code");

    // Verify incorrect OTP matching
    const isIncorrectOtp = await bcrypt.compare("000000", otpDoc.codeHash);
    console.log(`Comparing incorrect OTP code: 000000 -> Match: ${isIncorrectOtp}`);
    if (isIncorrectOtp) throw new Error("Test 2 Failed: OTP comparison succeeded on incorrect code");

    // Verify OTP attempts count increment
    otpDoc.attempts += 1;
    await otpDoc.save();
    console.log(`OTP verification attempt incremented: ${otpDoc.attempts}`);
    if (otpDoc.attempts !== 1) throw new Error("Test 2 Failed: Attempt count not tracked");

    // Simulate OTP deletion after successful verification
    await OTP.deleteMany({ email: TEST_EMAIL, purpose: "email_verification" });
    user.isVerified = true;
    await user.save();
    console.log(`User updated to verified: ${user.isVerified}`);
    if (user.isVerified !== true) throw new Error("Test 2 Failed: User verification status did not update");
    console.log("Test 2 Passed!\n");

    // --- TEST 3: Account Lockout Logic (Brute Force Protection) ---
    console.log("--- TEST 3: Brute Force Account Lockout ---");
    // Start with 0 failed attempts
    console.log(`Initial login attempts: ${user.loginAttempts}`);
    console.log(`Is Locked (Should be false): ${user.isLocked}`);
    if (user.isLocked) throw new Error("Test 3 Failed: User should not be locked initially");

    // Simulate 4 failed attempts (should not lock yet)
    for (let i = 1; i <= 4; i++) {
      await user.incLoginAttempts();
      const updatedUser = await User.findOne({ email: TEST_EMAIL });
      console.log(`Failed attempt #${i} recorded. loginAttempts = ${updatedUser.loginAttempts}, isLocked = ${updatedUser.isLocked}`);
      if (updatedUser.isLocked) throw new Error(`Test 3 Failed: User locked prematurely on attempt ${i}`);
    }

    // 5th failed attempt (should trigger lock)
    await user.incLoginAttempts();
    let lockedUser = await User.findOne({ email: TEST_EMAIL });
    console.log(`Failed attempt #5 recorded. loginAttempts = ${lockedUser.loginAttempts}, isLocked = ${lockedUser.isLocked}`);
    console.log(`Lock Until Time: ${lockedUser.lockUntil}`);
    if (!lockedUser.isLocked) throw new Error("Test 3 Failed: User account did not lock after 5 failed attempts");

    // Simulate successful login reset
    await lockedUser.resetLoginAttempts();
    const resetUser = await User.findOne({ email: TEST_EMAIL });
    console.log(`Successful login simulated. loginAttempts = ${resetUser.loginAttempts}, isLocked = ${resetUser.isLocked}`);
    if (resetUser.loginAttempts !== 0 || resetUser.isLocked) {
      throw new Error("Test 3 Failed: User failed attempts and lock were not cleared on reset");
    }
    console.log("Test 3 Passed!\n");

    // Clean up
    console.log("Cleaning up test data...");
    await User.deleteOne({ email: TEST_EMAIL });
    console.log("Cleanup complete.");
    console.log("\nALL TESTS COMPLETED SUCCESSFULLY!");

  } catch (error) {
    console.error("Test execution failed with error:", error);
  } finally {
    console.log("Disconnecting from database...");
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
}

runTests();
