import React, { useState } from 'react';

interface FiltersProps {
  onFilterChange: (filters: { country: string; state: string; city: string; amount: number; rating: number | null }) => void;
}

const Filters: React.FC<FiltersProps> = ({ onFilterChange }) => {
  const [country, setCountry] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [rating, setRating] = useState<number>(0);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  const toggleFilters = () => setIsMobileOpen(!isMobileOpen);

  const resetFilters = () => {
    setCountry('');
    setState('');
    setCity('');
    setAmount(0);
    setRating(0);

    onFilterChange({
      country: '',
      state: '',
      city: '',
      amount: 0,
      rating: null,
    });
  };

  const states = [
    { name: "Alabama", abbreviation: "AL" },
    // ... other states
    { name: "Wyoming", abbreviation: "WY" }
  ];

  const handleFilterChange = (field: string, value: string | number | null) => {
    let newCountry = country;
    let newState = state;
    let newCity = city;
    let newRating = rating;

    if (field === 'country') {
      newCountry = value as string;
      setCountry(newCountry);
    } else if (field === 'state') {
      newState = value as string;
      setState(newState);
    } else if (field === 'city') {
      newCity = value as string;
      setCity(newCity);
    } else if (field === 'rating') {
      newRating = value as number;
      setRating(newRating);
    }

    onFilterChange({
      country: newCountry,
      state: newState,
      city: newCity,
      amount,
      rating: newRating,
    });
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(parseInt(e.target.value));
  };

  const handleAmountCommit = () => {
    onFilterChange({
      country,
      state,
      city,
      amount,
      rating,
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Filter Players</h3>
        <button
          className="px-4 py-2 bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 focus:outline-none"
          onClick={resetFilters}
        >
          Reset
        </button>
        <button
          className="md:hidden px-4 py-2 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 focus:outline-none"
          onClick={toggleFilters}
        >
          {isMobileOpen ? 'Hide' : 'Show'} Filters
        </button>
      </div>

      <div className={`${isMobileOpen ? 'block' : 'hidden'} md:block`}>
        {/* Filter Fields */}
        {/* Country */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Country</label>
          <select
            className="w-full p-2 border rounded-md"
            value={country}
            onChange={(e) => handleFilterChange('country', e.target.value)}
          >
            <option value="">Select Country</option>
            <option value="United States of America">United States of America</option>
          </select>
        </div>

        {/* State */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">State</label>
          <select
            className="w-full p-2 border rounded-md"
            value={state}
            onChange={(e) => handleFilterChange('state', e.target.value)}
          >
            <option value="">Select State</option>
            {states.map((state) => (
              <option key={state.abbreviation} value={state.abbreviation}>
                {state.name}
              </option>
            ))}
          </select>
        </div>

        {/* City */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">City</label>
          <input
            type="text"
            className="w-full p-2 border rounded-md"
            value={city}
            onChange={(e) => handleFilterChange('city', e.target.value)}
            placeholder="Enter City"
          />
        </div>

       
        {/* Rating */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Rating</label>
          <div className="flex flex-row items-center gap-2">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    width="60"
    height="60"
    fill="none"
  >
    <circle
      cx="50"
      cy="50"
      r="30"
      fill="url(#bronzeGradient)"
      stroke="#8C4B1A"
      strokeWidth="2"
    />
    <path
      d="M50 35 L54 46 H66 L56 54 L60 66 L50 58 L40 66 L44 54 L34 46 H46 Z"
      fill="#8C4B1A"
      stroke="#662F0D"
      strokeWidth="1"
    />
    <path
      d="M40 70 L35 90 H45 L50 75 L55 90 H65 L60 70 Z"
      fill="#8C4B1A"
      stroke="#5A2911"
      strokeWidth="1"
    />
    <defs>
      <linearGradient id="bronzeGradient" x1="0" x2="0" y1="0" y2="100%">
        <stop offset="0%" stopColor="#CD7F32" />
        <stop offset="100%" stopColor="#8C4B1A" />
      </linearGradient>
    </defs>
  </svg>
  <span className="text-lg font-semibold text-[#8C4B1A]">Bronze</span>
</div>
<div className="flex flex-row items-center gap-2">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    width="60"
    height="60"
    fill="none"
  >
    <circle
      cx="50"
      cy="50"
      r="30"
      fill="url(#silverGradient)"
      stroke="#A6A6A6"
      strokeWidth="2"
    />
    <path
      d="M50 35 L54 46 H66 L56 54 L60 66 L50 58 L40 66 L44 54 L34 46 H46 Z"
      fill="#A6A6A6"
      stroke="#8C8C8C"
      strokeWidth="1"
    />
    <path
      d="M40 70 L35 90 H45 L50 75 L55 90 H65 L60 70 Z"
      fill="#A6A6A6"
      stroke="#737373"
      strokeWidth="1"
    />
    <defs>
      <linearGradient id="silverGradient" x1="0" x2="0" y1="0" y2="100%">
        <stop offset="0%" stopColor="#C0C0C0" />
        <stop offset="100%" stopColor="#A6A6A6" />
      </linearGradient>
    </defs>
  </svg>
  <span className="text-lg font-semibold text-[#A6A6A6]">Silver</span>
</div>
<div className="flex flex-row items-center gap-2">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    width="60"
    height="60"
    fill="none"
  >
    <circle
      cx="50"
      cy="50"
      r="30"
      fill="url(#goldGradient)"
      stroke="#D4AF37"
      strokeWidth="2"
    />
    <path
      d="M50 35 L54 46 H66 L56 54 L60 66 L50 58 L40 66 L44 54 L34 46 H46 Z"
      fill="#D4AF37"
      stroke="#B8860B"
      strokeWidth="1"
    />
    <path
      d="M40 70 L35 90 H45 L50 75 L55 90 H65 L60 70 Z"
      fill="#D4AF37"
      stroke="#8B6914"
      strokeWidth="1"
    />
    <defs>
      <linearGradient id="goldGradient" x1="0" x2="0" y1="0" y2="100%">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="100%" stopColor="#D4AF37" />
      </linearGradient>
    </defs>
  </svg>
  <span className="text-lg font-semibold text-[#D4AF37]">Gold</span>
</div>
<div className="flex flex-row items-center gap-2">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    width="60"
    height="60"
    fill="none"
  >
    <circle
      cx="50"
      cy="50"
      r="30"
      fill="url(#platinumGradient)"
      stroke="#B3B3B3"
      strokeWidth="2"
    />
    <path
      d="M50 35 L54 46 H66 L56 54 L60 66 L50 58 L40 66 L44 54 L34 46 H46 Z"
      fill="#E5E4E2"
      stroke="#A8A8A8"
      strokeWidth="1"
    />
    <path
      d="M40 70 L35 90 H45 L50 75 L55 90 H65 L60 70 Z"
      fill="#E5E4E2"
      stroke="#9B9B9B"
      strokeWidth="1"
    />
    <defs>
      <linearGradient id="platinumGradient" x1="0" x2="0" y1="0" y2="100%">
        <stop offset="0%" stopColor="#F0F0F0" />
        <stop offset="100%" stopColor="#B3B3B3" />
      </linearGradient>
    </defs>
  </svg>
  <span className="text-lg font-semibold text-[#B3B3B3]">Platinum</span>
</div>
<div className="flex flex-row items-center gap-2">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    width="60"
    height="60"
    fill="none"
  >
    <polygon
      points="50,10 65,35 50,60 35,35"
      fill="url(#diamondGradient)"
      stroke="#A9A9A9"
      strokeWidth="2"
    />

    <defs>
      <linearGradient id="diamondGradient" x1="0" x2="0" y1="0" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#D1D1D1" />
      </linearGradient>
    </defs>
  </svg>
  <span className="text-lg font-semibold text-[#D1D1D1]">Diamond</span>
</div>
<div className="flex flex-row items-center gap-2">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 120 100"
    width="60"
    height="60"
    fill="none"
  >
    {/* First Diamond */}
    <polygon
      points="30,10 45,35 30,60 15,35"
      fill="url(#diamondGradient)"
      stroke="#A9A9A9"
      strokeWidth="2"
    />
    {/* Second Diamond */}
    <polygon
      points="90,10 105,35 90,60 75,35"
      fill="url(#diamondGradient)"
      stroke="#A9A9A9"
      strokeWidth="2"
    />

    <defs>
      <linearGradient id="diamondGradient" x1="0" x2="0" y1="0" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#D1D1D1" />
      </linearGradient>
    </defs>
  </svg>
  <span className="text-lg font-semibold text-[#D1D1D1]">Double Diamond</span>
</div>

        </div>
      </div>
    </div>
  );
};

export default Filters;
