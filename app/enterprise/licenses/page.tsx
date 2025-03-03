"use client";
import React, { useEffect, useState } from 'react';
import { useSession, getSession } from 'next-auth/react';
import Sidebar from '../../components/enterprise/Sidebar';
import FreeEvaluationAllowed from '@/app/components/FreeEvaluationAllowed';

// Define the type for the data
interface Order {
  id: number;
  licenseKey: string;
  status: string;
 
}

const Home: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState<string>('');
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const limit = 10; // Set the number of items per page
  const { data: session } = useSession();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [allowedFreeRequests, setAllowedFreeRequests] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fetchRequests = async () => {
    const clubId = session?.user.id;
    if (!clubId) {
      console.error("Club ID is not available.");
      return;
    }

    try {
      const response = await fetch(`/api/freerequests?clubId=${clubId}`);

      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText} (Status: ${response.status})`);
      }

      const textResponse = await response.text();
      if (!textResponse) {
        throw new Error("Empty response body received.");
      }

      const body = JSON.parse(textResponse);
      if (body && body.requests) {
        setAllowedFreeRequests(body.requests);
      } else {
        throw new Error("Invalid response structure.");
      }
    } catch (error) {
      console.error("Failed to fetch free requests:", error);
    }
  };
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    fetchRequests();  // Replace `refreshData` with the actual function you want to run.
  };
  useEffect(() => {
   
    const fetchOrders = async () => {
      const session = await getSession();
      const enterpriseId = session?.user?.id; // Adjust according to your session structure

      if (!enterpriseId) {
        console.error('Enterprise ID not found in session');
        return;
      }

      const response = await fetch('/api/enterprise/licenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enterprise_id: enterpriseId,
        }),
      });

      if (!response.ok) {
        console.error('Failed to fetch orders');
        return;
      }

      const data = await response.json();
      setOrders(data.licenseslist);
      setFilteredOrders(data.licenseslist); // Initially show all orders
    };
    fetchRequests();
    fetchOrders();
  }, [session]);

  useEffect(() => {
    if (search) {
      const filtered = orders.filter((order) =>
        order.licenseKey.toLowerCase().includes(search.toLowerCase()) ||
        order.status.toString().includes(search.toLowerCase())
      );
      setFilteredOrders(filtered);
    } else {
      setFilteredOrders(orders);
    }
    setCurrentPage(1); // Reset to the first page when search is updated
  }, [search, orders]);

  const totalPages = filteredOrders.length === 0 ? 1 : Math.ceil(filteredOrders.length / limit);

  // Get the paginated orders
  const paginatedOrders = filteredOrders.slice(
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
        <div className="flex flex-wrap items-center mb-2">
  {/* First Column: Search Bar */}
  <div className="w-full md:w-2/3 pr-2">
    <input
      type="text"
      placeholder="Search by customer name or status"
      className="w-full px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
  </div>

  {/* Second Column: Button */}
  <div className="w-full md:w-1/3 pl-2 text-end">
    <button
      type="button"
      className="w-[250px] px-4 py-2 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      onClick={openModal} >
      {allowedFreeRequests} Free Evaluations
    </button>
  </div>
  </div>

  <FreeEvaluationAllowed isOpen={isModalOpen} onClose={closeModal} freeRequests={allowedFreeRequests}/>
  <div>
            <table className="w-full text-sm text-left text-gray-700">
              <thead>
                <tr>
                  <th>Serial Number</th>
                  <th>License Key</th>
                  <th>Status</th>
                  <th>Copy</th>
                </tr>
              </thead>
              <tbody>
  {paginatedOrders.length > 0 ? (
    paginatedOrders.map((order, index) => (
      <tr key={order.id}>
        {/* Serial Number Column */}
        <td>{(currentPage - 1) * limit + index + 1}</td>
        
        {/* Other Columns */}
       
        <td>{order.licenseKey}</td>
        <td><button
    className={`px-4 py-2 rounded-lg text-white ${
      order.status === "Free"
        ? "bg-green-500"
        : order.status === "Assigned"
        ? "bg-yellow-500"
        : "bg-red-500"
    }`}
  >
    {order.status}
  </button></td>
        
         
        <td>
          { order.status === "Consumed" ? "N/A" : (
            
        <button
            onClick={() => {
              navigator.clipboard.writeText(order.licenseKey);
              setCopiedIndex(index); // Set the copied index
              setTimeout(() => setCopiedIndex(null), 2000); // Reset after 2 seconds
            }}
            className="text-blue-500"
          >
            {copiedIndex === index ? "Copied" : "Copy"}
          </button>

)}
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan={5}>No License Key found</td>
    </tr>
  )}
</tbody>
            </table>
            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-4">
  {/* Previous Button */}
  <button
    onClick={handlePrevPage}
    disabled={currentPage === 1}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
      currentPage === 1
        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
        : "bg-blue-500 text-white hover:bg-blue-600"
    }`}
  >
    Previous
  </button>

  {/* Page Indicator */}
  <span className="text-sm text-gray-600">
    Page {currentPage} of {totalPages}
  </span>

  {/* Next Button */}
  <button
    onClick={handleNextPage}
    disabled={currentPage === totalPages}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
      currentPage === totalPages
        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
        : "bg-blue-500 text-white hover:bg-blue-600"
    }`}
  >
    Next 
  </button>
</div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
