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
  const fetchStates = async (country: number) => {
    try {
      const response = await fetch(`/api/masters/states?country=${country}`);
      const data = await response.json();
      setStatesList(data); // Adjust key if necessary based on your API response structure
    } catch (error) {
      console.error('Failed to fetch states:', error);
    }
  };
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
      fetchStates(Number(value));
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
        <h3 className="text-xl font-semibold">Filter Organizations</h3>
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
          <label className="block text-gray-700 mb-2 font-bold">Sport(s)</label>
          <select name='sport' className='w-full p-2 border rounded-md'>
           
            <option value="Soccer">Soccer</option>
          </select>
         
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2 font-bold">Country</label>
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
          <label className="block text-gray-700 mb-2 font-bold">State/Province</label>
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
          <label className="block text-gray-700 mb-2 font-bold">City</label>
          <input
            type="text"
            className="w-full p-2 border rounded-md"
            value={city}
            onChange={(e) => handleFilterChange('city', e.target.value)}
            placeholder="Enter City"
          />
        </div>

   
        

        {/* Rating */}
       
      </div>
    </div>
  );
};

export default Filters;
