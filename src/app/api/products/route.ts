import { NextResponse } from "next/server";
import Product from "@/models/Product";
import { connectDB } from "@/lib/mongodb";

// GET semua produk
export async function GET() {
  try {
    await connectDB();
    const products = await Product.find({});
    return NextResponse.json(products);
  } catch {
    return NextResponse.json({ message: "Error fetching products" }, { status: 500 });
  }
}

// POST untuk menambah produk baru
export async function POST(req: Request) {
  try {
    const data = await req.json();
    await connectDB();
    const newProduct = await Product.create(data);
    return NextResponse.json(newProduct);
  } catch {
    console.error("An error occurred");
    return NextResponse.json({ message: "Error adding product" }, { status: 500 });
  }
}
