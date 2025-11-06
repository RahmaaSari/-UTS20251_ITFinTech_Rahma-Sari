import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

interface ProductUpdateBody {
  name?: string;
  description?: string;
  price?: number;
  image?: string;
}

// GET /api/admin/products/[id]
export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  await connectDB();
  const product = await Product.findById(context.params.id).lean();
  if (!product) {
    return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
  }
  return NextResponse.json(product);
}

// PUT /api/admin/products/[id]
export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const body: ProductUpdateBody = await request.json();
    await connectDB();

    const updated = await Product.findByIdAndUpdate(context.params.id, body, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updated) {
      return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err: unknown) {
    console.error("Error updating product:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE /api/admin/products/[id]
export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    await connectDB();
    const deleted = await Product.findByIdAndDelete(context.params.id).lean();
    if (!deleted) {
      return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ message: "Produk berhasil dihapus" });
  } catch (err: unknown) {
    console.error("Error deleting product:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
