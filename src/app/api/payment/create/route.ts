import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Payment from "@/models/Payment";
import Checkout from "@/models/Checkout";
import User from "@/models/User";

interface AuthUser {
  id: string;
  status?: number;
}

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface PaymentRequest {
  cart: CartItem[];
  total: number;
}

interface XenditInvoiceResponse {
  invoice_url?: string;
  error?: string;
}

interface FonnteResponse {
  status?: boolean;
  message?: string;
}

// Helper function to handle authentication
async function handleAuth(req: Request): Promise<AuthUser | null> {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    // Your actual authentication logic here
    // This is a simplified version - replace with your actual auth logic
    return { id: 'user-id-from-token' };
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
    const { cart, total }: PaymentRequest = await req.json();
    
    if (!cart || !Array.isArray(cart) || typeof total !== 'number') {
      return NextResponse.json({ error: "Data cart dan total diperlukan" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    const serviceFee = 1000;
    const finalAmount = total + serviceFee;
    const external_id = `${userId}-${Date.now()}`;

    // Simpan Checkout dengan status waiting payment
    const checkout = await Checkout.create({
      userId,
      products: cart,
      total: finalAmount,
      status: "waiting payment",
      external_id,
    });

    // Validasi environment variables
    if (!process.env.XENDIT_API_KEY) {
      console.error("XENDIT_API_KEY tidak ditemukan");
      return NextResponse.json({ error: "Konfigurasi pembayaran tidak lengkap" }, { status: 500 });
    }

    if (!process.env.NEXT_PUBLIC_BASE_URL) {
      console.error("NEXT_PUBLIC_BASE_URL tidak ditemukan");
      return NextResponse.json({ error: "Konfigurasi base URL tidak lengkap" }, { status: 500 });
    }

    // Buat invoice Xendit
    const xenditRes = await fetch("https://api.xendit.co/v2/invoices", {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(`${process.env.XENDIT_API_KEY}:`).toString("base64"),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        external_id,
        amount: finalAmount,
        payer_email: user.email || "user@edushop.com",
        description: "Pembayaran EduShop",
        success_redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success?external_id=${external_id}`,
        failure_redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-failed`,
      }),
    });

    const invoice: XenditInvoiceResponse = await xenditRes.json();
    
    if (!xenditRes.ok || !invoice?.invoice_url) {
      console.error("Xendit error:", invoice);
      return NextResponse.json({ 
        error: "Gagal membuat invoice Xendit",
        details: invoice.error 
      }, { status: 500 });
    }

    // Simpan Payment ke DB
    const payment = await Payment.create({
      external_id,
      userId,
      checkoutId: checkout._id,
      items: cart,
      amount: finalAmount,
      status: "PENDING",
      invoice_url: invoice.invoice_url,
    });

    // Kirim notifikasi WA invoice jika user memiliki nomor telepon
    if (user.phone && process.env.FONNTE_API_KEY) {
      try {
        const fonnteRes = await fetch("https://api.fonnte.com/send", {
          method: "POST",
          headers: {
            Authorization: process.env.FONNTE_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            target: user.phone,
            message: `🧾 Halo ${user.name || "Pelanggan"}, pesanan Anda berhasil dibuat!\nTotal: Rp${finalAmount.toLocaleString("id-ID")}\nSilakan lakukan pembayaran di tautan berikut:\n${invoice.invoice_url}`,
          }),
        });

        const fonnteResult: FonnteResponse = await fonnteRes.json();
        if (!fonnteRes.ok) {
          console.warn("Gagal mengirim notifikasi WA:", fonnteResult);
        }
      } catch (waError) {
        console.warn("Error mengirim notifikasi WA:", waError);
        // Continue processing even if WA notification fails
      }
    }

    return NextResponse.json({
      message: "Payment berhasil dibuat",
      invoice_url: invoice.invoice_url,
      external_id,
      paymentId: payment._id,
    });
  } catch (error) {
    console.error("Error di /api/payment/create:", error);
    return NextResponse.json({ 
      error: "Internal Server Error" 
    }, { status: 500 });
  }
}


// import { NextResponse } from "next/server";
// import { connectDB } from "@/lib/mongodb";
// import Payment from "@/models/Payment";
// import Checkout from "@/models/Checkout";
// import User from "@/models/User";
// import { authenticate } from "@/lib/auth";

// export async function POST(req: Request) {
//   try {
//     // 🔒 Autentikasi
//     const auth = await authenticate(req as any);
//     if (!auth || typeof auth === "string" || (auth as any)?.status === 401) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const userId = (auth as any).id;
//     const { cart, total } = await req.json();
//     await connectDB();

//     const user = await User.findById(userId);
//     if (!user) {
//       return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
//     }

//     // ✅ Tambahkan biaya layanan (biar sama dengan frontend)
//     const serviceFee = 1000;
//     const finalAmount = total;
//     const external_id = `INV-${Date.now()}`;

//     // ✅ Simpan Checkout (keranjang transaksi)
//     await Checkout.create({
//       userId,
//       products: cart,
//       total: finalAmount,
//       status: "waiting payment",
//       external_id,
//     });

//     // ✅ Buat invoice ke Xendit
//     const xenditRes = await fetch("https://api.xendit.co/v2/invoices", {
//       method: "POST",
//       headers: {
//         Authorization:
//           "Basic " + Buffer.from(process.env.XENDIT_API_KEY + ":").toString("base64"),
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         external_id,
//         amount: finalAmount,
//         payer_email: user.email || "user@edushop.com",
//         description: "Pembayaran EduShop",
//         success_redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success?external_id=${external_id}`,
//         failure_redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-failed`,
//       }),
//     });

//     const invoice = await xenditRes.json();
//     if (!xenditRes.ok || !invoice?.invoice_url) {
//       console.error("❌ Xendit error:", invoice);
//       return NextResponse.json({ error: "Gagal membuat invoice Xendit" }, { status: 500 });
//     }

//     // ✅ Simpan Payment ke MongoDB
//     await Payment.create({
//       external_id,
//       userId,
//       items: cart,
//       amount: finalAmount,
//       status: "PENDING",
//       invoice_url: invoice.invoice_url,
//     });

//     // ✅ Kirim notifikasi WA setelah invoice berhasil dibuat
//     if (user.phone) {
//       await fetch("https://api.fonnte.com/send", {
//         method: "POST",
//         headers: {
//           Authorization: process.env.FONNTE_API_KEY!,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           target: user.phone,
//           message: `🧾 Halo ${user.name || "Pelanggan"}, pesanan Anda berhasil dibuat!\nTotal: Rp${finalAmount.toLocaleString(
//             "id-ID"
//           )}\nSilakan bayar melalui tautan berikut:\n${invoice.invoice_url}`,
//         }),
//       });
//     }

//     return NextResponse.json({
//       message: "Payment berhasil dibuat",
//       invoice_url: invoice.invoice_url,
//       external_id,
//     });
//   } catch (err) {
//     console.error("❌ Error di /api/payment/create:", err);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }
