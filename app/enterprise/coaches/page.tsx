"use client";
import React, { useEffect, useState } from 'react';
import { useSession, getSession } from 'next-auth/react';
import Sidebar from '../../components/enterprise/Sidebar';
import CoachForm from '@/app/components/enterprise/CoachForm';
import { showError, showSuccess } from '@/app/components/Toastr';
import { FaSpinner } from 'react-icons/fa';

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
  status: string;
  assignedLicenseCount: string;
  consumeLicenseCount: string;
}

const Home: React.FC = () => {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [loadingKey, setLoadingKey] = useState<boolean>(false);
  const [showLicenseModal, setShowLicenseModal] = useState<boolean>(false);
  const [showLicenseNoModal, setShowLicenseNoModal] = useState<boolean>(false);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [licenseCount, setLicenseCount] = useState<number>(0);
  const [licenseKey, setLicenseKey] = useState<string>('');
  const [totalLicenses, setTotalLicenses] = useState<number>(0);
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
      setTotalLicenses(data.totalLicensesCount[0].count)
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching coaches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadLicense = async () => {
        
    try {
        setLoadingKey(true);
        const userId= session?.user.id; 
        const response = await fetch("/api/fetchlicense", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId:userId,
                type:"Enterprise",
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to fetch license");
        }
        setLoadingKey(false);
        const data = await response.json();
        setLicenseKey(data.licenseKey);
       
    } catch (error) {
        console.error("Error fetching license:", error);
        alert("Failed to assign license");
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
        fetchCoaches();  /// Refresh data table
       
      } else {
        console.error('Failed to add coach');
      }
    } catch (error) {
      console.error('Error adding coach:', error);
    } finally {
      setShowModal(false);
    }
  };

  const handleAssignLicense = (coach: Coach) => {
    setSelectedCoach(coach);
    setShowLicenseModal(true);
  };

  const handleEnterLicense = (coach: Coach) => {
    handleLoadLicense();
    setSelectedCoach(coach);
    setShowLicenseNoModal(true);
  };

  const handleLicenseSubmit = async () => {
    try {
      const session = await getSession();
      const enterpriseId = session?.user?.id;

      if (!enterpriseId || !selectedCoach) {
        console.error('Missing required data');
        return;
      }
      if(licenseCount>totalLicenses){
        showError('License Qualtity can not be greater than available license.');
        return;
      }
      if(licenseCount===0){
        showError('Enter number of licenses.');
        return;
      }
      const response = await fetch('/api/enterprise/coach/assignLicense', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coach_id: selectedCoach.id,
          enterprise_id: enterpriseId,
          licenseCount: licenseCount,
        }),
      });

      if (response.ok) {
        showSuccess('License shared successfully');
        fetchCoaches(); 
        setShowLicenseModal(false);
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.message || 'Failed to share license';
        showError(errorMessage);
        setShowLicenseModal(true);
      }
    } catch (error) {
      console.error('Error sharing license:', error);
    } finally {
     
      setLicenseCount(0);
    }
  };

  const handleLicenseKeySubmit = async () => {
    try {
      const session = await getSession();
      const enterpriseId = session?.user?.id;

      if (!enterpriseId || !selectedCoach) {
        console.error('Missing required data');
        return;
      }

      const response = await fetch('/api/enterprise/coach/updatestatus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coach_id: selectedCoach.id,
          licenseKey: licenseKey,
         
          
        }),
      });

      if (response.ok) {
        showSuccess('License shared successfully');
        fetchCoaches(currentPage, search);
        
        setShowLicenseNoModal(false);
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.message || 'Failed to Change Status';
        showError(errorMessage);
        setShowLicenseNoModal(true);
      }
    } catch (error) {
      console.error('Error shared license:', error);
    } finally {
     
      setLicenseCount(0);
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

          <div className="overflow-x-auto">
  <table className="w-full text-sm text-left text-gray-700 mt-4">
    <thead>
      <tr>
        <th>Name</th>
        <th>Gender</th>
        <th>Email</th>
        <th>Phone</th>
        <th>Sport</th>
        <th>License</th>
        <th>Status</th>
        <th style={{width:225}}>Action</th>
      </tr>
    </thead>
    <tbody>
      {coaches.length > 0 ? (
        coaches.map((coach) => (
          <tr key={coach.id}>
            <td className="text-center">
              <img src={coach.image} className="rounded-full w-16 h-16 object-cover m-auto"/>
              {coach.firstName} {coach.lastName}
            </td>
            <td>{coach.gender}</td>
            <td>{coach.email}</td>
            <td>{coach.countrycode}{coach.phoneNumber}</td>
            <td>{coach.sport}</td>
            <td>
            <div className="mt-4">
  <button className="w-24 px-1 py-1 bg-blue-500 text-white rounded-lg">Shared {coach.assignedLicenseCount}</button>
  <button className="w-24 px-1 py-1 bg-red-500 text-white rounded-lg mt-2"> Consumed {coach.consumeLicenseCount}</button>
</div>
            </td>
            <td>
              {coach.status === 'Inactive' ? (
                <button
                  className="bg-red px-4 py-2 rounded bg-red-500 text-white"
                  onClick={() => handleEnterLicense(coach)}
                >
                  {coach.status}
                </button>
              ) : (
                <button className="bg-red px-4 py-2 rounded bg-green-500 text-white">
                  {coach.status}
                </button>
              )}
              
            </td>
            <td>
              <div className="flex items-center space-x-2">
                <a
                  href={`/coach/${coach.slug}`}
                  className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
                  target="_blank"
                >
                  View
                </a>
                <button
                  onClick={() => handleAssignLicense(coach)}
                  className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
                >
                  Share License
                </button>
              </div>
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan={8}>No coaches found</td>
        </tr>
      )}
    </tbody>
  </table>
</div>


          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 text-sm ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-500 hover:underline'
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
              className={`px-4 py-2 text-sm ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-blue-500 hover:underline'
                }`}
            >
              Next
            </button>
          </div>
        </div>

        {/* License Modal */}
        {showLicenseModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-4 rounded-lg w-96">
              <h2 className="text-2xl font-semibold mb-4">Assign Licenses</h2>
              <div className="mb-2">
              <label>Available License Keys: </label> 
               <span className='bg-blue-500 w-16 h-16 rounded-full p-2 text-white'>{totalLicenses}</span>
                </div>
                <div className="mb-2">
              <input
                type="number"
                className="w-full p-2 border rounded-lg mb-4"
                value={licenseCount}
                onChange={(e) => setLicenseCount(Number(e.target.value))}
                placeholder="Number of licenses"
              />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowLicenseModal(false)}
                  className="px-4 py-2 bg-gray-300 text-black rounded-lg mr-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLicenseSubmit}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
        {showLicenseNoModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-4 rounded-lg w-96">
              <h2 className="text-2xl font-semibold mb-4">Enter License Key</h2>
              <input
                type="text"
                className="w-full p-2 border rounded-lg mb-4"
                value={licenseKey}
                readOnly
                onChange={(e) => setLicenseKey(e.target.value)}
                placeholder="Enter License Key"
              />
              {loadingKey ? (
                                            <>
                                                <p><FaSpinner className="animate-spin mr-2" /> Finding Key...</p>
                                            </>
                                        ) : (
                                            <>
                                               
                                            </>
                                        )}
          {/* <button
          type='button'
  className="text-xs text-gray-500 underline"
  onClick={() => handleLoadLicense()}
>
  Assign License
</button> */}
              <div className="flex justify-end">
                <button
                  onClick={() => setShowLicenseNoModal(false)}
                  className="px-4 py-2 bg-gray-300 text-black rounded-lg mr-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLicenseKeySubmit}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}


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
