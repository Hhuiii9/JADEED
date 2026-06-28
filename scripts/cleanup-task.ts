import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { dbConnect } from "../src/lib/db";
import { Customer } from "../src/lib/models";

async function main() {
  console.log("Starting 90-day exact address cleanup task...");
  await dbConnect();

  const today = new Date();

  const start = new Date(today);
  start.setDate(start.getDate() - 90);
  start.setHours(0, 0, 0, 0);

  const end = new Date(today);
  end.setDate(end.getDate() - 90);
  end.setHours(23, 59, 59, 999);

  console.log(`Searching for customers created between:`);
  console.log(`Start: ${start.toISOString()}`);
  console.log(`End:   ${end.toISOString()}`);

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

  console.log(`[Success] Cleanup finished. Cleared address for ${result.modifiedCount} customer(s).`);
  process.exit(0);
}

main().catch((error) => {
  console.error("[Error] Cleanup task failed:", error);
  process.exit(1);
});
