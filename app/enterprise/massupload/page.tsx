"use client";
import React, { useEffect, useRef, useState } from 'react';
import { useSession, getSession } from 'next-auth/react';
import Sidebar from '../../components/enterprise/Sidebar';
import PlayerForm from '@/app/components/coach/PlayerForm';
import { showError, showSuccess } from '@/app/components/Toastr';
import defaultImage from '../../public/default.jpg';
import { FaCheck, FaCross, FaSpinner } from 'react-icons/fa';
import { type PutBlobResult } from '@vercel/blob';
import { upload } from '@vercel/blob/client';
import { useRouter } from 'next/navigation';

import FileUploader from '@/app/components/FileUploader';
import Papa from 'papaparse';
// Define the type for the coach data


type Team = {
    id?: number;
    team_name?: string;
    description?: string;
    logo?: string;
    created_by?: string;
    creator_id?: number;
    team_type?: string;
    team_year?: string;
    slug?: string;
    cover_image?: string;
    firstName?: string;
    lastName?: string;
    coachSlug?: string;
    playerIds?: number[];
};
const Home: React.FC = () => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [search, setSearch] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [selectedTeam, setSelectedTeam] = useState<string>('');

    const [showModal, setShowModal] = useState<boolean>(false);
    const [showLicenseNoModal, setShowLicenseNoModal] = useState<boolean>(false);
    const [bulkUpload, setBulkUpload] = useState<boolean>(false);
    const [isSubmit, setIsSubmit] = useState<boolean>(false);
    const [licenseKey, setLicenseKey] = useState<string>('');
    const limit = 10; // Items per page
    const [loadingKey, setLoadingKey] = useState<boolean>(false);
    const [isuploadingcsv, setIsuploadingcsv] = useState<boolean>(false);
    const [file, setFile] = useState<File | null>(null);
    const { data: session } = useSession();
    const [csvData, setCsvData] = useState<any[]>([]);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const router = useRouter();
    const fetchTeams = async () => {
        if (!session || !session.user?.id) {
            console.error("No user logged in");
            return;
        }

        try {
           
            const res = await fetch(`/api/coach/teams?enterprise_id=${session.user.id}`);
            if (!res.ok) throw new Error("Failed to fetch teams");
            const { data, teamplayersList }: { data: Team[]; teamplayersList: any[] } = await res.json();
            setTeams(data);
            const updatedTeams = data.map((team) => ({
                ...team,
                playerIds: teamplayersList
                    .filter((player) => player.teamId === team.id)
                    .map((player) => player.playerId),
            }));
           
            setTeams(updatedTeams);
        } catch (error) {
            console.error("Error fetching teams:", error);
        }
    };
    const handleUpload = async () => {
        setIsuploadingcsv(true);
        
        // Validate file selection
        if (!fileInputRef.current?.files?.length) {
            setIsuploadingcsv(false);
            showError("Please select a file to upload.");
            return;
        }
        

        const file = fileInputRef.current.files[0];

        try {
            const newBlob = await upload(file.name, file, {
                access: 'public',
                handleUploadUrl: '/api/uploads/csvupload/',
            });

            const imageUrl = newBlob.url;
            console.log(imageUrl);

            // Fetch the CSV file from the uploaded blob URL
            const response = await fetch(imageUrl);
            const csvData = await response.text(); // Get the CSV content as text

            // Parse the CSV data into JSON
            const { data } = Papa.parse(csvData, { header: true, skipEmptyLines: true });


            console.log('Parsed CSV data:', data);
            setCsvData(data);
            setIsuploadingcsv(false)
           
            // You can now use the parsed JSON data
        } catch (error) {
            setIsuploadingcsv(false)
            showError("Error in Uploading CSV");
        }
    };







    const handleInputChange = (index: any, field: any, value: any) => {
        const updatedCsvData = [...csvData];
        updatedCsvData[index][field] = value;
        setCsvData(updatedCsvData);
    };
    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setIsSubmit(true);
        try {

            const userId = session?.user.id;
            const response = await fetch("/api/uploads/csvupload/insert", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    coach_id: null,
                    enterprise_id: session?.user.id,
                    team_id:null,
                    csvData,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to fetch license");
            }
         
            setIsSubmit(false);
            setBulkUpload(false);
            showSuccess("Successfully Imported Players.");
            router.push('/enterprise/players');
        } catch (error) {
            setIsSubmit(false);
        }




    }
    const handleDelete = async (id: any) => {
        const updatedData = csvData.filter((_, i) => i !== id);
        // Update the state
        setCsvData(updatedData);

    };

    useEffect(() => {
        fetchTeams();
      
      }, [session]);

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-grow h-screen bg-gray-100 p-4 overflow-auto">

                <div className=" w-full h-screenflex justify-center items-center">
                    <div className="bg-white h-screen p-4 rounded-lg w-[100%]  overflow-hidden relative">
                        <div className="absolute top-0 left-0 right-0 bg-white p-4 flex justify-between items-center border-b">
                            <h2 className="text-xl font-semibold text-gray-800">Bulk Upload Players</h2>

                        </div>
                        <div className="pt-16 pb-4 overflow-y-auto h-screen">
                      
                            <div className=' mt-5'>
                            <label className='block text-gray-700 text-sm font-semibold mb-2'>Upload CSV File<span className='mandatory'>*</span></label>
                                <input
                                className='border border-gray-300 rounded-lg py-2 px-4 w-[350px]'
                                    type="file"
                                    accept=".csv"
                                   
                                    ref={fileInputRef}
                                />
                                <p className='text-sm text-blue-400'>(<a href='/playercsvsample.csv' download>Click Here to download sample csv file</a>)</p>
                                

                            </div>

                            <div className=' mt-5'>
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

                            {csvData.length > 0 && (
                                <form onSubmit={handleSubmit}>
                                    <div className="mt-4">
                                        <h3 className="font-semibold">CSV Data Preview</h3>
                                        <p className='text-sm text-red-600'>(This is the preview of the CSV data you are trying to upload. You can edit values as per your wish.)</p>
                                        <table className="w-full mt-2">
                                            <thead>
                                                <tr>
                                                    <th>First Name</th>
                                                    <th>Last Name</th>
                                                    <th>Email</th>
                                                    <th>Country Code</th>
                                                    <th>Phone Number</th>
                                                    <th>League</th>
                                                    <th>Experience</th>
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
                                                                    handleInputChange(index, 'FirstName', e.target.value)
                                                                }
                                                                className="w-full"
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="text"
                                                                value={row.LastName}
                                                                onChange={(e) =>
                                                                    handleInputChange(index, 'LastName', e.target.value)
                                                                }
                                                                className="w-full"
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="text"
                                                                value={row.Email}
                                                                onChange={(e) =>
                                                                    handleInputChange(index, 'Email', e.target.value)
                                                                }
                                                                className="w-full"
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="text"
                                                                value={row.CountryCode}
                                                                onChange={(e) =>
                                                                    handleInputChange(index, 'CountryCode', e.target.value)
                                                                }
                                                                className="w-full"
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="text"
                                                                value={row.PhoneNumber}
                                                                onChange={(e) =>
                                                                    handleInputChange(index, 'PhoneNumber', e.target.value)
                                                                }
                                                                className="w-full"
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="text"
                                                                value={row.League}
                                                                onChange={(e) =>
                                                                    handleInputChange(index, 'League', e.target.value)
                                                                }
                                                                className="w-full"
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="text"
                                                                value={row.Experience}
                                                                onChange={(e) =>
                                                                    handleInputChange(index, 'Experience', e.target.value)
                                                                }
                                                                className="w-full"
                                                            />
                                                        </td>
                                                        <td>
                                                            <a
                                                                href="#"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    handleDelete(index);
                                                                }}
                                                            >
                                                                🗑️
                                                            </a>
                                                        </td>
                                                    </tr>
                                                ))}
                                                <tr>
                                                    <td colSpan={8} className='text-center'>
                                                        <button
                                                            type="submit"
                                                            className={`mt-4 px-4 py-2 bg-blue-500 text-white rounded ${isSubmit ? "opacity-50 cursor-not-allowed" : ""
                                                                }`}
                                                            disabled={isSubmit}
                                                        >
                                                            {isSubmit ? (
                                                                <div className="flex items-center">
                                                                    <FaSpinner className="animate-spin mr-2" />
                                                                    Submitting...
                                                                </div>
                                                            ) : (
                                                                "Final Submit"
                                                            )}
                                                        </button>

                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
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
