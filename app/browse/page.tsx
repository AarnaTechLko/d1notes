"use client";
import { useEffect, useState } from 'react';
import ProfileCard from '../components/ProfileCard';
import SearchFilter from '../components/SearchFilter';
import Head from 'next/head';
import Loading from '../components/Loading';


// Define a type for the profile
interface Profile {
  id:number;
  firstName: string;
  lastName: string;
  organization: string;
  image: string | null;
  rating: number;
  slug: string; // Add slug if it's part of the profile
  clubName: string; // Add clubName if it's part of the profile
}

const Home = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [profiles, setProfiles] = useState<Profile[]>([]); // State for profiles
  const [loading, setLoading] = useState<boolean>(true); // State for loading status
  const [error, setError] = useState<string | null>(null); // State for error handling

  // Fetch coach data from API
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await fetch('/api/coach/signup'); // Replace with your API endpoint
        if (!response.ok) {
          throw new Error('Failed to fetch profiles');
        }
        const data = await response.json();
        
        setProfiles(data); // Assuming the data is an array of profiles
      } catch (err) {
        setError("Some issue occurred.");
      } finally {
        setLoading(false); // Set loading to false after the fetch is complete
      }
    };

    fetchProfiles();
  }, []);

  // Filter profiles based on the search query
  const filteredProfiles = profiles.filter((profile) => {
    const fullName = `${profile.firstName} ${profile.lastName}`.toLowerCase(); // Combine first and last names
    return fullName.includes(searchQuery.toLowerCase()); // Search in the full name
  });
  if (loading) {
    return <Loading/>; // Loading indicator
  }
  return (
    <>
      <Head>
        <title>Profile Directory</title>
      </Head>

      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        <div className="flex flex-col md:flex-row justify-center">
          <div className="w-full md:w-2/3 p-4 rounded-lg">
            <SearchFilter searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          </div>
        </div>

        
        {error && <p className="text-red-500">{error}</p>} {/* Error message */}

        <div className="mt-4">
  <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-4 gap-2">
    {filteredProfiles.map((profile, index) => (
      <div className="w-full lg:w-auto" key={profile.id}> {/* Full width on mobile */}
        <ProfileCard
          key={profile.id}
          name={profile.firstName} // Change from firstName to name
          organization={profile.clubName} // Ensure this matches your Profile interface
          image={profile.image ?? '/default-image.jpg'}
          rating={profile.rating}
          slug={profile.slug} // Ensure slug is also part of Profile interface
        />
      </div>
    ))}
  </div>
</div>
      </div>
    </>
  );
};

export default Home;
