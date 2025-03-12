"use client";
import React, { useEffect, useState } from 'react';
import { useSession, getSession } from 'next-auth/react';
import Sidebar from '../../components/teams/Sidebar';
import { useRouter } from 'next/navigation';
import { showError, showSuccess } from '@/app/components/Toastr';
import { FaRedo } from 'react-icons/fa';
import Processing from '@/app/components/Processing';

// Define the type for the data
interface Order {
  invitationId: number;
  email: string;
  invitation_for: string;
  status: string;
  action:string;
}

const Home: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState<string>('');
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const router = useRouter();
  const limit = 10; // Set the number of items per page
  const { data: session } = useSession();

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const resendInvitation = async (id: any) => {
    setProcessing(true);
    const response = await fetch(`/api/joinrequest/resend/?invitationId=${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      setProcessing(false);
      showError('Failed to rresend Invitation.');
      return;
    }
    const data = await response.json();
    setProcessing(false);
    showSuccess(data.message);



  }
  useEffect(() => {
    const fetchOrders = async () => {
      const session = await getSession();
      const enterpriseId = session?.user?.id; // Adjust according to your session structure

      if (!enterpriseId) {
        console.error('Enterprise ID not found in session');
        return;
      }

      const response = await fetch(`/api/joinrequest?player_id=${session.user.id}&type=team`);

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
        order.email.toLowerCase().includes(search.toLowerCase()) ||
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
  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    setSelectedOrder(null);
  };
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };



  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-grow bg-gray-100 p-4 overflow-auto">
        {processing && (
          <Processing />
        )}
        <div className="bg-white shadow-md rounded-lg p-6 h-auto">
          <h1 className="text-2xl font-bold mb-4">Invitation Log</h1>
          <div>
            <input
              type="text"
              placeholder="Search..."
              className="w-1/3 mb-2 px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <table className="w-full text-sm text-left text-gray-700">
              <thead>
                <tr>

                  <th>Email</th>
                  <th>User Type</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.length > 0 ? (
                  paginatedOrders.map((order, index) => (
                    <tr key={order.invitationId}>
                      {/* Serial Number Column */}


                      <td>
                        {/* Name on top */}
                        {order.email}

                      </td>

                      <td>{order.invitation_for.toUpperCase()}</td>
                      <td>
                        <span
                          className={`px-4 py-2 rounded-lg ${order.status === 'Sent'
                              ? 'text-black-500'
                              : order.status === 'Joined'
                                ? 'text-black-500'
                                : 'text-black-500'
                            }`}
                          onClick={() => {
                            if (order.status === 'Requested') {
                              setSelectedOrder(order);
                              setShowConfirmation(true);
                            }
                          }}
                        >
                          {order.status.toUpperCase()}
                        </span>
                          </td>
                        <td>{order.status == 'Sent' && (
                          <button
                            className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600 transition duration-200"
                            title="Resend Email"
                            onClick={() => resendInvitation(order.invitationId)}
                          >
                            <FaRedo />
                          </button>
                        )}</td>
                     
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
            {paginatedOrders.length > 0 && (
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
            )}
          </div>
        </div>
      </main>


    </div>
  );
};

export default Home;
