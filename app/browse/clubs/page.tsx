"use client";
import { useEffect, useState } from 'react';
import ProfileCard from '../../components/enterprise/ProfileCard';
import SearchFilter from '../../components/SearchFilter';
import Head from 'next/head';
import Loading from '../../components/Loading';
import Filters from '../../components/enterprise/Filters';

// Define a type for the profile
interface Profile {
  organizationName: string;
  country: string;
  logo: string;
  slug: string;
  club_id: string;
  
}

const Home = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    country: '',
    state: '',
    city: '',
    amount: 0,
    rating: null as number | null,
  });

  // Fetch coach data from API
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const queryParams = new URLSearchParams({
          country: filters.country || '',
          state: filters.state || '',
          city: filters.city || '',
          amount: filters.amount.toString(),
          rating: filters.rating?.toString() || '',
        }).toString();

        const response = await fetch(`/api/browse/clubs?${queryParams}`); // Replace with your API endpoint
        if (!response.ok) {
          throw new Error('Failed to fetch profiles');
        }
        const data = await response.json();
        console.log(data);
        setProfiles(data);
      } catch (err) {
        setError('Some issue occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, [filters]); // Fetch profiles whenever the filters change

  useEffect(() => {
    setFilteredProfiles(
      profiles.filter((profile) => {
        
        const organizationName = (profile.organizationName || '').toLowerCase();
       
    
        return (
          organizationName.includes(searchQuery.toLowerCase())
          
        );
      })
    );
  }, [searchQuery, profiles]); // Filter profiles based on search query

  const handleFilterChange = (newFilters: { country: string; state: string; city: string; amount: number; rating: number | null }) => {
    setFilters(newFilters);
    console.log(newFilters);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <>
     <head>
        <title>Profile Directory Clubs - D1 NOTES</title>
        <meta name="description" content="This is the home page of my Next.js application." />
      </head>
      <div className="container-fluid">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/4 p-4">
            <Filters onFilterChange={handleFilterChange} />
          </div>
          <div className="w-full md:w-3/4 p-4">
            <SearchFilter searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            {error && <p className="text-red-500">{error}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-4 gap-2 mt-4">
              {filteredProfiles.map((profile) => (
                <div className="w-full lg:w-auto" key={profile.slug}>
                  <ProfileCard
                    key={profile.slug}
                    id={profile.club_id}
                    organization={profile.organizationName}
                    logo={profile.logo ?? '/default.jpg'}
                    country={profile.country}
                    slug={profile.slug}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
