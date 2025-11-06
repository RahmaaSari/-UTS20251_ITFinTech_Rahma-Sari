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
  context: { params: Promise<{ id: string }> } // 👈 perhatikan ini
) {
  const { id } = await context.params; // 👈 ambil hasil promise
  await connectDB();
  const product = await Product.findById(id).lean();

  if (!product) {
    return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json(product);
}

// PUT /api/admin/products/[id]
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // 👈 disini juga
  const body: ProductUpdateBody = await request.json();
  await connectDB();

  const updated = await Product.findByIdAndUpdate(id, body, {
    new: true,
    runValidators: true,
  }).lean();

  if (!updated) {
    return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

// DELETE /api/admin/products/[id]
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // 👈 sama juga
  await connectDB();

  const deleted = await Product.findByIdAndDelete(id).lean();
  if (!deleted) {
    return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ message: "Produk berhasil dihapus" });
}
