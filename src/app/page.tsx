import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";

export default function HomePage() {
  const products = [
    { name: "Mainan Edukasi Anak", price: 120000, image: "/images/Mainan.jpg" },
    { name: "Puzzle Warna", price: 99000, image: "/images/Puzzle.png" },
    { name: "Buku Anak Islami", price: 150000, image: "/images/Buku.jpg" },
  ];

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="p-10">
        <h2 className="text-2xl font-bold mb-6">Our Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((p, i) => (
            <ProductCard key={i} {...p} />
          ))}
        </div>
      </section>
    </main>
  );
}
