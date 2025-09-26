import { Suspense } from 'react';
import PaymentSuccessContent from '@/app/payment-success/PaymentSuccessContent';

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Status Pembayaran</h1>
        <p>Loading...</p>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}