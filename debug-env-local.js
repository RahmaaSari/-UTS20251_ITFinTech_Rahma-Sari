const fs = require('fs');
const path = require('path');

console.log("🔍 DEBUG FILE .env.local");
console.log("=========================");

const envPath = path.join(__dirname, '.env.local');

// Cek apakah file exists
console.log("📁 Path .env.local:", envPath);
console.log("📄 File exists:", fs.existsSync(envPath));

if (fs.existsSync(envPath)) {
  const fileContent = fs.readFileSync(envPath, 'utf8');
  console.log("📋 Content file .env.local:");
  console.log("---------------------------");
  console.log(fileContent);
  console.log("---------------------------");
}

// Test dengan dotenv ke .env.local
console.log("\n🔄 Testing dotenv with .env.local:");
require("dotenv").config({ path: '.env.local' });
console.log("FONNTE_API_KEY:", process.env.FONNTE_API_KEY || "UNDEFINED");