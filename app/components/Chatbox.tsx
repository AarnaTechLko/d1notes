"use client";
import React, { useEffect, useRef, useState } from "react";
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
    useEffect(() => {
        const fetchUsers = async () => {
            if (!session?.user?.id) return;
            
            try {
                const response = await fetch(`/api/chatusers?user_id=${session.user.id}&user_type=${session.user.type}`);
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
                sender_id: Number(session.user.id),
                sender_type: session.user.type,
                receiver_id: selectedUser.user_id,
                receiver_type: selectedUser.type,
                message,
                createdAt: new Date().toISOString(),
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
            <header className="bg-gray-900 text-white p-2"></header>

            <div className="grid grid-cols-1 md:grid-cols-12 flex-1 mb-10 overflow-hidden">
                <div
                    className={`md:col-span-3 bg-gray-100 border-r border-gray-300 flex flex-col ${showUserList ? "block" : "hidden"
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
                    className={`col-span-1 md:col-span-6 flex flex-col ${showUserList && "hidden md:flex"
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
                                {chatData.map((msg, index) => (
                                    <div
                                        className={`flex mb-4 ${msg.sender_id === Number(session?.user?.id)
                                                ? "justify-end"
                                                : "justify-start"
                                            }`}
                                        key={index}
                                    >
                                        <div
                                            className={`p-3 rounded-lg shadow ${msg.sender_id !== Number(session?.user?.id)
                                                    ? "bg-blue-100"
                                                    : "bg-gray-200"
                                                }`}
                                            ref={index === chatData.length - 1 ? lastMessageRef : null}
                                        >
                                            <div
                                                dangerouslySetInnerHTML={{ __html: msg.message }}
                                                className="message-content"
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>


                            <div className="p-2 border-t bg-white relative">
                                <div className="flex items-center space-x-2">


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




                <div className="col-span-1 md:col-span-3 bg-white border-l border-gray-300 flex flex-col p-4">
                {selectedUser && (
                    <>
                    {loggedInUserType=='player' && (
                        <>
 <h2 className="text-xl font-semibold mb-4">Coach Profile</h2>
 <div className="flex flex-col items-center mb-4">
 <img
   src={selectedUser.image && selectedUser.image !== 'null' ? selectedUser.image : '/default.jpg'}
   alt="User Avatar"
   className="rounded-full mb-2 h-32 w-32"
 />
 <div className="text-center">
   <h3 className="font-semibold text-lg">{selectedUser.first_name} {selectedUser.last_name}</h3>
   <p className="text-sm text-gray-500"><b>Gender:</b> {selectedUser.gender} </p>
   <p className="text-sm text-gray-500"><b>Qualifications:</b> {selectedUser.qualifications}</p>
  
   <p className="text-sm text-gray-500"><b>Sport:</b> {selectedUser.sport}</p>
   
 </div>
 <a
   href={`/coach/${selectedUser.slug}`}
   className="mt-5 w-100 flex items-center justify-center py-2 px-4 bg-blue-500 text-white hover:bg-blue-600 rounded transition duration-200" target="_blank"
 >
   <FaEye className="mr-1" /> View Profile
 </a>
</div>
</>
                    )}
                   
                   {loggedInUserType=='coach' && (
                        <>
 <h2 className="text-xl font-semibold mb-4">Coach Profile</h2>
 <div className="flex flex-col items-center mb-4">
 <img
   src={selectedUser.image && selectedUser.image !== 'null' ? selectedUser.image : '/default.jpg'}
   alt="User Avatar"
   className="rounded-full mb-2 h-32 w-32"
 />
 <div className="text-center">
   <h3 className="font-semibold text-lg">{selectedUser.first_name} {selectedUser.last_name}</h3>
   <p className="text-sm text-gray-500"><b>Gender:</b> {selectedUser.gender} </p>
   <p className="text-sm text-gray-500"><b>Location:</b> {selectedUser.location}</p>
  
   <p className="text-sm text-gray-500"><b>Sport:</b> {selectedUser.sport}</p>
   <p className="text-sm text-gray-500"><b>Height:</b> {selectedUser.height}</p>
   <p className="text-sm text-gray-500"><b>Weight:</b> {selectedUser.weight} Lbs</p>
   
 </div>
 <a
   href={`/players/${selectedUser.slug}`}
   className="mt-5 w-100 flex items-center justify-center py-2 px-4 bg-blue-500 text-white hover:bg-blue-600 rounded transition duration-200" target="_blank"
 >
   <FaEye className="mr-1" /> View Profile
 </a>
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