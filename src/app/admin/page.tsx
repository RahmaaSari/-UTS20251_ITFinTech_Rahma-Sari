"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

interface Product {
  _id?: string;
  name: string;
  description: string;
  price: number;
  image: string;
  sold?: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState<Product>({
    name: "",
    description: "",
    price: 0,
    image: "",
  });

  // Ambil data statistik dan produk
  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then(setStats);

    fetch("/api/admin/products")
      .then((res) => res.json())
      .then(setProducts);
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus produk ini?")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    setProducts(products.filter((p) => p._id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const method = editingProduct ? "PUT" : "POST";
    const url = editingProduct ? `/api/admin/products/${editingProduct._id}` : "/api/admin/products";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const updated = await fetch("/api/admin/products").then((res) => res.json());
    setProducts(updated);
    setFormData({ name: "", description: "", price: 0, image: "" });
    setEditingProduct(null);
    setIsFormOpen(false);
  };

  if (!stats) return <p className="p-8 text-gray-500">Memuat dashboard...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-6 text-blue-600">Dashboard Admin</h1>

      {/* === RINGKASAN === */}
      <div className="grid grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded shadow text-center">
            <p className="text-gray-500">Pembayaran Lunas</p>
            <h2 className="text-2xl font-bold">{stats.totalLunas}</h2>
        </div>
        <div className="bg-white p-6 rounded shadow text-center">
            <p className="text-gray-500">Total Omzet</p>
            <h2 className="text-2xl font-bold">Rp {stats.totalOmzet.toLocaleString()}</h2>
        </div>
        <div className="bg-white p-6 rounded shadow text-center">
            <p className="text-gray-500">Produk Terjual</p>
            <h2 className="text-2xl font-bold">{stats.totalProdukTerjual}</h2>
        </div>
        </div>

      {/* === GRAFIK === */}
      <div className="bg-white p-6 rounded shadow mb-10">
        <h3 className="text-xl font-semibold mb-4 text-blue-700">Grafik Penjualan Harian</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={stats.daily}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="_id" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* === PRODUK === */}
      <div className="bg-white p-6 rounded shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-blue-600">Daftar Produk</h2>
          <button
            onClick={() => {
              setEditingProduct(null);
              setIsFormOpen(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Tambah Produk
          </button>
        </div>

        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Gambar</th>
              <th className="border p-2">Nama</th>
              <th className="border p-2">Harga</th>
              <th className="border p-2">Deskripsi</th>
              <th className="border p-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td className="border p-2">
                  <img src={p.image} alt={p.name} className="w-16 h-16 object-cover rounded" />
                </td>
                <td className="border p-2">{p.name}</td>
                <td className="border p-2">Rp {p.price.toLocaleString()}</td>
                <td className="border p-2">{p.description}</td>
                <td className="border p-2 text-center space-x-2">
                  <button
                    onClick={() => {
                      setEditingProduct(p);
                      setFormData(p);
                      setIsFormOpen(true);
                    }}
                    className="bg-yellow-400 text-white px-2 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p._id!)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* === FORM TAMBAH / EDIT === */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow w-96">
            <h3 className="text-lg font-semibold mb-4">
              {editingProduct ? "Edit Produk" : "Tambah Produk"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Nama Produk"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border p-2 rounded"
                required
              />
              <input
                type="number"
                placeholder="Harga"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full border p-2 rounded"
                required
              />
              <textarea
                placeholder="Deskripsi"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border p-2 rounded"
              />

              <input
              type="file"
            accept="image/*"
            onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                const formDataFile = new FormData();
                formDataFile.append("file", file);

                const res = await fetch("/api/upload", {
                method: "POST",
                body: formDataFile,
                });

                const data = await res.json();
                if (data.path) {
                setFormData({ ...formData, image: data.path });
                }
            }}
            className="w-full border p-2 rounded"
              />

              {formData.image && (
            <img
                src={formData.image}
                alt="Preview"
                className="w-32 h-32 object-cover rounded"
            />
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="bg-gray-400 text-white px-3 py-1 rounded"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-3 py-1 rounded"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
