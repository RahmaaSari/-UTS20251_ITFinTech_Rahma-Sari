"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";

interface CartItem {
  quantity: number;
  price?: number;
  name?: string;
  image?: string;
}

export default function Navbar() {
  const [cartCount, setCartCount] = useState(0);

  const updateCartCount = () => {
    const cart: CartItem[] = JSON.parse(localStorage.getItem("cart") || "[]");
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    setCartCount(count);
  };

  useEffect(() => {
    updateCartCount();
    window.addEventListener("cartChange", updateCartCount);

    // Reset cart setelah pembayaran sukses
    if (window.location.pathname === "/payment-success") {
      localStorage.removeItem("cart");
      setCartCount(0);
    }

    return () => {
      window.removeEventListener("cartChange", updateCartCount);
    };
  }, []);

  return (
    <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center shadow-md">
      {/* Logo / Brand */}
      <Link href="/" className="text-2xl font-bold tracking-wide hover:text-gray-200 transition-colors">
        EduShop
      </Link>

      {/* Menu kanan */}
      <div className="flex gap-6 items-center">
        <Link
          href="/"
          className="hover:text-gray-200 transition-colors font-medium"
        >
          Home
        </Link>

        {/* Ikon keranjang dengan badge */}
        <Link href="/checkout" className="relative">
          <ShoppingCart className="w-6 h-6 hover:text-gray-200 transition-colors" />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-3 bg-red-500 text-xs font-bold px-2 py-0.5 rounded-full">
              {cartCount}
            </span>
          )}
        </Link>
      </div>
    </nav>
  );
}