"use client";
import { useEffect, useState } from "react";

export default function CheckoutPage() {
  const [items, setItems] = useState<any[]>([]);

  const fetchCheckout = async () => {
    const res = await fetch("/api/checkout");
    const data = await res.json();
    setItems(data);
  };

  useEffect(() => {
    fetchCheckout();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>
      {items.map((item) => (
        <div key={item._id} className="border p-4 rounded-lg flex justify-between mb-2">
          <p>{item.productId}</p>
          <p>Qty: {item.quantity}</p>
        </div>
      ))}
      <a
        href="/payment"
        className="bg-green-500 text-white px-4 py-2 rounded inline-block mt-4"
      >
        Continue to Payment →
      </a>
    </div>
  );
}
