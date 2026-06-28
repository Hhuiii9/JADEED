import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import { Customer, Order } from "@/lib/models";
import { getAuthenticatedUser } from "@/lib/server-auth";

export async function GET() {
  try {
    await dbConnect();
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userObjectId = new mongoose.Types.ObjectId(user.userId);

    // 1. Total Customers count
    const totalCustomers = await Customer.countDocuments({ user_id: user.userId });

    // 2. Total Bags (from active customer profiles) using MongoDB Aggregation
    const bagsAggregation = await Customer.aggregate([
      { $match: { user_id: userObjectId } },
      { $group: { _id: null, total: { $sum: "$bags_count" } } },
    ]);
    const totalBags = bagsAggregation[0]?.total || 0;

    // 3. Total Pending Payments (from pending orders)
    const paymentsAggregation = await Order.aggregate([
      { $match: { user_id: userObjectId, payment_status: "PENDING" } },
      { $group: { _id: null, total: { $sum: "$price" } } },
    ]);
    const totalPendingPayments = paymentsAggregation[0]?.total || 0;

    // 4. Total Orders count
    const totalOrders = await Order.countDocuments({ user_id: user.userId });

    // 5. Recent Customers (limit 5)
    const recentCustomersRaw = await Customer.find({ user_id: user.userId })
      .sort({ created_at: -1 })
      .limit(5);

    const recentCustomers = recentCustomersRaw.map((c) => ({
      id: c._id.toString(),
      name: c.name,
      phone: c.phone,
      bags_count: c.bags_count,
      payment_status: c.payment_status,
      created_at: c.created_at,
    }));

    // 6. Recent Orders (limit 5)
    const recentOrdersRaw = await Order.find({ user_id: user.userId })
      .populate("customer_id", "name")
      .sort({ order_date: -1 })
      .limit(5);

    const recentOrders = recentOrdersRaw.map((o: any) => ({
      id: o._id.toString(),
      product_type: o.product_type,
      quantity: o.quantity,
      bags_count: o.bags_count,
      price: o.price,
      payment_status: o.payment_status,
      order_date: o.order_date,
      customer: {
        name: o.customer_id?.name || "Deleted Customer",
      },
    }));

    return NextResponse.json({
      totalCustomers,
      totalBags,
      totalPendingPayments,
      totalOrders,
      recentCustomers,
      recentOrders,
    });
  } catch (error: any) {
    console.error("Dashboard summary error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
