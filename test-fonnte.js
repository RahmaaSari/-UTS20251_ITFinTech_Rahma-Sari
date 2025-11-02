require("dotenv").config({ path: '.env.local' });  // ← spesifik ke file .env.local
const fetch = require("node-fetch");

// Debug
console.log("📁 Loading from:", '.env.local');
console.log("🔑 FONNTE_API_KEY:", process.env.FONNTE_API_KEY || "KOSONG");

async function testFonnte() {
  if (!process.env.FONNTE_API_KEY) {
    console.log("❌ Token tidak ditemukan!");
    return;
  }

  try {
    console.log("🚀 Mengirim pesan dengan token:", process.env.FONNTE_API_KEY.substring(0, 10) + "...");
    
    const response = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        Authorization: process.env.FONNTE_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        target: "6289527737000",
        message: "Halo! Ini pesan uji coba dari integrasi Fonnte 🚀",
      }),
    });

    const data = await response.json();
    console.log("✅ Hasil respons dari Fonnte:", data);
  } catch (error) {
    console.error("❌ Gagal mengirim pesan ke Fonnte:", error);
  }
}

testFonnte();