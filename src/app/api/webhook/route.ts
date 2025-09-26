import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Payment from "@/models/Payment";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("📩 Webhook received:", body);

    await connectDB();

    // Ambil data dari webhook Xendit
    const { external_id, status } = body;

    // Update status pembayaran
    await Payment.findOneAndUpdate(
      { _id: external_id }, // external_id = id checkout/payment kamu
      { status: status === "PAID" ? "LUNAS" : status }
    );

    return NextResponse.json({ message: "Webhook processed" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
