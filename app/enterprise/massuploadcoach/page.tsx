"use client";
import React, { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Sidebar from "../../components/enterprise/Sidebar";
import { showError, showSuccess } from "@/app/components/Toastr";
import { FaCheck, FaSpinner } from "react-icons/fa";
import Papa from "papaparse";

type Team = {
  id?: number;
  team_name?: string;
};

const Home: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [iscsvUploaded, setIscsvUploaded] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [isuploadingcsv, setIsuploadingcsv] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [isSubmit, setIsSubmit] = useState(false);
  const [showUploadControls, setShowUploadControls] = useState(true);
  const { data: session } = useSession();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmit(true);
    try {
      const response = await fetch("/api/uploads/csvupload/coach/insert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enterprise_id: session?.user.id,
          csvData,
        }),
      });
      if (!response.ok) throw new Error("Failed to submit data");

      setShowUploadControls(false);
      showSuccess("Successfully Imported Players.");
      setIsSubmit(false);
    } catch (error) {
      setIsSubmit(false);
      showError("Error in submission.");
    }
  };

  const handleDelete = (index: number) => {
    const updatedData = csvData.filter((_, i) => i !== index);
    setCsvData(updatedData);
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
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-grow h-screen bg-gray-100 p-4 overflow-auto">
        <div className="w-full h-screen flex justify-center items-center">
          <div className="bg-white h-screen p-4 rounded-lg w-[100%] overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 bg-white p-4 flex justify-between items-center border-b">
              <h2 className="text-xl font-semibold text-gray-800">Mass Upload Coach</h2>
            </div>
            <div className="pt-16 pb-4 overflow-y-auto h-screen">
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
                    <p className="text-sm text-blue-400"><a href="/CoachCsvSample.csv" download>Click Here to Download Sample CSV</a></p>
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
              {csvData.length > 0 && (
                <form onSubmit={handleSubmit}>
                  <div className="mt-4">
                  <div className="w-full flex items-center justify-between">
  <div>
    <h3 className="font-semibold">CSV Data Preview</h3>
    <p className="text-sm text-red-600">
      (Preview of the CSV data. You can edit values before submission.)
    </p>
  </div>
  <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-blue-600" onClick={handleOpenControl}>
    Go Back
  </button>
</div>
  
                    <table className="w-full mt-2">
                      <thead>
                        <tr>
                          <th>First Name</th>
                          <th>Last Name</th>
                          <th>Email</th>
                          <th>Country Code</th>
                          <th>Phone Number</th>
                          <th>Evaluation Charges</th>
                          
                          <th>Remove</th>
                        </tr>
                      </thead>
                      <tbody>
                        {csvData.map((row, index) => (
                          <tr key={index}>
                            <td>
                              <input
                                type="text"
                                value={row.FirstName}
                                onChange={(e) =>
                                  handleInputChange(index, "FirstName", e.target.value)
                                }
                                className="w-full"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                value={row.LastName}
                                onChange={(e) =>
                                  handleInputChange(index, "LastName", e.target.value)
                                }
                                className="w-full"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                value={row.Email}
                                onChange={(e) =>
                                  handleInputChange(index, "Email", e.target.value)
                                }
                                className="w-full"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                value={row.CountryCode}
                                onChange={(e) =>
                                  handleInputChange(index, "CountryCode", e.target.value)
                                }
                                className="w-full"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                value={row.PhoneNumber}
                                onChange={(e) =>
                                  handleInputChange(index, "PhoneNumber", e.target.value)
                                }
                                className="w-full"
                              />
                            </td>
                            <td className="flex">
                              $<input
                                type="text"
                                value={row.EvaluationCharges}
                                onChange={(e) =>
                                  handleInputChange(index, "League", e.target.value)
                                }
                                className="w-full"
                              />
                            </td>
                            
                            <td>
                              <button
                                type="button"
                                onClick={() => handleDelete(index)}
                                className="text-red-500"
                              >
                                🗑️
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="mt-4">
                      <button
                        type="submit"
                        className={`px-4 py-2 bg-blue-500 text-white rounded ${
                          isSubmit ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        disabled={isSubmit}
                      >
                        {isSubmit ? (
                          <>
                            <FaSpinner className="animate-spin mr-2" />
                            Submitting...
                          </>
                        ) : (
                          "Final Submit"
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
