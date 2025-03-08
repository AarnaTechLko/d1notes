"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { showError, showSuccess } from "./Toastr";
import { countryCodesList } from "@/lib/constants";

interface InviteFormProps {
  usertype: string;
  teamId?:string;
  enterpriseId?:string;
  registrationType:string;
}


const InviteForm: React.FC<InviteFormProps> = ({ usertype, teamId, registrationType,enterpriseId }) => {
  const [emails, setEmails] = useState<string[]>([""]);
  const [mobiles, setMobiles] = useState<{ code: string; number: string }[]>([
    { code: "+1", number: "" },
  ]);
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teams, setTeams] = useState<[] | null>([]);

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
      if (!res.ok) {
        throw new Error("Failed to fetch teams");
      }
      const data = await res.json();
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

    if (!isAnyEmailValid) {
      setError("Please provide a valid email.");
      setIsSubmitting(false);
      return;
    }

    const invalidEmails = emails.filter((email) => email.trim() && !validateEmail(email));
    if (invalidEmails.length > 0) {
      setError("Some email addresses are invalid. Please check and try again.");
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
      enterpriseId,
      teamId,
      registrationType:registrationType,
      usertype:usertype
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


    if (session?.user.type === 'Team') {

    }
    else {

    }
  }, [usertype, session]);

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl p-8 rounded-xl space-y-6"
    >




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
              className="border border-gray-300 rounded-lg py-2 px-4 w-full"
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



      {/* Error Message */}
      {error && <p className="text-red-600 text-center text-lg">{error}</p>}

      {/* Submit Button */}
      <div className="text-center">
        <button
          type="submit"
          className="w-full sm:w-auto px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg transition-all duration-300 ease-in-out hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 flex items-center justify-center"
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
