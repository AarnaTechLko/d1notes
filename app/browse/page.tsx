"use client";
import { useEffect, useState } from 'react';
import ProfileCard from '../components/ProfileCard';
import SearchFilter from '../components/SearchFilter';
import Head from 'next/head';
import Loading from '../components/Loading';
import Filters from '../components/Filters';

// Define a type for the profile
interface Profile {
  id: number;
  firstName: string;
  lastName: string;
  organization: string;
  image: string | null;
  rating: number;
  slug: string;
  clubName: string;
  expectedCharge: number;
}

const Home = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch coach data from API
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await fetch('/api/coach/signup'); // Replace with your API endpoint
        if (!response.ok) {
          throw new Error('Failed to fetch profiles');
        }
        const data = await response.json();
        setProfiles(data);
      } catch (err) {
        setError("Some issue occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  // Filter profiles based on the search query
  const filteredProfiles = profiles.filter((profile) => {
    const fullName = `${profile.firstName} ${profile.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <Head>
        <title>Profile Directory</title>
      </Head>

      <div className="container-fluid">
        <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/4 p-4">
            <Filters />
          </div>
          <div className="w-full md:w-3/4 p-4">
            <SearchFilter searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            {error && <p className="text-red-500">{error}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-4 gap-2 mt-4">
              {filteredProfiles.map((profile) => (
                <div className="w-full lg:w-auto" key={profile.id}>
                  <ProfileCard
                    key={profile.id}
                    name={profile.firstName}
                    organization={profile.clubName}
                    image={profile.image ?? '/default-image.jpg'}
                    rating={profile.rating}
                    slug={profile.slug}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Filters */}
        
        </div>
      </div>
    </>
  );
};

export default Home;
