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
    const now = new Date();
    
    // Start of "today" (midnight)
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Start of "7 days ago"
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // Start of "30 days ago"
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    // Helper function for order sum aggregations
    async function sumOrders(matchQuery: any) {
      const agg = await Order.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            price: { $sum: "$price" },
            quantity: { $sum: "$quantity" },
            bags: { $sum: "$bags_count" },
          },
        },
      ]);
      return agg[0] || { price: 0, quantity: 0, bags: 0 };
    }

    // 1. Daily Sales (Today)
    const dailySalesAgg = await sumOrders({
      user_id: userObjectId,
      order_date: { $gte: todayStart },
    });
    const dailySales = dailyOMappedPrice(dailySalesAgg.price);

    // 2. Weekly Sales (Last 7 days)
    const weeklySalesAgg = await sumOrders({
      user_id: userObjectId,
      order_date: { $gte: sevenDaysAgo },
    });
    const weeklySales = dailyOMappedPrice(weeklySalesAgg.price);

    // 3. Monthly Sales (Last 30 days)
    const monthlySalesAgg = await sumOrders({
      user_id: userObjectId,
      order_date: { $gte: thirtyDaysAgo },
    });
    const monthlySales = dailyOMappedPrice(monthlySalesAgg.price);

    // 4. Customer Count
    const customerCount = await Customer.countDocuments({ user_id: user.userId });

    // 5. Customer Bags Count
    const customerBagsAgg = await Customer.aggregate([
      { $match: { user_id: userObjectId } },
      { $group: { _id: null, total: { $sum: "$bags_count" } } },
    ]);
    const totalCustomerBags = customerBagsAgg[0]?.total || 0;

    // 6. Order Bags Count (All time)
    const orderBagsAgg = await Order.aggregate([
      { $match: { user_id: userObjectId } },
      { $group: { _id: null, total: { $sum: "$bags_count" } } },
    ]);
    const totalOrderBags = orderBagsAgg[0]?.total || 0;

    // 7. Pending Payments (All time)
    const pendingPaymentsAgg = await Order.aggregate([
      { $match: { user_id: userObjectId, payment_status: "PENDING" } },
      { $group: { _id: null, total: { $sum: "$price" } } },
    ]);
    const pendingPayments = pendingPaymentsAgg[0]?.total || 0;

    // 8. Product breakdown (Sales sum & qty sum grouped by product type)
    const productsBreakdown = await Order.aggregate([
      { $match: { user_id: userObjectId } },
      {
        $group: {
          _id: "$product_type",
          sales: { $sum: "$price" },
          quantity: { $sum: "$quantity" },
          bags: { $sum: "$bags_count" },
        },
      },
    ]);

    const formattedBreakdown = productsBreakdown.map((item) => ({
      type: item._id,
      sales: item.sales,
      quantity: item.quantity,
      bags: item.bags,
    }));

    // 9. Trend data: Daily sales for the last 7 days
    const last7DaysSales: { date: string; amount: number; bags: number }[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

      const dayAgg = await Order.aggregate([
        {
          $match: {
            user_id: userObjectId,
            order_date: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: null,
            price: { $sum: "$price" },
            bags: { $sum: "$bags_count" },
          },
        },
      ]);

      const formattedDate = start.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      last7DaysSales.push({
        date: formattedDate,
        amount: dayAgg[0]?.price || 0,
        bags: dayAgg[0]?.bags || 0,
      });
    }

    return NextResponse.json({
      dailySales,
      weeklySales,
      monthlySales,
      customerCount,
      totalCustomerBags,
      totalOrderBags,
      pendingPayments,
      productsBreakdown: formattedBreakdown,
      trend: last7DaysSales,
    });
  } catch (error: any) {
    console.error("Reports API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function dailyOMappedPrice(value: any) {
  return value || 0;
}
