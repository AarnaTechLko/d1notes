"use client";
import React, { useEffect, useState } from 'react';
import { useSession, getSession } from 'next-auth/react';
import Sidebar from '../components/Sidebar';
import { showSuccess } from '../components/Toastr';

// Define the type for the data
interface Order {
  id: number;
  team_name: string;
  image: string;
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
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    setSelectedOrder(null);
  };

  const handleAccept = async (status:any) => {
    if (!selectedOrder) return;
    console.log(selectedOrder);
    const request_id = selectedOrder.id;
    
    const playerId = session?.user.id;
    const message = `<p>Hi! Administrator</p><p>${session?.user.name} has accepted your join request! Now both of you can chat with each other!</p>`;
    try {
      const response = await fetch(`/api/teams/joinrequest/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, request_id, message, status }),
      });

      if (response.ok) {
        showSuccess("Join Request "+status+" successfully.");
        ///router.push('/coach/messages');
        fetchOrders();
      } else {
        console.error('Failed to accept request');
      }
    } catch (error) {
      console.error('Error accepting request:', error);
    }

    handleConfirmationClose(); // Close modal after accepting
  };

  const handleReject = async () => {
    if (!selectedOrder) return;

    try {
      const response = await fetch(`/api/rejectRequest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: selectedOrder.id }),
      });

      if (response.ok) {
        // Handle successful response (e.g., update UI)

      } else {
        console.error('Failed to reject request');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
    }

    handleConfirmationClose(); // Close modal after rejecting
  };
  const fetchOrders = async () => {
    const session = await getSession();
    const enterpriseId = session?.user?.id; // Adjust according to your session structure

    if (!enterpriseId) {
      console.error('Enterprise ID not found in session');
      return;
    }

    const response = await fetch(`/api/teams/joinrequest?player_id=${session.user.id}&type=team`);

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
  }, []);

  useEffect(() => {
    if (search) {
      const filtered = orders.filter((order) =>
        order.team_name.toLowerCase().includes(search.toLowerCase()) ||
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
                  <th>Team Name</th>
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


                      <td className="flex items-center space-x-4">
                        <a
                          href={`/teams/${order.slug}`} // Dynamic URL for the user's profile
                          className="font-medium text-gray-800 flex items-center space-x-4" target='_blank'
                        >
                          <div className="w-12 h-12 rounded-full overflow-hidden">
                            <img
                              src={order.image !== 'null' ? order.image : '/default.jpg'}
                              alt={`${order.team_name}'s profile`}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Name and Type */}
                          <div className="flex flex-col">
                            {/* Name */}
                            <span className="font-medium text-gray-800">{order.team_name}</span>


                          </div>
                        </a>
                      </td>


                      <td>{order.message}</td>
                      <td>

                        <button
                          className={`px-4 py-2 rounded-lg text-white ${order.status === 'Accepted'
                              ? 'bg-green-500'
                              : order.status === 'Requested'
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                          onClick={() => {
                            if (order.status === 'Requested') {
                              setSelectedOrder(order);
                              setShowConfirmation(true);
                            }
                          }}
                        >
                          {order.status}
                        </button></td>

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
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${currentPage === 1
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
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${currentPage === totalPages
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

      {showConfirmation && selectedOrder && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3 relative">
            {/* Close Button */}
            <button
              onClick={handleConfirmationClose}
              className="absolute top-2 right-2 text-gray-500 text-2xl"
            >
              &times;
            </button>

            <h3 className="text-xl font-semibold mb-4">Are you sure you want to proceed?</h3>
            <div className="flex justify-center">
              <button
               onClick={() => handleAccept('Approved')}
                className="px-4 py-2 bg-green-500 text-white rounded-lg mr-3"
              >
                Accept
              </button>
              <button
                onClick={() => handleAccept('Declined')}
                className="px-4 py-2 bg-red-500 text-white rounded-lg ml-3"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
