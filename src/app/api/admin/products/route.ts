// import { NextResponse } from "next/server";
// import { connectDB } from "@/lib/mongodb";
// import Product from "@/models/Product";

// export async function GET() {
//   await connectDB();
//   const products = await Product.find().sort({ createdAt: -1 });
//   return NextResponse.json(products);
// }

// export async function POST(req: Request) {
//   await connectDB();
//   const { name, description, price, image } = await req.json();
//   const product = await Product.create({ name, description, price, image });
//   return NextResponse.json(product);
// }

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

interface Params {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: Params) {
  try {
    await connectDB();
    const product = await Product.findById(params.id);
    
    if (!product) {
      return NextResponse.json(
        { error: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    await connectDB();
    const { name, description, price, image } = await request.json();
    
    const product = await Product.findByIdAndUpdate(
      params.id,
      { name, description, price, image },
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return NextResponse.json(
        { error: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    await connectDB();
    const product = await Product.findByIdAndDelete(params.id);
    
    if (!product) {
      return NextResponse.json(
        { error: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: "Produk berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}