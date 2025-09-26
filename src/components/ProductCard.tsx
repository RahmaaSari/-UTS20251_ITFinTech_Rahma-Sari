"use client";

import Image from "next/image";

interface ProductCardProps {
  name: string;
  price: number;
  image: string;
}

interface CartItem {
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export default function ProductCard({ name, price, image }: ProductCardProps) {
  const addToCart = () => {
    const cart: CartItem[] = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find((item) => item.name === name);

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ name, price, image, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    window.dispatchEvent(new Event("cartChange"));

    alert(`${name} ditambahkan ke keranjang!`);
  };

  return (
    <div className="bg-white shadow rounded p-4 text-center">
      <Image src={image} alt={name} width={300} height={300} className="rounded mx-auto" />
      <h3 className="mt-4 text-lg font-bold">{name}</h3>
      <p className="text-gray-700 mb-4">Rp{price.toLocaleString()}</p>
      <button
        onClick={addToCart}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Add to Cart
      </button>
    </div>
  );
}
