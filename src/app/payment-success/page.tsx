"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface PaymentStatus {
  external_id: string;
  status: string;
  amount: number;
  paid_at?: string;
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [payment, setPayment] = useState<PaymentStatus | null>(null);

  const external_id = searchParams.get("external_id");

  useEffect(() => {
    if (!external_id) return;

    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/payment/status?external_id=${external_id}`);
        const data = await res.json();
        setPayment(data.payment);
      } catch (err) {
        console.error(err);
      }
    };

    fetchStatus();
  }, [external_id]);

  if (!external_id) return <p>External ID tidak ditemukan.</p>;

  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold mb-4">Pembayaran Selesai</h1>
      {payment ? (
        <div>
          <p>Status: <span className="font-bold">{payment.status}</span></p>
          <p>Total: Rp{payment.amount.toLocaleString()}</p>
          {payment.paid_at && <p>Tanggal Bayar: {new Date(payment.paid_at).toLocaleString()}</p>}
        </div>
      ) : (
        <p>Memuat status pembayaran...</p>
      )}

      <button
        onClick={() => router.push("/")}
        className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Kembali ke Home
      </button>
    </div>
  );
}
