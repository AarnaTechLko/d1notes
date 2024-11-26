"use client";

import { useEffect, useState } from "react";
import CryptoJS from "crypto-js";
import { useSession } from "next-auth/react";
import { showError, showSuccess } from "./Toastr";
import { encryptData } from "@/lib/helpers";

interface InviteFormProps {
  usertype: string;
}

const InviteForm: React.FC<InviteFormProps> = ({ usertype }) => {
  const [emails, setEmails] = useState<string[]>([""]);
  const [mobiles, setMobiles] = useState<string[]>([""]);
  const [error, setError] = useState<string | null>(null);
  const [registrationType, setRegistrationType] = useState<"coach" | "player">("player");
  const { data: session, status } = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (emails.every(email => !email.trim()) && mobiles.every(mobile => !mobile.trim())) {
      setError("Please provide either an email or mobile number.");
      return;
    }

    setError(null);

    if (!session?.user?.id) {
      setError("User is not logged in.");
      return;
    }

    const userId = session.user.id;
    const userName = session.user.name;
    const encryptedUserId = CryptoJS.AES.encrypt(userId, "rerqwrq98798798798JHGJG86876hgfjhgjvr").toString();

    const baseUrl = window.location.origin;

    // const inviteUrl = registrationType === "coach"
    //   ? `${baseUrl}/coach/signup?uid=${encodeURIComponent(encryptedUserId)}&by=${usertype}`
    //   : `${baseUrl}/register?uid=${encodeURIComponent(encryptedUserId)}&by=${usertype}`;

    

    const inviteData = {
      emails,
      mobiles,
     
      usertype,
      userId,
      userName,
      registrationType,
    };

    try {
      const response = await fetch("/api/sendInvite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inviteData),
      });

      if (response.ok) {
        showSuccess("Invitation sent successfully!");
        setEmails([""]);
        setMobiles([""]);
      } else {
        showError("Failed to send the invitation.");
        
      }
    } catch (error) {
        showError("Failed to send the invitation.");
    }
  };

  const handleAddEmail = () => {
    setEmails([...emails, ""]);
  };

  const handleAddMobile = () => {
    setMobiles([...mobiles, ""]);
  };

  const handleEmailChange = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  const handleMobileChange = (index: number, value: string) => {
    const newMobiles = [...mobiles];
    newMobiles[index] = value;
    setMobiles(newMobiles);
  };

  useEffect(() => {
    if (usertype === "coach") {
      setRegistrationType("player");
    }
  }, [usertype]);
  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-8 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 shadow-xl rounded-xl space-y-6">
      <h2 className="text-3xl font-semibold text-center text-gray-900 mb-6"> {usertype === "coach" ? "Send Invitation to Players" : "Send Invitation"}</h2>

      {usertype !== "coach" && (
      <div className="mb-6 flex justify-center space-x-10">
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="registrationType"
            value="coach"
            checked={registrationType === "coach"}
            onChange={() => setRegistrationType("coach")}
            className="text-blue-500 border-2 border-blue-500 rounded-full p-2"
          />
          <span className="text-lg font-medium">Coach</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="registrationType"
            value="player"
            checked={registrationType === "player"}
            onChange={() => setRegistrationType("player")}
            className="text-blue-500 border-2 border-blue-500 rounded-full p-2"
          />
          <span className="text-lg font-medium">Player</span>
        </label>
      </div>
 )}
      {/* Email Input */}
      <div className="mb-6">
        <label htmlFor="email" className="block text-xl font-medium text-gray-700 mb-4">
          Email <span className="text-sm text-gray-500">(Use comma to add multiple emails)</span>
        </label>
        {emails.map((email, index) => (
          <div key={index} className="flex space-x-3 mb-4">
            <input
              type="text"
              value={email}
              onChange={(e) => handleEmailChange(index, e.target.value)}
              className="w-full px-5 py-3 border-2 border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="Enter email address"
            />
            {emails.length > 1 && (
              <button
                type="button"
                onClick={() => setEmails(emails.filter((_, i) => i !== index))}
                className="text-red-600 hover:text-red-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={handleAddEmail} className="text-blue-600 hover:text-blue-800 font-medium">
          + Add another email
        </button>
      </div>

      {/* Mobile Input */}
      <div className="mb-6">
        <label htmlFor="mobile" className="block text-xl font-medium text-gray-700 mb-4">
          Phone Number <span className="text-sm text-gray-500">(Use comma to add multiple phone numbers)</span>
        </label>
        {mobiles.map((mobile, index) => (
          <div key={index} className="flex space-x-3 mb-4">
            <input
              type="tel"
              value={mobile}
              onChange={(e) => handleMobileChange(index, e.target.value)}
              className="w-full px-5 py-3 border-2 border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="Enter mobile number"
            />
            {mobiles.length > 1 && (
              <button
                type="button"
                onClick={() => setMobiles(mobiles.filter((_, i) => i !== index))}
                className="text-red-600 hover:text-red-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={handleAddMobile} className="text-blue-600 hover:text-blue-800 font-medium">
          + Add another phone number
        </button>
      </div>

      {/* Error Message */}
      {error && <p className="text-red-600 text-center text-lg">{error}</p>}

      {/* Submit Button */}
      <div className="text-center">
        <button
          type="submit"
          className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white text-lg font-medium rounded-lg transition-all duration-300 ease-in-out hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500"
        >
          Send Invite
        </button>
      </div>
    </form>
  );
};

export default InviteForm;
