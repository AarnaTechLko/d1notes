import { useState, useEffect, ChangeEvent } from 'react';

interface Country {
  id: string | number;
  name: string;
}

interface CountriesDropdownProps {
  onSelect: (country: Country) => void;
}

const CountriesDropdown: React.FC<CountriesDropdownProps> = ({ onSelect }) => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/masters/countries')
      .then((response) => response.json())
      .then((data) => setCountries(data || []))
      .catch((error) => console.error('Error fetching countries:', error));
  }, []);

  const handleSelectCountry = (country: Country) => {
    onSelect(country);
    setIsOpen(false);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search countries..."
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        className="w-full border px-4 py-2 rounded-md"
      />
      {isOpen && (
        <ul className="absolute z-10 w-full bg-white border rounded-md mt-1 max-h-60 overflow-y-auto">
          {filteredCountries.length > 0 ? (
            filteredCountries.map((country) => (
              <li
                key={country.id}
                onClick={() => handleSelectCountry(country)}
                className="px-4 py-2 cursor-pointer hover:bg-gray-200"
              >
                {country.name}
              </li>
            ))
          ) : (
            <li className="px-4 py-2 text-gray-500">No countries found</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default CountriesDropdown;
