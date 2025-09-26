import Navbar from "@/components/Navbar";

export default function CartPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="p-10">
        <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
        <p className="text-gray-700">Your cart is currently empty.</p>
      </section>
    </main>
  );
}
