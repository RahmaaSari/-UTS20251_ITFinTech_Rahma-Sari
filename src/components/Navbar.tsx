// src/components/Navbar.tsx
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm py-3">
      <div className="max-w-4xl mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <div className="font-bold text-lg">Logo</div>

        {/* Icon Cart */}
        <div className="flex items-center space-x-4">
          <Link href="/checkout" className="flex items-center space-x-2">
            <span className="text-xl">🛒</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
