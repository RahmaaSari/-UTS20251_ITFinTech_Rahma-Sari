import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET() {
  try {
    await connectDB();

    const products = [
      {
        name: "Green Tea",
        description: "Minuman teh hijau segar",
        price: 2.5,
        category: "Drinks",
        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300",
      },
      {
        name: "Potato Chips",
        description: "Cemilan kentang renyah",
        price: 1.8,
        category: "Snacks",
        image: "https://images.unsplash.com/photo-1585238342028-4bc961bba0e1?w=300",
      },
      {
        name: "Chocolate Bar",
        description: "Coklat manis lezat",
        price: 3.2,
        category: "Snacks",
        image: "https://images.unsplash.com/photo-1606312619070-b4f4c9b3b1f0?w=300",
      },
      {
        name: "Mineral Water",
        description: "Air mineral murni",
        price: 1.0,
        category: "Drinks",
        image: "https://images.unsplash.com/photo-1564228512246-65bf09e6c2a8?w=300",
      },
    ];

    // Hapus data lama
    await Product.deleteMany({});
    // Tambah data baru
    await Product.insertMany(products);

    return NextResponse.json({ message: "✅ Data produk berhasil di-seed" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "❌ Gagal seeding data" }, { status: 500 });
  }
}
