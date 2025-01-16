import React, { useEffect, useState, FC } from 'react';

interface State {
  id: string;
  name: string;
}

interface StatesDropdownProps {
  countryId: string;
}

const StatesDropdown: FC<StatesDropdownProps> = ({ countryId }) => {
  const [states, setStates] = useState<State[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const fetchStates = async (countryId: string) => {
    if (!countryId) return;
    try {
      const response = await fetch('/api/masters/states', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ countryId }),
      });
      const data = await response.json();
      setStates(data.states || []);
    } catch (error) {
      console.error('Error fetching states:', error);
    }
  };

  useEffect(() => {
    fetchStates(countryId);
  }, [countryId]);

  const filteredStates = states.filter((state) =>
    state.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search states..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => setIsOpen(true)}
        className="w-full border px-4 py-2 rounded-md"
      />
      {isOpen && (
        <ul className="absolute z-10 w-full bg-white border rounded-md mt-1 max-h-60 overflow-y-auto">
          {filteredStates.length > 0 ? (
            filteredStates.map((state) => (
              <li
                key={state.id}
                className="px-4 py-2 cursor-pointer hover:bg-gray-200"
              >
                {state.name}
              </li>
            ))
          ) : (
            <li className="px-4 py-2 text-gray-500">No states found</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default StatesDropdown;
