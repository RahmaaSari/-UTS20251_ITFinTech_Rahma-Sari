import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = process.env.JWT_SECRET || "default_secret";

// Daftar path yang butuh proteksi admin
const protectedPaths = ["/admin"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Hanya cek untuk path yang diawali "/admin"
  if (protectedPaths.some((p) => pathname.startsWith(p))) {
    const token = req.cookies.get("token")?.value || req.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      // Tidak ada token → redirect ke halaman utama
      return NextResponse.redirect(new URL("/", req.url));
    }

    try {
      // Verifikasi JWT
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(SECRET)
      );

      // Cek apakah role-nya admin
      if (payload.role !== "admin") {
        return NextResponse.redirect(new URL("/", req.url));
      }

      // Admin → izinkan lanjut
      return NextResponse.next();
    } catch (err) {
      console.error("❌ Token invalid:", err);
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"], // Jalankan middleware di semua route /admin
};
