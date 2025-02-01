"use client";
import React, { useEffect, useState } from 'react';
import { useSession, getSession } from 'next-auth/react';
import Sidebar from '../../components/teams/Sidebar';
import { useRouter } from 'next/navigation';
import { showSuccess } from '@/app/components/Toastr';

// Define the type for the data
interface Order {
  id: number;
  requestedToName: string;
  message: string;
  status: string;
  image: string;
  type: string;
  first_name?: string;
  last_name?: string;
  playerId?: number;
  slug?: number;
}

const Home: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState<string>('');
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
 
  
  const router = useRouter();
  const limit = 10; // Set the number of items per page
  const { data: session } = useSession();
  
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const fetchOrders = async () => {
    const session = await getSession();
    const enterpriseId = session?.user?.id; // Adjust according to your session structure

    if (!enterpriseId) {
      console.error('Enterprise ID not found in session');
      return;
    }

    const response = await fetch(`/api/teams/joinrequest?team_id=${session.user.id}&type=team`);

    if (!response.ok) {
      console.error('Failed to fetch orders');
      return;
    }

    const data = await response.json();
    setOrders(data.data);
    setFilteredOrders(data.data); // Initially show all orders
  };
  useEffect(() => {
    

    fetchOrders();
  }, [session]);

  useEffect(() => {
    if (search) {
      const filtered = orders.filter((order) =>
        order.requestedToName.toLowerCase().includes(search.toLowerCase()) ||
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
          <div>
            <input
              type="text"
              placeholder="Search by Player Name or Status"
              className="w-1/3 mb-2 px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <table className="w-full text-sm text-left text-gray-700">
              <thead>
                <tr>
                  <th>Serial Number</th>
                  <th>Player Name</th>
                  <th>Notes</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
  {paginatedOrders.length > 0 ? (
    paginatedOrders.map((order, index) => (
      <tr key={order.id}>
        {/* Serial Number Column */}
        <td>{(currentPage - 1) * limit + index + 1}</td>
       
       
        <td className="flex items-center space-x-3 p-2">
  <img src={`${order.image}`} alt="{order.first_name}"  className="w-10 h-10 rounded-full object-cover" />
  <a href={`/players/${order.slug}`} target="_blank"  className="text-blue-600 hover:underline font-medium">
    {order.first_name} {order.last_name}
  </a>
</td>

        <td>{order.message}</td>
        <td>
        
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
        </td>
     
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan={5}>No Requests found</td>
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
