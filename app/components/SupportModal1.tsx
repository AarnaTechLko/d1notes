"use client";
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useSession } from "next-auth/react";

interface SupportModalProps {
  setSupportOpen: (open: boolean) => void;
  onTicketCreated?: (ticket: any) => void;
}

const SupportModal1: React.FC<SupportModalProps> = ({
  setSupportOpen,
  onTicketCreated,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    setSupportOpen(true);

    if (status === "authenticated" && session?.user) {
      setFormData((prev) => ({
        ...prev,
        name: session.user.name || "",
        email: session.user.email || "",
      }));
    }
  }, [setSupportOpen, session, status]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/browse/ticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        onTicketCreated?.(result.ticket); // Optional: update parent immediately

        Swal.fire({
          title: "Success!",
          text: result.message,
          icon: "success",
          confirmButtonText: "OK",
        }).then(() => {
          setSupportOpen(false);
        });
      } else {
        Swal.fire({
          title: "Error!",
          text: result.message,
          icon: "error",
          confirmButtonText: "Try Again",
        });
      }
    } catch (err) {
      Swal.fire({
        title: "Error!",
        text: "An error occurred while submitting the ticket.",
        icon: "error",
        confirmButtonText: "Try Again",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-1/2">
        <h2 className="text-xl font-bold mb-4">Create a New Ticket</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4 flex space-x-4">
            <div className="w-1/2">
              <label htmlFor="name" className="block mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                className="w-full p-2 border rounded"
                value={formData.name}
                onChange={handleChange}
                required
                readOnly
              />
            </div>
            <div className="w-1/2">
              <label htmlFor="email" className="block mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full p-2 border rounded"
                value={formData.email}
                onChange={handleChange}
                required
                readOnly
              />
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="subject" className="block mb-2">
              Subject
            </label>
            <select
              id="subject"
              className="w-full p-2 border rounded"
              value={formData.subject}
              onChange={handleChange}
              required
            >
              <option value="">Select a subject</option>
              <option value="General Inquiry">General Inquiry</option>
              <option value="Technical Support">Technical Support</option>
              <option value="Billing Issues">Billing Issues</option>
              <option value="Account Issues">Account Issues</option>
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="message" className="block mb-2">
              Message
            </label>
            <textarea
              id="message"
              className="w-full p-2 border rounded"
              value={formData.message}
              onChange={handleChange}
              required
              rows={5}
            ></textarea>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
              onClick={() => setSupportOpen(false)}
            >
              Close
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupportModal1;
