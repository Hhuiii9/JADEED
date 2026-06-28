import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Customer, Order } from "@/lib/models";
import { getAuthenticatedUser } from "@/lib/server-auth";

// GET /api/customers/[id] - Fetch single customer detail
export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await props.params;

    const customer = await Customer.findById(id);

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    if (customer.user_id.toString() !== user.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json({
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
      address_deleted_at: customer.address_deleted_at,
    });
  } catch (error: any) {
    console.error("GET customer detail error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/customers/[id] - Update customer
export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await props.params;

    // Check if customer exists and belongs to the user
    const existingCustomer = await Customer.findById(id);

    if (!existingCustomer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    if (existingCustomer.user_id.toString() !== user.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
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

    if (address !== undefined && (!address || !address.trim())) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 });
    }

    const bags = parseInt(bags_count, 10);
    if (isNaN(bags) || bags < 0) {
      return NextResponse.json({ error: "Number of bags must be a valid non-negative number" }, { status: 400 });
    }

    const validPaymentStatuses = ["PAID", "PENDING"];
    const status = validPaymentStatuses.includes(payment_status) ? payment_status : "PENDING";

    // Update customer in MongoDB
    const updatedCustomer = await Customer.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        phone: phone.trim(),
        address: address ? address.trim() : existingCustomer.address,
        image_url: image_url !== undefined ? image_url : existingCustomer.image_url,
        bags_count: bags,
        payment_status: status,
        notes: notes !== undefined ? notes : existingCustomer.notes,
      },
      { new: true }
    );

    if (!updatedCustomer) {
      throw new Error("Failed to update customer");
    }

    return NextResponse.json({
      id: updatedCustomer._id.toString(),
      user_id: updatedCustomer.user_id.toString(),
      name: updatedCustomer.name,
      phone: updatedCustomer.phone,
      address: updatedCustomer.address,
      image_url: updatedCustomer.image_url,
      bags_count: updatedCustomer.bags_count,
      payment_status: updatedCustomer.payment_status,
      notes: updatedCustomer.notes,
      created_at: updatedCustomer.created_at,
      updated_at: updatedCustomer.updated_at,
      address_deleted_at: updatedCustomer.address_deleted_at,
    });
  } catch (error: any) {
    console.error("PUT customer error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/customers/[id] - Delete customer
export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await props.params;

    // Check ownership
    const existingCustomer = await Customer.findById(id);

    if (!existingCustomer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    if (existingCustomer.user_id.toString() !== user.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Cascade delete: Remove orders associated with this customer
    await Order.deleteMany({ customer_id: id });

    // Delete customer
    await Customer.findByIdAndDelete(id);

    return NextResponse.json({ message: "Customer deleted successfully" });
  } catch (error: any) {
    console.error("DELETE customer error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
