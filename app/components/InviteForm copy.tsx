"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { showError, showSuccess } from "./Toastr";
import { countryCodesList } from "@/lib/constants";

interface InviteFormProps {
  usertype: string;
}


const InviteForm: React.FC<InviteFormProps> = ({ usertype }) => {
  const [emails, setEmails] = useState<string[]>([""]);
  const [mobiles, setMobiles] = useState<{ code: string; number: string }[]>([
    { code: "+1", number: "" },
  ]);
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [registrationType, setRegistrationType] = useState<"coach" | "player">("player");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teams, setTeams] = useState<[] | null >([]);
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const { data: session } = useSession();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const formatPhoneNumber = (value: string) => {
    if (!value) return value;

    const phoneNumber = value.replace(/[^\d]/g, ""); // Remove all non-numeric characters

    const phoneNumberLength = phoneNumber.length;

    if (phoneNumberLength < 4) return phoneNumber;

    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }

    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };

  const validateMobile = (mobile: { code: string; number: string }): boolean => {
    // Remove all non-numeric characters
    const numericOnly = mobile.number.replace(/[^\d]/g, "");
    
    // Check if the numeric part is exactly 10 digits
    const isTenDigits = numericOnly.length === 10;
  
    return Boolean(mobile.code) && isTenDigits;
  };

  const fetchTeams = async () => {
    if (!session || !session.user?.id) {
      console.error("No user logged in");
      return;
    }

    const enterpriseID = session.user.type === 'enterprise' ? session.user.id : session.user.club_id;


    try {
      setLoadingData(true);
      const res = await fetch(`/api/teams?enterprise_id=${enterpriseID}`);
      if (!res.ok) 
        {
          throw new Error("Failed to fetch teams");
        }
      const data=await res.json();
      console.log(data);
   
      setTeams(data.data);
    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);

    const isAnyEmailValid = emails.some((email) => email.trim() && validateEmail(email));
    const isAnyMobileValid = mobiles.some((mobile) => validateMobile(mobile));
    if (registrationType !== "coach" && !selectedTeam) {
      setError("Please Select a Team.");
      setIsSubmitting(false);
      return;
    }
    if (!isAnyEmailValid && !isAnyMobileValid) {
      setError("Please provide a valid email or mobile number.");
      setIsSubmitting(false);
      return;
    }

    const invalidEmails = emails.filter((email) => email.trim() && !validateEmail(email));
    if (invalidEmails.length > 0) {
      setError("Some email addresses are invalid. Please check and try again.");
      setIsSubmitting(false);
      return;
    }

    const invalidMobiles = mobiles.filter(
      (mobile) => mobile.number.trim() && (!validateMobile(mobile) || mobile.number.length !== 14)
    );
    if (invalidMobiles.length > 0) {
      setError("Some mobile numbers are invalid. Ensure they are 14 digits (excluding country code).");
      setIsSubmitting(false);
      return;
    }

    setError(null);

    if (!session?.user?.id) {
      setError("User is not logged in.");
      setIsSubmitting(false);
      return;
    }

    const userId = session.user.id;
    const userName = session.user.name;

    const inviteData = {
      emails,
      mobiles: mobiles.map((mobile) => `${mobile.code}${mobile.number}`),
      usertype,
      userId,
      userName,
      registrationType,
      selectedTeam,
     
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
        setMobiles([{ code: "+1", number: "" }]);
      } else {
        showError("Failed to send the invitation.");
      }
    } catch (error) {
      showError("Failed to send the invitation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddMobile = () => {
    setMobiles([...mobiles, { code: "+1", number: "" }]);
  };

  const handleMobileChange = (index: number, field: "code" | "number", value: string) => {
    const newMobiles = [...mobiles];
    newMobiles[index][field] = field === "number" ? formatPhoneNumber(value) : value;
    setMobiles(newMobiles);
  };

  useEffect(() => {
    fetchTeams();
   
    if (usertype === "coach") {
      setRegistrationType("player");
    }
   
    if(session?.user.type==='team')
    {
      setSelectedTeam(session?.user.id);
    }
    else{
      setSelectedTeam('');
    }
  }, [usertype, session]);

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto p-8  shadow-xl rounded-xl space-y-6"
    >
      <h2 className="text-xl font-semibold text-center text-gray-900 mb-6">
      Get started by clicking on Your Teams and create Your Teams…
          
      </h2>

      {usertype !== "coach" && usertype !== "Team" && (
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
 {registrationType !== "coach" && (
<div className="mb-6">
  <label className="block text-xl font-medium text-gray-700 mb-4">
    Select Team: <span className="text-sm text-gray-500">*</span>
  </label>
  <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              disabled={selectedTeam !== ''}
              className="px-5 py-3 border-2 border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition w-full"
            >
              <option value="">Select</option>
              {teams?.map((items:any) => (
                <option key={items.id} value={items?.id}>
                  {items.team_name}
                </option>
              ))}
            </select>

  </div>
  )}
      <div className="mb-6">
  <label className="block text-xl font-medium text-gray-700 mb-4">
    Email  
  </label>
  {emails.map((email, index) => (
    <div key={index} className="flex space-x-3 mb-4">
      <input
        type="text"
        value={email}
        onChange={(e) => {
          const newEmails = [...emails];
          newEmails[index] = e.target.value;
          setEmails(newEmails);
        }}
        className="w-full px-5 py-3 border-2 border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
        placeholder="Enter email address"
      />
      {/* Remove email button */}
      {emails.length > 1 && (
        <button
          type="button"
          onClick={() => {
            const newEmails = emails.filter((_, idx) => idx !== index);
            setEmails(newEmails);
          }}
          className="text-red-600 hover:text-red-800 font-medium"
        >
          Remove
        </button>
      )}
    </div>
  ))}
  <button
    type="button"
    onClick={() => setEmails([...emails, ""])}
    className="text-blue-600 hover:text-blue-800 font-medium"
  >
    + Add another email
  </button>
</div>

      {/* Mobile Input */}
      <div className="mb-6">
        <label className="block text-xl font-medium text-gray-700 mb-4">
          Mobile Number  
        </label>
        {mobiles.map((mobile, index) => (
          <div key={index} className="flex space-x-3 mb-4 items-center">
            <select
              value={mobile.code}
              onChange={(e) => handleMobileChange(index, "code", e.target.value)}
              className="px-5 py-3 border-2 border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            >
              <option value="">Select</option>
              {countryCodesList.map((country, index) => (
                <option key={index} value={country.code}>
                  {country.country} ({country.code})
                </option>
              ))}
            </select>
            <input
              type="tel"
              value={mobile.number}
              placeholder="(444) 444-4444"
              onChange={(e) => handleMobileChange(index, "number", e.target.value)}
              className="w-full px-5 py-3 border-2 border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
               
            />
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddMobile}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          + Add another phone number
        </button>
      </div>

      {/* Error Message */}
      {error && <p className="text-red-600 text-center text-lg">{error}</p>}

      {/* Submit Button */}
      <div className="text-center">
        <button
          type="submit"
          className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white text-lg font-medium rounded-lg transition-all duration-300 ease-in-out hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 flex items-center justify-center"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <svg
              className="animate-spin h-5 w-5 text-white mr-3"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.964 7.964 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : null}
          {isSubmitting ? "Sending..." : "SEND INVITE"}
        </button>
      </div>
    </form>
  );
};

export default InviteForm;
