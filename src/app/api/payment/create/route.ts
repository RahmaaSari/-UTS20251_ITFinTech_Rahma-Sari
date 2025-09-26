import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Payment from "@/models/Payment";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { amount } = await req.json();
    const external_id = "order-" + Date.now();

    // Simpan di MongoDB
    await Payment.create({ external_id, amount, status: "PENDING" });

    // Buat invoice Xendit
    const response = await fetch("https://api.xendit.co/v2/invoices", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " + Buffer.from(`${process.env.XENDIT_API_KEY}:`).toString("base64"),
      },
      body: JSON.stringify({
        external_id,
        amount,
        payer_email: "test@email.com",
        description: "Test payment",
        should_send_email: false,
      }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 });
  }
}
