"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [contact, setContact] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const router = useRouter();

  // === 1. Request OTP ===
  const handleRequestOTP = async () => {
    const body = contact.includes("@") ? { email: contact } : { phone: contact };
    const res = await fetch("/api/auth/request-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (res.ok) {
      alert("OTP berhasil dikirim! Silakan cek email atau WhatsApp Anda.");
      setStep(2);
    } else {
      alert(data.error);
    }
  };

  // === 2. Verifikasi OTP ===
  const handleVerifyOTP = async () => {
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contact, otp }),
      credentials: "include", // ✅ penting agar cookie token tersimpan
    });

    const data = await res.json();

    if (res.ok) {
      // simpan token dan user ke localStorage (untuk navbar)
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      alert("Login sukses!");

      // ✅ kalau admin → redirect ke dashboard, kalau pembeli → ke beranda
      if (data.user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } else {
      alert(data.error || "OTP salah atau sudah kadaluarsa");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96 space-y-4">
        <h1 className="text-2xl font-bold text-center text-blue-600">
          Login dengan OTP
        </h1>

        {step === 1 ? (
          <>
            <input
              type="text"
              placeholder="Email atau No. WhatsApp"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full border p-2 rounded"
            />
            <button
              onClick={handleRequestOTP}
              className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700"
            >
              Kirim OTP
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Masukkan OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full border p-2 rounded"
            />
            <button
              onClick={handleVerifyOTP}
              className="bg-green-600 text-white w-full py-2 rounded hover:bg-green-700"
            >
              Verifikasi OTP
            </button>
          </>
        )}
      </div>
    </div>
  );
}
