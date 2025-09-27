"use client";

import { useEffect, useState } from "react";

interface Payment {
  external_id: string;
  email: string;
  amount: number;
  status: string;
}

export default function PaymentSuccessPage() {
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const external_id = params.get("external_id");

    if (!external_id) {
      setError("❌ external_id tidak ditemukan di URL");
      setLoading(false);
      return;
    }

    fetch(`/api/payment/status?external_id=${external_id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.payment) {
          setPayment(data.payment);
        } else {
          setError(data.error || "❌ Transaksi tidak ditemukan");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("❌ Gagal mengambil data dari server");
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center mt-10">🔄 Mengecek status pembayaran...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {payment?.status === "LUNAS" ? (
        <>
          <h1 className="text-3xl font-bold text-green-600">✅ Pembayaran Berhasil!</h1>
          <p className="mt-4 text-gray-700">
            Terima kasih, transaksi dengan ID <b>{payment.external_id}</b> sudah <b>LUNAS</b>.
          </p>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-bold text-yellow-600">⌛ Menunggu Pembayaran</h1>
          <p className="mt-4 text-gray-700">
            Status transaksi: <b>{payment?.status}</b>
          </p>
        </>
      )}
    </div>
  );
}