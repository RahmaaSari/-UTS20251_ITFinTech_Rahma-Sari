// src/app/api/webhook/xendit/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Payment from "@/models/Payment";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📩 Webhook received:", body);

    await connectDB();

    const { external_id, status, paid_at } = body;

    if (status === "PAID") {
      await Payment.findOneAndUpdate(
        { external_id },
        { status: "LUNAS", paid_at: paid_at ? new Date(paid_at) : new Date() }
      );
      console.log(`✅ Payment ${external_id} updated to LUNAS`);
    } else {
      console.log(`Webhook received with status: ${status}`);
    }

    return NextResponse.json({ message: "Webhook processed" });
  } catch (_error) {
    console.error("Webhook error", _error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
