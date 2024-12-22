"use client"
import React, { useEffect, useState } from 'react';
import { useSession, getSession } from 'next-auth/react';
import Sidebar from '../../components/enterprise/Sidebar';
import { formatDate } from '@/lib/clientHelpers';

const Messages: React.FC = () => {
  const [messages, setMessages] = useState<[]>([]);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const limit = 10; // Items per page
  const { data: session } = useSession();

  const fetchMessages = async (page = 1, searchQuery = '') => {
    setLoading(true);
    try {
      const session = await getSession();
      const enterpriseId = session?.user?.id;

      if (!enterpriseId) {
        console.error('Enterprise ID not found in session');
        return;
      }

      const response = await fetch(
        `/api/enterprise/messages?enterprise_id=${enterpriseId}&page=${page}&limit=${limit}&search=${encodeURIComponent(searchQuery)}`
      );

      if (!response.ok) {
        console.error('Failed to fetch messages');
        return;
      }

      const data = await response.json();
      setMessages(data || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages(currentPage, search);
  }, [currentPage, search]);

  // Debounce search input to reduce API calls
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1); // Reset to the first page
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-grow bg-gray-100 p-4 overflow-auto">
        <div className="bg-white shadow-md rounded-lg p-6 h-auto">
          <div className="flex justify-between items-center">
            <input
              type="text"
              placeholder="Search by name, email, or phone"
              className="w-1/3 mb-2 px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={search}
              onChange={handleSearchChange}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-700 mt-4">
              <thead>
                <tr>
                  <th>Sender</th>
                  <th>Receiver</th>
                  <th>Last Message</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {messages.length > 0 ? (
                  messages.map((message: any) => (
                    <tr key={message.id}>
                      <td className="text-center">
                        <a href={`/${message.normalized_sender_type === 'coach' ? 'coach' : 'players'}/${message.sender_slug}`} target="_blank">
                          <img
                            src={message.sender_image === 'null' || !message.sender_image ? '/default.jpg' : message.sender_image}
                            className="rounded-full w-16 h-16 object-cover m-auto"
                          />
                          {message.sender_name}
                        </a>
                      </td>
                      <td className="text-center">
                        <a href={`/${message.normalized_receiver_type === 'coach' ? 'coach' : 'players'}/${message.receiver_slug}`} target="_blank">
                          <img
                            src={message.receiver_image === 'null' || !message.receiver_image ? '/default.jpg' : message.receiver_image}
                            className="rounded-full w-16 h-16 object-cover m-auto"
                          />
                          {message.receiver_name}
                        </a>
                      </td>
                      <td>{message.latest_message}</td>
                      <td>{formatDate(message.latest_message_time)}</td>
                      <td>
                        <a
                          href={`/coach/${message.slug}`}
                          className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600"
                          target="_blank"
                        >
                          View All Chats
                        </a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5}>No messages found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 text-sm ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-500 hover:underline'}`}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 text-sm ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-blue-500 hover:underline'}`}
            >
              Next
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Messages;
