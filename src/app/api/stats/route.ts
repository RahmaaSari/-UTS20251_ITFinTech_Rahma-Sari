import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Payment from "@/models/Payment";
import Checkout from "@/models/Checkout";

export async function GET() {
  await connectDB();

  // Hitung total pembayaran yang sudah lunas
  const totalLunas = await Checkout.countDocuments({ status: "lunas" });

  // Hitung omzet total dari Payment yang sudah PAID/LUNAS
  const omzetAgg = await Payment.aggregate([
    { $match: { status: { $in: ["PAID", "LUNAS"] } } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const totalOmzet = omzetAgg[0]?.total || 0;

  // Hitung produk terjual dari checkout
  const allCheckouts = await Checkout.find({ status: "lunas" });
  const totalProdukTerjual = allCheckouts.reduce((sum, co) => {
    return sum + co.products.reduce((s: number, p: any) => s + (p.quantity || 1), 0);
  }, 0);

  // Grafik omzet harian dari Payment
  const dailySales = await Payment.aggregate([
    { $match: { status: { $in: ["PAID", "LUNAS"] }, paid_at: { $exists: true } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$paid_at" } },
        total: { $sum: "$amount" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return NextResponse.json({
    totalLunas,
    totalOmzet,
    totalProdukTerjual,
    daily: dailySales,
  });
}
