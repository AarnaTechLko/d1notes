import { useState, useRef, useEffect } from "react";
import { FaSearch, FaFilter } from "react-icons/fa";
import { useSession } from "next-auth/react";
interface SearchFilterProps {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}
// Custom hook to handle click outside to close the dropdown
const useOutsideClick = (ref: any, handler: () => void) => {
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (ref.current && !ref.current.contains(event.target)) {
        handler();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, handler]);
};

const SearchFilter: React.FC<SearchFilterProps> = ({ searchQuery, setSearchQuery }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filterOption, setFilterOption] = useState<string>("all");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();


  useOutsideClick(dropdownRef, () => setIsDropdownOpen(false));

  const handleSubmitFilter = () => {
    alert(`Filter applied: ${filterOption}`);
    setIsDropdownOpen(false);
  };

  const handleResetFilter = () => {
    setFilterOption("all");
    alert("Filters reset.");
    setIsDropdownOpen(false);
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between w-full">
      {/* Sign In Button */}



      {/* Search Input and Button */}
      <div className="flex items-center w-full md:max-w-md rounded-full border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 mb-2 md:mb-0">
        {/* Search Icon */}
        <span className="pl-4 text-gray-400">
          <FaSearch />
        </span>
        {/* Search Input */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search profiles..."
          className="w-full px-4 py-2 rounded-full focus:outline-none"
        />
        {/* Search Button */}
        <button className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 focus:outline-none">
          Search
        </button>
      </div>

      {/* Filter Button with Dropdown */}
    
    </div>
  );
};

export default SearchFilter;
