import { loadStripe } from '@stripe/stripe-js';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PackageData {
  id: number;
  packageName: string;
  amount: string; // HTML content field
  details: string; // New column for image URL
}

const Packages: React.FC = () => {
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [loadingPackageId, setLoadingPackageId] = useState<number | null>(null);
  const [organizationId, setOrganizationId] = useState<number>();
  const { data: sessions } = useSession();

  const handleBuyNow = async (pkgId: string, amount: number) => {
    try {
      setLoadingPackageId(Number(pkgId)); // Set loading state for the clicked button
      const stripe = await stripePromise;
      const response = await fetch('/api/enterprise/packagepayments', {
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
    } catch (error) {
      console.error('Error processing payment:', error);
    } finally {
      setLoadingPackageId(null); // Reset loading state
    }
  };

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetch('/api/packages');
        const data = await response.json();
        setPackages(data.packages);
      } catch (error) {
        console.error('Error fetching packages:', error);
      }
    };

    if (sessions && sessions.user) {
      const id = Number(sessions.user.id);
      setOrganizationId(id);
    }

    fetchPackages();
  }, [sessions]);

  return (
    <div className="flex flex-col items-center py-10 text-black">
      <h2 className="text-4xl font-bold mb-6">Pricing Packages</h2>
      <div className="flex flex-wrap justify-center gap-6">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className="bg-white text-black rounded-lg shadow-lg p-6 w-80 border-t-8 border-blue-500"
          >
            <h3 className="text-2xl font-semibold text-center">{pkg.packageName}</h3>
            <p className="text-center text-4xl font-bold mt-4">${pkg.amount}</p>
            <p className="text-center text-sm text-gray-500 mt-5">{pkg.details}</p>
            <button
              onClick={() => handleBuyNow(pkg.id.toString(), parseFloat(pkg.amount))}
              className={`bg-blue-500 text-white p-2 rounded-lg mt-4 w-full ${
                loadingPackageId === pkg.id ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={loadingPackageId === pkg.id}
            >
              {loadingPackageId === pkg.id ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
                  </svg>
                  <span className="ml-2">Processing...</span>
                </div>
              ) : (
                'Purchase Now'
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Packages;
