import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import ProductCard from "@/components/ProductCard";

export default async function HomePage() {
  await connectDB();
  const products = await Product.find().lean();

  return (
    <main className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
      {products.map((p: any) => (
        <ProductCard
          key={p._id}
          name={p.name}
          price={p.price}
          image={p.image}
        />
      ))}
    </main>
  );
}
