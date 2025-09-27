import { NextResponse } from "next/server";
import Payment from "@/models/Payment";
import { connectDB } from "@/lib/mongodb";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const external_id = searchParams.get("external_id");

    if (!external_id) {
      return NextResponse.json({ error: "external_id wajib ada" }, { status: 400 });
    }

    await connectDB();

    const payment = await Payment.findOne({ external_id });

    if (!payment) {
      return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ payment });
  } catch (error) {
    console.error("❌ Error GET status:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}