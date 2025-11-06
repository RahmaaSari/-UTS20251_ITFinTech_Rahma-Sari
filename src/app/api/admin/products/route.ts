import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

// GET: ambil semua produk
export async function GET() {
  await connectDB();
  const products = await Product.find().lean();
  return NextResponse.json(products);
}

// POST: tambah produk baru
export async function POST(req: Request) {
  try {
    const { name, description, price, image } = await req.json();
    await connectDB();

    const newProduct = await Product.create({ name, description, price, image });
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("Error adding product:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


// import { NextResponse } from "next/server";
// import { connectDB } from "@/lib/mongodb";
// import Product from "@/models/Product";

// interface Params {
//   params: {
//     id: string;
//   };
// }

// export async function GET(request: Request, { params }: Params) {
//   try {
//     await connectDB();
//     const product = await Product.findById(params.id);
    
//     if (!product) {
//       return NextResponse.json(
//         { error: "Produk tidak ditemukan" },
//         { status: 404 }
//       );
//     }
    
//     return NextResponse.json(product);
//   } catch (error) {
//     console.error("Error fetching product:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

// export async function PUT(request: Request, { params }: Params) {
//   try {
//     await connectDB();
//     const { name, description, price, image } = await request.json();
    
//     const product = await Product.findByIdAndUpdate(
//       params.id,
//       { name, description, price, image },
//       { new: true, runValidators: true }
//     );
    
//     if (!product) {
//       return NextResponse.json(
//         { error: "Produk tidak ditemukan" },
//         { status: 404 }
//       );
//     }
    
//     return NextResponse.json(product);
//   } catch (error) {
//     console.error("Error updating product:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

// export async function DELETE(request: Request, { params }: Params) {
//   try {
//     await connectDB();
//     const product = await Product.findByIdAndDelete(params.id);
    
//     if (!product) {
//       return NextResponse.json(
//         { error: "Produk tidak ditemukan" },
//         { status: 404 }
//       );
//     }
    
//     return NextResponse.json({ message: "Produk berhasil dihapus" });
//   } catch (error) {
//     console.error("Error deleting product:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }