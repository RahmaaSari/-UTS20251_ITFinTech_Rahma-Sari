import Image from "next/image";

interface ProductCardProps {
  name: string;
  price: number;
  image: string;
}

export default function ProductCard({ name, price, image }: ProductCardProps) {
  return (
    <div className="bg-white shadow rounded p-4 text-center">
      <Image
        src={image}
        alt={name}
        width={300}
        height={300}
        className="rounded mx-auto"
      />
      <h3 className="mt-4 text-lg font-bold">{name}</h3>
      <p className="text-gray-700 mb-4">Rp{price.toLocaleString()}</p>
      <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Add to Cart
      </button>
    </div>
  );
}
