import { NextResponse } from "next/server";
import Payment from "@/models/Payment";
import { connectDB } from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const { external_id, payer_email, amount, items } = await req.json(); // ✅ gunakan payer_email

    if (!external_id || !payer_email || !amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid input data" }, { status: 400 });
    }

    console.log("📦 Incoming request:", { external_id, payer_email, amount, items });

    await connectDB();

    await Payment.create({
      external_id,
      amount,
      email: payer_email,
      status: "PENDING",
    });

    const response = await fetch("https://api.xendit.co/v2/invoices", {
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
        items: items?.map((item: any) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        success_redirect_url: "https://uts-20251-it-fin-tech-rahma-sari.vercel.app/payment-success",
      }),
    });

    const data = await response.json();
    console.log("🧾 Xendit Response:", data);

    if (response.ok && data.invoice_url) {
      return NextResponse.json({ invoice_url: data.invoice_url, data });
    }

    return NextResponse.json(
      { error: data.message || "Gagal membuat invoice", detail: data },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("❌ Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
