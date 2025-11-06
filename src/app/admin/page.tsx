"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

interface Product {
  _id?: string;
  name: string;
  description: string;
  price: number;
  image: string;
  sold?: number;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AdminDashboard() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Product>({
    name: "",
    description: "",
    price: 0,
    image: "",
  });
  const [chartView, setChartView] = useState<"daily" | "weekly" | "monthly">("daily");

  // auto-refresh setiap 10 detik
  const { data: stats, error: statsError } = useSWR("/api/stats", fetcher, {
    refreshInterval: 10000,
  });

  const { data: products, mutate: refreshProducts } = useSWR(
    "/api/admin/products",
    fetcher,
    { refreshInterval: 10000 }
  );

  if (!stats || !products)
    return <p className="p-8 text-gray-500">Memuat dashboard...</p>;

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus produk ini?")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    refreshProducts();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingProduct ? "PUT" : "POST";
    const url = editingProduct
      ? `/api/admin/products/${editingProduct._id}`
      : "/api/admin/products";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    setFormData({ name: "", description: "", price: 0, image: "" });
    setEditingProduct(null);
    setIsFormOpen(false);
    refreshProducts();
  };

  // ambil data sesuai toggle grafik
  const chartData =
    chartView === "weekly"
      ? stats.weekly
      : chartView === "monthly"
      ? stats.monthly
      : stats.daily;

  const chartTitle =
    chartView === "weekly"
      ? "Grafik Penjualan Mingguan"
      : chartView === "monthly"
      ? "Grafik Penjualan Bulanan"
      : "Grafik Penjualan Harian";

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
          <h2 className="text-2xl font-bold">
            Rp {stats.totalOmzet.toLocaleString()}
          </h2>
        </div>
        <div className="bg-white p-6 rounded shadow text-center">
          <p className="text-gray-500">Produk Terjual</p>
          <h2 className="text-2xl font-bold">{stats.totalProdukTerjual}</h2>
        </div>
      </div>

      {/* === GRAFIK PENJUALAN === */}
      <div className="bg-white p-6 rounded shadow mb-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-blue-700">{chartTitle}</h3>
          <div className="space-x-2">
            <button
              className={`px-3 py-1 rounded ${
                chartView === "daily" ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
              onClick={() => setChartView("daily")}
            >
              Harian
            </button>
            <button
              className={`px-3 py-1 rounded ${
                chartView === "weekly" ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
              onClick={() => setChartView("weekly")}
            >
              Mingguan
            </button>
            <button
              className={`px-3 py-1 rounded ${
                chartView === "monthly" ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
              onClick={() => setChartView("monthly")}
            >
              Bulanan
            </button>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
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
            {products.map((p: Product) => (
              <tr key={p._id}>
                <td className="border p-2">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-16 h-16 object-cover rounded"
                  />
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
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full border p-2 rounded"
                required
              />
              <input
                type="number"
                placeholder="Harga"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: Number(e.target.value) })
                }
                className="w-full border p-2 rounded"
                required
              />
              <textarea
                placeholder="Deskripsi"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
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

      {/* === TRANSAKSI === */}
      <div className="bg-white p-6 rounded shadow mt-10">
        <h2 className="text-xl font-semibold text-blue-600 mb-4">
          Daftar Transaksi
        </h2>

        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Tanggal</th>
              <th className="border p-2">Pembeli</th>
              <th className="border p-2">Total</th>
              <th className="border p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {stats.orders?.map((order: any) => (
              <tr key={order._id}>
                <td className="border p-2">
                  {new Date(order.createdAt).toLocaleDateString("id-ID")}
                </td>
                <td className="border p-2">{order.userId}</td>
                <td className="border p-2">
                  Rp {order.totalAmount.toLocaleString()}
                </td>
                <td
                  className={`border p-2 font-semibold ${
                    order.status === "paid"
                      ? "text-green-600"
                      : "text-yellow-600"
                  }`}
                >
                  {order.status === "paid" ? "Lunas" : "Menunggu"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
