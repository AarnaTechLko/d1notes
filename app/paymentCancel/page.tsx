// pages/paymentCancelled.tsx

import Link from 'next/link';
import React from 'react';

const PaymentCancelled: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 py-10 px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Payment Cancelled</h1>
        <p className="text-gray-700 mb-6">
          Unfortunately, your payment could not be processed at this time. Please try again or contact support if you need assistance.
        </p>
        <Link href="/">
          <a className="inline-block bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-500 transition">
            Go to Home
          </a>
        </Link>
        <Link href="/contact-support">
          <a className="inline-block ml-4 bg-gray-700 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition">
            Contact Support
          </a>
        </Link>
      </div>
    </div>
  );
};

export default PaymentCancelled;
