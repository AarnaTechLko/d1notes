"use client"; 
import { useEffect, useState } from 'react';
import { NextPage } from 'next';

interface PaymentDetails {
  payment_status: string;
  amount_total: number;
  currency: string;
  customer_email: string;
  payment_intent: string; // Added to display payment intent
}

const fetchPaymentDetails = async (session_id: string): Promise<PaymentDetails | null> => {
  try {
    const response = await fetch(`/api/payment?session_id=${session_id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch payment details');
    }

    const paymentData = await response.json();
    return paymentData;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const PaymentDonePage: NextPage<{ searchParams: { session_id?: string } }> = ({ searchParams }) => {
  const { session_id } = searchParams;
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session_id) {
      setError('Error: Session ID is missing');
      return;
    }

    const getPaymentDetails = async () => {
      const details = await fetchPaymentDetails(session_id as string);
      if (!details) {
        setError('Error: Unable to fetch payment details');
      } else {
        setPaymentDetails(details);
      }
    };

    getPaymentDetails();
  }, [session_id]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-100 text-red-800 border border-red-300 p-4 rounded shadow">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!paymentDetails) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-gray-900 flex items-center justify-center">
  <div className="max-w-xl w-full bg-white rounded-lg shadow-md p-6">
    <h1 className="text-2xl font-bold mb-4 text-center">Payment Details</h1>
    <div className="mb-4">
      <p className="text-lg">
        <strong>Payment status:</strong> {paymentDetails.payment_status.charAt(0).toUpperCase() + paymentDetails.payment_status.slice(1)}
      </p>
      <p className="text-lg">
        <strong>Total Amount:</strong> {(paymentDetails.amount_total / 100).toFixed(2)} {paymentDetails.currency?.toUpperCase()}
      </p>

      <p className="text-lg">
        <strong>Reference ID:</strong> {paymentDetails.payment_intent}
      </p>
    </div>
    <button className="w-full py-2 mt-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200">
      <a href='/dashboard'>Go to Dashboard</a>
    </button>
  </div>
</div>

  );
};

export default PaymentDonePage;
