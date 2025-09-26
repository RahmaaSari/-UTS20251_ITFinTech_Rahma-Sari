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
    // 🔹 Trigger update ke Navbar
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
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => updateQuantity(i, -1)}
                  className="px-2 py-1 bg-gray-200 rounded"
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(i, 1)}
                  className="px-2 py-1 bg-gray-200 rounded"
                >
                  +
                </button>
                <button
                  onClick={() => removeItem(i)}
                  className="ml-4 text-red-500 font-bold"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}

          <div className="text-right mt-6">
            <h2 className="text-xl font-bold">Total: Rp{total.toLocaleString()}</h2>
            <Link href="/payment">
              <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Lanjut ke Pembayaran
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
