"use client";
import React, { useEffect, useState } from "react";
import "../globals.css";
import Sidebar from "../components/Sidebar";
import { getSession } from "next-auth/react";
import { useTable, Column, CellProps } from "react-table"; // Import Column type
import { Evaluation, EvaluationsByStatus } from "../types/types"; // Import the correct types
import { FaEye } from "react-icons/fa";
import ProfileCard from "../components/ProfileCard";

const Dashboard: React.FC = () => {
  const [evaluations, setEvaluations] = useState<EvaluationsByStatus>({
    Requested: [],
    Accepted: [],
    Completed: [],
    Declined: [],
    Drafted: [],
  });
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
    enterprise_id: number;
    phoneNumber: string;
    qualifications: string;
    expectedCharge: number;
  }
  const [selectedTab, setSelectedTab] = useState<string>("0");
  const [data, setData] = useState<Evaluation[]>([]); // State to hold the data for the table
  const [loading, setLoading] = useState<boolean>(true); // Add loading state
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [currentDescription, setCurrentDescription] = useState<string>("");
  const [coaches, setCoaches] = useState<Profile[]>([]);
  const [playerClubId,setPlayerClubid]=useState<string>('')
  const [freeEvaluations,setFreeEvaluations]=useState(0);
  const [allowedFreeRequests,setAllowedFreeRequests]=useState(0);
  
  const Modal: React.FC<{ isOpen: boolean, onClose: () => void, description: string }> = ({ isOpen, onClose, description }) => {
    console.log("Modal isOpen: ", isOpen); // Log the open state for debugging
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
          <h3 className="text-lg font-bold mb-4">Full Description</h3>
          <p>{description}</p>
          <button onClick={onClose} className="mt-4 text-blue-500 ">
            Close
          </button>
        </div>
      </div>
    );
  };
  const fetchRequests = async () => {
    const session = await getSession();
    const clubId =session?.user.club_id;
    if (!clubId) {
      console.error("Club ID is not available.");
      return;
    }
    
    try {
      const response = await fetch(`/api/freerequests?clubId=${clubId}`);
      
      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText} (Status: ${response.status})`);
      }
  
      const textResponse = await response.text(); // Read response as text
      if (!textResponse) {
        throw new Error("Empty response body received.");
      }
  
      const body = JSON.parse(textResponse); // Parse text as JSON
      if (body && body.requests) {
        setAllowedFreeRequests(body.requests);
      } else {
        throw new Error("Invalid response structure.");
      }
    } catch (error) {
      console.error("Failed to fetch free requests:", error);
    }
  };
  const fetchEvaluations = async (status: string) => {
    setLoading(true); // Set loading to true before fetching data
    const session = await getSession();
    const userId = session?.user.id;
     

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const response = await fetch("/api/evaluations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        status, // Pass the active tab status
      }),
    });

    if (!response.ok) {
      setLoading(false);
      throw new Error("Failed to fetch evaluations");
    }

    const evaluationsData = await response.json();
    setEvaluations((prev) => ({
      ...prev,
      [status]: evaluationsData, // Assuming evaluationsData is an array
    }));

    setData(evaluationsData); // Set the data for the table
    setLoading(false); // Set loading to false after data is fetched
  };


  const fetchCoach = async () => {
    setLoading(true); // Set loading to true before fetching data
    const session = await getSession();
    const userId = session?.user.id;
    const clubId = session?.user.club_id;
    setPlayerClubid(clubId || '');

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const response = await fetch("/api/player/coaches", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clubId,
        
      }),
    });

    if (!response.ok) {
      setLoading(false);
      throw new Error("Failed to fetch evaluations");
    }

    const coachData = await response.json();
    
    setCoaches(coachData);
 
    setLoading(false); // Set loading to false after data is fetched
  };


  const fetchFreeEvaluations = async () => {
    setLoading(true); // Set loading to true before fetching data
    const session = await getSession();
    const player_id = session?.user.id;
    

    const response = await fetch("/api/freeevaluations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        player_id,
        
      }),
    });

    if (!response.ok) {
      setLoading(false);
      throw new Error("Failed to fetch evaluations");
    }

    const coachData = await response.json();
    
    setFreeEvaluations(coachData.countRecords);
 
    setLoading(false); // Set loading to false after data is fetched
  };
  
  const handleReadMore = (description: string) => {
    setCurrentDescription(description);
   
    setModalOpen(true); // Open modal with full description
     
  };

  const handleCloseModal = () => {
    setModalOpen(false); // Close modal
  };
  useEffect(() => {
    // Fetch data for the initially selected tab
    fetchEvaluations(selectedTab);
    fetchFreeEvaluations();
    fetchRequests();
    fetchCoach();
  }, [selectedTab]);

  // Define columns for the react-table with proper types
  const columns: Column<Evaluation>[] = React.useMemo(
    () => [
      {
        Header: 'Date',
    accessor: 'created_at',
    Cell: ({ value }: CellProps<Evaluation>) => {
      // Format the date to 'dd-mm-yyyy'
      const date = new Date(value);
      return date.toLocaleDateString('en-US'); // This formats the date to 'dd/mm/yyyy'
    },
        
      },
      {
        Header: "Coach Name",
        accessor: "first_name",
        Cell: ({ row }: CellProps<Evaluation>) => (
          <div className="space-y-2"> {/* Stack links vertically with spacing */}
          <a href={`coach/${row.original.slug}`} target="_blank" rel="noopener noreferrer">
   {row.original.first_name} {row.original.last_name}
</a>
         </div>
        ),
      },
      { Header: "Review Title", accessor: "review_title" }, // Use the correct accessor
      {
        Header: "Video Links",  // Combine all video links under this column
        accessor: "primary_video_link",  // Or just leave it as undefined if it's not needed
        Cell: ({ row }: CellProps<Evaluation>) => (
          <div className="space-y-2"> {/* Stack links vertically with spacing */}
            <a href={row.original.primary_video_link} target="_blank" rel="noopener noreferrer" className="block w-full text-center px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md text-base font-medium mt-2">
              Primary
            </a>
            <a href={row.original.video_link_two} target="_blank" rel="noopener noreferrer" className="block w-full text-center px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md text-base font-medium mt-2">
             Link#2
            </a>
            <a href={row.original.video_link_three} target="_blank" rel="noopener noreferrer" className="block w-full text-center px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md text-base font-medium mt-2">
              Link#3
            </a>
          </div>
        ),
      },
      {
        Header: "Video Description",
        accessor: "video_description",
        Cell: ({ cell }) => {
          const description = cell.value ?? ""; // Default to an empty string if undefined
      
          const truncatedDescription = description.length > 30 ? description.substring(0, 30) + "..." : description;
      
          return (
            <div>
              <span>{truncatedDescription}</span>
              {description.length > 30 && (
                <button onClick={() => handleReadMore(description)} className="text-blue-500 ml-2">
                  Read More
                </button>
              )}
            </div>
          );
        },
      },
      { Header: "Payment Status", accessor: "payment_status" },
      ...(selectedTab === "2" // Check if the current tab is "Completed"
        ? [
            {
              Header: "View Evaluation",
              Cell: ({ row }: CellProps<Evaluation>) => (
                <button
                  onClick={() => handleEvaluationDetails(row.original)} // Pass the evaluation object
                  className="text-blue-500"
                >
                  <FaEye className="inline" /> {/* Render the view icon */}
                </button>
              ),
            },
          ]
        : []),
    ],
    [selectedTab]
  );

  const handleEvaluationDetails = (evaluation: Evaluation) => {
    window.open(`/evaluationdetails?evaluationId=${evaluation.evaluationId}`, "_blank");
  };

  const handleAction = (evaluation: Evaluation) => {
    // Implement the action logic here
    console.log("Action for:", evaluation);
    // You could navigate to another page, open a modal, etc.
  };

  // Create table instance
  const tableInstance = useTable({ columns, data });

  return ( 
    <div className="flex h-screen">
      <Modal
  isOpen={modalOpen}
  onClose={handleCloseModal}
  description={currentDescription}
/>
      <Sidebar />
      <main className="flex-grow bg-gray-100 p-4 overflow-x-auto">
    
 
        <div className="grid grid-cols-1 bg-white sm:grid-cols-1 lg:grid-cols-4 gap-2 mt-4 p-6">
          <div className="col-span-full"><h3 className="text-lg text-black font-bold w-full clear-both">Your Coaches</h3></div>
        
      {coaches.map((profile) => (
                <div className="w-full lg:w-auto" key={profile.id}>
                  <ProfileCard
                    key={profile.id}
                    id={profile.id}
                    name={profile.firstName}
                    organization={profile.clubName}
                    image={profile.image ?? '/default.jpg'}
                    rating={profile.rating}
                    freeEvaluations={freeEvaluations}
                    expectedCharge={profile.expectedCharge}
                    allowedFreeRequests={allowedFreeRequests}
                    slug={profile.slug}
                    usedIn='playerlogin'
                    playerClubId={Number(playerClubId)}
                    coachClubId={profile.enterprise_id}
                  />
                </div>
              ))}


       
        </div> 
      </main>


      
    </div>
  );
};

export default Dashboard;
