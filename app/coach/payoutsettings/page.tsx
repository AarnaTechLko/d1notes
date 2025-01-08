"use client"
import Sidebar from '@/app/components/coach/Sidebar';
import { useState } from 'react';

const CreateAccountForm = () => {
  const [formData, setFormData] = useState({
    country: '',
    email: '',
    currency: '',
    routingNumber: '',
    accountNumber: ''
  });
  const [accountId, setAccountId] = useState(null);

  const handleChange = (e:any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e:any) => {
    e.preventDefault();
    // Call the Stripe Create Account API here
    try {
      const response = await fetch('/api/payouts/createaccount', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (response.ok) {
        setAccountId(result.accountId); // Assuming the API returns an accountId
      } else {
        console.error('Error creating account:', result.error);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-grow bg-gray-100 p-4 overflow-auto">
        <div className="bg-white shadow-md rounded-lg p-6 h-auto">
          <h2 className="text-xl font-semibold mb-4">Create Stripe Account</h2>
          <form onSubmit={handleSubmit}>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="mb-4">
      <label htmlFor="country" className="block text-sm font-medium text-gray-700">Email</label>
      <input
        type="text"
        id="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        required
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
      />
    </div>
    <div className="mb-4">
      <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
      <input
        type="text"
        id="country"
        name="country"
        value={formData.country}
        onChange={handleChange}
        required
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
      />
    </div>
    <div className="mb-4">
      <label htmlFor="currency" className="block text-sm font-medium text-gray-700">Currency</label>
      <input
        type="text"
        id="currency"
        name="currency"
        value={formData.currency}
        onChange={handleChange}
        required
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
      />
    </div>
    <div className="mb-4">
      <label htmlFor="routingNumber" className="block text-sm font-medium text-gray-700">Routing Number</label>
      <input
        type="text"
        id="routingNumber"
        name="routingNumber"
        value={formData.routingNumber}
        onChange={handleChange}
        required
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
      />
    </div>
    <div className="mb-4">
      <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700">Account Number</label>
      <input
        type="text"
        id="accountNumber"
        name="accountNumber"
        value={formData.accountNumber}
        onChange={handleChange}
        required
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
      />
    </div>
  </div>
  <button
    type="submit"
    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 mt-4"
  >
    Submit
  </button>
</form>

          {accountId && <div className="mt-4 text-green-500">Account created! Account ID: {accountId}</div>}
        </div>
      </main>
    </div>
  );
};

export default CreateAccountForm;
