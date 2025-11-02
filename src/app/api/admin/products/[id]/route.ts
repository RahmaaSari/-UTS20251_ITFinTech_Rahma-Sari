import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

export async function PUT(req: Request, { params }: any) {
  await connectDB();
  const data = await req.json();
  const updated = await Product.findByIdAndUpdate(params.id, data, { new: true });
  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: any) {
  await connectDB();
  await Product.findByIdAndDelete(params.id);
  return NextResponse.json({ message: "Product deleted" });
}
