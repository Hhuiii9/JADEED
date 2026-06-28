import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import mongoose from "mongoose";
import { dbConnect } from "../src/lib/db";
import { User, Customer, Order } from "../src/lib/models";
import { hashPassword } from "../src/lib/auth";

async function main() {
  console.log("=== Seeding JADEED Coconut Oil MongoDB Database (Auth Only) ===");
  await dbConnect();

  // 1. Clear existing database data to start fresh
  console.log("Clearing existing data...");
  await Order.deleteMany({});
  await Customer.deleteMany({});
  await User.deleteMany({});

  // 2. Create default Admin User
  console.log("Creating default administrator account...");
  const adminEmail = "admin@jadeed.com";
  const password = "password123";
  const passwordHash = await hashPassword(password);
  
  const user = await User.create({
    name: "JADEED Admin",
    email: adminEmail,
    phone: "9876543210",
    password_hash: passwordHash,
  });
  console.log(`[Success] User seeded!`);
  console.log(`Email: ${adminEmail}`);
  console.log(`Password: ${password}`);

  // Disconnect
  await mongoose.disconnect();
  
  console.log("=== Seeding Completed Successfully ===");
  process.exit(0);
}

main().catch((error) => {
  console.error("[Error] Seeding failed:", error);
  process.exit(1);
});
