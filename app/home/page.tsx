"use client";
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import Header from './../components/Header';
import SocccerField from './../public/images/soccer-field.jpg';
import Footer from './../components/Footer';
import Head from 'next/head';
import ProfileCard from './../components/ProfileCard';
import Loading from './../components/Loading';
import Player from '../../public/Player.jpg'
import { FaArrowLeft, FaCheckCircle, FaCreditCard, FaList, FaPaperPlane, FaSearch, FaUserPlus } from 'react-icons/fa';

// Define the types for the coaches' data

export default function Home(): JSX.Element {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [profiles, setProfiles] = useState<any[]>([]); // Initialize as an empty array
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState('Soccer');
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const handleScrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft -= 300;
    }
  };
  const selectValue = (value: string) => {
    setSelectedValue(value);
    setIsDropdownOpen(false); // Close the dropdown after selection
  };
  const handleScrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += 300;
    }
  };
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await fetch('/api/coach/signup'); // Replace with your API endpoint
        if (!response.ok) {
          throw new Error('Failed to fetch profiles');
        }
        const data = await response.json();
        console.log(data);
        setProfiles(data); // Assuming the data is an array of profiles
      } catch (err) {
        setError("Some error occured");
      } finally {
        setLoading(false); // Set loading to false after the fetch is complete
      }
    };

    fetchProfiles();
  }, []);

  if (loading) {
    return <Loading/>; // Loading indicator
  }

  if (error) {
    return <div>Error: {error}</div>; // Error message
  }

  return (
    <>
      <head>
        <title>Home - D1 NOTES</title>
        <meta name="description" content="This is the home page of my Next.js application." />
      </head>
      <div className="max-w-7xl mx-auto px-4 mt-24 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center py-10">
        <h1 className="text-4xl font-bold text-gray-900  items-center m-auto">
  Gain access to coaches that specialize in{' '}
  <div
    className="inline-flex items-center relative border border-gray-500 px-2 py-1 rounded-sm ml-2"
    ref={dropdownRef}
  >
    <button
      className="text-blue-600 text-xl flex items-center focus:outline-none"
      onClick={toggleDropdown}
    >
      <span className="text-blue-600 text-4xl" >{selectedValue}</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="ml-1 h-5 w-5 text-blue-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>
    {isDropdownOpen && (
      <div className="absolute left-0 top-full bg-white shadow-md mt-1 rounded-md w-max z-50 border border-gray-300">
        <ul>
          <li
            className="px-4 py-2 text-xl hover:text-blue-600 cursor-pointer"
            onClick={() => selectValue('Soccer')}
          >
            Soccer
          </li>
        </ul>
      </div>
    )}
  </div>
</h1>

          <p className="mt-4 text-lg text-gray-500">
          D1 NOTES is setting the standard for individual game film evaluation that offers young athletes the development edge they have been missing.
          </p>
        </div>

        {/* Scrollable Thumbnails Section */}
        <div className="relative">
  {/* Horizontal scrolling container */}
  <div
    className="flex overflow-x-auto space-x-4 scrollbar-hide scroll-smooth snap-x snap-mandatory px-4"
    ref={scrollRef}
  >
    {profiles.map((coach, index) => (
      <div key={coach.id || index} className="snap-center flex-shrink-0 w-[250px]">
        <ProfileCard
          name={coach.firstName}
          image={coach.image}
          organization={coach.clubName}
          rating={coach.rating}
          slug={coach.slug}
          facebook={coach?.facebook}
          instagram={coach?.instagram}
          linkedin={coach?.linkedin}
          xlink={coach?.xlink}
          evaluation_rate={coach?.evaluation_rate}
          youtube={coach?.youtube}
        />
      </div>
    ))}
  </div>

  {/* Scroll Buttons */}
  <button
    onClick={handleScrollLeft}
    className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-gray-200 p-2 rounded-full z-10 shadow-md"
  >
    ←
  </button>
  <button
    onClick={handleScrollRight}
    className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-gray-200 p-2 rounded-full z-10 shadow-md"
  >
    →
  </button>
</div>

      </div>
      
      <div className="container mx-auto p-6">
      <div className="grid md:grid-cols-3 gap-6">
        {/* Players Box */}
        <div className="bg-blue-500 text-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Players</h2>
          <p className="text-lg">
          How are you using all those videos of your games? Are you getting consistent individual game feedback for your development? Would you like access to a curated global network of top coaches, trainers, and scouts?
          </p>
          <a href='/howitworks' className='text-lg font-bold'>How It Works for Players</a>
        </div>

        {/* Coaches Box */}
        <div className="bg-green-500 text-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Coaches</h2>
          <p className="text-lg">
          Are you a respected coach, trainer, or scout interested in a convenient way to expand your audience or services globally? You are worth more than you know to young athletes today.
          </p>
          <a href='/howitworks#coach' className='text-lg font-bold '>How It Works for Coaches</a>
        </div>

        {/* Enterprises Box */}
        <div className="bg-red-500 text-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Enterprises</h2>
          <p className="text-lg">
          Are you an organization or team that can benefit from a turnkey solution which has the potential to increase individual player development and the value / level of satisfaction delivered to your participants?
          </p>
          
          <a href='/howitworks#enterprises' className='text-lg font-bold'>How It Works for Enterprises</a>
        </div>
      </div>


      <div className="grid md:grid-cols-1 gap-6 mt-5">
      <div className="bg-yellow-500 text-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4">D1 NOTES is here to help!</h2>
          <p className="text-lg">
          We provide the most practical online platform for giving, receiving and managing individual game film evaluations by way of seamlessly connecting coaches, trainers, scouts and enterprises with players, anywhere, anytime (and soon to be, any sport). A win-win-win format for all.
          </p>
        </div>

      </div>
    </div>

     

    <div className="flex items-center justify-center  bg-white-900 mb-10">
      <div className="bg-black text-center rounded-lg p-10 w-full max-w-full">
        <h2 className="text-white text-3xl sm:text-4xl font-bold mb-4">
          Ready to take your game to the next level?
        </h2>
        <p className="text-gray-400 text-lg mb-6">
          Request an evaluation now to get feedback on your game film.
        </p>
        <a href="/browse">
          <a className="inline-block px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-md text-lg font-medium">
            Find a Coach
          </a>
        </a>
      </div>
    </div>
 
    </>
  );
}
