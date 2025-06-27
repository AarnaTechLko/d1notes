"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Sidebar from "@/app/components/Sidebar";
import { Bell } from "lucide-react";

interface Notification {
  id: number;
  message: string;
  isRead: number; // 0 or 1
  created_at: string;
}

const PAGE_SIZE = 10;

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchNotifications = async () => {
      try {
        const res = await fetch(`/api/notification?user_id=${session.user.id}`);
        const data = await res.json();
        setNotifications(data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, [session]);

  // Pagination logic
  const totalPages = Math.ceil(notifications.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const currentItems = notifications.slice(startIndex, startIndex + PAGE_SIZE);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-grow bg-gray-100 p-4 overflow-y-auto">
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="container mx-auto">
            <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Bell className="w-6 h-6" /> Admin Messages
            </h1>

            {notifications.length === 0 ? (
              <p className="text-gray-500">No notifications.</p>
            ) : (
              <>
                <ul className="space-y-4">
                  {currentItems.map((notif) => (
                    <li
                      key={notif.id}
                      className={`p-4 rounded-lg shadow-sm border ${
                        notif.isRead === 0 ? "bg-blue-50 border-blue-200" : "bg-white"
                      }`}
                    >
                      <p className="text-sm text-gray-700">{notif.message}</p>
                      <span className="text-xs text-gray-400">
                        {new Date(notif.created_at).toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="flex items-center justify-between mt-6">
                  <button
                    onClick={handlePrev}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
