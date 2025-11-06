import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Payment from "@/models/Payment";
import Checkout from "@/models/Checkout";
import User from "@/models/User";
import { authenticate } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const auth = await authenticate(req as any);
    if (!auth || typeof auth === "string" || (auth as any)?.status === 401) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (auth as any).id;
    const { cart, total } = await req.json();
    await connectDB();

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });

    const serviceFee = 1000;
    const finalAmount = total + serviceFee;
    const external_id = `${userId}-${Date.now()}`;

    // Simpan Checkout dengan status waiting payment
    const checkout = await Checkout.create({
      userId,
      products: cart,
      total: finalAmount,
      status: "waiting payment",
      external_id,
    });

    // Buat invoice Xendit
    const xenditRes = await fetch("https://api.xendit.co/v2/invoices", {
      method: "POST",
      headers: {
        Authorization:
          "Basic " + Buffer.from(`${process.env.XENDIT_API_KEY}:`).toString("base64"),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        external_id,
        amount: finalAmount,
        payer_email: user.email || "user@edushop.com",
        description: "Pembayaran EduShop",
        success_redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success?external_id=${external_id}`,
        failure_redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-failed`,
      }),
    });

    const invoice = await xenditRes.json();
    if (!xenditRes.ok || !invoice?.invoice_url) {
      console.error("❌ Xendit error:", invoice);
      return NextResponse.json({ error: "Gagal membuat invoice Xendit" }, { status: 500 });
    }

    // Simpan Payment ke DB
    const payment = await Payment.create({
      external_id,
      userId,
      checkoutId: checkout._id,
      items: cart,
      amount: finalAmount,
      status: "PENDING",
      invoice_url: invoice.invoice_url,
    });

    // Kirim notifikasi WA invoice
    if (user.phone) {
      await fetch("https://api.fonnte.com/send", {
        method: "POST",
        headers: {
          Authorization: process.env.FONNTE_API_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          target: user.phone,
          message: `🧾 Halo ${user.name || "Pelanggan"}, pesanan Anda berhasil dibuat!\nTotal: Rp${finalAmount.toLocaleString(
            "id-ID"
          )}\nSilakan lakukan pembayaran di tautan berikut:\n${invoice.invoice_url}`,
        }),
      });
    }

    return NextResponse.json({
      message: "Payment berhasil dibuat",
      invoice_url: invoice.invoice_url,
      external_id,
      paymentId: payment._id,
    });
  } catch (err) {
    console.error("❌ Error di /api/payment/create:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
