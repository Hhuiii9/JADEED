import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import mongoose from "mongoose";
import { dbConnect } from "../src/lib/db";
import { Customer, User } from "../src/lib/models";
import { hashPassword } from "../src/lib/auth";

async function runTest() {
  console.log("=== Running Exact 90-Day Address Cleanup Test (MongoDB) ===");
  await dbConnect();

  // 1. Create a test user
  const email = `test-cleanup-user-${Date.now()}@example.com`;
  const passwordHash = await hashPassword("password123");
  const user = await User.create({
    name: "Cleanup Test User",
    email,
    phone: "1234567890",
    password_hash: passwordHash,
  });
  console.log(`Created test user: ${user.email}`);

  // 2. Define timestamps
  const eightyNineDaysAgo = new Date();
  eightyNineDaysAgo.setDate(eightyNineDaysAgo.getDate() - 89);
  eightyNineDaysAgo.setHours(12, 0, 0, 0); // midday

  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  ninetyDaysAgo.setHours(12, 0, 0, 0); // midday

  const ninetyOneDaysAgo = new Date();
  ninetyOneDaysAgo.setDate(ninetyOneDaysAgo.getDate() - 91);
  ninetyOneDaysAgo.setHours(12, 0, 0, 0); // midday

  // 3. Create test customers
  const customer89 = await Customer.create({
    user_id: user._id,
    name: "Customer (89 days)",
    phone: "8989898989",
    address: "89 Green Oil Ave",
    bags_count: 10,
    payment_status: "PENDING",
    created_at: eightyNineDaysAgo,
  });
  console.log(`Created 89-day customer: ${customer89.name} (Created: ${customer89.created_at.toISOString()})`);

  const customer90 = await Customer.create({
    user_id: user._id,
    name: "Customer (90 days)",
    phone: "9090909090",
    address: "90 Coconut St",
    bags_count: 20,
    payment_status: "PAID",
    created_at: ninetyDaysAgo,
  });
  console.log(`Created 90-day customer: ${customer90.name} (Created: ${customer90.created_at.toISOString()})`);

  const customer91 = await Customer.create({
    user_id: user._id,
    name: "Customer (91 days)",
    phone: "9191919191",
    address: "91 Copra Way",
    bags_count: 30,
    payment_status: "PAID",
    created_at: ninetyOneDaysAgo,
  });
  console.log(`Created 91-day customer: ${customer91.name} (Created: ${customer91.created_at.toISOString()})`);

  // 4. Run the cleanup logic
  console.log("Executing exact 90-day cleanup query...");
  
  const today = new Date();
  
  const start = new Date(today);
  start.setDate(start.getDate() - 90);
  start.setHours(0, 0, 0, 0);

  const end = new Date(today);
  end.setDate(end.getDate() - 90);
  end.setHours(23, 59, 59, 999);

  const result = await Customer.updateMany(
    {
      created_at: {
        $gte: start,
        $lte: end,
      },
      address: { $ne: null },
    },
    {
      $set: {
        address: null,
        address_deleted_at: new Date(),
      },
    }
  );

  console.log(`Cleanup complete. Modified count: ${result.modifiedCount}`);

  // 5. Fetch updated values
  const updated89 = await Customer.findById(customer89._id);
  const updated90 = await Customer.findById(customer90._id);
  const updated91 = await Customer.findById(customer91._id);

  let testPassed = true;

  // Check 89-day customer (must NOT be cleared)
  if (updated89 && updated89.address === "89 Green Oil Ave" && updated89.address_deleted_at === null) {
    console.log("✓ Success: 89-day customer address was NOT cleared.");
  } else {
    console.error("✗ Fail: 89-day customer address was cleared or deleted_at is set.", updated89);
    testPassed = false;
  }

  // Check 90-day customer (must BE cleared)
  if (updated90 && updated90.address === null && updated90.address_deleted_at !== null) {
    console.log("✓ Success: 90-day customer address was cleared and address_deleted_at is set.");
  } else {
    console.error("✗ Fail: 90-day customer address was NOT cleared correctly.", updated90);
    testPassed = false;
  }

  // Check 91-day customer (must NOT be cleared - already run yesterday)
  if (updated91 && updated91.address === "91 Copra Way" && updated91.address_deleted_at === null) {
    console.log("✓ Success: 91-day customer address was NOT cleared.");
  } else {
    console.error("✗ Fail: 91-day customer address was cleared or deleted_at is set.", updated91);
    testPassed = false;
  }

  // 6. Clean up database
  console.log("Cleaning up test database records...");
  await Customer.deleteMany({ user_id: user._id });
  await User.findByIdAndDelete(user._id);
  console.log("Cleanup complete.");

  // Disconnect mongoose
  await mongoose.disconnect();

  if (testPassed) {
    console.log("=== TEST PASSED SUCCESSFULLY ===");
    process.exit(0);
  } else {
    console.log("=== TEST FAILED ===");
    process.exit(1);
  }
}

runTest().catch((error) => {
  console.error("Test execution failed:", error);
  process.exit(1);
});
