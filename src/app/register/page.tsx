"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("pembeli");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, role }),
    });
    const data = await res.json();
    if (res.ok) {
      alert("Registrasi berhasil, silakan login!");
      router.push("/login");
    } else {
      alert(data.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96 space-y-4">
        <h1 className="text-2xl font-bold text-center text-blue-600">Register</h1>
        <input type="text" placeholder="Nama Lengkap" value={name} onChange={(e) => setName(e.target.value)} className="w-full border p-2 rounded" required />
        <input type="email" placeholder="Email (opsional)" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border p-2 rounded" />
        <input type="text" placeholder="Nomor WhatsApp (628...)" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border p-2 rounded" />
        <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full border p-2 rounded">
          <option value="pembeli">Pembeli</option>
          <option value="admin">Admin</option>
        </select>
        <button className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700">Daftar</button>
      </form>
    </div>
  );
}
