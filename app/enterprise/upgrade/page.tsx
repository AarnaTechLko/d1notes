"use client";
import React, { useEffect, useState } from "react";
import "../../globals.css";
import Sidebar from "../../components/enterprise/Sidebar";
import { getSession, useSession, signIn } from "next-auth/react";
import { licensePackages } from "@/lib/constants";
import { loadStripe } from '@stripe/stripe-js';
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
interface License {
  id: number;
  minimum_license: number;
  maximum_license: number;
  amount: number;
}

const Dashboard: React.FC = () => {
  const { data: sessions } = useSession();
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
  const [licenseCount, setLicenseCount] = useState<number>(0);
  const [showModal, setShowModal] = useState(false);
  const [loadingPackageId, setLoadingPackageId] = useState<number | null>(null);
  const [organizationId, setOrganizationId] = useState<number>();
  const handlePurchase = (license:any) => {
    setSelectedLicense(license);
    setLicenseCount(license.minimum_license); // Initialize with minimum license count
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedLicense(null);
  };

  const handleLicenseCountChange = (value: number) => {
    setLicenseCount(value);
  
    const matchingLicense = licensePackages.find((pkg) => {
      const maxLicense = typeof pkg.maximum_license === 'string' ? Number(pkg.maximum_license) : pkg.maximum_license; // Convert to number if it's a string
      return value >= pkg.minimum_license && value <= maxLicense;
    });
  
    if (matchingLicense) {
      // Ensure that the matching license has maximum_license as a number
      const validLicense = {
        ...matchingLicense,
        maximum_license: Number(matchingLicense.maximum_license), // Ensure number type
      };
      setSelectedLicense(validLicense); // Update the selected license range dynamically
    }
  };
  
  
  

  const totalAmount = selectedLicense ? licenseCount * selectedLicense.amount : 0;


  const handleBuyNow = async (amount: number) => {
    try {
      setLoadingPackageId(amount); // Set loading state for the clicked button
      const stripe = await stripePromise;
      const payload={
        packageId:1,
        amount: amount,
        no_of_licenses: licenseCount,
        rate: amount / licenseCount,
        organizationId: organizationId,
      };
 
    
      const response = await fetch('/api/enterprise/packagepayments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
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
    

    if (sessions && sessions.user) {
      const id = Number(sessions.user.id);
      setOrganizationId(id);
    }
 
  }, [sessions]);
  return (
    <div className="flex h-screen bg-gradient-to-r from-blue-50 to-purple-50">
      <Sidebar />
      <main className="flex-grow p-6">
        <div className="bg-white shadow-lg rounded-lg p-8 border border-gray-200">
          <h1 className="text-2xl font-bold mb-6 text-blue-800">License Packages</h1>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300 shadow-sm">
              <thead>
                <tr className="bg-gradient-to-r from-blue-500 to-purple-500 text-black">
                  <th className="border border-gray-300 px-4 py-2 text-left">Number of Licenses</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Amount per License</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Purchase</th>
                </tr>
              </thead>
              <tbody>
                {licensePackages.map((license, index) => (
                  <tr key={index} className="hover:bg-blue-100">
                    <td className="border border-gray-300 px-4 py-2">
                      {license.minimum_license} - {license.maximum_license}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      ${license.amount}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <button
                        className="bg-gradient-to-r from-green-400 to-green-600 text-white font-semibold py-2 px-4 rounded shadow-md hover:from-green-500 hover:to-green-700"
                        onClick={() => handlePurchase(license)}
                      >
                        Purchase
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {showModal && selectedLicense && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
            <h2 className="text-xl font-bold text-blue-700 mb-4">Purchase License</h2>
            <label className="block mb-4">
              <span className="text-gray-700">Number of Licenses:</span>
              <p className="text-xs">( You can edit as per your wish.)</p>
              <input
                type="number"
                className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={licenseCount}
                min={1} // Allow any starting value to dynamically match ranges
                onChange={(e) => handleLicenseCountChange(Number(e.target.value))}
              />
            </label>
            <div className="text-lg mb-4">
              Total Cost: <span className="font-bold text-blue-600">${totalAmount}</span>
            </div>
            <div className="flex justify-end gap-4">
              <button
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                onClick={handleCloseModal}
              >
                Cancel
              </button>
              <button
              onClick={() => handleBuyNow(totalAmount)}
              className={`bg-blue-500 text-white p-2 rounded-lg mt-4 w-full ${
                loadingPackageId === totalAmount ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={loadingPackageId === totalAmount}
            >
              {loadingPackageId === totalAmount ? (
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
                'Buy Now'
              )}
            </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

