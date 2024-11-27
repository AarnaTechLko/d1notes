"use client";
import { useEffect, useState } from 'react';
import ProfileCard from '@/app/components/players/ProfileCard';
import SearchFilter from '../../components/SearchFilter';
import Head from 'next/head';
import Loading from '../../components/Loading';
import Filters from '../../components/players/Filters';

// Define a type for the profile
interface Profile {
  coachName: string;
  enterpriseName: string;
  firstName: string;
  lastName: string;
  image: string;
  slug: string;
  rating:number;
  
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

        const response = await fetch(`/api/browse/players?${queryParams}`); // Replace with your API endpoint
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
        
        const organizationName = (profile.firstName || '').toLowerCase();
       
    
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
      <Head>
        <title>Profile Directory</title>
      </Head>

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
                    rating={5}
                    coachName={profile.coachName}
                    enterpriseName={profile.enterpriseName}
                    firstName={profile.firstName}
                    lastName={profile.lastName}
                    image={profile.image ?? '/default-image.jpg'}
                   
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
