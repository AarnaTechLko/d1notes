import React, { useEffect, useState } from 'react';
import { countries,Grades,positionOptionsList,states } from '@/lib/constants';

interface FiltersProps {
  onFilterChange: (filters: { country: string;graduation:string; state: string;birthyear:string; city: string; amount: number; rating: number | null, position:string,ageGroup:string }) => void;
}

const Filters: React.FC<FiltersProps> = ({ onFilterChange }) => {
  const [country, setCountry] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [rating, setRating] = useState<number>(0);
  const [graduation, setGraduation] = useState<string>('');
  const [position, setPosition] = useState<string>('');
  const [birthyear, setBirthyear] = useState<string>('');
  const [ageGroup, setAgeGroup] = useState<string>('');
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const [countriesList, setCountriesList] = useState([]);
  const [statesList, setStatesList] = useState([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const ageGroups = ["U6", "U7", "U8", "U9", "U10","U11","U12","U13","U14","U15","U16","U17","U18","U19","High School","College","Semi Pro","Pro"];
  const birthYears = Array.from({ length: 36 }, (_, i) => 1985 + i);
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
    setBirthyear('');
    setAgeGroup('');
    setPosition('');
    setGraduation('');
    setAmount(0);
    setRating(0);

    onFilterChange({
      country: '',
      state: '',
      city: '',
      birthyear: '',
      position: '',
      graduation: '',
      amount: 0,
      rating: null,
      ageGroup
    });
  };

   

  const handleFilterChange = (field: string, value: string | number | null) => {
    let newCountry = country;
    let newState = state;
    let newCity = city;
    let newgraduation = graduation;
    let newRating = rating;
    let newPosition = position;
    let newBirthyear = birthyear;
    let newageGroup = ageGroup;

    if (field === 'country') {
      newCountry = value as string;
      setCountry(newCountry);
      fetchStates(Number(value));
    } else if (field === 'state') {
      newState = value as string;
      setState(newState);
    } else if (field === 'city') {
    } else if (field === 'graduation') {
      newgraduation = value as string;
      setGraduation(newgraduation);
    } else if (field === 'city') {
      newCity = value as string;
      setCity(newCity);
    } else if (field === 'rating') {
      newRating = value as number;
      setRating(newRating);
    
    } else if (field === 'birthyear') {
      newBirthyear = value as string;
      setBirthyear(newBirthyear);
    }
     else if (field === 'ageGroup') {
      newageGroup = value as string;
      setAgeGroup(newageGroup);
    }
     else if (field === 'position') {
      newPosition = value as string;
      setPosition(newPosition);
    }

    onFilterChange({
      country: newCountry,
      state: newState,
      city: newCity,
      amount,
      rating: newRating,
      birthyear: newBirthyear,
      graduation: newgraduation,
      position: newPosition,
      ageGroup: newageGroup,
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
      graduation,
      birthyear,
      position,
      ageGroup
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
          <label className="block text-gray-700 mb-2 font-bold">Sport(s)</label>
          <select name='sport' className='w-full p-2 border rounded-md' >
           
            <option value="Soccer">Select</option>
            <option value="Soccer">Soccer</option>
          </select>
         
        </div>
        <div className="mb-4"> 
          <label className="block text-gray-700 font-bold mb-2">High School Graduation Year</label>
          <select
            className="w-full p-2 border rounded-md"
            value={graduation}
            onChange={(e) => handleFilterChange('graduation', e.target.value)}
          >
            <option value="">Select</option>
            {Grades.map((grad) => (
                        <option key={grad} value={grad}>
                          {grad}
                        </option>
                      ))}
          </select>
        </div>
        <div className="space-x-4 mb-4">
          Age{/* <span className="mandatory">*</span> */}:
          </div>
                            <div className="space-x-4 mb-4">
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="radio"
            name="option"
            value="ageGroup"
            checked={selectedOption === "ageGroup"}
            onChange={() => setSelectedOption("ageGroup")}
            className="hidden"
          />
          <span
            className={`px-4 py-2 rounded-full ${
              selectedOption === "ageGroup"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            Age Group
          </span>
        </label>

        <label className="inline-flex items-center cursor-pointer">
          <input
            type="radio"
            name="option"
            value="birthYear"
            checked={selectedOption === "birthYear"}
            onChange={() => setSelectedOption("birthYear")}
            className="hidden"
          />
          <span
            className={`px-4 py-2 rounded-full ${
              selectedOption === "birthYear"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            Birth Year
          </span>
        </label>
      </div>

      {/* Dropdowns */}
      {selectedOption === "ageGroup" && (
        <select className="w-full p-2 border rounded-md" name="age_group"  >
          <option value="">Select Age Group</option>
          {ageGroups.map((group) => (
            <option key={group} value={group}>
              {group}
            </option>
          ))}
        </select>
      )}

      {selectedOption === "birthYear" && (
        <select className="w-full p-2 border rounded-md" name="team_year" >
          <option value="">Select Birth Year</option>
          {birthYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      )}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2 font-bold mt-2">Position</label>
          <select
            className="w-full p-2 border rounded-md"
            value={position}
            onChange={(e) => handleFilterChange('position', e.target.value)}
          >
            <option value="">Select</option>
            {positionOptionsList.map((grad) => (
                        <option key={grad.value} value={grad.label}>
                          {grad.label}
                        </option>
                      ))}
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
        {/* <div className="mb-4">
          <label className="block text-gray-700 mb-2 font-bold">Rating</label>
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
 
        </div> */}
      </div>
    </div>
  );
};

export default Filters;
