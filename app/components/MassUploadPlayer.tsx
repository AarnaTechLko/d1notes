"use client";
import React, { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
 
import { showError, showSuccess, showWarning } from "@/app/components/Toastr";
import { FaCheck, FaSpinner, FaTrash } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import Swal from "sweetalert2";
interface InviteFormProps {
    usertype: string;
    teamId?:string;
    enterpriseId?:string;
    registrationType:string;
  }
type Team = {
  id?: number;
  team_name?: string;
};

const MassUploadPlayer: React.FC<InviteFormProps> = ({ usertype,teamId,registrationType,enterpriseId }) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [iscsvUploaded, setIscsvUploaded] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string>(teamId || '');
  const [isuploadingcsv, setIsuploadingcsv] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [isSubmit, setIsSubmit] = useState(false);
  const [showUploadControls, setShowUploadControls] = useState(true);
  const { data: session } = useSession();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [failedData, setFailedData] = useState<any[]>([]);
  const router = useRouter();

  const fetchTeams = async () => {
    if (!session || !session.user?.id) {
      console.error("No user logged in");
      return;
    }
    try {
      const res = await fetch(`/api/teams?enterprise_id=${session.user.id}`);
      if (!res.ok) throw new Error("Failed to fetch teams");
      const { data }: { data: Team[] } = await res.json();
      setTeams(data);
    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  };

  const handleUpload = async () => {
    setFailedData([]);
    if (selectedTeam === "" && usertype!='Club') {
      showError("Please select a Team.");
      return;
    }
    if (!fileInputRef.current?.files?.length) {
      setIsuploadingcsv(false);
      showError("Please select a file to upload.");
      return;
    }

    const file = fileInputRef.current.files[0];

    try {
      setIsuploadingcsv(true);
      setShowUploadControls(false);
      const response = await fetch(URL.createObjectURL(file));
      const csvData = await response.text();
      const { data } = Papa.parse(csvData, { header: true, skipEmptyLines: true });
      setCsvData(data);
      setIscsvUploaded(true);
      setIsuploadingcsv(false);
    } catch (error) {
      setIsuploadingcsv(false);
      showError("Error in Uploading CSV");
    }
  };

  const handleInputChange = (index: number, field: string, value: string) => {
    const updatedCsvData = [...csvData];
    updatedCsvData[index][field] = value;
    setCsvData(updatedCsvData);
  };

  let enterprise_id;
  let team_id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmit(true);
 const payload={
  enterprise_id:enterpriseId,
  teamId: selectedTeam,
  csvData,
  registrationType:registrationType,
  usertype:usertype
};
 
    try {
      const response = await fetch("/api/sendmassinvite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to submit data");
      const data = await response.json();
      if (data.success === false) {
        setFailedData(data.duplicates);
        showWarning("Coaches Players. But we have found some duplicate records.");
      } else {
        ///router.push("/teampanel/players");
        showSuccess("Invitation Sent Successfully.");
      }
      setShowUploadControls(true);
      setCsvData([]);
      setIsSubmit(false);
    } catch (error) {
      setIsSubmit(false);
      showError("Error in submission.");
    }
  };

  const handleDelete = (index: number) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to undo this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedData = csvData.filter((_, i) => i !== index);
        setCsvData(updatedData);
        Swal.fire("Deleted!", "The item has been deleted.", "success");
      }
    });
  };

  const handleOpenControl = () => {
    setShowUploadControls(true);
    setCsvData([]);
  };

  useEffect(() => {
    fetchTeams();
    setIscsvUploaded(false);
  }, [session]);

  return (
 <>
      
            <div className="pt-4 pb-4 overflow-y-auto h-screen">
              {showUploadControls && (
                <>
                  
                  <div className="">
                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                      Upload CSV File<span className="mandatory">*</span>
                    </label>
                    <input
                      className="border border-gray-300 rounded-lg py-2 px-4 w-[350px]"
                      type="file"
                      accept=".csv"
                      ref={fileInputRef}
                    />
                    <p className="text-sm text-blue-400">
                      <a href="/MassInviteSample.csv" download>
                      Please download and use CSV (Open this file in Excel or any CSV supported tool(s)) 
                      </a>
                    </p>
                  </div>
                  <div className="mt-5">
                    <button
                      type="submit"
                      onClick={handleUpload}
                      className="flex items-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg"
                      disabled={isuploadingcsv}
                    >
                      {isuploadingcsv ? (
                        <>
                          <FaSpinner className="animate-spin mr-2" /> Uploading...
                        </>
                      ) : (
                        <>
                          <FaCheck className="mr-2" /> Upload
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
              {failedData.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-2xl text-center font-semibold text-red-600">
                    We have found Duplicate Entries
                  </h3>
                  <p className="text-sm text-gray-600 text-center">
                    The following entries were not uploaded due to duplicates <span className="text-blue-600">Rest data has been imported Successfully</span>
                  </p>
                  <table className="w-full mt-2 border border-gray-300">
                    <thead>
                      <tr>
                       
                        <th>Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {failedData.map((row, index) => (
                        <tr key={index} className="bg-red-100">
                        
                          <td>{row.Email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {csvData.length > 0 && (
                <form onSubmit={handleSubmit}>
                  <div className="mt-4">
                    <div className="w-full flex items-center justify-between">
                      <div className="flex flex-col">
                        <h3 className="font-semibold"></h3>
                        
                      </div>
                      <div className="flex space-x-4">
                        {/* <button
                          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-blue-600"
                          onClick={handleOpenControl}
                        >
                          Go Back
                        </button> */}
                      </div>
                    </div>
                    <table className="w-full mt-2">
                      <thead>
                        <tr>
                         
                          <th>Email</th>
                          <th>Remove</th>
                        </tr>
                      </thead>
                      <tbody>
                        {csvData.map((row, index) => (
                          <tr key={index}>
                            
                            <td>
                              <input
                                type="text"
                                value={row.Email}
                                onChange={(e) => handleInputChange(index, "Email", e.target.value)}
                                className="w-full"
                              />
                            </td>
                            <td>
                              <button
                                type="button"
                                onClick={() => handleDelete(index)}
                                className="text-red-500"
                              >
                                <FaTrash/>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="mt-4 text-end">
                      <button
                        type="submit"
                        className={`px-4 py-2 bg-blue-500 text-white rounded ${isSubmit ? "opacity-50 cursor-not-allowed" : ""}`}
                        disabled={isSubmit}
                      >
                        {isSubmit ? (
                          <div className="flex items-center">
                            <FaSpinner className="animate-spin mr-2" />
                            <span>Submitting...</span>
                          </div>
                        ) : (
                          "Final Submit"
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
            </> 
  );
};

export default MassUploadPlayer;