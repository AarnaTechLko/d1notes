"use client";
import React, { useEffect, useState } from "react";
import "../globals.css";
import Sidebar from "../components/Sidebar";
import { getSession } from "next-auth/react";
import { useTable, Column, CellProps } from "react-table"; // Import Column type
import { Evaluation, EvaluationsByStatus } from "../types/types"; // Import the correct types
import { FaEye } from "react-icons/fa";

const Dashboard: React.FC = () => {
  const [evaluations, setEvaluations] = useState<EvaluationsByStatus>({
    Requested: [],
    Accepted: [],
    Completed: [],
    Declined: [],
    Drafted: [],
  });

  const [selectedTab, setSelectedTab] = useState<string>("0");
  const [data, setData] = useState<Evaluation[]>([]); // State to hold the data for the table
  const [loading, setLoading] = useState<boolean>(true); // Add loading state
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  // Fetch evaluations when the selected tab changes
  const fetchEvaluations = async (status: string) => {
    setLoading(true); // Set loading to true before fetching data
    const session = await getSession();
    const userId = session?.user.id;
    console.log(userId);

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

  useEffect(() => {
    // Fetch data for the initially selected tab
    fetchEvaluations(selectedTab);
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
      return date.toLocaleDateString('en-GB'); // This formats the date to 'dd/mm/yyyy'
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
      { Header: "Video Description", accessor: "video_description" },
      { Header: "Payment Status", accessor: "payment_status" },
      ...(selectedTab === "2" // Check if the current tab is "Completed"
        ? [
            {
              Header: "View Evaluation",
              Cell: ({ row }: CellProps<Evaluation>) => (
                <button
                  onClick={() => handleEvaluationDetails(row.original)} // Pass the evaluation object
                  className="text-blue-500 hover:underline"
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
      <Sidebar />
      <main className="flex-grow bg-gray-100 p-4 overflow-x-auto">
        <div className="bg-white shadow-md rounded-lg p-6 ">
          {/* Dropdown to select tab */}
          
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
  );
};

export default Dashboard;
