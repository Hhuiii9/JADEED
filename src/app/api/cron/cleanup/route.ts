import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Customer } from "@/lib/models";

export async function GET(request: Request) {
  return handleCleanup(request);
}

export async function POST(request: Request) {
  return handleCleanup(request);
}

async function handleCleanup(request: Request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret") || request.headers.get("x-cron-secret");
    const expectedSecret = process.env.CRON_SECRET || "jadeed_cron_default_secret_key_2026";

    if (secret !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();

    const start = new Date(today);
    start.setDate(start.getDate() - 90);
    start.setHours(0, 0, 0, 0);

    const end = new Date(today);
    end.setDate(end.getDate() - 90);
    end.setHours(23, 59, 59, 999);

    // Mongoose update: Clear address of customers created exactly 90 days ago
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

    return NextResponse.json({
      success: true,
      message: `Address cleanup completed. Cleared address for ${result.modifiedCount} customer(s).`,
      start,
      end,
      count: result.modifiedCount,
    });
  } catch (error: any) {
    console.error("Cleanup cron error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
