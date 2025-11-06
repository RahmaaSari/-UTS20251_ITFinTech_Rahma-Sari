import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Payment from "@/models/Payment";
import Checkout from "@/models/Checkout";

interface ProductItem {
  quantity?: number;
  productId?: string;
  name?: string;
  price?: number;
}

interface CheckoutDocument {
  _id: string;
  userId: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  products: ProductItem[];
  __v?: number;
}

interface DailySalesData {
  _id: string;
  total: number;
}

interface WeeklySalesData {
  _id: string;
  total: number;
}

interface MonthlySalesData {
  _id: string;
  total: number;
}

interface RecentOrder {
  _id: string;
  userId: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  products: ProductItem[];
}

interface StatsResponse {
  totalLunas: number;
  totalOmzet: number;
  totalProdukTerjual: number;
  daily: DailySalesData[];
  weekly: WeeklySalesData[];
  monthly: MonthlySalesData[];
  orders: RecentOrder[];
}

export async function GET(): Promise<NextResponse<StatsResponse | { error: string }>> {
  try {
    await connectDB();

    // === 1️⃣ Total transaksi lunas ===
    const totalLunas = await Checkout.countDocuments({ 
      status: { $in: ["paid", "lunas"] } 
    });

    // === 2️⃣ Total omzet (hanya dari Payment dengan status PAID/LUNAS) ===
    const omzetAgg = await Payment.aggregate([
      { $match: { status: { $in: ["PAID", "LUNAS", "paid", "lunas"] } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalOmzet = omzetAgg[0]?.total || 0;

    // === 3️⃣ Total produk terjual ===
    const allCheckouts = await Checkout.find({ 
      status: { $in: ["paid", "lunas"] } 
    });
    
    const totalProdukTerjual = allCheckouts.reduce((sum: number, co: CheckoutDocument) => {
      return sum + co.products.reduce((subtotal: number, p: ProductItem) => {
        return subtotal + (p.quantity || 1);
      }, 0);
    }, 0);

    // === 4️⃣ Grafik omzet harian ===
    const dailySales = await Payment.aggregate([
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

    // === 5️⃣ Grafik omzet mingguan ===
    const weeklySales = await Payment.aggregate([
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
              ")"
            ] 
          },
          total: 1,
        },
      },
      { $sort: { "_id": 1 } },
    ]);

    // === 6️⃣ Grafik omzet bulanan ===
    const monthlySales = await Payment.aggregate([
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

    // === 7️⃣ Ambil daftar order (untuk tabel bawah dashboard) ===
    const recentOrders = await Checkout.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    
    // Type conversion untuk recentOrders
    const formattedOrders: RecentOrder[] = recentOrders.map((order: any) => ({
      _id: order._id?.toString() || '',
      userId: order.userId?.toString() || '',
      totalAmount: order.totalAmount || order.total || 0,
      status: order.status || 'unknown',
      createdAt: order.createdAt?.toISOString() || new Date().toISOString(),
      products: order.products || [],
    }));

    // === 8️⃣ Return data lengkap ===
    const responseData: StatsResponse = {
      totalLunas,
      totalOmzet,
      totalProdukTerjual,
      daily: dailySales as DailySalesData[],
      weekly: weeklySales as WeeklySalesData[],
      monthly: monthlySales as MonthlySalesData[],
      orders: formattedOrders,
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error("Error in stats API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}