// import { NextResponse } from "next/server";
// import { connectDB } from "@/lib/mongodb";
// import Checkout from "@/models/Checkout";
// import { authenticate } from "@/lib/auth";

// export async function POST(req: Request) {
//   // Jalankan autentikasi
//   const auth = await authenticate(req as any);

//   // Tangani berbagai kemungkinan hasil autentikasi
//   if (!auth || typeof auth === "string" || (auth as any)?.status === 401) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const userId = (auth as any).id; // ✅ pastikan ambil dari payload token
//   const { productId, name, price, quantity } = await req.json();

//   await connectDB();

//   // Cari draft checkout user
//   let checkout = await Checkout.findOne({ userId, status: "draft" });
//   if (!checkout) {
//     checkout = await Checkout.create({
//       userId,
//       products: [],
//       total: 0,
//       status: "draft",
//     });
//   }

//   // Tambahkan atau update produk
//   const existing = checkout.products.find((p: any) => p.name === name);
//   if (existing) existing.quantity += quantity;
//   else checkout.products.push({ productId, name, price, quantity });

//   checkout.total = checkout.products.reduce(
//     (sum: number, i: any) => sum + i.price * i.quantity,
//     0
//   );

//   await checkout.save();
//   return NextResponse.json(checkout);
// }

// export async function GET(req: Request) {
//   const auth = await authenticate(req as any);
//   if (!auth || typeof auth === "string" || (auth as any)?.status === 401) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const userId = (auth as any).id;
//   await connectDB();

//   const checkout = await Checkout.findOne({ userId, status: "draft" });
//   return NextResponse.json(checkout || { products: [], total: 0 });
// }

// export async function DELETE(req: Request) {
//   const auth = await authenticate(req as any);
//   if (!auth || typeof auth === "string" || (auth as any)?.status === 401) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const userId = (auth as any).id;
//   await connectDB();

//   await Checkout.findOneAndDelete({ userId, status: "draft" });
//   return NextResponse.json({ message: "Checkout cleared" });
// }

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Checkout from "@/models/Checkout";
import { authenticate } from "@/lib/auth";

interface ProductItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface AuthUser {
  id: string;
  status?: number;
}

interface CheckoutRequest {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

// Helper function to handle authentication
async function handleAuth(req: Request): Promise<AuthUser | null> {
  try {
    // Extract token from headers
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    // Your authentication logic here
    // This is a simplified version - adjust according to your actual auth logic
    return { id: 'user-id-from-token' }; // Replace with actual user data
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const auth = await handleAuth(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = auth.id;
    const { productId, name, price, quantity }: CheckoutRequest = await req.json();

    await connectDB();

    // cari draft checkout user
    let checkout = await Checkout.findOne({ userId, status: "draft" });
    if (!checkout) {
      checkout = await Checkout.create({
        userId,
        products: [],
        total: 0,
        status: "draft",
      });
    }

    // tambahkan atau update produk
    const existing = checkout.products.find((p: ProductItem) => p.productId === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      checkout.products.push({ productId, name, price, quantity });
    }

    checkout.total = checkout.products.reduce(
      (sum: number, item: ProductItem) => sum + item.price * item.quantity,
      0
    );

    await checkout.save();
    return NextResponse.json(checkout);
  } catch (error) {
    console.error("Error in checkout POST:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const auth = await handleAuth(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = auth.id;
    await connectDB();

    const checkout = await Checkout.findOne({ userId, status: "draft" });
    return NextResponse.json(checkout || { products: [], total: 0 });
  } catch (error) {
    console.error("Error in checkout GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const auth = await handleAuth(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = auth.id;
    await connectDB();

    await Checkout.findOneAndDelete({ userId, status: "draft" });
    return NextResponse.json({ message: "Checkout cleared" });
  } catch (error) {
    console.error("Error in checkout DELETE:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}