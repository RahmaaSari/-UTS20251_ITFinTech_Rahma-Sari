// import { NextResponse } from "next/server";
// import Payment from "@/models/Payment";
// import { connectDB } from "@/lib/mongodb";

// export async function POST(req: Request) {
//   try {
//     const { external_id, payer_email, amount, items } = await req.json();
//     await connectDB();

//     // Simpan awal di DB
//     const payment = await Payment.create({ external_id, amount, status: "PENDING" });

//     // Panggil Xendit (Basic Auth with API key as username)
//     const xenditRes = await fetch("https://api.xendit.co/v2/invoices", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: "Basic " + Buffer.from(`${process.env.XENDIT_API_KEY}:`).toString("base64"),
//       },
//       body: JSON.stringify({
//         external_id,
//         payer_email,
//         amount,
//         description: "Pembayaran EduShop",
//         items,
//         success_redirect_url: `https://uts-20251-it-fin-tech-rahma-sari.vercel.app/payment-success?external_id=${external_id}`,
//         failure_redirect_url: `https://uts-20251-it-fin-tech-rahma-sari.vercel.app/payment-failure?external_id=${external_id}`,
//       }),
//     });

//     const data = await xenditRes.json();

//     return NextResponse.json({
//       message: "Payment created",
//       invoice_url: data.invoice_url ?? null,
//       xendit_response: data,
//       db_payment_id: payment._id,
//     });
//   } catch (error: unknown) {
//     console.error("Payment creation error:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }

import { NextResponse } from "next/server";
import Payment from "@/models/Payment";
import { connectDB } from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const { external_id, email, amount, items } = await req.json(); // FE kirim email

    // ✅ Koneksi MongoDB
    await connectDB();

    // ✅ Simpan ke DB
    await Payment.create({
      external_id,
      amount,
      email,
      status: "PENDING",
    });

    // ✅ Panggil API Xendit
    const res = await fetch("https://api.xendit.co/v2/invoices", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa(process.env.XENDIT_API_KEY + ":"), // gunakan API Key
      },
      body: JSON.stringify({
        external_id,
        payer_email: email,
        amount,
        description: "Pembayaran EduShop",
        items,
        success_redirect_url: "http://localhost:3000/payment-success", // bisa ubah ke domain deploy nanti
      }),
    });

    const data = await res.json();

    // ✅ Debug
    console.log("🧾 Xendit Response:", data);

    // ✅ Jika berhasil
    if (data.invoice_url) {
      return NextResponse.json({ invoice_url: data.invoice_url, data });
    }

    // ✅ Jika gagal
    return NextResponse.json(
      { error: data.message || "Gagal membuat invoice" },
      { status: 400 }
    );
  } catch (error) {
    console.error("❌ Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

