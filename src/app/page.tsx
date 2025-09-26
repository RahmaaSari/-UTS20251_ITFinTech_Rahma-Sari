"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, []);

  const handleAddToCheckout = async (productId: string) => {
    await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: 1 }),
    });
    alert("Product added to checkout!");
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Select Item</h1>
      <div className="grid grid-cols-1 gap-4">
        {products.map((p) => (
          <div key={p._id} className="border p-4 rounded-lg flex justify-between">
            <div>
              <h2 className="font-semibold">{p.name}</h2>
              <p className="text-sm">{p.description}</p>
              <p className="font-bold">${p.price}</p>
            </div>
            <button
              onClick={() => handleAddToCheckout(p._id)}
              className="bg-blue-500 text-white px-3 py-1 rounded"
            >
              Add +
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
