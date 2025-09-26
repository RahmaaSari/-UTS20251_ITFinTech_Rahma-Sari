// src/app/api/payment/create/route.ts
import { NextResponse } from "next/server";
import Payment from "@/models/Payment";
import { connectDB } from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const { external_id, payer_email, amount, items } = await req.json();

    await connectDB();

    await Payment.create({ external_id, amount, status: "PENDING" });

    const res = await fetch("https://api.xendit.co/v2/invoices", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa(process.env.XENDIT_API_KEY + ":"),
      },
      body: JSON.stringify({
        external_id,
        payer_email,
        amount,
        description: "Pembayaran EduShop",
        items,
        success_redirect_url: "https://uts-20251-it-fin-tech-rahma-sari-ny2wb35lh.vercel.app/payment-success",
      }),
    });

    const data = await res.json();
    return NextResponse.json({ data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
