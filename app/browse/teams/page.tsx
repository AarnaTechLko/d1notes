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

  const [playerType, setPlayerType] = useState<string | null>(null);


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
  const handleRedirect = (profileId: number, clubId: number) => {
    if (session?.user.type == 'player' || session?.user.type == 'coach') {
      return teamids.includes(profileId);
    }
    if (session?.user.type == 'enterprise' && Number(session.user.id) === clubId) {
      return true;
    }
    if (session?.user.type == 'team' && Number(session?.user.id) === profileId) {
      return true;
    }
    return false;
  };

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

        const response = await fetch(`/api/browse/teams?${queryParams}`);
        if (!response.ok) {
          throw new Error('Failed to fetch profiles');
        }
        const data = await response.json();
        setProfiles(data);
      } catch (err) {
        setError('Some issue occurred.');
      } finally {
        setLoading(false);
      }
    };

    const fetchTeamIds = async () => {
      try {
        if (!session) return;

        const type = session.user.type;
        const userId = session.user.id;

        const response = await fetch(`/api/browse/fetchteams?type=${type}&userId=${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch teams');
        }
        const data = await response.json();
        setTeamIds(data);
      } catch (err) {
        setError('Some issue occurred.');
      }
    };

    fetchProfiles();
    fetchTeamIds();
  }, [filters, session]);

  useEffect(() => {
    setFilteredProfiles(
      profiles.filter((profile) =>
        (profile.teamName || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, profiles, session]);

  const handleFilterChange = (newFilters: {
    country: string;
    state: string;
    city: string;
    year: string;
    gender: string;
    amount: number;
    rating: number | null;
  }) => {
  setFilters(newFilters);
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
            {/* <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-4 gap-2 mt-4">
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
            </div> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
