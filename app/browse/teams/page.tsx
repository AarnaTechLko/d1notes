"use client";
import { useEffect, useState } from 'react';
import ProfileCard from '@/app/components/teams/ProfileCard';
import SearchFilter from '../../components/SearchFilter';
import Head from 'next/head';
import Loading from '../../components/Loading';
import Filters from '../../components/teams/Filters';
import { useSession } from "next-auth/react";


// Define a type for the profile
interface Profile {
  creatorName: string;
  teamName: string;
  logo: string;
  slug: string;

}

const Home = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [teamids, setTeamIds] = useState<number[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [redirect, setRedirect] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  const [filters, setFilters] = useState({
    country: '',
    state: '',
    city: '',
    year: '',
    gender: '',
    amount: 0,
    rating: null as number | null,
  });
  const handleRedirect = (profileId: number, clubId:number) => {
    if (session?.user.type == 'player' ||  session?.user.type == 'coach') {
      if (teamids.includes(profileId)) {
        return true;
      }
      else {
        return false;
      }
    }
    if (session?.user.type == 'enterprise' && Number(session.user.id)==clubId) {
      return true;
    }
    if (session?.user.type == 'team' && Number(session?.user.id) === profileId) {
      return true;
    }

  };

  const fetchTeamIds = async () => {
    try {
      let type;
      let userId;

      if (session) {
        type = session.user.type;
        userId = session.user.id;
      }
      else {
        return "unAuthorized";
      }

      const response = await fetch(`/api/browse/fetchteams?type=${type}&userId=${userId}`); // Replace with your API endpoint
      if (!response.ok) {
        throw new Error('Failed to fetch teams');
      }
      const data = await response.json();

      setTeamIds(data);
    } catch (err) {
      setError('Some issue occurred.');
    } finally {
      setLoading(false);
    }
  };


  // Fetch coach data from API
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const queryParams = new URLSearchParams({
          country: filters.country || '',
          state: filters.state || '',
          city: filters.city || '',
          year: filters.year || '',
          gender: filters.gender || '',
          amount: filters.amount.toString(),
          rating: filters.rating?.toString() || '',
        }).toString();

        const response = await fetch(`/api/browse/teams?${queryParams}`); // Replace with your API endpoint
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
    fetchTeamIds();
  }, [filters]); // Fetch profiles whenever the filters change

  useEffect(() => {

    setFilteredProfiles(
      profiles.filter((profile) => {

        const organizationName = (profile.teamName || '').toLowerCase();


        return (
          organizationName.includes(searchQuery.toLowerCase())

        );
      })
    );
  }, [searchQuery, profiles, session]); // Filter profiles based on search query

  const handleFilterChange = (newFilters: { country: string; state: string; city: string; year: string; gender: string; amount: number; rating: number | null }) => {
    setFilters(newFilters);
    console.log(newFilters);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <head>
        <title>Profile Directory Teams - D1 NOTES</title>
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
              {filteredProfiles.map((profile: any) => (
                <div className="w-full lg:w-auto" key={profile.slug}>

                  <ProfileCard
                    key={profile.slug}

                    creatorname={profile.creatorName}
                    teamName={profile.teamName}
                    logo={profile.logo ?? '/default-image.jpg'}
                    rating={5}
                    slug={profile.slug}
                    redirect={handleRedirect(profile.teamId, profile.club_id)}
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
