import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Checkout, { ICheckout, IProductItem } from "@/models/Checkout";
import { authenticate, AuthPayload } from "@/lib/auth";

// === POST ===
// Tambah produk ke keranjang user (status: draft)
export async function POST(req: Request) {
  const auth: AuthPayload | null = await authenticate(req);
  if (!auth?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = auth.id;
  const { productId, name, price, quantity }: IProductItem = await req.json();

  await connectDB();

  // Cari draft checkout
  let checkout = await Checkout.findOne<ICheckout>({ userId, status: "draft" });

  if (!checkout) {
    // Buat baru kalau belum ada
    checkout = new Checkout({
      userId,
      products: [],
      total: 0,
      status: "draft",
    });
  }

  // Tambahkan / update produk
  const existing = checkout.products.find((p) => p.productId === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    checkout.products.push({ productId, name, price, quantity });
  }

  // Hitung total
  checkout.total = checkout.products.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  await checkout.save();

  return NextResponse.json(checkout);
}

// === GET ===
// Ambil isi keranjang (checkout draft)
export async function GET(req: Request) {
  const auth: AuthPayload | null = await authenticate(req);
  if (!auth?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = auth.id;
  await connectDB();

  const checkout = await Checkout.findOne<ICheckout>({ userId, status: "draft" });
  return NextResponse.json(checkout || { products: [], total: 0 });
}

// === DELETE ===
// Kosongkan keranjang (hapus draft)
export async function DELETE(req: Request) {
  const auth: AuthPayload | null = await authenticate(req);
  if (!auth?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = auth.id;
  await connectDB();

  await Checkout.findOneAndDelete({ userId, status: "draft" });
  return NextResponse.json({ message: "Checkout cleared" });
}
