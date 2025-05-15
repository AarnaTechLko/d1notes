"use client";
import { useState, useEffect, useMemo } from 'react';
import { CellProps } from 'react-table';
import React from 'react';
import '../../globals.css'; // Import CSS module
import Sidebar from '../../components/coach/Sidebar';
import { useTable, Column } from 'react-table';
import { Evaluation, EvaluationsByStatus,EvaluationData } from '../../types/types';
import Modal from '../../components/Modal';
import AcceptanceModal from '@/app/components/coach/AcceptanceModal';
import { useSession, signOut } from 'next-auth/react';
// import FakeEvaluationForm from '@/app/components/coach/FakeEvaluationForm';
import EvaluationForm from '@/app/components/coach/EvaluationForm';
import NewEvaluationForm from '@/app/components/coach/NewEvaluationForm';
import { FaArrowLeft, FaArrowRight, FaEye } from 'react-icons/fa';
import { getSession } from "next-auth/react";
import { calculateHoursFromNow } from '@/lib/clientHelpers';
import PromptComponent from '@/app/components/Prompt';
import TeamProfileCard from '@/app/components/teams/ProfileCard';
import Swal from 'sweetalert2';
import { showError } from '@/app/components/Toastr';
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/solid";
import { useRef } from "react";
import { useRouter } from 'next/navigation';



const DetailsModal: React.FC<{ isOpen: boolean, onClose: () => void, description: string }> = ({ isOpen, onClose, description }) => {

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

  useEffect(() => {
    const handleScroll = () => {
      if (tableContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = tableContainerRef.current;
        const scrollPercentage = (scrollLeft / (scrollWidth - clientWidth)) * 100;


        setIsStart(scrollLeft === 0);
        setIsEnd(scrollLeft + clientWidth >= scrollWidth);
        setIsMiddle(scrollPercentage >= 40);

      }
    };

    const container = tableContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, []); // Empty dependency array means it runs only once after mount


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenNew, setIsModalOpenNew] = useState(false);
  const [isMiddle, setIsMiddle] = useState(false);
  const [IsStart, setIsStart] = useState(false);
  const [isEnd, setIsEnd] = useState(false);
  const [isAcceptOpen, setIsAcceptOpen] = useState(false);
  const [isEvFormOpen, setIsEvFormOpen] = useState(false);
  const [isNewEvFormOpen, setIsNewEvFormOpen] = useState(false);

  const [isFakeFormOpen, setIsFakeFormOpen] = useState(false);
  //const [clubId, setClubId]=useState<string | undefined>(undefined);
  const [evaluationId, setEvaluationId] = useState<number | undefined>(undefined);
  const [coachId, setCoachId] = useState<number | undefined>(undefined);
  const [playerId, setPlayerId] = useState<number | undefined>(undefined);
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState<boolean>(true);
  const [teams, setTeams] = useState<[]>([]);
  const [evaluationData, setEvaluationData] = useState<Evaluation | undefined>(undefined);
  const [modalContent, setModalContent] = useState<JSX.Element | null>(null);
  const [newmodalContent, setnewModalContent] = useState<JSX.Element | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingAccept, setLoadingAccept] = useState<boolean>(false);
  const [loadingReject, setLoadingReject] = useState<boolean>(false);
  const [evaluations, setEvaluations] = useState<EvaluationsByStatus>({
    Requested: [],
    Accepted: [],
    Completed: [],
    Declined: [],
    Drafted: [],
  });
  const [selectedTab, setSelectedTab] = useState<string>('0');
  const [data, setData] = useState<Evaluation[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  
  const [submittedEvaluations, setSubmittedEvaluations] = useState<number[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [currentDescription, setCurrentDescription] = useState<string>("");
  const router = useRouter();

  const openEvalModal = () => {
    console.log("Going to open")
    setIsEvFormOpen(true);
  };
  const openNewEvForm = () => setIsNewEvFormOpen(true);
  const closeNewEvForm = () => setIsNewEvFormOpen(false);

  const openFakeEvalModel = () => {

    setIsFakeFormOpen(true)

  }

  const handleReadMore = (description: string) => {
    setCurrentDescription(description);

    setModalOpen(true); // Open modal with full description

  };
  const fetchTeams = async () => {
    setLoading(true); // Set loading to true before fetching data
    const session = await getSession();
    const userId = session?.user.id;


    if (!userId) {
      throw new Error("User not authenticated");
    }

    const response = await fetch(`/api/coach/teams?enterprise_id=${session.user.id}`);

    if (!response.ok) {
      setLoading(false);
      throw new Error("Failed to fetch teams");
    }

    const coachData = await response.json();

    setTeams(coachData.data);

    setLoading(false); // Set loading to false after data is fetched
  };
  const handleCloseModal = () => {
    setModalOpen(false); // Close modal
  };

  useEffect(() => {
    const saved = localStorage.getItem('submittedEvaluations');
    if (saved) {
      setSubmittedEvaluations(JSON.parse(saved));
    }
  }, []);
  

  
  
  const fetchEvaluations = async (status: string) => {
    const session = await getSession();
    const coachId = session?.user.id;

    console.log("coachId: ", coachId, " status: ", status)

    setLoading(true);
    const response = await fetch('/api/coach/evaluations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status, coachId }),
    });

    if (!response.ok) {
      setLoading(false);
      throw new Error('Failed to fetch evaluations');
    }

    const evaluationsData = await response.json();

    console.log("Evaluation Data: ", evaluationsData)

    setEvaluations(evaluationsData);

    setData(evaluationsData);
    setLoading(false);
  };


  const columns = React.useMemo<Column<Evaluation>[]>(
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
                    {remainingTime.toFixed(0)} Hours
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

          }
          // Fallback value if data is missing
        },
      },
      {
        Header: 'Player Name',
        accessor: 'first_name',
        Cell: ({ row }: CellProps<Evaluation>) => (
          <div className="flex items-center space-x-2">
            <img
              src={(!row.original.image || row.original.image === 'null') ? '/default.jpg' : row.original.image}
              alt={row.original.first_name}
              className="w-8 h-8 rounded-full"
            />
            <a
              href={`/players/${row.original.playerSlug}`}
              className=" font-bold text-blue-700"
              target="_blank"
              rel="noopener noreferrer"
            >
              {row.original.first_name} {row.original.last_name}
            </a>
          </div>
        ),
      },
      {
        Header: 'Review Title',
        accessor: 'review_title',
      },
      // {
      //   Header: "Overall Average",
      //   accessor: "rating",
      //   Cell: ({ row }: CellProps<Evaluation>) => {
      //     const evaluationData = row.original.evaluation;
      
      //     // Early fallback if evaluationData is empty
      //     if (!evaluationData) {
      //       return <span className="text-gray-500">No evaluation data</span>;
      //     }
      
      //     let parsedEval;
      
      //     try {
      //       // Only parse if it's a string and not already an object
      //       parsedEval =
      //         typeof evaluationData === "string"
      //           ? JSON.parse(evaluationData)
      //           : evaluationData;
      //     } catch (error) {
      //       return <span className="text-gray-500">Invalid data</span>;
      //     }
      
      //     // Safely extract values with fallback
      //     const {
      //       technical = null,
      //       tactical = null,
      //       physical = null,
      //       distribution = null,
      //       organization = null,
      //     } = parsedEval || {};
      
      //     const scores = [technical, tactical, physical, distribution, organization].filter(
      //       (score): score is number => typeof score === "number"
      //     );
      
      //     const overallScore =
      //       scores.length > 0
      //         ? (scores.reduce((acc, curr) => acc + curr, 0) / scores.length).toFixed(1)
      //         : "N/A";
      
      //     return (
      //       <span className="px-2 py-1 text-sm rounded text-blue-800">
      //         {overallScore}
      //       </span>
      //     );
      //   },
      // }
      
      
      
      
            
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
      {
        Header: selectedTab === '2' ? 'Evaluation' : 'Action',
        Cell: ({ row }: CellProps<Evaluation>) => {
          const evaluation = row.original;
          if (selectedTab === '0') {
            return (
              // <a className="cursor-pointer" onClick={() => handleRequestedAction(evaluation)}>
              <>   <button
                onClick={() => handleAccept(evaluation)}
                className="bg-green-500 text-white font-semibold px-4 py-2 rounded hover:bg-green-600 transition duration-200"
              >
                {loadingAccept ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    <span>Accepting...</span>
                  </div>
                ) : (
                  <span>Accept</span>
                )}

              </button>
                <button
                  onClick={() => handleReject(evaluation)}

                  className="bg-red-500 ml-2 text-white font-semibold px-4 py-2 rounded hover:bg-red-600 transition duration-200"
                >
                  {loadingReject ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      <span>Declining...</span>
                    </div>
                  ) : (
                    <span>Decline</span>
                  )}
                </button>

              </>

            );
          } else if (selectedTab === '1') {
            return (
              <>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleAcceptedAction(evaluation)}
                    className="bg-green-500 text-white px-3 py-1 rounded text-xs"
                  >
                    Evaluate
                  </button>
                  {/* <button
  onClick={() => {
    if (submittedEvaluations.includes(evaluation.evaluationId)) {
      router.push(`/newevaluationdetails?evaluationId=${evaluation.evaluationId}`);
    } else {
      NewhandleAcceptedAction(evaluation);
    }
  }}
  className={`${
    submittedEvaluations.includes(evaluation.evaluationId)
      ? "bg-blue-500"
      : "bg-green-500"
  } text-white px-3 py-1 rounded text-xs`}
>
  {submittedEvaluations.includes(evaluation.evaluationId) ? "View" : "New Evaluate"}
</button> */}




                </div>

              </>
            );
          } else if (selectedTab === '4') {
            return (
              <button
                onClick={() => handleAcceptedAction(evaluation)}
                className="bg-green-500 text-white px-4 py-2 rounded text-sm md:text-base"
              >
                Open Draft
              </button>
            );
          } else {
            if (selectedTab != '3') {

              return <a onClick={() => handleEvaluationDetails(evaluation)} href='#' className=' text-blue-700'>View</a>;
            }
            else {
              return 'Declined';
            }

          }
        },
      },
    ],
    [selectedTab]
  );

  const handleTabChange = (tab: any) => {
    setEvaluations({
      Requested: [],
      Accepted: [],
      Completed: [],
      Declined: [],
      Drafted: [],
    })
    setLoading(true);
    setSelectedTab(tab.value);

    fetchEvaluations(selectedTab);
    setIsDropdownOpen(false);

  }
  const handleRequestedAction = (evaluation: Evaluation) => {
    setEvaluationId(evaluation.evaluationId);
    setCoachId(evaluation.coachId);
    setPlayerId(evaluation.playerId);
    setIsAcceptOpen(true);
  };

  const handleEvaluationDetails = (evaluation: Evaluation) => {
    window.open(`/evaluationdetails?evaluationId=${evaluation.evaluationId}`, '_blank');
  };

  const handleAcceptedAction = (evaluation: Evaluation) => {
    setEvaluationId(evaluation.evaluationId);
    setCoachId(evaluation.coachId);
    setPlayerId(evaluation.playerId);
    setEvaluationData(evaluation);
    console.log("evaluation: ", evaluation);
    setIsEvFormOpen(true);
  };
  
  const NewhandleAcceptedAction = (evaluation: Evaluation) => {
    setEvaluationId(evaluation.evaluationId);
    setCoachId(evaluation.coachId);
    setPlayerId(evaluation.playerId);
    setEvaluationData(evaluation);
    setSubmittedEvaluations(prev => [...prev, evaluation.evaluationId]);

    console.log("evaluation: ", evaluation);
    setIsNewEvFormOpen(true);
  };


  const tableInstance = useTable({ columns, data });

  const filteredRows = tableInstance.rows.filter((row) =>
    row.cells.some((cell) =>
      String(cell.value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  const closeModal = () => {
    setIsModalOpen(false);
    setIsModalOpenNew(false);

    setModalContent(null);
    setnewModalContent(null);
  };

  const closeAcceptanceModal = () => {
    setIsAcceptOpen(false);
  };

  const closeFakeEvform = () => {

    setIsFakeFormOpen(false);

  }

  const closeEvform = () => {
    setIsEvFormOpen(false);
  };
  const closeNewEvform = () => {
    setIsNewEvFormOpen(false);
  };

  const clubId = useMemo(() => session?.user?.club_id ?? '', [session]);

  useEffect(() => {

    fetchEvaluations(selectedTab);
    fetchTeams();


  }, [selectedTab]);


  const handleAccept = async (evaluation: any) => {
    setLoadingAccept(true);
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to accept this evaluation request?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Accept',
      cancelButtonText: 'Cancel',
    }).then(async (result) => {

      if (result.isConfirmed) {
        const payload = {
          evaluationId: evaluation.evaluationId,
          status: 1,
        };

        try {
          const response = await fetch('/api/coach/evaluations', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            setLoadingAccept(false);
            throw new Error('Failed to accept evaluation');
          }

          Swal.fire({
            title: 'Accepted!',
            text: 'You have accepted the evaluation request.',
            icon: 'success',
          }).then(() => {
            setTimeout(() => {
              window.location.href = window.location.href;
            }, 1000);
          });
        } catch (error: any) {
          setLoadingAccept(false);
          showError(error?.message);
        }
      }
    });
  };

  const handleReject = async (evaluation: any) => {
    setLoadingReject(true);
    Swal.fire({
      title: 'Add a Comment',
      input: 'textarea',
      inputPlaceholder: 'Write your comment here...',
      inputAttributes: {
        'aria-label': 'Write your Comment here',
      },
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Decline',
      cancelButtonText: 'Cancel',
    }).then(async (result) => {
      if (result.isConfirmed) {

        const remark = result.value;
        if (!remark) {
          Swal.fire('Error', 'Remark is required to reject the evaluation.', 'error');
          return;
        }

        const payload = {
          evaluationId: evaluation.evaluationId,
          status: 3,
          remark: remark, // Include the remark in the payload
        };

        try {
          const response = await fetch('/api/coach/evaluations', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            setLoadingReject(false);
            throw new Error('Failed to reject evaluation');
          }

          Swal.fire({
            title: 'Declined!',
            text: 'You have Declined the evaluation request.',
            icon: 'error',
          }).then(() => {
            setTimeout(() => {
              window.location.href = window.location.href;
            }, 1000);
          });
        } catch (error) {
          console.error('Error:', error);
        }
      }
    });
  };


  return (
    <>



      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {modalContent}
      </Modal>
      {/* <AcceptanceModal
        evaluationId={evaluationId}
        isOpen={isAcceptOpen}
        onClose={closeAcceptanceModal}
      /> */}
      <EvaluationForm
        evaluationId={evaluationId ?? null}
        evaluationData={evaluationData ?? null}
        coachId={coachId ?? null}
        playerId={playerId ?? null}
        isOpen={isEvFormOpen}
        onClose={closeEvform}
      />
      <NewEvaluationForm
        evaluationId={evaluationId ?? null}
        evaluationData={evaluationData ?? null}
        coachId={coachId ?? null}
        playerId={playerId ?? null}
        isOpen={isNewEvFormOpen}
        onClose={closeNewEvForm}
      />


      {/* <FakeEvaluationForm
        evaluationId={null}
        evaluationData={null}
        coachId={null}
        playerId={null}
        isOpen={isFakeFormOpen}
        onClose={closeFakeEvform}
      /> */}


      <div className="flex h-screen">
        <DetailsModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          description={currentDescription}
        />
        <Sidebar />
        <main className="flex-grow bg-gray-100 p-4 overflow-x-auto">

          <div className="bg-white shadow-md rounded-lg p-6 ">
            <h3 className='font-bold text-lg'>Evaluation Tracker</h3>
            <PromptComponent marginleft={0} stepstext="Let’s get started! First, upload your bank account information to receive funds by clicking on Payment Information in the left side menu if you plan to offer evaluations to the public for a fee. Next, if you are part of an Organization or Team participating in D1 Notes, check Join Requests to see if you received an invite from your Organization or Team. Otherwise, be prepared to give Players who seek you out, the edge they have been missing!" />
            {/* {!clubId && (
            <div className="flex items-center space-x-2 bg-blue-100 p-4 rounded-lg shadow-lg">
            
            <span className="text-xl font-semibold text-gray-700">Your Evaluation Rate:</span>
            <span className="text-2xl font-bold text-blue-600"> {session?.user.coachCurrency}{session?.user?.expectedCharge}</span>
          </div>
          )} */}


            {/* Dropdown for tabs on small screens */}
            <div className="block md:hidden mb-4 ">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded w-full text-left"
              >
                {['Requested', 'Accepted', 'Completed', 'Declined', 'Draftes'][parseInt(selectedTab)]} ▼
              </button>
              {isDropdownOpen && (
                <ul className="bg-white shadow-lg rounded mt-2">
                  {[
                    { name: 'Requested', value: '0' },
                    { name: 'Accepted', value: '1' },
                    { name: 'Completed', value: '2' },
                    { name: 'Declined', value: '3' },
                    { name: 'Draftes', value: '4' },
                  ].map((tab) => (
                    <li key={`${tab.name}${tab.value}`}>
                      <button
                        onClick={() => handleTabChange(tab)}

                        className="w-full px-4 py-2 hover:bg-gray-100"
                      >
                        {tab.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Regular tabs for larger screens */}
            <br></br>
            <div className="hidden md:flex space-x-4 mb-4 mt-100">
              {[
                { name: 'Requested', value: '0' },
                { name: 'Accepted', value: '1' },
                { name: 'Completed', value: '2' },
                { name: 'Declined', value: '3' },
                { name: 'Drafts', value: '4' },
              ].map((tab) => (
                <button
                  key={`${tab.name}${tab.value}`}
                  onClick={() => handleTabChange(tab)}
                  className={`p-2 border-b-2 ${selectedTab === tab.value ? 'border-blue-500 font-bold' : 'border-transparent'}`}
                >
                  {tab.name}
                </button>
              ))}
            </div>

            {/* Responsive Table */}
            <div ref={tableContainerRef} className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <input
                type="text"
                placeholder="Search by Keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 mb-4 border border-gray-300 rounded-md"
              />
              <button
                onClick={scrollLeft}
                className={`absolute left-4 top-1/2 p-3 text-white transform -translate-y-1/2 rounded-full shadow-md z-10 transition-colors duration-300 w-10 h-10 flex items-center justify-center bg-gray-500 lg:hidden ${IsStart ? "bg-gray-400 cursor-not-allowed" : isMiddle ? "bg-green-500" : "bg-blue-500"
                  }`}
              >
                <FaArrowLeft />
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
                        <div className="flex justify-center items-center gap-2">
                          <svg
                            className="animate-spin h-5 w-5 text-gray-500"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v8H4z"
                            ></path>
                          </svg>
                          <span>Loading Evaluations...</span>
                        </div>
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
                disabled={isEnd}
                style={{
                  backgroundColor: isEnd ? "grey" : isMiddle ? "#22c55e" : "#22c55e", // Tailwind green-500 and blue-500
                  color: "white",
                  padding: "10px",
                  border: "none",
                  cursor: isEnd ? "not-allowed" : "pointer",
                }}
                className={`absolute right-4 top-1/2 transform -translate-y-1/2 bg-green-500 text-white w-10 h-10 flex items-center justify-center rounded-full shadow-md z-10 lg:hidden
  `}
              >
                <FaArrowRight />
              </button>

            </div>
          </div>

          <div className="grid grid-cols-1 bg-white  mt-4 p-6">
            <h3 className='font-bold text-lg'>Quick Tips</h3>

            <h3 className='font-bold text-lg mt-4'>Visibility</h3>
            <p>Ensure your Public Visibility in the menu is on so that players seeking individual game film evaluations can find your profile in the coach marketplace. If you would like to go through a quick D1 Notes verification process to enhance your profile with a “D1 Verified” badge, <a href="/contact" target="_blank" className="text-blue-600 hover:text-blue-800 ">click here</a> to email and let us know! Upon receiving an evaluation request, you can either accept or politely decline it with a comment. A completed evaluation will look like <button onClick={() => openEvalModal()} className="text-blue-600 hover:text-blue-800 ">this</button>. You may search players in Player Profiles and see their limited information, but you cannot click through to see all of their details, nor contact them until they request an evaluation from you. If your Public Visibility is off, you will not show up in the coach marketplace.</p>

            <h3 className='font-bold text-lg mt-4'>Time and Rate Explanation</h3>
            <p>In order to add pricing tiers to your base evaluation rate based on faster maximum evaluation turnaround times, <a href="/coach/charges" target="_blank" className="text-blue-600 hover:text-blue-800 ">click here</a>  or on Time and Rate in the menu. The default rate is your base evaluation rate and the default turnaround time is 120 hours or 5 days (the maximum time). Adding tiers to your oﬀering is optional. If you would like to modify your base evaluation rate, <a href="/coach/charges" target="_blank" className="text-blue-600 hover:text-blue-800 ">click here</a> or on Time and Rate in the menu, or <a href="/coach/profile" target="_blank" className="text-blue-600 hover:text-blue-800 ">click here</a> or edit your Profile in Settings.</p>

            <h3 className='font-bold text-lg mt-4'>Organizations Explanation</h3>
            <p>Only if you have been added by an organization or single team that is using D1 Notes’ Organizations (white label) capabilities, you can view that organization’s or single team’s internal / private information by <a href="/coach/teams" target="_blank" className="text-blue-600 hover:text-blue-800 ">clicking here</a> or on Your Teams in the menu. From here, you can navigate through your team(s) and view the coaches and players on your roster(s). These players will automatically not be charged any rate as your organization / team has already paid for them.</p>

            <h3 className='font-bold text-lg mt-4'>Sending Messages</h3>
            <p>The Messages function in the menu allows you to communicate with any player in Your Teams as well as communicate further with any player in the marketplace once you have accepted their evaluation request.</p>


          </div>

          {/* <div className="grid grid-cols-1 bg-white sm:grid-cols-1 lg:grid-cols-4 gap-2 mt-4 p-6">
          <div className="col-span-full"><h3 className="text-lg text-black font-bold w-full clear-both">Your Teams</h3></div>
        
      {teams.map((item:any) => (
                <div className="w-full lg:w-auto" key={item.id}>
                  <TeamProfileCard
                     key={item?.slug}
                     creatorname={item.creatorName}
                     teamName={item.team_name} // Ensure `team_name` is correct
                     logo={item.logo ?? '/default.jpg'}
                     rating={5}
                     slug={item.slug}
                  />
                </div>
              ))}

 
       
        </div> */}
        </main>
      </div>
    </>
  );
};

export default Dashboard;
