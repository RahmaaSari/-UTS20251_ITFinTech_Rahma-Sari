"use client";

import { useEffect, useState } from "react";

interface CartItem {
  price: number;
  quantity: number;
  name?: string;
  image?: string;
}

export default function PaymentPage() {
  const [total, setTotal] = useState(0);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(stored);
    const t = stored.reduce((sum: number, i: CartItem) => sum + i.price * i.quantity, 0);
    setTotal(t);
  }, []);

  const handlePayment = async () => {
    if (cart.length === 0) return alert("Keranjang kosong!");

    setLoading(true);

    try {
      // Gunakan external_id unik
      const external_id = "order_" + Date.now();

      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          external_id,
          amount: total,
          payer_email: "test@example.com", // bisa diganti sesuai input user
        }),
      });

      const data = await res.json();

      if (data.data && data.data.invoice_url) {
        // redirect ke Xendit checkout page
        window.location.href = data.data.invoice_url;
      } else {
        alert("Gagal membuat payment. Cek console.");
        console.log(data);
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat membuat payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Pembayaran</h1>
      <p>Total yang harus dibayar: <span className="font-bold">Rp{total.toLocaleString()}</span></p>
      <button
        onClick={handlePayment}
        disabled={loading}
        className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Memproses..." : "Bayar Sekarang"}
      </button>
    </div>
  );
}
