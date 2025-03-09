"use client";
import React, { useEffect, useState } from 'react';
import { useSession, getSession } from 'next-auth/react';
import Sidebar from '../../components/coach/Sidebar';
import { useRouter } from 'next/navigation';
import { showSuccess } from '@/app/components/Toastr';
import { FaArrowLeft, FaArrowRight, FaEye } from 'react-icons/fa';
import  { useRef } from "react";
// Define the type for the data
interface Accounts {
  id: number;
  playername: string;
  commision_amount: string;
  transaction_id: string;
  status: string;
  created_at?: string;
  image?: string;
  slug?: string;
  evaluation_title?: string;
}

const Home: React.FC = () => {
  const [accounts, setAccounts] = useState<Accounts[]>([]);
  const [search, setSearch] = useState<string>('');
  const [accountBalance, setAccountBalance] = useState<string>('');
  const [filterAccounts, setFilterAccounts] = useState<Accounts[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [isMiddle, setIsMiddle] = useState(false);
    const [IsStart, setIsStart] = useState(false);
    const [isEnd, setIsEnd] = useState(false);
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

  const router = useRouter();

  const limit = 10; // Set the number of items per page
  const { data: session } = useSession();
  const fetchAccounts = async () => {
    const session = await getSession();
    const coach_id = session?.user?.id; // Adjust according to your session structure

    if (!coach_id) {
      
      return;
    }

    const response = await fetch(`/api/coach/account?coach_id=${session.user.id}`);

    if (!response.ok) {
      console.error('Failed to fetch orders');
      return;
    }

    const data = await response.json();
    setAccounts(data.earnings);
    
    setAccountBalance(data?.accounts?.[0]?.amount ?? 0);
    setFilterAccounts(data.earnings);  
  };
  useEffect(() => {
   

    fetchAccounts();
  }, []);

  useEffect(() => {
    if (search) {
      const filtered = accounts.filter((account) =>
        account.playername.toLowerCase().includes(search.toLowerCase()) ||
      account.status.toString().includes(search.toLowerCase())
      );
      setFilterAccounts(filtered);
    } else {
        setFilterAccounts(accounts);
    }
    setCurrentPage(1); // Reset to the first page when search is updated
  }, [search, accounts]);

  
  const totalPages = filterAccounts.length === 0 ? 1 : Math.ceil(filterAccounts.length / limit);

  // Get the paginated orders
  const paginatedOrders = filterAccounts.slice(
    (currentPage - 1) * limit,
    currentPage * limit
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

 
    
  

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-grow bg-gray-100 p-4 overflow-auto">
        <div className="bg-white shadow-md rounded-lg p-6 h-auto">
          <div>
          <div className="flex justify-between items-center mb-4">
  <input
    type="text"
    placeholder="Search..."
    className="w-1/3 px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />
  <span className="text-lg font-semibold text-gray-800">Total Earnings: USD ${accountBalance}</span>
</div>
<div ref={tableContainerRef} className="overflow-x-auto max-h-[400px] overflow-y-auto">
<button
  onClick={scrollLeft}
  className={`absolute left-4 top-1/2 p-3 text-white transform -translate-y-1/2 rounded-full shadow-md z-10 transition-colors duration-300 w-10 h-10 flex items-center justify-center bg-gray-500 lg:hidden ${
    IsStart ? "bg-gray-400 cursor-not-allowed" : isMiddle ? "bg-green-500" : "bg-blue-500"
  }`}
>
  <FaArrowLeft />
</button>
            <table className="w-full text-sm text-left text-gray-700">
              <thead>
                <tr>
                <th>Date</th>
                  <th>Player Name</th>
                  <th>Review Title</th>
                  <th>USD Rate</th>
                 
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.length > 0 ? (
                  paginatedOrders.map((accounts, index) => (
                    <tr key={accounts.id}>
                     <td>
                         {accounts.created_at ? new Date(accounts.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="flex items-center space-x-4">
                        <a
                          href={`/players/${accounts.slug}`} // Dynamic URL for the user's profile
                          className="font-medium text-gray-800 flex items-center space-x-4" target='_blank'
                        >
                          <div className="w-12 h-12 rounded-full overflow-hidden">
                            <img
                              src={accounts.image !== 'null' ? accounts.image : '/default.jpg'}
                              alt={`${accounts.playername}'s profile`}
                              className="w-full h-full object-cover"
                            />
                          </div>

                        
                          <div className="flex flex-col">
                          
                            <span className="font-medium text-gray-800">{accounts.playername}</span>
 
                          </div>
                        </a>
                      </td>
                      <td>{accounts.evaluation_title}</td>
                      <td>$ {accounts.commision_amount}</td>
                     
                      <td>{accounts.status}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6}>No transactions yet...</td>
                  </tr>
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
            {paginatedOrders.length > 0 && (
  <div className="flex justify-between items-center mt-4">
    {/* Pagination Controls */}
    <button
      onClick={handlePrevPage}
      disabled={currentPage === 1}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
        currentPage === 1
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-blue-500 text-white hover:bg-blue-600'
      }`}
    >
      Previous
    </button>

    <span className="text-sm text-gray-600">
      Page {currentPage} of {totalPages}
    </span>

    <button
      onClick={handleNextPage}
      disabled={currentPage === totalPages}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
        currentPage === totalPages
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-blue-500 text-white hover:bg-blue-600'
      }`}
    >
      Next
    </button>
  </div>
)}

          </div>
        </div>
      </main>

    </div>
  );
};

export default Home;
