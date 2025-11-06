import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Payment from "@/models/Payment";
import Checkout from "@/models/Checkout";

interface ProductItem {
  name: string;
  price: number;
  quantity: number;
}

interface CheckoutDoc {
  products: ProductItem[];
  status: string;
}

interface AggregatedSale {
  _id: string;
  total: number;
}

export async function GET() {
  await connectDB();

  const totalLunas = await Checkout.countDocuments({ status: { $in: ["paid", "lunas"] } });

  const omzetAgg = await Payment.aggregate([
    { $match: { status: { $in: ["PAID", "LUNAS", "paid", "lunas"] } } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const totalOmzet = omzetAgg[0]?.total || 0;

  const allCheckouts: CheckoutDoc[] = await Checkout.find({ status: { $in: ["paid", "lunas"] } });
  const totalProdukTerjual = allCheckouts.reduce((sum: number, co: CheckoutDoc) => {
    return (
      sum +
      co.products.reduce(
        (subtotal: number, p: ProductItem) => subtotal + (p.quantity || 1),
        0
      )
    );
  }, 0);

  // Harian
  const dailySales: AggregatedSale[] = await Payment.aggregate([
    {
      $match: {
        status: { $in: ["PAID", "LUNAS", "paid", "lunas"] },
        paid_at: { $exists: true },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$paid_at" } },
        total: { $sum: "$amount" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Mingguan
  const weeklySales: AggregatedSale[] = await Payment.aggregate([
    {
      $match: {
        status: { $in: ["PAID", "LUNAS", "paid", "lunas"] },
        paid_at: { $exists: true },
      },
    },
    {
      $group: {
        _id: {
          year: { $isoWeekYear: "$paid_at" },
          week: { $isoWeek: "$paid_at" },
        },
        total: { $sum: "$amount" },
      },
    },
    {
      $project: {
        _id: {
          $concat: [
            "Minggu ke-",
            { $toString: "$_id.week" },
            " (",
            { $toString: "$_id.year" },
            ")",
          ],
        },
        total: 1,
      },
    },
    { $sort: { "_id": 1 } },
  ]);

  // Bulanan
  const monthlySales: AggregatedSale[] = await Payment.aggregate([
    {
      $match: {
        status: { $in: ["PAID", "LUNAS", "paid", "lunas"] },
        paid_at: { $exists: true },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$paid_at" },
          month: { $month: "$paid_at" },
        },
        total: { $sum: "$amount" },
      },
    },
    {
      $project: {
        _id: {
          $concat: [
            {
              $arrayElemAt: [
                [
                  "",
                  "Januari",
                  "Februari",
                  "Maret",
                  "April",
                  "Mei",
                  "Juni",
                  "Juli",
                  "Agustus",
                  "September",
                  "Oktober",
                  "November",
                  "Desember",
                ],
                "$_id.month",
              ],
            },
            " ",
            { $toString: "$_id.year" },
          ],
        },
        total: 1,
      },
    },
    { $sort: { "_id": 1 } },
  ]);

  const recentOrders = await Checkout.find().sort({ createdAt: -1 }).limit(20).lean();

  return NextResponse.json({
    totalLunas,
    totalOmzet,
    totalProdukTerjual,
    daily: dailySales || [],
    weekly: weeklySales || [],
    monthly: monthlySales || [],
    orders: recentOrders || [],
  });
}
