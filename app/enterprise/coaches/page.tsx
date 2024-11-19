"use client";
import React, { useEffect, useState } from 'react';
import { useSession, getSession } from 'next-auth/react';
import Sidebar from '../../components/enterprise/Sidebar';
import CoachForm from '@/app/components/enterprise/CoachForm';

// Define the type for the coach data
interface Coach {
  id: number;
  image: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  countrycode: string;
  gender: string;
  sport: string;
  expectedCharge: string;
  slug: string;
  qualifications: string;
}

const Home: React.FC = () => {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [showModal, setShowModal] = useState<boolean>(false);
  const limit = 10; // Items per page

  const { data: session } = useSession();

  const fetchCoaches = async (page = 1, searchQuery = '') => {
    setLoading(true);

    try {
      const session = await getSession();
      const enterpriseId = session?.user?.id;

      if (!enterpriseId) {
        console.error('Enterprise ID not found in session');
        return;
      }

      const response = await fetch(
        `/api/enterprise/coach/signup?enterprise_id=${enterpriseId}&page=${page}&limit=${limit}&search=${encodeURIComponent(searchQuery)}`,
      
      );

      if (!response.ok) {
        console.error('Failed to fetch coaches');
        return;
      }

      const data = await response.json();
      setCoaches(data.coaches);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching coaches:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoaches(currentPage, search);
  }, [currentPage, search]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleAddCoachClick = () => {
    setShowModal(true); // Open the modal
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1); // Reset to the first page
  };

  const handleSubmitCoachForm = async (formData: any) => {
    try {
      const response = await fetch('/api/enterprise/coach/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      fetchCoaches(currentPage, search);
      if (response.ok) {
        console.log('Coach added successfully');
        fetchCoaches(); // Refresh data table
      } else {
        console.error('Failed to add coach');
      }
    } catch (error) {
      console.error('Error adding coach:', error);
    } finally {
      setShowModal(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-grow bg-gray-100 p-4 overflow-auto">
        <div className="bg-white shadow-md rounded-lg p-6 h-auto">
          <div className="flex justify-between items-center">
            <input
              type="text"
              placeholder="Search by name, email, or phone"
              className="w-1/3 mb-2 px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={search}
              onChange={handleSearchChange}
            />
            <button
              onClick={handleAddCoachClick}
              className="px-4 py-2 text-sm text-white bg-blue-500 hover:bg-blue-700 rounded-lg"
            >
              Add Coach
            </button>
          </div>

        
            <table className="w-full text-sm text-left text-gray-700 mt-4">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Gender</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Sport</th>
                  <th>Qualification</th>
                  <th>Action</th>
                </tr>
              </thead>
              {loading ? (
            <div>Loading...</div>
          ) : (
              <tbody>
                {coaches.length > 0 ? (
                  coaches.map((coach) => (
                    <tr key={coach.id}>
                      <td className='text-center'> 
                        <img src={coach.image} className="rounded-full w-32 h-32 object-cover m-auto"/>
                        {coach.firstName} {coach.lastName}</td>
                      <td>{coach.gender}</td>
                      <td>{coach.email}</td>
                      <td>{coach.countrycode}{coach.phoneNumber}</td>
                      <td>{coach.sport}</td>
                      <td>{coach.qualifications}</td>
                      <td>

                        <a href={`/coach/${coach.slug}`} className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75" target='_blank'>View</a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7}>No coaches found</td>
                  </tr>
                )}
              </tbody>
               )}
            </table>
         

          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 text-sm ${
                currentPage === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-blue-500 hover:underline'
              }`}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 text-sm ${
                currentPage === totalPages
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-blue-500 hover:underline'
              }`}
            >
              Next
            </button>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-4 rounded-lg w-11/12 max-h-[100vh] overflow-hidden relative">
              <div className="absolute top-0 left-0 right-0 bg-white p-4 flex justify-between items-center border-b">
                <h2 className="text-2xl font-semibold text-gray-800">Add Coach</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-xl text-gray-600 hover:text-gray-900"
                >
                  &times;
                </button>
              </div>
              <div className="pt-16 pb-4 overflow-y-auto max-h-[70vh]">
                <CoachForm onSubmit={handleSubmitCoachForm} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
