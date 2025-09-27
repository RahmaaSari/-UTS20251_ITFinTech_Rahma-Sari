import { NextResponse } from "next/server";
import Payment from "@/models/Payment";
import { connectDB } from "@/lib/mongodb";

interface PaymentItem {
  name: string;
  quantity: number;
  price: number;
}

interface PaymentRequestBody {
  external_id: string;
  email: string;
  amount: number;
  items: PaymentItem[];
}

export async function POST(req: Request) {
  try {
    const body: PaymentRequestBody = await req.json();
    const { external_id, email, amount, items } = body;

    if (!external_id || !email || !amount || !items || !items.length) {
      return NextResponse.json(
        { error: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    // ✅ Ambil API key dari environment
    const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY;

    if (!XENDIT_SECRET_KEY) {
      console.error("❌ XENDIT_SECRET_KEY tidak ditemukan di environment");
      return NextResponse.json(
        { error: "Konfigurasi server tidak lengkap (API key tidak ditemukan)" },
        { status: 500 }
      );
    }

    // ✅ Koneksi ke MongoDB
    await connectDB();

    // ✅ Simpan transaksi ke database
    await Payment.create({
      external_id,
      amount,
      email,
      status: "PENDING",
    });

    // ✅ Encode Basic Auth
    const authHeader =
      "Basic " + Buffer.from(`${XENDIT_SECRET_KEY}:`).toString("base64");

    // ✅ Panggil API Xendit
    const res = await fetch("https://api.xendit.co/v2/invoices", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        external_id,
        payer_email: email,
        amount,
        description: "Pembayaran EduShop",
        items,
        success_redirect_url:
          "https://uts-20251-it-fin-tech-rahma-sari.vercel.app/payment-success",
        failure_redirect_url:
          "https://uts-20251-it-fin-tech-rahma-sari.vercel.app/payment-failed",
      }),
    });

    const data = await res.json();

    // ✅ Log untuk debugging di Vercel
    console.log("🧾 Xendit Response:", data);

    // ✅ Jika sukses
    if (data.invoice_url) {
      return NextResponse.json({ invoice_url: data.invoice_url, data });
    }

    // ✅ Jika gagal dari Xendit
    return NextResponse.json(
      { error: data.message || "Gagal membuat invoice", data },
      { status: 400 }
    );
  } catch (error) {
    console.error("❌ Error di server:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
