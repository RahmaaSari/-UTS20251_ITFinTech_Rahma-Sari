import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { sendOTP } from "@/lib/mail";
import { sendWhatsApp } from "@/lib/sendWhatsApp";

export async function POST(req: Request) {
  await connectDB();
  const { email, phone } = await req.json();

  const user = await User.findOne({ $or: [{ email }, { phone }] });
  if (!user) return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 5 * 60 * 1000);

  user.otp = otp;
  user.otpExpires = expires;
  await user.save();

  if (phone) {
    await sendWhatsApp(phone, `Kode OTP login Anda: ${otp} (berlaku 5 menit).`);
  } else if (email) {
    await sendOTP(email, otp);
  }

  return NextResponse.json({ message: "OTP dikirim" });
}
