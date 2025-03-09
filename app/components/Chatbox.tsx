"use client";
import React, { useEffect, useRef, useState } from "react";
import { FaEye, FaPaperclip, FaSmile, FaArrowLeft } from "react-icons/fa";
import EmojiPicker from "emoji-picker-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/clientHelpers";
interface ChatMessage {
    senderId: number;
    sender_type: string;
    receiver_id: number;
    receiver_type: string;
    message: string;
    messageCreatedAt: string;
    createdAt: string;
    club_id?: number;
}

interface User {
    user_id: number;
    first_name: string;
    last_name: string;
    type: string;
    location:string;
    image: string;
    gender: string;
    grade_level: string;
    height: string;
    slug: string;
    sport: string;
    bio: string;
    team: string;
    qualifications: string;
    weight: string;

}


const ChatBox: React.FC = () => {
    const [message, setMessage] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showUserList, setShowUserList] = useState(true);
    const [chatData, setChatData] = useState<ChatMessage[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const { data: session } = useSession();
    const lastMessageRef = useRef(null);
    const [isUserScrolling, setIsUserScrolling] = useState(false);
    const [loggedInUserType, setLoggedInUserType] = useState<string>();
    const chatBoxRef = useRef<HTMLDivElement | null>(null);
    const router = useRouter();
    const handleGoBack = () => {
        router.back(); // This goes back to the previous page
      };
    
    useEffect(() => {
        const fetchUsers = async () => {
            if (!session?.user?.id) return;
            
            try {
                const response = await fetch(`/api/chatusers?user_id=${session.user.id}&user_type=${session.user.type}&club_id=${session?.user?.club_id}`);
                const data = await response.json();
                console.log(data);
                setUsers(data);

            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        if (session) fetchUsers();
    }, [session]);

    useEffect(() => {
        if (!selectedUser) return;
        let type;
        setLoggedInUserType(session?.user?.type);
        if (session?.user?.type=='coach')
        {
            type='player';
        }
        else{
            type='coach';
        }
        const fetchChatMessages = async () => {
            try {
                const response = await fetch(
                    `/api/chats?receiver_id=${selectedUser.user_id}&type=${type}&sentFor=${session?.user.id}`
                );
                const data = await response.json();

                setChatData(data);


            } catch (error) {
                console.error("Error fetching chat messages:", error);
            }
        };

        fetchChatMessages();
        const intervalId = setInterval(fetchChatMessages, 1000); // Poll every second.

        return () => clearInterval(intervalId);
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
        console.log(user);
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
        console.log(selectedUser);
        try {
            const payload: ChatMessage = {
                senderId: Number(session.user.id),
                sender_type: session.user.type,
                receiver_id: selectedUser.user_id,
                receiver_type : session?.user?.type === "coach" ? "player" : "coach",
                club_id: Number(session?.user?.club_id) || 0, 
                message,
                createdAt: new Date().toISOString(),
                messageCreatedAt: new Date().toISOString(),
            };
            
            await fetch("/api/chats", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            setChatData((prevChatData) => [...prevChatData, payload]); // Add message to chat data
            setMessage(""); // Clear the input field after sending
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };
    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [chatData]);
    useEffect(() => {
        // Automatically select the first user when the component mounts
        if (users.length > 0) {
            setSelectedUser(users[0]);
        }
    }, [users]);

    return (
        <div className="flex flex-col h-screen">
            <header className="bg-gray-900 text-white text-right">
            {/* <button 
      onClick={handleGoBack} 
      className="bg-blue-500 text-white px-4 mx-auto py-2 rounded hover:bg-blue-600"
    >
      Go Back
    </button> */}
            </header>

            <div className="grid grid-cols-1 md:grid-cols-12 flex-1 mb-10 overflow-hidden">
                <div
                    className={`md:col-span-3 bg-gray-100 border-r border-gray-300 flex flex-col ${showUserList ? "block" : "hidden"
                        } md:block`}
                >
                    <div className="p-4 border-b">
                        <input
                            className="w-full p-2 rounded bg-gray-200 border focus:outline-none"
                            type="text"
                            placeholder="Search by Name..."
                        />
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {users.map((user, index) => (
                            <>
                                <div className={`flex items-center p-4 cursor-pointer ${
                        selectedUser === user ? 'bg-gray-300' : 'hover:bg-gray-200'
                    }`}
                                    onClick={() => handleUserSelect(user)}>
                                    <img
                                        src={user.image && user.image !== 'null' ? user.image : '/default.jpg'}
                                        alt="User Avatar"
                                        className="rounded-full h-[32px]"
                                    />
                                    <div className="ml-4">
                                        <h2 className="font-semibold">{user.first_name} {user.last_name}</h2>
                                    </div>
                                </div>

                            </>
                        ))}
                    </div>
                </div>

                <div
                    className={`col-span-1 md:col-span-6 flex flex-col`}
                >
                   {selectedUser ? (
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
                    src={selectedUser.image && selectedUser.image !== 'null' ? selectedUser.image : '/default.jpg'}
                    alt="User Avatar"
                    className="rounded-full h-[32px]"
                />
                <div className="ml-4">
                    <h2 className="font-semibold">{selectedUser.first_name} {selectedUser.last_name}</h2>
                </div>
            </div>
        </div>

        <div
            className="flex-1 overflow-y-auto p-4 bg-gray-50 chatboxdiv"
            style={{ maxHeight: "400px", overflowY: "auto" }} ref={chatBoxRef}
        > 
            {chatData.length > 0 ? (
                chatData.map((msg, index) => (
                    <div
                        className={`flex mb-4 ${msg.senderId === Number(session?.user?.id)
                            ? "justify-end"
                            : "justify-start"
                        }`}
                        key={index}
                    >
                        <div
                            className={`p-3 rounded-lg shadow ${msg.senderId !== Number(session?.user?.id)
                                ? "bg-blue-100"
                                : "bg-gray-200"
                            }`}
                            ref={index === chatData.length - 1 ? lastMessageRef : null}
                        >
                            <div
                                dangerouslySetInnerHTML={{ __html: msg.message }}
                                className="message-content"
                            ></div>
                            <p className={`text-xs ${msg.senderId === Number(session?.user?.id) ? "text-right" : "text-left"}`}>
                                {formatDate(msg.messageCreatedAt)}
                            </p>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center text-gray-500 mt-4">No Messages...</div>
            )}
        </div>

        <div className="p-2 border-t bg-white relative">
            <div className="flex items-center space-x-2">
                <button
                    onClick={handleEmojiClick}
                    className="text-gray-500 hover:text-gray-800 flex-shrink-0"
                >
                    <FaSmile />
                </button>

                <textarea
                    className="flex-1 p-2 border rounded-lg bg-gray-100 focus:outline-none resize-none h-18"
                    placeholder=""
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                        }
                    }}
                />

                <button
                    onClick={handleSendMessage}
                    className="ml-2 bg-green-500 text-white p-2 rounded-lg flex-shrink-0 h-10"
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
) : (
    <div className="text-center text-gray-500 p-6 mt-10">No Messages...</div>
)}

                </div>




                <div className="col-span-1 md:col-span-3 bg-white border-l border-gray-300 flex flex-col p-4">
                {selectedUser && (
                    <>
                    {loggedInUserType=='player' && (
                        <>
 <h2 className="text-xl font-semibold mb-4 hidden md:block">Coach Profile</h2>
<div className="relative flex flex-col items-center mb-4 hidden md:block">
  {/* Image Container for Centering */}
  <div className="relative">
    <img
      src={selectedUser.image && selectedUser.image !== 'null' ? selectedUser.image : '/default.jpg'}
      alt="User Avatar"
      className="rounded-full h-32 w-32 mx-auto"
    />
    {/* Button Positioned Above the Image */}
    <a
      href={`/coach/${selectedUser.slug}`}
      className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 py-2 px-4 bg-black bg-opacity-50 text-white flex items-center justify-center rounded transition duration-200 hover:bg-opacity-70"
      target="_blank"
    >
      <FaEye className="mr-1" /> View Details
    </a>
  </div>
  {/* Text Below Image */}
  <div className="text-center mt-6">
    <h3 className="font-semibold text-lg">{selectedUser.first_name} {selectedUser.last_name}</h3>
    <p className="text-sm text-gray-500"><b>Sport:</b> {selectedUser.sport}</p>
  </div>
</div>


</>
                    )}
                   
                   {loggedInUserType=='coach' && (
                        <>
 <h2 className="text-xl font-semibold mb-4 hidden md:block">Player Profile</h2>
<div className="relative flex flex-col items-center mb-4 hidden md:block">
  {/* Image Container for Centering */}
  <div className="relative">
    <img
      src={selectedUser.image && selectedUser.image !== 'null' ? selectedUser.image : '/default.jpg'}
      alt="User Avatar"
      className="rounded-full h-32 w-32 mx-auto"
    />
    {/* Semi-Transparent Black Button Positioned Above the Image */}
    <a
      href={`/players/${selectedUser.slug}`}
      className="absolute bottom-[40px] left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white flex items-center justify-center px-4 py-2 rounded transition duration-200 hover:bg-opacity-70"
      target="_blank"
    >
      <FaEye className="mr-1" /> View Details
    </a>
  </div>
  {/* Text Below Image */}
  <div className="text-center mt-6">
    <h3 className="font-semibold text-lg">{selectedUser.first_name} {selectedUser.last_name}</h3>
  </div>
</div>


</>
                    )}

            </>
          )}
        </div>




            </div>
        </div>
    );
};

export default ChatBox;
