"use client";
import React, { useState } from 'react';
import { FaEye, FaPaperclip, FaSmile, FaArrowLeft } from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';

const Messages: React.FC = () => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [showUserList, setShowUserList] = useState(true); // New state for user list visibility

  const chatData: Record<string, { id: string; text: string; time: string }[]> = {
    'Joh Joseph': [
      { id: 'out', text: "Hey, did you catch the football match last night?", time: "5:30 PM" },
      { id: 'in', text: "Yes! It was an incredible game! Our team played well.", time: "5:32 PM" },
      { id: 'out', text: "Who do you think will score next?", time: "5:34 PM" },
    ],
    'Sarah Brown': [
      { id: 'in', text: "Did you see the game highlights?", time: "5:20 PM" },
      { id: 'out', text: "Absolutely! They were fantastic!", time: "5:22 PM" },
    ],
    'Mark Anderson': [
      { id: 'in', text: "Excited for the next tournament!", time: "6:00 PM" },
      { id: 'out', text: "Me too! It's going to be thrilling.", time: "6:01 PM" },
    ],
    'Emily Clark': [
      { id: 'in', text: "I think our team can win!", time: "6:10 PM" },
      { id: 'out', text: "I hope so! Let's give our best.", time: "6:11 PM" },
    ],
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      console.log("File uploaded: ", file.name);
    }
  };

  const handleEmojiClick = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const onEmojiClick = (emojiObject: any) => {
    setMessage((prevMessage) => prevMessage + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const handleUserSelect = (user: string) => {
    setSelectedUser(user);
    setMessage('');
    setUploadedFile(null);
    setShowUserList(false); // Hide user list when a user is selected
  };

  const handleBackClick = () => {
    setShowUserList(true); // Show user list on back button click
    setSelectedUser(null); // Reset selected user
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-gray-900 text-white p-2 md:p-1">
        {/* Header Content */}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 flex-1 mb-10 overflow-hidden">
        {/* User List Column - hidden on mobile */}
        <div className={`md:col-span-3 bg-gray-100 border-r border-gray-300 flex flex-col ${showUserList ? 'block' : 'hidden'} md:block`}>
          <div className="p-4 border-b">
            <input
              className="w-full p-2 rounded bg-gray-200 border focus:outline-none"
              type="text"
              placeholder="Search"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {Object.keys(chatData).map((user) => (
              <div
                key={user}
                className="p-4 hover:bg-gray-200 cursor-pointer"
                onClick={() => handleUserSelect(user)}
              >
                <div className="font-bold">{user}</div>
                <p className="text-sm text-gray-500">{chatData[user][0]?.text || ""}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Column */}
        <div className={`col-span-1 md:col-span-6 flex flex-col ${showUserList && 'hidden md:flex'}`}>
          {selectedUser && (
            <div className="flex items-center p-4 border-b bg-white">
              {/* Back button only visible on mobile */}
              <button
                className="text-gray-500 hover:text-gray-800 md:hidden mr-4"
                onClick={handleBackClick}
              >
                <FaArrowLeft />
              </button>
              <div className="flex items-center">
                <img
                  src="https://via.placeholder.com/40"
                  alt="User Avatar"
                  className="rounded-full"
                />
                <div className="ml-4">
                  <h2 className="font-semibold">{selectedUser}</h2>
                  <p className="text-sm text-gray-500">Online</p>
                </div>
              </div>
              <div className="ml-auto flex space-x-4">
                <button className="text-gray-500 hover:text-gray-800">
                  <i className="fas fa-video"></i>
                </button>
                <button className="text-gray-500 hover:text-gray-800">
                  <i className="fas fa-phone"></i>
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {selectedUser && chatData[selectedUser]?.map((msg, index) => (
              <div className={`flex mb-4 ${msg.id === 'in' ? 'justify-start' : 'justify-end'}`} key={index}>
                <img
                  src="https://via.placeholder.com/40"
                  alt="User Avatar"
                  className={`w-12 h-12 rounded-full ${msg.id === 'in' ? '' : 'ml-2'}`}
                />
                <div className="ml-4">
                  <div className={`p-3 rounded-lg shadow ${msg.id === 'in' ? 'bg-gray-200' : 'bg-blue-100'}`}>
                    <p className={`text-black ${msg.id === 'out' ? 'text-right' : 'text-left'}`}>{msg.text}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{msg.time}</p>
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

              {uploadedFile && (
                <span className="text-sm text-gray-600">
                  {uploadedFile.name}
                </span>
              )}

              <button onClick={handleEmojiClick} className="text-gray-500 hover:text-gray-800">
                <FaSmile />
              </button>

              <input
                type="text"
                className="flex-1 p-2 border rounded-lg bg-gray-100 focus:outline-none"
                placeholder="Send a message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />

              <button className="ml-2 bg-green-500 text-white p-2 rounded-lg">
                Send
              </button>
            </div>

            {showEmojiPicker && (
              <div className="absolute bottom-16">
                <EmojiPicker onEmojiClick={onEmojiClick} />
              </div>
            )}
          </div>
        </div>

        {/* Coach Profile Column - can remain visible on all devices */}
        <div className="col-span-1 md:col-span-3 bg-white border-l border-gray-300 flex flex-col p-4">
          <h2 className="text-xl font-semibold mb-4">Player Profile</h2>
          {selectedUser && (
            <div className="flex flex-col items-center mb-4">
              <img
                src="https://via.placeholder.com/100"
                alt="User Avatar"
                className="rounded-full mb-2"
              />
              <div className="text-center">
                <h3 className="font-semibold text-lg">{selectedUser}</h3>
                <p className="text-sm text-gray-500">Location: {selectedUser === 'Joh Joseph' ? 'USA' : selectedUser === 'Sarah Brown' ? 'UK' : selectedUser === 'Mark Anderson' ? 'USA' : 'Canada'}</p>
                <p className="text-sm text-gray-500">Club: {selectedUser === 'Joh Joseph' ? 'United FC' : selectedUser === 'Sarah Brown' ? 'United FC' : selectedUser === 'Mark Anderson' ? 'City FC' : 'Raptors FC'}</p>
                <p className="text-sm text-gray-500">Age: {selectedUser === 'Joh Joseph' ? '28' : selectedUser === 'Sarah Brown' ? '25' : selectedUser === 'Mark Anderson' ? '30' : '27'}</p>
                <p className="text-sm text-gray-500">Sport: {selectedUser === 'Joh Joseph' ? 'Football' : selectedUser === 'Sarah Brown' ? 'Basketball' : selectedUser === 'Mark Anderson' ? 'Tennis' : 'Baseball'}</p>
                <p className="text-sm text-gray-500">Bio: {selectedUser === 'Joh Joseph' ? 'Passionate football player.' : selectedUser === 'Sarah Brown' ? 'Loves playing basketball.' : selectedUser === 'Mark Anderson' ? 'Avid tennis fan.' : 'Baseball enthusiast.'}</p>
              </div>
              <a
                href=''
                className="mt-5 w-100 flex items-center justify-center py-2 px-4 bg-blue-500 text-white hover:bg-blue-600 rounded transition duration-200"
              >
                <FaEye className="mr-1" /> View Profile
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
