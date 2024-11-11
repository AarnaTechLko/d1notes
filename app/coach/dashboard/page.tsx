"use client";
import { useState, useEffect } from 'react';
import { CellProps } from 'react-table';
import React from 'react';
import '../../globals.css'; // Import CSS module
import Sidebar from '../../components/coach/Sidebar';
import { useTable, Column } from 'react-table';
import { Evaluation, EvaluationsByStatus } from '../../types/types';
import Modal from '../../components/Modal';
import AcceptanceModal from '@/app/components/coach/AcceptanceModal';
import { useSession, signOut } from 'next-auth/react';
import EvaluationForm from '@/app/components/coach/EvaluationForm';
import { FaEye } from 'react-icons/fa';
import { getSession } from "next-auth/react";

const Dashboard: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAcceptOpen, setIsAcceptOpen] = useState(false);
  const [isEvFormOpen, setIsEvFormOpen] = useState(false);
  const [evaluationId, setEvaluationId] = useState<number | undefined>(undefined);
  const [coachId, setCoachId] = useState<number | undefined>(undefined);
  const [playerId, setPlayerId] = useState<number | undefined>(undefined);
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState<boolean>(true);

  const [evaluationData, setEvaluationData] = useState<Evaluation | undefined>(undefined);
  const [modalContent, setModalContent] = useState<JSX.Element | null>(null);
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

  const fetchEvaluations = async (status: string) => {
    const session = await getSession();
    const coachId = session?.user.id;
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
    setEvaluations((prev) => ({
      ...prev,
      [status]: evaluationsData,
    }));
  
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
      return date.toLocaleDateString('en-GB'); // This formats the date to 'dd/mm/yyyy'
    },
        
      },
      {
        Header: 'Player Name',
        accessor: 'first_name',
        Cell: ({ row }: CellProps<Evaluation>) => `${row.original.first_name} ${row.original.last_name}`,
      },
      {
        Header: 'Review Title',
        accessor: 'review_title',
      },
      {
        Header: "Video Links",  // Combine all video links under this column
        accessor: "primary_video_link",  // Or just leave it as undefined if it's not needed
        Cell: ({ row }: CellProps<Evaluation>) => (
          <div className="space-y-2"> {/* Stack links vertically with spacing */}
            <a href={row.original.primary_video_link} target="_blank" rel="noopener noreferrer" className="block w-full text-center px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md text-base font-medium mt-2">
              One
            </a>
            <a href={row.original.video_link_two} target="_blank" rel="noopener noreferrer" className="block w-full text-center px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md text-base font-medium mt-2">
             Two
            </a>
            <a href={row.original.video_link_three} target="_blank" rel="noopener noreferrer" className="block w-full text-center px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md text-base font-medium mt-2">
              Three
            </a>
          </div>
        ),
      },
      {
        Header: 'Description',
        accessor: 'video_description',
      },
      {
        Header: 'Action',
        Cell: ({ row }: CellProps<Evaluation>) => {
          const evaluation = row.original;
          if (selectedTab === '0') {
            return (
              <button
                onClick={() => handleRequestedAction(evaluation)}
                className="bg-blue-500 text-white px-4 py-2 rounded text-sm md:text-base"
              >
                Action
              </button>
            );
          } else if (selectedTab === '1') {
            return (
              <button
                onClick={() => handleAcceptedAction(evaluation)}
                className="bg-green-500 text-white px-4 py-2 rounded text-sm md:text-base"
              >
                Evaluate
              </button>
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
            return <a onClick={() => handleEvaluationDetails(evaluation)}><FaEye /></a>;
          }
        },
      },
    ],
    [selectedTab]
  );

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
    setIsEvFormOpen(true);
  };

  const tableInstance = useTable({ columns, data });

  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent(null);
  };

  const closeAcceptanceModal = () => {
    setIsAcceptOpen(false);
  };

  const closeEvform = () => {
    setIsEvFormOpen(false);
  };

  useEffect(() => {
    fetchEvaluations(selectedTab);
  }, [selectedTab]);

  return (
    <>
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {modalContent}
      </Modal>
      <AcceptanceModal
        evaluationId={evaluationId}
        isOpen={isAcceptOpen}
        onClose={closeAcceptanceModal}
      />
      <EvaluationForm
        evaluationId={evaluationId ?? null}
        evaluationData={evaluationData ?? null}
        coachId={coachId ?? null}
        playerId={playerId ?? null}
        isOpen={isEvFormOpen}
        onClose={closeEvform}
      />

      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-grow bg-gray-100 p-4 overflow-x-auto">
          <div className="bg-white shadow-md rounded-lg p-6 ">
            {/* Dropdown for tabs on small screens */}
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
                    { name: 'Drafted', value: '4' },
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

            {/* Regular tabs for larger screens */}
            <div className="hidden md:flex space-x-4 mb-4">
              {[
                { name: 'Requested', value: '0' },
                { name: 'Accepted', value: '1' },
                { name: 'Completed', value: '2' },
                { name: 'Declined', value: '3' },
                { name: 'Drafted', value: '4' },
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

            {/* Responsive Table */}
            <div className="overflow-x-auto">
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
            Loading...
          </td>
        </tr>
      ) : (
        tableInstance.rows.map((row) => {
          tableInstance.prepareRow(row);
          return (
            <tr {...row.getRowProps()} key={row.id}>
              {row.cells.map((cell) => (
                <td
                  {...cell.getCellProps()}
                  key={`${row.id}-${cell.column.id}`}
                  className="border-b border-gray-200 px-4 py-2"
                  style={{ whiteSpace: 'nowrap' }} // Ensure cells don’t wrap unless necessary
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
</div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Dashboard;
