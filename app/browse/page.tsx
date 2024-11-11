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
  city: string;
  email: string;
  lastName: string;
  organization: string;
  image: string | null;
  rating: number;
  slug: string;
  clubName: string;
  gender: string;
  sport: string;
  phoneNumber: string;
  qualifications: string;
  expectedCharge: number;
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

        const response = await fetch(`/api/coach/signup?${queryParams}`); // Replace with your API endpoint
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
        const fullName = `${profile.firstName} ${profile.lastName}`.toLowerCase();
        const email = (profile.email || '').toLowerCase();
        const city = (profile.city || '').toLowerCase(); // Example additional field
        const clubName = (profile.clubName || '').toLowerCase(); // Example additional field
        const phoneNumber = (profile.phoneNumber || '').toLowerCase(); // Example additional field
        const gender = (profile.gender || '').toLowerCase(); // Example additional field
        const sport = (profile.sport || '').toLowerCase(); // Example additional field
        const qualifications = (profile.qualifications || '').toLowerCase(); // Example additional field
        const rating = String(profile.rating || ''); // Example additional field
    
        return (
          fullName.includes(searchQuery.toLowerCase()) ||
          email.includes(searchQuery.toLowerCase()) ||
          city.includes(searchQuery.toLowerCase()) ||
          clubName.includes(searchQuery.toLowerCase()) ||
          qualifications.includes(searchQuery.toLowerCase()) ||
          sport.includes(searchQuery.toLowerCase()) ||
          rating.includes(searchQuery) || // You can keep adding more fields as needed
          phoneNumber.includes(searchQuery) // You can keep adding more fields as needed
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
        </div>
      </div>
    </>
  );
};

export default Home;
