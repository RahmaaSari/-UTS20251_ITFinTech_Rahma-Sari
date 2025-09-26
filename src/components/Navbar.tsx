"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [cartCount, setCartCount] = useState(0);

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const count = cart.reduce((sum: number, item: any) => sum + item.quantity, 0);
    setCartCount(count);
  };

  useEffect(() => {
    updateCartCount();
    window.addEventListener("cartChange", updateCartCount);
    return () => {
      window.removeEventListener("cartChange", updateCartCount);
    };
  }, []);

  return (
    <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
      <Link href="/" className="text-xl font-bold">EduShop</Link>
      <div className="flex gap-6">
        <Link href="/">Home</Link>
        <Link href="/checkout">Checkout ({cartCount})</Link>
      </div>
    </nav>
  );
}
