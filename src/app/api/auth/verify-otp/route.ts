import { NextResponse } from "next/server";
import { cookies } from "next/headers"; //
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { signToken } from "@/lib/jwt";

export async function POST(req: Request) {
  await connectDB();
  const { contact, otp } = await req.json();

  const user = await User.findOne({
    $or: [{ phone: contact }, { email: contact }],
    otp,
    otpExpires: { $gt: new Date() },
  });

  if (!user) {
    return NextResponse.json({ error: "OTP salah atau sudah kadaluarsa" }, { status: 400 });
  }

  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();


  const token = signToken({
    id: user._id,
    role: user.role,
    email: user.email,
  });

  const cookieStore = await cookies();
  cookieStore.set("token", token, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24, // 1 hari
  });

  return NextResponse.json({
    message: "Login sukses",
    token,
    user,
  });
}
