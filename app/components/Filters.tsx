import React, { useEffect, useState } from 'react';
import { FaStar } from 'react-icons/fa';

interface FiltersProps {
  onFilterChange: (filters: { country: string; state: string; city: string; amount: number; rating: number | null; sport:string }) => void;
}

const Filters: React.FC<FiltersProps> = ({ onFilterChange }) => {
  const [country, setCountry] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [sport, setSport] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [rating, setRating] = useState<number>(0);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const [countriesList, setCountriesList] = useState([]);
  const [statesList, setStatesList] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
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
      sport: '',
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
    let newSport = sport;

    if (field === 'country') {
      newCountry = value as string;
      setCountry(newCountry);
      fetchStates(Number(value));
    } 
    else if (field === 'sport') {
      newSport = value as string;
      setSport(newSport);
    }
    //else if (field === 'state') {
    //   newState = value as string;
    //   setState(newState);
    // } else if (field === 'city') {
    //   newCity = value as string;
    //   setCity(newCity);
    // } 
    else if (field === 'rating') {
      newRating = value as number;
      setRating(newRating);
    }

    onFilterChange({
      country: newCountry,
      state: newState,
      city: newCity,
      sport: newSport,
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
      sport,
      state,
      city,
      amount,
      rating,
    });
  };
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <FaStar
        key={i}
        color={i < rating ? '#ffd700' : '#ccc'}
        style={{ marginRight: '4px', float:'left' }}
        />
      );
    }
    return stars;
  };

  const handleRatingSelect = (rating: number) => {
    setRating(rating);
    handleFilterChange('rating', rating); // Send the numeric value
    setIsDropdownOpen(false); 
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
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2 font-bold">Sport(s)</label>
          <select name='sport' className='w-full p-2 border rounded-md' onChange={(e) => handleFilterChange('city', e.target.value)} value={sport}>
          <option value="">Select</option>
            <option value="Soccer">Soccer</option>
          </select>
         
        </div>
 
        <div className="mb-4">
          <label className="block text-gray-700 mb-2 font-bold">Expected Rate</label>
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
          <label className="block text-gray-700 mb-2 font-bold">Star Rating</label>
          <div className="relative">
            <button
              className="w-full p-2 border rounded-md flex items-center justify-between"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)} // Toggle dropdown
            >
              <span className="text-gray-700">{renderStars(rating ?? 0)}</span>
              <span>▼</span>
            </button>
            {isDropdownOpen && (
              <div className="absolute left-0 w-full bg-white border mt-1 rounded-md shadow-md z-10">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    onClick={() => handleRatingSelect(value)}
                    className="w-full p-2 text-left flex items-center"
                  >
                    <span className="text-gray-700">{renderStars(value)}</span>
                    
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Filters;
