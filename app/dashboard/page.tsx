"use client";
import React, { useEffect, useState } from "react";
import "../globals.css";
import Sidebar from "../components/Sidebar";
import { getSession } from "next-auth/react";
import { useTable, Column, CellProps } from "react-table"; // Import Column type
import { Evaluation, EvaluationsByStatus } from "../types/types"; // Import the correct types
import { FaEye } from "react-icons/fa";
import ProfileCard from "../components/ProfileCard";
import { calculateHoursFromNow } from "@/lib/clientHelpers";
import TeamProfileCard from '@/app/components/teams/ProfileCard';
import PromptComponent from "../components/Prompt";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/solid";
import  { useRef } from "react";

const Dashboard: React.FC = () => {
  const tableContainerRef = useRef<HTMLDivElement>(null); // ✅ Correct usage of useRef

  // Scroll handlers
  const scrollLeft = () => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollLeft -= 200; // Adjust as needed
    }
  };

  const scrollRight = () => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollLeft += 200;
    }
  };
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
  const [teams, setTeams] = useState<[]>([]);
  const [playerClubId, setPlayerClubid] = useState<string>('')
  const [freeEvaluations, setFreeEvaluations] = useState(0);
  const [allowedFreeRequests, setAllowedFreeRequests] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
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
    const clubId = session?.user.club_id;
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





  const fetchTeams = async () => {
    setLoading(true); // Set loading to true before fetching data
    const session = await getSession();
    const userId = session?.user.id;


    if (!userId) {
      throw new Error("User not authenticated");
    }

    const response = await fetch("/api/player/teams", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,

      }),
    });

    if (!response.ok) {
      setLoading(false);
      throw new Error("Failed to fetch evaluations");
    }

    const coachData = await response.json();

    setTeams(coachData);

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
    fetchCoach();
    fetchFreeEvaluations();
    fetchRequests();
    fetchTeams();
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
        Header: selectedTab === '0' ? 'Completion Time' : 'Time Remaining',
        accessor: 'createdAt',
        Cell: ({ row }: CellProps<Evaluation>) => {



          const accepted_at = row?.original?.accepted_at;
          const turnaroundTime = row?.original?.turnaroundTime;
          if (selectedTab == '1' && turnaroundTime) {
            if (accepted_at && turnaroundTime !== undefined && turnaroundTime !== null) {
              const hoursFromNow = calculateHoursFromNow(accepted_at);
              if (hoursFromNow !== null && hoursFromNow !== undefined) {
                const remainingTime = turnaroundTime - hoursFromNow;
                const boxClass = remainingTime >= 0
                  ? 'bg-green-900 text-white px-2 py-1 rounded'
                  : 'bg-red-600 text-white px-2 py-1 rounded';
                return (
                  <span >
                    {remainingTime.toFixed(2)} Hours
                  </span>
                );
              }
            }
          }
          else {
            const boxClass = 'bg-red-600 text-white px-2 py-1 rounded';
            return (

              <span >
                {turnaroundTime ? `${turnaroundTime} Hours` : "Not Applicable"}
              </span>
            );


            // Fallback value if data is missing
          } // Fallback value if data is missing
        },
      },
      {
        Header: 'Coach Name',
        accessor: 'first_name',
        Cell: ({ row }: CellProps<Evaluation>) => (
          <div className="flex items-center space-x-2">
            <img
  src={(!row.original.image || row.original.image === 'null') ? '/default.jpg' : row.original.image}
  alt={row.original.first_name}
  className="w-8 h-8 rounded-full"
/>
            <a
              href={`/coach/${row.original.slug}`}
              className=" font-bold text-blue-700"
              target="_blank"
              rel="noopener noreferrer"
            >
              {row.original.first_name} {row.original.last_name}
            </a>
          </div>
        ),
      }
    ,
      { Header: "Review Title", accessor: "review_title" }, // Use the correct accessor
      {
        Header: "Video Links",  // Combine all video links under this column
        accessor: "primary_video_link",  // Or just leave it as undefined if it's not needed
        Cell: ({ row }: CellProps<Evaluation>) => (
          <div className="space-y-2"> {/* Stack links vertically with spacing */}
            <a
              href={row.original.primary_video_link}
              target="_blank"
              rel="noopener noreferrer"
              className="px-1 py-0.5 text-[10px] font-light text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors"
            >
              Link#1
            </a>

            {row.original.video_link_two ? (
              <a
                href={row.original.video_link_two}
                target="_blank"
                rel="noopener noreferrer"
                className="px-1 py-0.5 text-[10px] font-light text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors ml-2"
              >
                Link#2
              </a>
            ) : (
              <button
                disabled
                className="px-1 py-0.5 text-[10px] font-light text-gray-400 bg-gray-300 rounded ml-2 cursor-not-allowed"
              >
                Link#2
              </button>
            )}

            {row.original.video_link_three ? (
              <a
                href={row.original.video_link_three}
                target="_blank"
                rel="noopener noreferrer"
                className="px-1 py-0.5 text-[10px] font-light text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors ml-2"
              >
                Link#3
              </a>
            ) : (
              <button
                disabled
                className="px-1 py-0.5 text-[10px] font-light text-gray-400 bg-gray-300 rounded ml-2 cursor-not-allowed"
              >
                Link#3
              </button>
            )}
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
                <button onClick={() => handleReadMore(description)} className="text-blue-500  ml-2">
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
            Header: "Evaluation",
            Cell: ({ row }: CellProps<Evaluation>) => (
              <button
                onClick={() => handleEvaluationDetails(row.original)} // Pass the evaluation object
                className="text-blue-500"
              >
                View
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
  const filteredRows = tableInstance.rows.filter((row) =>
    row.cells.some((cell) =>
      String(cell.value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  return (
    <div className="flex h-screen">
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        description={currentDescription}
      />
      <Sidebar />

      <main className="flex-grow bg-gray-100 p-4 overflow-x-auto">
        <div className="bg-white shadow-md rounded-lg p-6 ">
          <h3 className='font-bold text-lg'>Evaluation Tracker</h3>
          <PromptComponent marginleft={0} stepstext="Let’s get started! First, upload your payment information to send funds by clicking on Payment Information in the left side menu if you plan to purchase evaluations from D1’s public marketplace of Coaches. Next, if you are part of an Organization or Team participating in D1 Notes, check Join Requests to see if you received an invite from your Organization or Team offering free evaluations. Otherwise, start your journey to greatness by finding a Coach who will give you that edge you have been missing!" />

          <div className="block md:hidden mb-4">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded w-full text-left"
            >
              {['Requested', 'Accepted', 'Completed', 'Declined', 'Drafted'][parseInt(selectedTab)]} ▼
            </button>
            {isDropdownOpen && (
              <ul className="bg-white shadow-lg rounded mt-2">
                {[
                  { name: 'Requested', value: '0' },
                  { name: 'Accepted', value: '1' },
                  { name: 'Completed', value: '2' },
                  { name: 'Declined', value: '3' },

                ].map((tab) => (
                  <li key={tab.value}>
                    <button
                      onClick={() => {
                        setSelectedTab(tab.value);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      {tab.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="hidden md:flex space-x-4 mb-4">
            {[
              { name: 'Requested', value: '0' },
              { name: 'Accepted', value: '1' },
              { name: 'Completed', value: '2' },
              { name: 'Declined', value: '3' },

            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setSelectedTab(tab.value)}
                className={`p-2 border-b-2 ${selectedTab === tab.value ? 'border-blue-500 font-bold' : 'border-transparent'}`}
              >
                {tab.name}
              </button>
            ))}
          </div>

          {/* Table to display evaluations */}
          <div ref={tableContainerRef}className=" overflow-x-auto max-h-[400px] overflow-y-auto">
            <input
              type="text"
              placeholder="Search by Keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 mb-4 border border-gray-300 rounded-md"
            />
            <button
        onClick={scrollLeft}
        className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-500 text-white p-2 rounded-full shadow-md z-10"
      >
        ⬅
      </button>
            <table {...tableInstance.getTableProps()} className="min-w-full bg-white border border-gray-300">
              <thead>
                {tableInstance.headerGroups.map((headerGroup) => (
                  <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
                    {headerGroup.headers.map((column) => (
                      <th
                        {...column.getHeaderProps()}
                        key={column.id}
                        className="border-b-2 border-gray-200 bg-gray-100 px-4 py-2 text-left text-gray-600"
                        style={{ whiteSpace: 'nowrap' }} // Ensure headers don't wrap
                      >
                        {column.render('Header')}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody {...tableInstance.getTableBodyProps()}>
                {loading ? (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-4">
                      Loading Evaluations...
                    </td>
                  </tr>
                ) : filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-4 text-gray-500">
                      No Entries...
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row) => {
                    tableInstance.prepareRow(row);
                    return (
                      <tr {...row.getRowProps()} key={row.id}>
                        {row.cells.map((cell) => (
                          <td
                            {...cell.getCellProps()}
                            key={`${row.id}-${cell.column.id}`}
                            className="border-b border-gray-200 px-4 py-2"
                          >
                            <div className="truncate w-auto min-w-0">{cell.render('Cell')}</div>
                          </td>
                        ))}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            <button
        onClick={scrollRight}
        className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-500 text-white p-2 rounded-full shadow-md z-10"
      >
        ➡
      </button>
          </div>
        </div>


        <div className="grid grid-cols-1 bg-white  mt-4 p-6">
          <h3 className='font-bold text-lg'>Quick Tips</h3>

          <h3 className='font-bold text-lg mt-4'>Request an Evaluation</h3>
         <p className="text-justify"> In order to search for a coach in the marketplace to request an individual game film evaluation, <a href="/browse" target="_blank" className="text-blue-600 hover:text-blue-800 ">click here</a> or on Coaches in the header. When you receive a completed evaluation, it will look similar to this [[for now, show a blank field player evaluation form]]]. If your Public Visibility is on, a coach may find you in player marketplace searches and see your limited information, but they cannot click through to view all of your details, nor contact you until you request an evaluation from the coach. If your Public Visibility is off, you will not show up in the player marketplace.</p>

         <h3 className='font-bold text-lg mt-4'>Enterprises / Your Teams Explanation</h3> 
<p className="text-justify">Only if you have been added by an organization or single team that is using D1 Notes’ Enterprises (white label) capabilities, you can view that organization’s or single team’s internal / private information by <a href="/yourteams" target="_blank" className="text-blue-600 hover:text-blue-800 ">clicking here</a> [[[check to make sure this link to goes to Your Teams in the menu]]] or on Your Teams in the menu. From here, you can navigate through your team(s)… in order to request an individual game film evaluation from a coach of the organization or single team that added you, view the roster and click on a coach’s profile. You will automatically not be charged any rate as your organization / team has already paid for them.</p>
<p></p>
<h3 className='font-bold text-lg mt-4'>Sending Messages</h3>
<p className="text-justify">The Messages function in the menu allows you to communicate with any coach in Your Teams as well as communicate further with any coach in the marketplace that has accepted an evaluation request from you.</p>




        </div>
        {/* <div className="grid grid-cols-1 bg-white sm:grid-cols-1 lg:grid-cols-4 gap-2 mt-4 p-6">
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


       
        </div> */}
        {/* <div className="grid grid-cols-1 bg-white sm:grid-cols-1 lg:grid-cols-4 gap-2 mt-4 p-6">
          <div className="col-span-full"><h3 className="text-lg text-black font-bold w-full clear-both">Your Teams</h3></div>
        
      {teams.map((item:any) => (
                <div className="w-full lg:w-auto" key={item.id}>
                  <TeamProfileCard
                     key={item?.teamSlug}
                     creatorname={item.creatorName}
                     teamName={item.teamName} // Ensure `team_name` is correct
                     logo={item.logo ?? '/default.jpg'}
                     rating={5}
                     slug={item.teamSlug}
                  />
                </div>
              ))}

 
       
        </div>  */}
      </main>



    </div>
  );
};

export default Dashboard;
