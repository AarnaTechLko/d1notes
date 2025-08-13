"use client";
import React, { useState, useEffect } from "react";
// import PageBreadcrumb from "@/app/components/common/PageBreadCrumb";
// import { Table, TableBody, td, th, tr } from "@/app/components/ui/table";
import { Dialog, DialogTitle, DialogContent } from "@/app/components/ui/dialog";
import { MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import Badge from "@/app/components/ui/badge/Badge";
import SupportModal1 from "@/app/components/SupportModal1";
import { useSession } from 'next-auth/react';

import { Loader2 } from "lucide-react";
import Swal from "sweetalert2";

interface Ticket {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  assign_to: number;
  assignToUsername: string;
  createdAt: string;
  status: string;
  ticket_from: number;
  role: string;
}
interface Admin {
  id: number;
  username: string;
  email: string;
  role: string;
}
interface TicketReply {
  id: number;
  ticketId: number;
  message: string;
  status: string;
  repliedBy: string;
  createdAt: string;
}


const TicketsPage = () => {

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [subAdmins, setSubAdmins] = useState<Admin[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState<boolean>(false);
  const [replyMessage, setReplyMessage] = useState<string>("");
  const [replyStatus, setReplyStatus] = useState<string>("");
  const [supportOpen, setSupportOpen] = useState(false);
  const { data: session, status } = useSession();
  const [ticketReplies, setTicketReplies] = useState<TicketReply[]>([]);


  // const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();


  const handleReplyClick = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsReplyModalOpen(true);

    try {
      const response = await fetch(`/api/browse/ticket/replies?ticketId=${ticket.id}`);
      if (!response.ok) throw new Error("Failed to fetch replies");

      const data = await response.json();
      setTicketReplies(data.replies);
      setReplyStatus(ticket.status); // Set current status for reply
    } catch (error) {
      console.error("Error fetching replies:", error);
      Swal.fire("Error", "Could not load ticket messages.", "error");
    }
  };




  const handleReplySubmit = async () => {
    if (!selectedTicket) {
      Swal.fire("Error", "No ticket selected.", "error");
      return;
    }
    setLoading(true); // Start loading


    try {
      const response = await fetch("/api/browse/ticket/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: selectedTicket.id, // Use the selected ticket's ID
          repliedBy: session?.user?.id,
          message: replyMessage,
          status: replyStatus,
        }),
      });

      const data = await response.json();
      if (response.ok) {

        Swal.fire("Success", "Reply sent successfully!", "success");

        setTickets((prevTickets) =>
          prevTickets.map((t) =>
            t.id === selectedTicket.id ? { ...t, status: replyStatus } : t
          )
        );

        setIsReplyModalOpen(false);
      } else {
        Swal.fire("Error", data.error || "Failed to send reply.", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire("Error", "An unexpected error occurred.", "error");
    } finally {
      setLoading(false); // Stop loading
    }
  };


  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/browse/ticket?search=${searchQuery}&page=${currentPage}&limit=10&userId=${session?.user?.id}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) throw new Error("Failed to fetch tickets");

        const data = await response.json();
        setTickets(data.tickets);


        setTotalPages(data.totalPages);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [searchQuery, currentPage]);

  useEffect(() => {
    const fetchSubAdmins = async () => {
      try {
        const response = await fetch(`/api/browse/subadmin`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) throw new Error("Failed to fetch sub-admins");

        const contentType = response.headers.get("Content-Type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text();
          throw new Error(`Expected JSON, but got: ${text}`);
        }

        const data = await response.json();
        setSubAdmins(data.admins);
      } catch (err) {
        console.error("Error fetching sub-admins:", err);
        setError((err as Error).message);
      }
    };
    fetchSubAdmins();
  }, []);

  const handleAssignToClick = (ticket: Ticket) => {
    // If already assigned, don't open the modal
    if (ticket.assign_to) {
      Swal.fire('Already Assigned', 'This ticket has already been assigned to a sub-admin.', 'info');
      return;
    }

    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };


  const handleAssignSubAdmin = async (subAdmin: Admin) => {
    if (!selectedTicket) return;
    setIsSubmitting(true);


    try {
      const response = await fetch(`/api/browse/ticket/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: selectedTicket.id, assignTo: subAdmin.id }),
      });

      // Log the response status and content
      console.log("Response Status:", response.status);

      const contentType = response.headers.get("Content-Type");
      console.log("Response Content-Type:", contentType);

      if (!response.ok) {
        const errorData = await response.json(); // Assuming the API returns a JSON error message
        console.error("API Error Response:", errorData);
        throw new Error(`Failed to assign sub-admin: ${errorData?.error || "Unknown error"}`);
      }

      // Check if the response is JSON
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text(); // Read the response as text if not JSON
        console.error("Non-JSON Response:", text);
        throw new Error(`Expected JSON, but got: ${text}`);
      }

      // const data = await response.json();
      setTickets((prevTickets) =>
        prevTickets.map((t) => (t.id === selectedTicket.id ? { ...t, assign_to: subAdmin.id, assignToUsername: subAdmin.username } : t))
      );

      setIsModalOpen(false); // Close modal after assigning sub-admin
    } catch (err) {
      console.error("Error assigning sub-admin:", err);
      setError((err as Error).message); // Set the error state
    } finally {
      setIsSubmitting(false);
    }
  };




  const handleModalSubmit = () => {
    if (!selectedTicket) {
      setError("No ticket selected");
      return;

    }
    setIsSubmitting(true);


    // Find the selected sub-admin object based on the last clicked admin (selectedTicket.assign_to)
    const assignedSubAdmin = subAdmins.find((admin) => admin.id === selectedTicket.assign_to);

    if (assignedSubAdmin) {
      handleAssignSubAdmin(assignedSubAdmin); // Call API function to assign
    } else {
      setError("Please select a sub-admin before submitting.");
    }
  };




  useEffect(() => {
    if (status === 'authenticated') {
      console.log("User ID:", session?.user?.id);
    }
  }, [session, status]);


  // ✅ This function is passed to modal and updates state
  const handleTicketCreated = (newTicket: Ticket) => {
    setTickets((prev) => [newTicket, ...prev]);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* <div>
      Welcome {session?.user?.id}
      {session?.user?.name}
    </div> */}
      {/* <PageBreadcrumb pageTitle="Ticket" onSearch={setSearchQuery} /> */}
      <div className="flex justify-end items-center mx-10 mt-5 dark:border-white/[0.05] " >
        <button
          className="bg-blue-500 text-white text-sm rounded-md  p-2"
          onClick={() => setSupportOpen(true)}
        >
          New Ticket
        </button>
      </div>

      {/* Support Modal */}
      {supportOpen && (
        <SupportModal1 setSupportOpen={setSupportOpen}
          onTicketCreated={handleTicketCreated}

        />)}

      <div className="flex justify-end items-center mx-10 mt-2   dark:border-white/[0.05]">
        {[...Array(totalPages)].map((_, index) => {
          const pageNumber = index + 1;
          return (
            <button
              key={pageNumber}
              onClick={() => setCurrentPage(pageNumber)}
              className={`px-3 py-1 rounded-md ${currentPage === pageNumber ? "bg-blue-500 text-white text-xs" : "text-blue-500 hover:bg-gray-200"
                }`}
            >
              {pageNumber}
            </button>
          );
        })}
      </div>

      {loading && <p className="text-center py-5">Loading...</p>}
      {error && <p className="text-center py-5 text-red-500">{error}</p>}

      {!loading && !error && (
        <>

          <div className="overflow-hidden  mx-10 my-4  border  bg-white rounded-2xl shadow-md font-sans text-sm bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className=" font-bold    p-4 dark:text-gray-300">Total Tickets: {tickets.length}</div>


            <table className=" min-w-full text-sm border-collapse ">
              <thead className="bg-gray-300 text-gray-900   ">
                <tr>
                  <td className="px-5 py-3 font-medium border-none   text-start">Name</td>
                  <td className="px-5 py-3 font-medium border-none  text-start">Email</td>
                  <td className="px-5 py-3 font-medium border-none  text-start">Subject</td>
                  <td className="px-5 py-3 font-medium border-none  text-start">Message</td>
                  <td className="px-5 py-3 font-medium border-none  text-start">Assigned</td>


                  <td className="px-5 py-3 font-medium border-none  text-start">Status</td>
                  <td className="px-5 py-3 font-medium border-none  text-start">Actions</td>
                  {/* <td className="px-5 py-3 font-medium text-gray-500 text-start">Ticket From</td>
                <td className="px-5 py-3 font-medium text-gray-500 text-start">Role</td> */}

                </tr>
              </thead>
              <tbody >
                {tickets.map((ticket) => (
                  ticket && ticket.name ? (

                    <tr key={ticket.id} className="border">

                      <td className="px-4 py-3 text-gray-500 border-none  dark:text-gray-400">{ticket.name}</td>
                      <td className="px-4 py-3 text-gray-500 border-none  dark:text-gray-400">{ticket.email}</td>
                      <td className="px-4 py-3 text-gray-500  border-none dark:text-gray-400">{ticket.subject}</td>
                      <td className="px-4 py-3 text-gray-500  border-none dark:text-gray-400">
                        {ticket.message.slice(0, 60)}...
                      </td>
                      <td className="px-4 py-3 text-gray-500  border-none dark:text-gray-400">
                        <button
                          className="text-blue-500 hover:underline text-xs"
                          onClick={() => handleAssignToClick(ticket)}
                        >
                          {ticket.assignToUsername || "Not Assigned"}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-gray-500  border-none dark:text-yellow-500">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${(() => {
                            const status = ticket.status?.trim().toLowerCase();
                            if (status === "closed") return "bg-gray-100 text-gray-500";
                            if (status === "open") return "bg-blue-50 text-blue-600";
                            if (status === "fixed") return "bg-green-50 text-green-600";
                            if (status === "pending") return "bg-orange-50 text-orange-500";
                            return "bg-gray-200 text-gray-800";
                          })()}
    `}
                        >
                          {ticket.status?.trim() || "Pending"}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-gray-500 border-none  dark:text-gray-400">
                        <div className="flex gap-3">
                          <button className="text-green-500" onClick={() => handleReplyClick(ticket)}>
                            <MessageSquare size={18} />
                          </button>
                        </div>

                      </td>
                      {/* <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{ticket.ticket_from}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{ticket.role}</td> */}

                    </tr>
                  ) : null
                ))}
              </tbody>
            </table>




            <Dialog open={isReplyModalOpen} onOpenChange={setIsReplyModalOpen}>
              <DialogContent className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
                <DialogTitle>Reply to Ticket</DialogTitle>

                {/* Previous Messages */}
                <div>
                  <h3 className="text-sm font-medium mb-2 text-blue-600">Previous Messages</h3>
                  <div className="border border-blue-300 rounded-md p-3 max-h-60 overflow-y-auto space-y-4 bg-gray-50">
                    {ticketReplies.length === 0 ? (
                      <p className="text-gray-400 text-sm">No messages yet.</p>
                    ) : (
                      ticketReplies.map((reply) => (
                        <div key={reply.id} className="border-b pb-3">
                          <p className="text-sm text-gray-700 mb-1">
                            <span className="font-semibold">Message:</span> {reply.message}
                          </p>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm">Status:</span>
                            <Badge
                              color={
                                reply.status.toLowerCase() === "Closed" ? "error" :
                                  reply.status.toLowerCase() === "Open" ? "info" :
                                    reply.status.toLowerCase() === "Fixed" ? "success" :
                                      reply.status.toLowerCase() === "Pending" ? "warning" :
                                        "light"
                              }
                            >
                              {reply.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-700">
                            <span className="font-semibold">Date:</span> {reply.repliedBy}  {new Date(reply.createdAt).toLocaleString()}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>



                {/* New Message Input */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-1">New Message</label>
                    <textarea
                      className="w-full p-3 border rounded-md resize-none"
                      placeholder="text"
                      rows={2}
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                    />
                  </div>

                  {/* Status Selection */}
                  <div>
                    {/* <label className="block text-sm font-medium text-gray-700 mb-1">Status</label> */}
                    <select
                      className="w-full p-3 border rounded-md"
                      value={replyStatus}
                      onChange={(e) => setReplyStatus(e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Open">Open</option>
                      <option value="Fixed">Fixed</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
                      onClick={() => setIsReplyModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center justify-center"
                      onClick={handleReplySubmit}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="animate-spin text-blue-300 mr-2" size={16} /> Submitting...
                        </>
                      ) : (
                        "Submit"
                      )}
                    </button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>




          </div>
        </>
      )}

      {/* Modal for Assigning Subadmin */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className=" p-6 max-h-[80vh] overflow-y-auto space-y-6">
          <DialogTitle>Assign Subadmin</DialogTitle>
          <p className="text-gray-500">Select a sub-admin to assign:</p>

          {/* Sub-admin selection */}
          <ul className="mt-4 space-y-2">
            {subAdmins.map((subAdmin) => (
              <li
                key={subAdmin.id}
                className={`p-2 border rounded-md cursor-pointer 
             ${selectedTicket?.assign_to === subAdmin.id ? "bg-blue-200 dark:bg-blue-700" : "hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                onClick={() => setSelectedTicket((prev) => prev ? { ...prev, assign_to: subAdmin.id } : null)}
              >
                {subAdmin.username}
                {/* ({subAdmin.email}) */}
              </li>
            ))}
          </ul>

          {/* Submit & Cancel Buttons */}
          <div className="mt-4 flex justify-end gap-3">
            <button
              className="px-4 py-2 bg-red-500 text-white rounded-md"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-md"
              onClick={handleModalSubmit}>
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin inline mr-2" size={16} />Submitting...
                </>
              ) : (
                "Submit"
              )}            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>

  );
};

export default TicketsPage;









