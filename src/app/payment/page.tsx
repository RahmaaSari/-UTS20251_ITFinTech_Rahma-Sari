// src/app/payment/page.tsx
"use client";
import Link from "next/link";

export default function PaymentPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg p-6 shadow">
        <Link href="/checkout" className="text-blue-500 text-sm">
          ← Back
        </Link>
        <h2 className="text-xl font-semibold mb-4">Secure Checkout</h2>

        <div className="mb-4">
          <p className="text-sm text-gray-600">Shipping Address</p>
          <div className="bg-gray-100 p-2 rounded mt-1 text-sm text-gray-700">
            Jl. Contoh No. 123, Jakarta
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm font-medium mb-2">Payment Method</p>
          <div className="space-y-2 text-sm">
            <label className="flex items-center space-x-2">
              <input type="radio" name="payment" defaultChecked /> Credit/Debit Card
            </label>
            <label className="flex items-center space-x-2">
              <input type="radio" name="payment" /> PayPal
            </label>
            <label className="flex items-center space-x-2">
              <input type="radio" name="payment" /> Other (E-Wallet, Bank Transfer)
            </label>
          </div>
        </div>

        <div className="border-t pt-3 text-sm space-y-1">
          <p>Item(s): <span className="float-right">$3.2X</span></p>
          <p>Shipping: <span className="float-right">$1.2X</span></p>
          <p className="font-semibold">Total: <span className="float-right">$3.2X</span></p>
        </div>

        <button className="w-full mt-5 bg-green-600 text-white py-2 rounded-lg">
          Confirm & Pay
        </button>
      </div>
    </div>
  );
}
