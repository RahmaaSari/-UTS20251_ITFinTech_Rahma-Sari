// src/app/api/webhook/xendit/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Payment from "@/models/Payment";

export async function POST(req: Request) {
  try {
    const headers = req.headers;
    const tokenHeader = headers.get("x-callback-token");
    const secretToken = process.env.XENDIT_WEBHOOK_TOKEN;

    // ✅ Verifikasi token webhook dari Xendit
    if (tokenHeader !== secretToken) {
      console.error("❌ Invalid Xendit callback token");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log("📩 Webhook received:", body);

    await connectDB();

    const { external_id, status, paid_at } = body;

    if (!external_id) {
      return NextResponse.json({ error: "Missing external_id" }, { status: 400 });
    }

    if (status === "PAID") {
      const update = await Payment.findOneAndUpdate(
        { external_id },
        { status: "LUNAS", paid_at: paid_at ? new Date(paid_at) : new Date() },
        { new: true }
      );

      if (update) {
        console.log(`✅ Payment ${external_id} updated to LUNAS`);
      } else {
        console.log(`⚠️ Payment ${external_id} not found`);
      }
    } else {
      console.log(`Webhook received with status: ${status}`);
    }

    return NextResponse.json({ message: "Webhook processed" });
  } catch (error) {
    console.error("Webhook error", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}