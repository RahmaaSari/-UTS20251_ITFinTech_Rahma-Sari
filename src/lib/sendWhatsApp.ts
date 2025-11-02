import fetch from "node-fetch";

export async function sendWhatsApp(target: string, message: string) {
  if (!process.env.FONNTE_API_KEY) {
    console.error("❌ FONNTE_API_KEY belum di-set di .env");
    return;
  }

  try {
    const res = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        Authorization: process.env.FONNTE_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ target, message }),
    });

    const data = await res.json();
    if (!data.status) console.warn("⚠️  Fonnte response:", data);
    else console.log("✅ Pesan WA terkirim:", data);
    return data;
  } catch (err) {
    console.error("❌ Error kirim WA:", err);
  }
}
