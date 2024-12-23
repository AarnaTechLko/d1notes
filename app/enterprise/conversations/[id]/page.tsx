"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Sidebar from "../../../components/enterprise/Sidebar";
import { formatDate } from "@/lib/clientHelpers";

interface Conversations {
  params: {
    id: number;
  };
}

const Messages: React.FC<Conversations> = ({ params }) => {
  const [messages, setMessages] = useState<[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalMessages, setModalMessages] = useState<[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const { data: session } = useSession();

  const fetchAllMessages = async (id: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/enterprise/conversations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        console.error("Failed to fetch conversation messages");
        return;
      }

      const data = await response.json();
      setModalMessages(data || []);
      setModalVisible(true);
    } catch (error) {
      console.error("Error fetching conversation messages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllMessages(params.id);
  }, [params]);

  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-grow bg-gray-100 p-4 overflow-auto">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full h-full overflow-auto">
          <h2 className="text-xl font-bold mb-4">Conversation Messages</h2>
          {loading ? (
            <p>Loading messages...</p>
          ) : modalMessages.length > 0 ? (
            modalMessages.map((msg: any) => (
              <div
  key={msg.id}
  className={`message mb-4 ${
    msg.senderId === msg.coachId ? "text-left" : "text-right"
  }`}
>
  {/* Display image and message inline */}
  <div className={`flex items-center ${msg.senderId === msg.coachId ? "justify-start" : "justify-end"}`}>
    <img
      src={
        msg.senderId === msg.coachId
          ? (msg.coachImage && msg.coachImage !== 'null' ? msg.coachImage : '/default.jpg')
          : (msg.playerImage && msg.playerImage !== 'null' ? msg.playerImage : '/default.jpg')
      }
      alt="Profile"
      className="w-8 h-8 rounded-full mr-2"
    />
    <div
      className={`w-[50%] p-2 rounded-lg ${
        msg.senderId === msg.coachId
          ? "bg-blue-300 text-black"
          : "bg-gray-300 text-black"
      }`}
    >
      <p>{msg.message}</p>
      <span className="block text-xs text-gray-700 mt-1">
        {msg.timestamp}
      </span>
    </div>
  </div>
  
  {/* Display name below the message */}
  <div className={`mt-1 ${msg.senderId === msg.coachId ? "text-left" : "text-right"}`}>
    <span
      className={`text-sm ${
        msg.senderId === msg.coachId ? "text-blue-500" : "text-gray-700"
      }`}
    >
      {msg.senderId === msg.coachId ? `${msg.coachFirstName} ${msg.coachLastName}` : `${msg.playerFirstName} ${msg.playerLastName}`} <span className="text-[10px] text-gray-400">{formatDate(msg.createdAt)}</span>
    </span>
  </div>
</div>

            
            ))
          ) : (
            <p>No messages found in this conversation.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Messages;
