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

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const t = cart.reduce((sum: number, i: CartItem) => sum + i.price * i.quantity, 0);
    setTotal(t);
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Pembayaran</h1>
      <p>Total yang harus dibayar: <span className="font-bold">Rp{total.toLocaleString()}</span></p>
      <button className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Bayar Sekarang
      </button>
    </div>
  );
}
