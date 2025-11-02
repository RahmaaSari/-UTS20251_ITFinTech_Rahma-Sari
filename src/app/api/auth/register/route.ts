import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  await connectDB();
  const { name, email, phone, role } = await req.json();

  if (!name || (!email && !phone)) {
    return NextResponse.json({ error: "Nama dan salah satu kontak wajib diisi" }, { status: 400 });
  }

  const existing = await User.findOne({ $or: [{ email }, { phone }] });
  if (existing) {
    return NextResponse.json({ error: "Pengguna sudah terdaftar" }, { status: 400 });
  }

  const newUser = await User.create({ name, email, phone, role });
  return NextResponse.json({ message: "Registrasi berhasil", user: newUser });
}
