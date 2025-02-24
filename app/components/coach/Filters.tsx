import React, { useEffect, useState } from 'react';

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
  const [countriesList, setCountriesList] = useState([]);
  const [statesList, setStatesList] = useState([]);
  useEffect(() => {
    fetch('/api/masters/countries')
      .then((response) => response.json())
      .then((data) => setCountriesList(data || []))
      .catch((error) => console.error('Error fetching countries:', error));
  }, []);
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
        <h3 className="text-xl font-semibold">Filter Coaches</h3>
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
            <option value="">Select</option>
            {countriesList
                      .map((country:any) => (
                        <option key={country.id} value={country.id}>
                          {country.name}
                        </option>
                      ))}
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
            <option value="">Select</option>
                      {statesList.map((state: any, index) => (
    <option key={index} value={state.name}>
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

       
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Expected Rate</label>
          <input
            type="range"
            min="0"
            max="1000"
            value={amount}
            onChange={handleAmountChange}
            onMouseUp={handleAmountCommit}
            className="w-full"
          />
          <p className="text-gray-600">Up to ${amount}</p>
        </div>

        {/* Rating */}
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
                  onChange={() => handleFilterChange('rating', star)}
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
