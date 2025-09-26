import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Checkout from "@/models/Checkout";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    await connectDB();
    const newCheckout = await Checkout.create(data);
    return NextResponse.json(newCheckout);
  } catch (error) {
    return NextResponse.json({ message: "Error creating checkout" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const items = await Checkout.find({});
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ message: "Error fetching checkout" }, { status: 500 });
  }
}
