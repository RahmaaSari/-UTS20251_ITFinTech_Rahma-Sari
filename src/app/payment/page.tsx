"use client";

import { useEffect, useState } from "react";

interface CartItem {
  price: number;
  quantity: number;
  name?: string;
}

export default function PaymentPage() {
  const [total, setTotal] = useState(0);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const serviceFee = 1000; // ✅ biaya layanan tetap

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(stored);
    const subtotal = stored.reduce(
      (sum: number, i: CartItem) => sum + i.price * i.quantity,
      0
    );
    setTotal(subtotal + serviceFee); // ✅ total sudah termasuk biaya layanan
  }, []);

  const handlePayment = async () => {
    if (cart.length === 0) return alert("Keranjang kosong!");

    const email = prompt("Masukkan email untuk menerima invoice pembayaran:");
    if (!email) return alert("Email wajib diisi!");

    setLoading(true);

    try {
      const external_id = "order_" + Date.now();

      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          external_id,
          email,
          amount: total,
          items: [
            ...cart.map((item) => ({
              name: item.name || "Produk EduShop",
              quantity: item.quantity,
              price: item.price,
            })),
            {
              name: "Biaya Layanan Aplikasi", // ✅ tambahan
              quantity: 1,
              price: serviceFee,
            },
          ],
        }),
      });

      const data = await res.json();
      console.log("📦 Response dari API:", data);

      if (data.invoice_url) {
        window.location.href = data.invoice_url;
      } else {
        alert(`Gagal membuat payment: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat membuat payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-8 border rounded-lg shadow-md mt-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Pembayaran</h1>

      {/* ✅ Daftar Invoice */}
      <div className="mb-6">
        {cart.map((item, idx) => (
          <div
            key={idx}
            className="flex justify-between items-center border-b py-2"
          >
            <span>
              {item.name} x {item.quantity}
            </span>
            <span>
              Rp{(item.price * item.quantity).toLocaleString()}
            </span>
          </div>
        ))}
        {/* Tambahkan biaya layanan */}
        <div className="flex justify-between items-center border-t pt-2 font-medium text-sm text-gray-700">
          <span>Biaya Layanan Aplikasi</span>
          <span>Rp{serviceFee.toLocaleString()}</span>
        </div>
      </div>

      {/* ✅ Total */}
      <div className="bg-gray-50 p-4 rounded-md mb-6">
        <p className="text-lg">
          Total yang harus dibayar:{" "}
          <span className="font-bold text-green-600">
            Rp{total.toLocaleString()}
          </span>
        </p>
      </div>

      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
      >
        {loading ? "Memproses Pembayaran..." : "Bayar Sekarang"}
      </button>
    </div>
  );
}