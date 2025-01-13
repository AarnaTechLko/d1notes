"use client";
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import Header from './components/Header';
import SocccerField from './../public/images/soccer-field.jpg';
import Footer from './components/Footer';
import Head from 'next/head';
import ProfileCard from './components/ProfileCard';
import Loading from './components/Loading';
import Player from '../public/Player.jpg'
import { FaArrowLeft, FaCheckCircle, FaCreditCard, FaList, FaPaperPlane, FaSearch, FaUserPlus } from 'react-icons/fa';

// Define the types for the coaches' data

export default function Home(): JSX.Element {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [profiles, setProfiles] = useState<any[]>([]); // Initialize as an empty array
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Scroll handling
  const handleScrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft -= 300;
    }
  };

  const handleScrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += 300;
    }
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
          <h1 className="text-4xl font-bold text-gray-900">
            Find coaches that specialize in{' '}
            <span className="text-blue-600">Youth Soccer</span>
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            D1 NOTES is setting the standard for game film evaluation that offers
            young athletes the edge they have been missing.
          </p>
        </div>

        {/* Scrollable Thumbnails Section */}
        <div className="relative">
          {/* Horizontal scrolling container */}
          <div
            className="flex overflow-x-auto space-x-4 scrollbar-hide scroll-smooth snap-x snap-mandatory"
            ref={scrollRef}
          >
            {profiles.map((coach, index) => (
              <ProfileCard
              key={coach.id || index}
              name={coach.firstName}
              image={coach.image}
              organization={coach.clubName}
              rating={coach.rating}
              slug={coach.slug}
              
              /> 
              
               
            ))}
          </div>

          {/* Scroll Buttons */}
          <button
            onClick={handleScrollLeft}
            className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-gray-200 p-2 rounded-full z-10"
          >
            ←
          </button>
          <button
            onClick={handleScrollRight}
            className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-gray-200 p-2 rounded-full z-10"
          >
            →
          </button>
        </div>
      </div>
      
     <div className="bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side: How it works steps */}
        <div className="space-y-12">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            How It Works for Players
          </h2>
          <div className="space-y-8">
            {/* Step 1 */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <span className="inline-block p-3 bg-gray-100 rounded-full">
                  {/* Icon for Find a coach */}
                <FaUserPlus/>
                </span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Create Account</h3>
                <p className="mt-2 text-base text-gray-500">
                Create account for player(s) and find a registered coach
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <span className="inline-block p-3 bg-gray-100 rounded-full">
                 <FaSearch/>
                </span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Search and choose one of our experienced coaches </h3>
                <p className="mt-2 text-base text-gray-500">
                that we’ve vetted to review your game film remotely and send you summarized written feedback to store.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <span className="inline-block p-3 bg-gray-100 rounded-full">
                  <FaPaperPlane/>
                </span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Submit an evaluation request</h3>
                <p className="mt-2 text-base text-gray-500">
                  With some video footage which shows your game.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <span className="inline-block p-3 bg-gray-100 rounded-full">
                  <FaCreditCard/>
                </span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Make Payment</h3>
                <p className="mt-2 text-base text-gray-500">
                Confirm payment and send a request to the coach for an evaluation. The coach has 48 hours to accept, and we won’t charge you until the coach accepts.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <span className="inline-block p-3 bg-gray-100 rounded-full">
                  <FaCheckCircle/>
                </span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Coach accepts your request</h3>
                <p className="mt-2 text-base text-gray-500">
                You’ll get a notification when the coach accepts. The coach has 5 days to return your evaluation.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <span className="inline-block p-3 bg-gray-100 rounded-full">
                 <FaArrowLeft/>
                
                </span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Coach returns an evaluation</h3>
                <p className="mt-2 text-base text-gray-500">
                Receive the evaluation and feedback to improve your game!
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4"><a href="/howitworks" className="inline-block px-2 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md  font-medium text-sm">Read More...</a></div>
          </div>
        </div>

        {/* Right Side: Image */}
        <div className="flex justify-center lg:justify-end">
          <div className="relative w-full h-96 lg:h-auto lg:w-[90%]">
            <Image
              src={Player}
              alt="Soccer ball on the field"
              layout="fill"
              objectFit="cover"
              className="rounded-lg"
            />
          </div>
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
            Find a coach
          </a>
        </a>
      </div>
    </div>
 
    </>
  );
}
