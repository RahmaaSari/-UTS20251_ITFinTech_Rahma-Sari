"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

interface CartItem {
  quantity: number;
  price?: number;
  name?: string;
  image?: string;
}

export default function Navbar() {
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState<{ name?: string; email?: string; role?: string } | null>(null);

  const updateCartCount = () => {
    const cart: CartItem[] = JSON.parse(localStorage.getItem("cart") || "[]");
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    setCartCount(count);
  };

  const checkUser = () => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      setUser(JSON.parse(userData));
    } else {
      setUser(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    alert("Anda telah logout.");
    window.location.href = "/";
  };

  useEffect(() => {
    updateCartCount();
    checkUser();
    window.addEventListener("cartChange", updateCartCount);
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
      {/* Logo */}
      <Link href="/" className="text-2xl font-bold tracking-wide hover:text-gray-200 transition-colors">
        EduShop
      </Link>

      <div className="flex gap-6 items-center">
        {/* ❌ Hilangkan link Home jika admin */}
        {user?.role !== "admin" && (
          <Link href="/" className="hover:text-gray-200 transition-colors font-medium">
            Home
          </Link>
        )}

        {/* Hanya admin yang bisa lihat Dashboard */}
        {user?.role === "admin" && (
          <Link href="/admin" className="hover:text-gray-200 transition-colors font-medium">
            Dashboard
          </Link>
        )}

        {/* Jika belum login */}
        {!user && (
          <>
            <Link
              href="/login"
              className="bg-white text-blue-600 font-semibold px-3 py-1 rounded-md hover:bg-gray-100 transition"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="bg-green-500 text-white font-semibold px-3 py-1 rounded-md hover:bg-green-600 transition"
            >
              Register
            </Link>
          </>
        )}

        {/* Jika sudah login */}
        {user && (
          <>
            <span className="font-medium">
              👋 {user.name || user.email} ({user.role})
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md"
            >
              Logout
            </button>
          </>
        )}

        {/* 🛒 Keranjang hanya untuk pembeli dan login */}
        {user?.role !== "admin" && (
          <a
            href="/checkout"
            onClick={(e) => {
              e.preventDefault();
              const token = localStorage.getItem("token");
              if (!token) {
                alert("Silakan login untuk melihat keranjang Anda.");
                window.location.href = "/login";
                return;
              }
              window.location.href = "/checkout";
            }}
            className="relative"
          >
            <ShoppingCart className="w-6 h-6 hover:text-gray-200 transition-colors" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-500 text-xs font-bold px-2 py-0.5 rounded-full">
                {cartCount}
              </span>
            )}
          </a>
        )}
      </div>
    </nav>
  );
}


// "use client";

// import Link from "next/link";
// import { useEffect, useState } from "react";
// import { ShoppingCart } from "lucide-react";

// interface CartItem {
//   quantity: number;
//   price?: number;
//   name?: string;
//   image?: string;
// }

// export default function Navbar() {
//   const [cartCount, setCartCount] = useState(0);

//   const updateCartCount = () => {
//     const cart: CartItem[] = JSON.parse(localStorage.getItem("cart") || "[]");
//     const count = cart.reduce((sum, item) => sum + item.quantity, 0);
//     setCartCount(count);
//   };

//   useEffect(() => {
//     updateCartCount();
//     window.addEventListener("cartChange", updateCartCount);

//     // Reset cart setelah pembayaran sukses
//     if (window.location.pathname === "/payment-success") {
//       localStorage.removeItem("cart");
//       setCartCount(0);
//     }

//     return () => {
//       window.removeEventListener("cartChange", updateCartCount);
//     };
//   }, []);

//   return (
//     <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center shadow-md">
//       {/* Logo / Brand */}
//       <Link href="/" className="text-2xl font-bold tracking-wide hover:text-gray-200 transition-colors">
//         EduShop
//       </Link>

//       {/* Menu kanan */}
//       <div className="flex gap-6 items-center">
//         <Link
//           href="/"
//           className="hover:text-gray-200 transition-colors font-medium"
//         >
//           Home
//         </Link>

//         {/* Ikon keranjang dengan badge */}
//         <Link href="/checkout" className="relative">
//           <ShoppingCart className="w-6 h-6 hover:text-gray-200 transition-colors" />
//           {cartCount > 0 && (
//             <span className="absolute -top-2 -right-3 bg-red-500 text-xs font-bold px-2 py-0.5 rounded-full">
//               {cartCount}
//             </span>
//           )}
//         </Link>
//       </div>
//     </nav>
//   );
// }
