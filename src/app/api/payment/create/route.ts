import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Payment from "@/models/Payment";
import Checkout from "@/models/Checkout";
import User from "@/models/User";
import { authenticate } from "@/lib/auth";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface AuthPayload {
  id: string;
  email?: string;
  role?: string;
  status?: number;
}

export async function POST(req: Request) {
  try {
    const auth = (await authenticate(req)) as AuthPayload | null;
    if (!auth || typeof auth === "string" || auth.status === 401) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = auth.id;
    const { cart, total }: { cart: CartItem[]; total: number } = await req.json();
    await connectDB();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    const serviceFee = 1000;
    const finalAmount = total + serviceFee;
    const external_id = `${userId}-${Date.now()}`;

    // Simpan Checkout
    const checkout = await Checkout.create({
      userId,
      products: cart,
      total: finalAmount,
      status: "waiting payment",
      external_id,
    });

    // Buat invoice ke Xendit
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

    const invoice = await xenditRes.json() as { invoice_url?: string };
    if (!xenditRes.ok || !invoice?.invoice_url) {
      console.error("❌ Xendit error:", invoice);
      return NextResponse.json({ error: "Gagal membuat invoice Xendit" }, { status: 500 });
    }

    // Simpan Payment ke DB
    await Payment.create({
      external_id,
      userId,
      checkoutId: checkout._id,
      items: cart,
      amount: finalAmount,
      status: "PENDING",
      invoice_url: invoice.invoice_url,
    });

    // Kirim WA notifikasi invoice
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
          )}\nSilakan bayar melalui tautan berikut:\n${invoice.invoice_url}`,
        }),
      });
    }

    return NextResponse.json({
      message: "Payment berhasil dibuat",
      invoice_url: invoice.invoice_url,
      external_id,
    });
  } catch (err: unknown) {
    console.error("❌ Error di /api/payment/create:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
