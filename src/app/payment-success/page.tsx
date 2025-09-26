"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const external_id = searchParams.get("external_id");
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!external_id) return;

    const fetchStatus = async () => {
      const res = await fetch(`/api/payment/status?external_id=${external_id}`);
      const data = await res.json();
      setStatus(data.payment?.status ?? "Unknown");
    };

    fetchStatus();
  }, [external_id]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Status Pembayaran</h1>
      <p>External ID: {external_id}</p>
      <p>Status: {status ?? "Loading..."}</p>
    </div>
  );
}
