"use client";
import React, { useEffect, useState } from "react";
import { FaEye, FaPaperclip, FaSmile, FaArrowLeft } from "react-icons/fa";
import EmojiPicker from "emoji-picker-react";
import { useSession } from "next-auth/react";

interface ChatMessage {
  sender_id: number;
  sender_type: string;
  receiver_id: number;
  receiver_type: string;
  message: string;
  createdAt: string;
}

interface User {
  id: number;
  receiverName: string;
  receiverId: number;
  receiverType: string;
  avatar: string;
}

const Messages: React.FC = () => {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserList, setShowUserList] = useState(true);
  const [chatData, setChatData] = useState<ChatMessage[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchUsers = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch(`/api/chatusers?sender_id=${session.user.id}&sender_type=coach`);
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    if (session) fetchUsers();
  }, [session]);

  useEffect(() => {
    if (!selectedUser) return;

    const fetchChatMessages = async () => {
      try {
        const response = await fetch(
          `/api/chats?receiver_id=${selectedUser.receiverId}&type=${selectedUser.receiverType}`
        );
        const data = await response.json();
        setChatData(data);
      } catch (error) {
        console.error("Error fetching chat messages:", error);
      }
    };

    fetchChatMessages();
  }, [selectedUser]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleEmojiClick = () => setShowEmojiPicker((prev) => !prev);

  const onEmojiClick = (emojiObject: { emoji: string }) => {
    setMessage((prevMessage) => prevMessage + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setMessage("");
    setUploadedFile(null);
    setShowUserList(false);
  };

  const handleBackClick = () => {
    setShowUserList(true);
    setSelectedUser(null);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedUser || !session?.user?.id) return;

    try {
      const payload: ChatMessage = {
        sender_id: Number(session.user.id),
        sender_type: "coach",
        receiver_id: selectedUser.receiverId,
        receiver_type: selectedUser.receiverType,
        message,
        createdAt: new Date().toISOString(),
      };

      await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setChatData((prevChatData) => [...prevChatData, payload]);
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-gray-900 text-white p-2"></header>

      <div className="grid grid-cols-1 md:grid-cols-12 flex-1 mb-10 overflow-hidden">
        <div
          className={`md:col-span-3 bg-gray-100 border-r border-gray-300 flex flex-col ${
            showUserList ? "block" : "hidden"
          } md:block`}
        >
          <div className="p-4 border-b">
            <input
              className="w-full p-2 rounded bg-gray-200 border focus:outline-none"
              type="text"
              placeholder="Search"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {users.map((user) => (
              <div
                key={user.id}
                className="p-4 hover:bg-gray-200 cursor-pointer"
                onClick={() => handleUserSelect(user)}
              >
                <div className="font-bold">{user.receiverName}</div>
              </div>
            ))}
          </div>
        </div>

        <div
          className={`col-span-1 md:col-span-6 flex flex-col ${
            showUserList && "hidden md:flex"
          }`}
        >
          {selectedUser && (
            <>
              <div className="flex items-center p-4 border-b bg-white">
                <button
                  className="text-gray-500 hover:text-gray-800 md:hidden mr-4"
                  onClick={handleBackClick}
                >
                  <FaArrowLeft />
                </button>
                <div className="flex items-center">
                  <img
                    src={selectedUser.avatar}
                    alt="User Avatar"
                    className="rounded-full"
                  />
                  <div className="ml-4">
                    <h2 className="font-semibold">{selectedUser.receiverName}</h2>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                {chatData.map((msg, index) => (
                  <div
                    className={`flex mb-4 ${
                      msg.sender_id === Number(session?.user?.id)
                        ? "justify-end"
                        : "justify-start"
                    }`}
                    key={index}
                  >
                    <div
                      className={`p-3 rounded-lg shadow ${
                        msg.sender_id !== Number(session?.user?.id)
                          ? "bg-blue-100"
                          : "bg-gray-200"
                      }`}
                    >
                      <p>{msg.message}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-2 border-t bg-white relative">
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    id="fileUpload"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="fileUpload" className="cursor-pointer">
                    <FaPaperclip />
                  </label>

                  <button
                    onClick={handleEmojiClick}
                    className="text-gray-500 hover:text-gray-800"
                  >
                    <FaSmile />
                  </button>

                  <input
                    type="text"
                    className="flex-1 p-2 border rounded-lg bg-gray-100 focus:outline-none"
                    placeholder="Send a message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />

                  <button
                    onClick={handleSendMessage}
                    className="ml-2 bg-green-500 text-white p-2 rounded-lg"
                  >
                    Send
                  </button>
                </div>

                {showEmojiPicker && (
                  <div className="absolute bottom-16">
                    <EmojiPicker onEmojiClick={onEmojiClick} />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
