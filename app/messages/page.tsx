"use client";
import React, { useState } from 'react';
import { FaEye, FaPaperclip, FaSmile, FaArrowLeft } from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';
import ChatBox from '../components/Chatbox';

const Messages: React.FC = () => {
  

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-gray-900 text-white  md:p-1">
        {/* Header Content */}
      </header>

      <ChatBox/>
    </div>
  );
};

export default Messages;
