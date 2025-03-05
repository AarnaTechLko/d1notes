"use client";
import React, { useEffect, useState } from "react";
import { useSession, getSession } from "next-auth/react";
import Sidebar from "../../components/teams/Sidebar";
import PlayerForm from "@/app/components/coach/PlayerForm";
import { showError, showSuccess } from "@/app/components/Toastr";
import { FaArchive, FaSpinner } from "react-icons/fa";
import defaultImage from "../../public/default.jpg";
import ResetPassword from "@/app/components/ResetPassword";
import Swal from "sweetalert2";

interface Coach {
  id: number;
  image: string;
  first_name: string;
  last_name: string;
  email: string;
  number: string;
  countrycode: string;
  gender: string;
  sport: string;
  status: string;
  position: string;
  team: string;
  slug: string;
  totalEvaluations: string;
}

const TeamArchive: React.FC = () => {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const limit = 10;
  const { data: session } = useSession();

  const fetchCoaches = async (page = 1, searchQuery = "") => {
    setLoading(true);
    try {
      const session = await getSession();
      const teamId = session?.user?.id;
      if (!teamId) return;

      const response = await fetch(
        `/api/teampanel/player/signup?team_id=${teamId}&page=${page}&limit=${limit}&search=${encodeURIComponent(
          searchQuery
        )}`
      );

      if (!response.ok) return;

      const data = await response.json();
      setCoaches(data.players);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching coaches:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoaches(currentPage, search);
  }, [currentPage, search, session]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-grow bg-gray-50 p-6 overflow-auto">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-4">Archived Teams</h1>
          <div className="flex justify-between items-center mb-4">
            <input
              type="text"
              placeholder="Search players..."
              className="w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <table className="w-full text-sm text-left border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Gender</th>
                <th className="p-3">Email</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Sport</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center">
                    <FaSpinner className="animate-spin" /> Loading...
                  </td>
                </tr>
              ) : coaches.length > 0 ? (
                coaches.map((coach) => (
                  <tr key={coach.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 flex items-center space-x-2">
                      <img
                        src={coach.image || defaultImage.src}
                        className="rounded-full w-10 h-10"
                        alt="Coach"
                      />
                      <span>{coach.first_name} {coach.last_name}</span>
                    </td>
                    <td className="p-3">{coach.gender}</td>
                    <td className="p-3">{coach.email}</td>
                    <td className="p-3">{coach.countrycode}{coach.number}</td>
                    <td className="p-3">{coach.sport}</td>
                    <td className="p-3">
                      <span className={`px-3 py-1 rounded text-white ${coach.status === "Inactive" ? "bg-red-500" : "bg-green-500"}`}>
                        {coach.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => alert("Archiving Player...")}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaArchive size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-4 text-center">No players found.</td>
                </tr>
              )}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm text-blue-500 disabled:text-gray-400"
              >
                Previous
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm text-blue-500 disabled:text-gray-400"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TeamArchive;
