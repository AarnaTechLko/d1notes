"use client";
import React, { useEffect, useState } from 'react';
import { useSession, getSession } from 'next-auth/react';
import Sidebar from '../components/Sidebar';

// Define the type for the data
interface Order {
  id: number;
  requestedToName: string;
  requestedToImage: string;
  message: string;
  status: string;
  type: string;
  slug: string;
 
}

const Home: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState<string>('');
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const limit = 10; // Set the number of items per page
  const { data: session } = useSession();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  useEffect(() => {
    const fetchOrders = async () => {
      const session = await getSession();
      const enterpriseId = session?.user?.id; // Adjust according to your session structure

      if (!enterpriseId) {
        console.error('Enterprise ID not found in session');
        return;
      }

      const response = await fetch(`/api/joinrequest?player_id=${session.user.id}`);

      if (!response.ok) {
        console.error('Failed to fetch orders');
        return;
      }

      const data = await response.json();
      setOrders(data.data);
      setFilteredOrders(data.data); // Initially show all orders
    };

    fetchOrders();
  }, []);

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

  const totalPages = Math.ceil(filteredOrders.length / limit);

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
              placeholder="Search by customer name or status"
              className="w-1/3 mb-2 px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <table className="w-full text-sm text-left text-gray-700">
              <thead>
                <tr>
                  <th>Sr. No.</th>
                  <th>Reuqested To</th>
                  <th>Message</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
  {paginatedOrders.length > 0 ? (
    paginatedOrders.map((order, index) => (
      <tr key={order.id}>
        {/* Serial Number Column */}
        <td>{(currentPage - 1) * limit + index + 1}</td>
       
       
        <td className="flex items-center space-x-4">
        <a
      href={`/coach/${order.slug}`} // Dynamic URL for the user's profile
      className="font-medium text-gray-800 flex items-center space-x-4" target='_blank'
    >
  <div className="w-12 h-12 rounded-full overflow-hidden">
    <img
      src={order.requestedToImage !== 'null' ? order.requestedToImage : '/default.jpg'}
      alt={`${order.requestedToName}'s profile`}
      className="w-full h-full object-cover"
    />
  </div>

  {/* Name and Type */}
  <div className="flex flex-col">
    {/* Name */}
    <span className="font-medium text-gray-800">{order.requestedToName}</span>

    {/* Type as a badge */}
    <span
      className={`px-4 py-1 w-fit text-center uppercase rounded-full text-white text-sm font-medium ${
        order.type === "team"
          ? "bg-green-500"
          : order.type === "coach"
          ? "bg-yellow-500"
          : "bg-red-500"
      }`}
    >
      {order.type}
    </span>
  </div>
  </a>
</td>


        <td>{order.message}</td>
        <td><button
    className={`px-4 py-2 rounded-lg text-white ${
      order.status === "Accepted"
        ? "bg-green-500"
        : order.status === "Requested"
        ? "bg-yellow-500"
        : "bg-red-500"
    }`}
  >
    {order.status}
  </button></td>
     
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan={5}>No Requests Key found</td>
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
