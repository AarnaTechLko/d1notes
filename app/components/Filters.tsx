import React, { useState } from 'react';

const Filters = () => {
  const [country, setCountry] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [rating, setRating] = useState<number | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  const toggleFilters = () => setIsMobileOpen(!isMobileOpen);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Filter Coach</h3>
        <button 
          className="md:hidden px-4 py-2 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 focus:outline-none"
          onClick={toggleFilters}
        >
          {isMobileOpen ? 'Hide' : 'Show'} Filters
        </button>
      </div>

      {/* Collapsible content */}
      <div className={`${isMobileOpen ? 'block' : 'hidden'} md:block`}>
        {/* Country Selection */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Country</label>
          <select
            className="w-full p-2 border rounded-md"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          >
            <option value="">Select Country</option>
            <option value="USA">USA</option>
            <option value="Canada">Canada</option>
            <option value="UK">UK</option>
          </select>
        </div>

        {/* State Selection */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">State</label>
          <select
            className="w-full p-2 border rounded-md"
            value={state}
            onChange={(e) => setState(e.target.value)}
          >
            <option value="">Select State</option>
            <option value="California">California</option>
            <option value="Texas">Texas</option>
            <option value="New York">New York</option>
          </select>
        </div>

        {/* City Text Input */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">City</label>
          <input
            type="text"
            className="w-full p-2 border rounded-md"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter City"
          />
        </div>

        {/* Expected Charge Slider */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Expected Charge</label>
          <input
            type="range"
            min="0"
            max="500"
            value={amount}
            onChange={(e) => setAmount(parseInt(e.target.value))}
            className="w-full"
          />
          <p className="text-gray-600">Up to ${amount}</p>
        </div>

        {/* Star Rating Filter with Rows of 1 to 5 Stars */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Star Rating</label>
          <div className="flex flex-col gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <label key={star} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="rating"
                  value={star}
                  checked={rating === star}
                  onChange={() => setRating(star)}
                  className="hidden"
                />
                <div className="flex gap-1">
                  {[...Array(star)].map((_, i) => (
                    <span key={i} className="text-yellow-500 text-xl">★</span>
                  ))}
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Filters;
