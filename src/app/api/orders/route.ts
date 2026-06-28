import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Order, Customer } from "@/lib/models";
import { getAuthenticatedUser } from "@/lib/server-auth";

// GET /api/orders - List authenticated user's orders
export async function GET(request: Request) {
  try {
    await dbConnect();
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");

    const query: any = { user_id: user.userId };
    if (customerId) {
      query.customer_id = customerId;
    }

    // Find orders and populate customer reference details
    const orders = await Order.find(query)
      .populate("customer_id", "name phone")
      .sort({ order_date: -1 });

    const transformed = orders.map((o: any) => ({
      id: o._id.toString(),
      customer_id: o.customer_id?._id?.toString() || "",
      product_type: o.product_type,
      quantity: o.quantity,
      bags_count: o.bags_count,
      price: o.price,
      payment_status: o.payment_status,
      order_date: o.order_date,
      created_at: o.created_at,
      customer: {
        name: o.customer_id?.name || "Deleted Customer",
        phone: o.customer_id?.phone || "",
      },
    }));

    return NextResponse.json(transformed);
  } catch (error: any) {
    console.error("GET orders error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create a new order
export async function POST(request: Request) {
  try {
    await dbConnect();
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      customer_id,
      product_type,
      quantity,
      bags_count,
      price,
      payment_status,
      order_date,
    } = body;

    // Validate inputs
    if (!customer_id) {
      return NextResponse.json({ error: "Customer is required" }, { status: 400 });
    }

    const allowedProducts = ["COCONUT", "COCONUT_OIL", "COPRA"];
    if (!product_type || !allowedProducts.includes(product_type)) {
      return NextResponse.json(
        { error: "Product type must be one of: Coconut, Coconut Oil, Copra" },
        { status: 400 }
      );
    }

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      return NextResponse.json({ error: "Quantity must be a number greater than 0" }, { status: 400 });
    }

    const bags = parseInt(bags_count, 10);
    if (isNaN(bags) || bags < 0) {
      return NextResponse.json({ error: "Bags count must be a non-negative number" }, { status: 400 });
    }

    const prc = parseFloat(price);
    if (isNaN(prc) || prc < 0) {
      return NextResponse.json({ error: "Price must be a non-negative number" }, { status: 400 });
    }

    const allowedStatuses = ["PAID", "PENDING"];
    const status = allowedStatuses.includes(payment_status) ? payment_status : "PENDING";

    // Verify customer ownership
    const customer = await Customer.findById(customer_id);

    if (!customer || customer.user_id.toString() !== user.userId) {
      return NextResponse.json({ error: "Invalid customer selected" }, { status: 400 });
    }

    const dateVal = order_date ? new Date(order_date) : new Date();

    const order = await Order.create({
      user_id: user.userId,
      customer_id,
      product_type,
      quantity: qty,
      bags_count: bags,
      price: prc,
      payment_status: status,
      order_date: dateVal,
    });

    return NextResponse.json(
      {
        id: order._id.toString(),
        customer_id: order.customer_id.toString(),
        product_type: order.product_type,
        quantity: order.quantity,
        bags_count: order.bags_count,
        price: order.price,
        payment_status: order.payment_status,
        order_date: order.order_date,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST order error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
