"use client";
import React, { useEffect, useState } from "react";
import { FaEye, FaPaperclip, FaSmile, FaArrowLeft } from "react-icons/fa";
import EmojiPicker from "emoji-picker-react";
import { useSession } from "next-auth/react";
import ChatBox from "@/app/components/Chatbox";

const Home: React.FC = () => {
  
  return (
    <div className="flex flex-col h-screen">
      <header className="bg-gray-900 text-white"></header>

    <ChatBox/>
    </div>
  );
};

export default Home;
