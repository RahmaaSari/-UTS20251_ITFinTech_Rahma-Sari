import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import ProductCard from "@/components/ProductCard";

export interface ProductType {
  _id: string;
  name: string;
  price: number;
  image: string;
}

export default async function HomePage() {
  await connectDB();

  const products = (await Product.find().lean()) as unknown as ProductType[];

  return (
    <main className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
      {products.map((p) => (
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
