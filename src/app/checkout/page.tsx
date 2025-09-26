"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface CartItem {
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(stored);
  }, []);

  const saveCart = (updated: CartItem[]) => {
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    window.dispatchEvent(new Event("cartChange"));
  };

  const updateQuantity = (index: number, delta: number) => {
    const updated = [...cart];
    updated[index].quantity += delta;
    if (updated[index].quantity <= 0) updated.splice(index, 1);
    saveCart(updated);
  };

  const removeItem = (index: number) => {
    const updated = cart.filter((_, i) => i !== index);
    saveCart(updated);
  };

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // 🔹 Function untuk lanjut ke payment
  const handlePayment = async () => {
    if (cart.length === 0) return alert("Keranjang kosong!");

    try {
      const external_id = "order_" + Date.now();

      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          external_id,
          payer_email: "test@example.com",
          amount: total,
          items: cart, // 🔹 Kirim semua item cart
        }),
      });

      const data = await res.json();

      if (data.data && data.data.invoice_url) {
        window.location.href = data.data.invoice_url;
      } else {
        alert("Gagal membuat payment. Cek console.");
        console.log(data);
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat membuat payment.");
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      {cart.length === 0 ? (
        <p>
          Keranjang kosong. <Link href="/" className="text-blue-600 underline">Kembali ke Home</Link>
        </p>
      ) : (
        <div>
          {cart.map((item, i) => (
            <div key={i} className="flex items-center justify-between border-b py-4">
              <div className="flex items-center gap-4">
                <Image src={item.image} alt={item.name} width={80} height={80} />
                <div>
                  <h2 className="font-bold">{item.name}</h2>
                  <p>Rp{item.price.toLocaleString()}</p>
                  <p>Qty: {item.quantity}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => updateQuantity(i, -1)} className="px-2 py-1 bg-gray-200 rounded">-</button>
                <button onClick={() => updateQuantity(i, 1)} className="px-2 py-1 bg-gray-200 rounded">+</button>
                <button onClick={() => removeItem(i)} className="ml-4 text-red-500 font-bold">Hapus</button>
              </div>
            </div>
          ))}

          <div className="text-right mt-6">
            <h2 className="text-xl font-bold">Total: Rp{total.toLocaleString()}</h2>
            <button
              onClick={handlePayment}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Lanjut ke Pembayaran
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
