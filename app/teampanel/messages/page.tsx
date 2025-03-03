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
  const [modalMessages, setModalMessages] = useState<[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
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

  const closeModal = () => {
    setModalVisible(false);
    setModalMessages([]);
  };

  const fetchAllMessages = async (message: any) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/enterprise/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });
  
      if (!response.ok) {
        console.error('Failed to fetch conversation messages');
        return;
      }
  
      const data = await response.json();
      setModalMessages(data.result || []);
      setModalVisible(true);
    } catch (error) {
      console.error('Error fetching conversation messages:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleViewAll=(message:any)=>{
   
    fetchAllMessages(message);
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-grow bg-gray-100 p-4 overflow-auto">
        <div className="bg-white shadow-md rounded-lg p-6 h-auto">
          <div className="flex justify-between items-center">
            <input
              type="text"
              placeholder="Search..."
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
                        <a href={`/coach/${message.coachSlug}`} target="_blank">
                          <img
                            src={message.coachPhoto === 'null' || !message.coachPhoto ? '/default.jpg' : message.coachPhoto}
                            className="rounded-full w-16 h-16 object-cover m-auto"
                          />
                          {message.coachName}
                        </a>
                      </td>
                      <td className="text-center">
                      <a href={`/players/${message.playerSlug}`} target="_blank">
                          <img
                            src={message.playerPhoto === 'null' || !message.playerPhoto ? '/default.jpg' : message.playerPhoto}
                            className="rounded-full w-16 h-16 object-cover m-auto"
                          />
                          {message.playerName}
                        </a>
                      </td>
                      <td>{message.messageContent}</td>
                      <td>{formatDate(message.messageTimestamp)}</td>
                      <td>
                        <a href={`/enterprise/conversations/${message.chatId}`}  className="mb-4 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">
                          View All
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
              className={`px-4 py-2 text-sm ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-500'}`}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 text-sm ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-blue-500'}`}
            >
              Next
            </button>
          </div>
        </div>

        {modalVisible && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-2/3 h-3/4 overflow-auto">
              <button onClick={closeModal} className="text-red-500 float-right mb-2">Close</button>
              <h2 className="text-xl font-bold mb-4">Conversation Messages</h2>
              {modalMessages.length > 0 ? (
                modalMessages.map((msg: any, index) => (
                  <div
                  key={msg.id}
                  className={`message mb-4 ${
                    msg.sender_type === "coach" ? "text-right" : "text-left"
                  }`}
                >
                  <div
                    className={`inline-block p-2 rounded-lg ${
                      msg.sender_type === "coach"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-300 text-black"
                    }`}
                  >
                    <p>{msg.message}</p>
                    <span className="block text-xs text-gray-700 mt-1">
                       
                    </span>
                  </div>
                </div>
                ))
              ) : (
                <p>No messages found in this conversation.</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Messages;
