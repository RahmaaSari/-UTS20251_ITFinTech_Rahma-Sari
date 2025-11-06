import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Payment from "@/models/Payment";
import Checkout from "@/models/Checkout";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    await connectDB();
    const token =
      req.headers.get("x-callback-token") || req.headers.get("X-CALLBACK-TOKEN");

    if (token !== process.env.XENDIT_WEBHOOK_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { external_id, status, paid_at } = body;

    const payment = await Payment.findOneAndUpdate(
      { external_id },
      { status: status.toUpperCase(), paid_at: paid_at ? new Date(paid_at) : new Date() },
      { new: true }
    );

    if (!payment) {
      console.warn(`Payment ${external_id} tidak ditemukan`);
      return NextResponse.json({ message: "Payment not found" }, { status: 404 });
    }

    // Update checkout status
    await Checkout.findOneAndUpdate(
      { external_id },
      { status: status === "PAID" ? "paid" : status }
    );

    // Jika lunas → kirim WA dan hapus keranjang draft user
    if (status === "PAID") {
      const user = await User.findById(payment.userId);
      if (user?.phone) {
        await fetch("https://api.fonnte.com/send", {
          method: "POST",
          headers: {
            Authorization: process.env.FONNTE_API_KEY!,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            target: user.phone,
            message: `✅ Pembayaran Anda (${external_id}) telah diterima.\nTerima kasih telah berbelanja di EduShop!`,
          }),
        });
      }

      // Bersihkan keranjang draft user
      await Checkout.deleteMany({ userId: payment.userId, status: "draft" });
    }

    return NextResponse.json({ message: "Webhook processed" });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
