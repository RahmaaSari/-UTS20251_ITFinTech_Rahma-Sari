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
        success_redirect_url: "http://uts-20251-it-fin-tech-rahma-sari.vercel.app/payment-success", // bisa ubah ke domain deploy nanti
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

