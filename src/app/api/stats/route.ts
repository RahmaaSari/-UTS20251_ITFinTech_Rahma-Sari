// import { NextResponse } from "next/server";
// import { connectDB } from "@/lib/mongodb";
// import Payment from "@/models/Payment";
// import Checkout from "@/models/Checkout";

// export async function GET() {
//   await connectDB();

//   // Hitung total pembayaran yang sudah lunas
//   const totalLunas = await Checkout.countDocuments({ status: "lunas" });

//   // Hitung omzet total dari Payment yang sudah PAID/LUNAS
//   const omzetAgg = await Payment.aggregate([
//     { $match: { status: { $in: ["PAID", "LUNAS"] } } },
//     { $group: { _id: null, total: { $sum: "$amount" } } },
//   ]);
//   const totalOmzet = omzetAgg[0]?.total || 0;

//   // Hitung produk terjual dari checkout
//   const allCheckouts = await Checkout.find({ status: "lunas" });
//   const totalProdukTerjual = allCheckouts.reduce((sum, co) => {
//     return sum + co.products.reduce((s: number, p: any) => s + (p.quantity || 1), 0);
//   }, 0);

//   // Grafik omzet harian dari Payment
//   const dailySales = await Payment.aggregate([
//     { $match: { status: { $in: ["PAID", "LUNAS"] }, paid_at: { $exists: true } } },
//     {
//       $group: {
//         _id: { $dateToString: { format: "%Y-%m-%d", date: "$paid_at" } },
//         total: { $sum: "$amount" },
//       },
//     },
//     { $sort: { _id: 1 } },
//   ]);

//   return NextResponse.json({
//     totalLunas,
//     totalOmzet,
//     totalProdukTerjual,
//     daily: dailySales,
//   });
// }

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Payment from "@/models/Payment";
import Checkout from "@/models/Checkout";

export async function GET() {
  await connectDB();

  // === 1️⃣ Total transaksi lunas ===
  const totalLunas = await Checkout.countDocuments({ status: { $in: ["paid", "lunas"] } });

  // === 2️⃣ Total omzet (hanya dari Payment dengan status PAID/LUNAS) ===
  const omzetAgg = await Payment.aggregate([
    { $match: { status: { $in: ["PAID", "LUNAS", "paid", "lunas"] } } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const totalOmzet = omzetAgg[0]?.total || 0;

  // === 3️⃣ Total produk terjual ===
  const allCheckouts = await Checkout.find({ status: { $in: ["paid", "lunas"] } });
  const totalProdukTerjual = allCheckouts.reduce((sum, co) => {
    return (
      sum +
      co.products.reduce((subtotal: number, p: any) => subtotal + (p.quantity || 1), 0)
    );
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
  // Group berdasarkan tahun dan minggu ke-n (ISO week)
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
        _id: { $concat: ["Minggu ke-", { $toString: "$_id.week" }, " (", { $toString: "$_id.year" }, ")"] },
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

  // === 8️⃣ Return data lengkap ===
  return NextResponse.json({
    totalLunas,
    totalOmzet,
    totalProdukTerjual,
    daily: dailySales,
    weekly: weeklySales,
    monthly: monthlySales,
    orders: recentOrders,
  });
}
