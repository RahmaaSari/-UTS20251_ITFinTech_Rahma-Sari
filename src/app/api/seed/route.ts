import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET() {
  try {
    await connectDB();

    const products = [
      {
        name: "Buku Edukatif",
        description: "Buku belajar interaktif untuk anak usia dini.",
        price: 50000,
        image: "/images/Buku.jpg",
      },
      {
        name: "Mainan Puzzle",
        description: "Puzzle kayu untuk melatih motorik halus anak.",
        price: 75000,
        image: "/images/Puzzle.png",
      },
      {
        name: "Flashcard ABC",
        description: "Mainan untuk belajar warna.",
        price: 40000,
        image: "/images/Mainan.jpg",
      },
    ];

    await Product.deleteMany({});
    await Product.insertMany(products);

    return NextResponse.json({ message: "Seeding berhasil!", products });
  } catch {
    console.error("An error occurred");
    return NextResponse.json({ error: "Seeding gagal" }, { status: 500 });
  }
}
