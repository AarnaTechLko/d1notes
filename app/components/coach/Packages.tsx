 
import { loadStripe } from '@stripe/stripe-js';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!); // Your Stripe publishable key
interface PackageData {
    id: number;
    packageName: string;
    amount: string; // HTML content field
    details: string; // New column for image URL
  }
  const Packages: React.FC = () => {
    const handleBuyNow = async (pkgId: string, amount: number) => {
        const stripe = await stripePromise;
        const response = await fetch('/api/coach/packagepayments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            packageId: pkgId,
            amount: amount,
            organizationId: organizationId,
          }),
        });
        const session = await response.json();
      
        const result = await stripe?.redirectToCheckout({ sessionId: session.id });
      
        if (result?.error) {
          console.error('Error redirecting to checkout:', result.error.message);
        }
      };
      
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [organizationId,setorganizationId]=useState<Number>();
  const { data: sessions } = useSession();

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetch('/api/packages');
        const data = await response.json();
       /// console.log(data);
        setPackages(data.packages);
      } catch (error) {
        console.error('Error fetching packages:', error);
      }
    };
    if (sessions && sessions.user) {
        const id = Number(sessions.user.id); // Convert to number
        setorganizationId(id); // Set playerId or null if conversion fails
    }
    

    fetchPackages();
  }, [sessions]);
  return (
    <div className="flex flex-col items-center min-h-screen py-10  text-black">
      <h2 className="text-4xl font-bold mb-6">Pricing Packages</h2>
      <div className="flex flex-wrap justify-center gap-6">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className="bg-white text-black rounded-lg shadow-lg p-6 w-80 border-t-8 border-blue-500"
          >
            <h3 className="text-2xl font-semibold text-center">{pkg.packageName}</h3>
            <p className="text-center text-4xl font-bold mt-4">${pkg.amount} </p>
            <p className="text-center text-sm text-gray-500  mt-5">{pkg.details}</p>
            <button
            onClick={() => handleBuyNow(pkg.id.toString(),parseFloat(pkg.amount))}
            className="bg-blue-500 text-white p-2 rounded-lg mt-4 w-full"
          >
            Buy Now
          </button> 
          </div>
          
        ))}
      </div>
      
    </div>
  );
};

export default Packages;
