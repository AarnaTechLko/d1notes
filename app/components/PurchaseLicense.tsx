"use client";
import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { useSession } from "next-auth/react";
import { licensePackages, teamlicensePackages } from "@/lib/constants";
import { formatCurrency } from "@/lib/clientHelpers";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface License {
  id: number;
  minimum_license: number;
  maximum_license: number | string;
  amount: number;
}

interface PurchaseLicenseProps {
  organizationId: string;
  type: string;
}

const PurchaseLicense: React.FC<PurchaseLicenseProps> = ({
  organizationId,
  type,
}) => {
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
  const [licenseCount, setLicenseCount] = useState<number>(0);
  const [showModal, setShowModal] = useState(false);
  const [loadingPackageId, setLoadingPackageId] = useState<number | null>(null);

  const { data: session } = useSession();

  // Determine which license package to use
  const licensePackagesList: License[] =
    session?.user?.type === "team" ? teamlicensePackages : licensePackages;

  // Handle Purchase Click
  const handlePurchase = (license: License) => {
    setSelectedLicense(license);
    setLicenseCount(license.minimum_license);
    setShowModal(true);
  };

  // Close Modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedLicense(null);
  };

  // Handle License Count Change
  const handleLicenseCountChange = (value: number) => {
    setLicenseCount(value);
    const matchingLicense = licensePackagesList.find((pkg) => {
      const maxLicense =
        typeof pkg.maximum_license === "string"
          ? Number(pkg.maximum_license)
          : pkg.maximum_license;
      return value >= pkg.minimum_license && value <= maxLicense;
    });

    if (matchingLicense) {
      setSelectedLicense({
        id: matchingLicense.id,
        minimum_license: matchingLicense.minimum_license,
        maximum_license: Number(matchingLicense.maximum_license),
        amount: matchingLicense.amount,
      });
    }
  };

  // Calculate Total Amount
  const totalAmount = selectedLicense ? licenseCount * selectedLicense.amount : 0;

  // Handle Buy Now
  const handleBuyNow = async (amount: number) => {
    try {
      setLoadingPackageId(amount);
      const stripe = await stripePromise;

      const payload = {
        packageId: selectedLicense?.id,
        amount,
        no_of_licenses: licenseCount,
        rate: amount / licenseCount,
        organizationId,
        type,
      };

      const response = await fetch("/api/enterprise/packagepayments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const session = await response.json();
      const result = await stripe?.redirectToCheckout({ sessionId: session.id });

      if (result?.error) {
        console.error("Error redirecting to checkout:", result.error.message);
      }
    } catch (error) {
      console.error("Error processing payment:", error);
    } finally {
      setLoadingPackageId(null);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-6 text-blue-800">
        Player Evaluation Pricing
      </h1>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300 shadow-sm">
          <thead>
            <tr className="bg-gradient-to-r from-blue-500 to-purple-500 text-black">
              <th className="border border-gray-300 px-4 py-2 text-left">
                Number of Evaluations
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Rate per Evaluation
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {licensePackagesList.map((license) => (
              <tr key={license.id} className="hover:bg-blue-100">
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

      {/* Purchase Modal */}
      {showModal && selectedLicense && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
            <h2 className="text-xl font-bold text-blue-700 mb-4">
              Purchase Evaluations
            </h2>
            <label className="block mb-4">
              <span className="text-gray-700">Number of Evaluations:</span>
            </label>
            <input
              type="number"
              className="border border-gray-300 rounded-lg py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={licenseCount}
              min={1}
              onChange={(e) => handleLicenseCountChange(Number(e.target.value))}
            />
            <div className="text-lg mb-4">
              Total Cost:{" "}
              <span className="font-bold text-blue-600">
                ${formatCurrency(totalAmount)}
              </span>
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
                  loadingPackageId === totalAmount
                    ? "opacity-50 cursor-not-allowed"
                    : ""
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
                  "Purchase Now"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PurchaseLicense;
