import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Customer } from "@/lib/models";
import { getAuthenticatedUser } from "@/lib/server-auth";

// GET /api/customers - List authenticated user's customers
export async function GET(request: Request) {
  try {
    await dbConnect();
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";

    const query: any = { user_id: user.userId };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const customers = await Customer.find(query).sort({ created_at: -1 });

    // Transform Mongoose docs to match expected JSON structure
    const transformed = customers.map((c) => ({
      id: c._id.toString(),
      user_id: c.user_id.toString(),
      name: c.name,
      phone: c.phone,
      address: c.address,
      image_url: c.image_url,
      bags_count: c.bags_count,
      payment_status: c.payment_status,
      notes: c.notes,
      created_at: c.created_at,
      updated_at: c.updated_at,
      address_deleted_at: c.address_deleted_at,
    }));

    return NextResponse.json(transformed);
  } catch (error: any) {
    console.error("GET customers error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/customers - Create a customer
export async function POST(request: Request) {
  try {
    await dbConnect();
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, address, image_url, bags_count, payment_status, notes } = body;

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Customer name is required" }, { status: 400 });
    }
    if (!phone || !phone.trim()) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }
    const phoneRegex = /^\+?[\d\s-]{7,15}$/;
    if (!phoneRegex.test(phone.trim())) {
      return NextResponse.json({ error: "Please enter a valid phone number" }, { status: 400 });
    }

    if (!address || !address.trim()) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 });
    }

    const bags = parseInt(bags_count, 10);
    if (isNaN(bags) || bags < 0) {
      return NextResponse.json({ error: "Number of bags must be a valid non-negative number" }, { status: 400 });
    }

    const validPaymentStatuses = ["PAID", "PENDING"];
    const status = validPaymentStatuses.includes(payment_status) ? payment_status : "PENDING";

    const customer = await Customer.create({
      user_id: user.userId,
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      image_url: image_url || null,
      bags_count: bags,
      payment_status: status,
      notes: notes || null,
    });

    return NextResponse.json(
      {
        id: customer._id.toString(),
        user_id: customer.user_id.toString(),
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
        image_url: customer.image_url,
        bags_count: customer.bags_count,
        payment_status: customer.payment_status,
        notes: customer.notes,
        created_at: customer.created_at,
        updated_at: customer.updated_at,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST customer error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
