// pages/paymentCancelled.tsx
"use client"; // Ensure this is a client component


import Link from 'next/link';
import React,{useEffect} from 'react';
import { getSession} from "next-auth/react";



const PaymentCancelled: React.FC = () => {

  useEffect(() => {
  
    const fetchOrders = async () => {

      // const session = await getSession();

      // console.log("session: ", session)
      const urlParams = new URLSearchParams(window.location.search);
      const evaluation_id = urlParams.get("evaluation_id");

      console.log("evaluation_id: ", evaluation_id);

      const response = await fetch('/api/delete-unpaid-evaluation', {
       method: 'DELETE',
       headers: {
           'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        evaluation_id
      })
      })
     };
  
     fetchOrders();
  
  })

  //  console.log(session.email);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 py-10 px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Payment Cancelled</h1>
        <p className="text-gray-700 mb-6">
          Unfortunately, your payment could not be processed at this time. Please try again or contact support if you need assistance.
        </p>
        <Link className="inline-block bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-500 transition" href="/browse">
            Go to Home
        </Link>
        <Link className="inline-block ml-4 bg-gray-700 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition" href="/contact-support">
            Contact Support
        </Link>
      </div>
    </div>
  );
};

export default PaymentCancelled;
