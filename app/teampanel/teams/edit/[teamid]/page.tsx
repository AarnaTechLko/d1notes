"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic"; // Add this import

const Sidebar = dynamic(() => import('@/app/components/enterprise/Sidebar'), { ssr: false });
const FileUploader = dynamic(() => import('@/app/components/FileUploader'), { ssr: false });
const TeamModal = dynamic(() => import('@/app/components/enterprise/TeamModal'), { ssr: false });
import { getSession, useSession } from "next-auth/react";
import { useSearchParams } from 'next/navigation';
import Swal from "sweetalert2";
import DefaultPic from "../../../../public/default.jpg";
import Link from "next/link";
import { FaEdit, FaEye, FaTrash } from "react-icons/fa";
import CoverImage from '../../../../../public/coverImage.jpg';
import { showError, showSuccess } from "@/app/components/Toastr";
import { upload } from "@vercel/blob/client";
import Image from "next/image";
interface TeamProps {
    params: {
        teamid: string;
    };
}
type Team = {
    id?: number;
    team_name?: string;
    status?: string | undefined;
    description?: string;
    logo?: string;
    created_by?: string;
    creator_id?: number;
    team_type?: string;
    team_year?: string;
    slug?: string;
    cover_image?: string;
    firstName?: string;
    leage?: string;
    lastName?: string;
    coachSlug?: string;
    playerIds?: number[];
};
type FormValues = {
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
    coach_id?: number;
    playerIds?: number[];
    manager_name?: string;
    manager_email?: string;
    manager_phone?: string;
    club_id?: string;
    status?: string;
    leage?: string;
};
type Player = {
    id: number;
    image: string;
    first_name: string;
    last_name: string;
};

const EditTeam = ({ params }: TeamProps) => {


    const { data: session } = useSession();
    const { teamid } = params;
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const coverImageInputRef = useRef<HTMLInputElement | null>(null);
    const [playerList, setPlayerList] = useState([]);
    const [coachList, setCoachList] = useState([]);
    const [photoUploading, setPhotoUploading] = useState(false);
    const [formValues, setFormValues] = useState<FormValues>({
        id: 0,  // Default to empty string
        team_name: "",  // Default to empty string
        description: "",
        logo: "",
        created_by: "Enterprise",
        creator_id: 0,
        cover_image: "",
        team_type: "Men",
        team_year: "",
        coach_id: 0,
        manager_name: "",
        manager_email: "",
        manager_phone: "",
        club_id: "",
        status: ""
    });

    const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = event.target;
        setFormValues((prevValues) => ({
            ...prevValues,
            [name]: value,
        }));
    };

    const handleCoverImageChange = async () => {
        if (!coverImageInputRef.current?.files) {
            throw new Error("No file selected");
        }
        setPhotoUploading(true);

        const file = coverImageInputRef.current.files[0];

        // Create an Image object to check the dimensions
        const img = new window.Image();
        img.onload = async () => {
            const { width, height } = img;



            try {
                const newBlob = await upload(file.name, file, {
                    access: "public",
                    handleUploadUrl: "/api/uploads",
                });
                setPhotoUploading(false);
                const imageUrl = newBlob.url;
                setFormValues({ ...formValues, cover_image: imageUrl }); // Ensure new image URL is saved correctly
            } catch (error) {
                setPhotoUploading(false);
                console.error("Error uploading cover image:", error);
            }
        };

        img.onerror = () => {
            setPhotoUploading(false);
            showError("Error loading image.");
        };

        // Trigger the image loading
        img.src = URL.createObjectURL(file);
    };

    const handleImageChange = async () => {
        if (!fileInputRef.current?.files) {
            throw new Error("No file selected");
        }
        setPhotoUploading(true);
        const file = fileInputRef.current.files[0];

        try {
            const newBlob = await upload(file.name, file, {
                access: "public",
                handleUploadUrl: "/api/uploads",
            });
            setPhotoUploading(false);
            const imageUrl = newBlob.url;
            setFormValues({ ...formValues, logo: imageUrl });
        } catch (error) {
            setPhotoUploading(false);
            console.error("Error uploading file:", error);
        }
    };
    const handleCoverImageClick = () => {
        if (coverImageInputRef.current) {
            coverImageInputRef.current.click(); // Trigger cover image input click
        }
    };

    const handleImageClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click(); // Trigger cover image input click
        }
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Custom Validation
        if (!formValues.team_name) {
            showError("Team Name is required.");
            return;
        }



        if (!formValues.team_year) {
            showError("Team Year is required.");
            return;
        }

        if (!formValues.team_type) {
            showError("Team Type is required.");
            return;
        }


        if (!formValues.logo) {
            showError("Logo is required.");
            return;
        }

        // if (!formValues.cover_image) {
        //     showError("Cover Image is required.");
        //     return;
        // }

        if (session?.user.club_id) {
            formValues.club_id = session.user.club_id;
            formValues.creator_id = Number(session.user.id);
        } else {
            formValues.club_id = session?.user.id || '';
        }

        const response = await fetch("/api/teams", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formValues),
        });

        if (!response.ok) {
            const errorData = await response.json();
            showError(errorData.message || "Something went wrong!");
        }
        else {
            showSuccess("Team Updated Successfully.");
        }


    };


    const teamId = teamid;

    const fetchTeam = async (teamId: any) => {
        try {

            const session = await getSession();
            const enterprise_id = session?.user?.id;
            const response = await fetch(`/api/enterprise/teams?team_id=${teamId}`);
            const data = await response.json();
            setFormValues(data.teamData[0]);
            setPlayerList(data.playersData);
            setCoachList(data.coachesData);

        } catch (error) {
            console.error("Error fetching coaches:", error);
        }
    };


    useEffect(() => {
        if (teamId) {
            fetchTeam(teamId);
        }
    }, [teamId]);




    const handleDelete = async (teamId: any, id: any, type: any) => {
        // Show SweetAlert confirmation dialog
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `This will remove this ${type} from this team!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, keep it',
        });

        // If the user confirms, proceed with the deletion
        if (result.isConfirmed) {
            try {
                const res = await fetch(`/api/teams/removal`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id, type, teamid: teamId }), // Pass the necessary parameters
                });

                if (res.ok) {
                    showSuccess('Coach deleted successfully!');
                    fetchTeam(teamId);
                } else {
                    const data = await res.json();
                    showError(data.message || 'Failed to delete coach');
                }
            } catch (error) {
                showError('An error occurred while deleting the coach');
            } finally {
                //setLoading(false);
            }
        }
    };

    return (
        <div className="flex h-screen">
            <Sidebar />
            <main className="flex-grow bg-gray-100 p-4 overflow-x-auto">
                <div className="bg-white shadow-md rounded-lg p-6">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* First Column: Team Details */}
                        <div className="space-y-4 shadow p-8">
                            <h3 className="text-lg font-bold border-b-2 border-black-300 pb-2">Team Details</h3>
                            <div onClick={handleImageClick} className="cursor-pointer relative">
                                <label className="block text-sm font-medium text-gray-700">
                                    Team Logo<span className="mandatory">*</span>
                                </label>
                                <div className="relative">
                                    <Image
                                        src={formValues.logo || DefaultPic}
                                        alt="Team Logo"
                                        width={100}
                                        height={100}
                                        className="rounded-full mx-auto"
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white font-bold h-10 w-[95px] mx-auto text-xs rounded top-8">
                                        Click to Upload
                                    </div>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                                {photoUploading && <FileUploader />}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Name<span className="mandatory">*</span>
                                </label>
                                <input
                                    placeholder="Ex. LA Storm Blue"
                                    type="text"
                                    value={formValues.team_name}
                                    onChange={handleChange}
                                    name="team_name"
                                    className="border border-gray-300 rounded-lg py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            {/* <div>
          <label className="block text-sm font-medium text-gray-700">
            Coach<span className="mandatory">*</span>
          </label>
          <Select
            options={coaches ?? []}
            value={selectedCoach}
            onChange={handleCoachChange}
            isClearable
            placeholder="Select"
            formatOptionLabel={getOptionLabel}
            components={{ Option: CustomOption }}
          />
        </div> */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Age<span className="mandatory">*</span>
                                </label>
                                <select
                                    value={formValues.team_year}
                                    onChange={handleChange}
                                    name="team_year"
                                    className="border border-gray-300 rounded-lg py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select</option>
                                    <option value="2024">2024</option>
                                    <option value="2025">2025</option>
                                    <option value="2026">2026</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Gender<span className="mandatory">*</span>
                                </label>
                                <select
                                    value={formValues.team_type}
                                    onChange={handleChange}
                                    name="team_type"
                                    className="border border-gray-300 rounded-lg py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>

                                </select>

                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Status<span className="mandatory">*</span>
                                </label>
                                <select
                                    value={formValues.status}
                                    onChange={handleChange}
                                    name="status"
                                    className="border border-gray-300 rounded-lg py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select</option>
                                    <option value="Active">Active</option>
                                    <option value="Not Active">Not Active</option>

                                </select>

                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Leage<span className="mandatory">*</span>
                                </label>
                                <input
                                    placeholder="Ex. MLS, ECNL, NPL, AYSO, etc..."
                                    type="text"
                                    value={formValues.leage}
                                    onChange={handleChange}
                                    name="leage"
                                    className="border border-gray-300 rounded-lg py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex justify-center space-x-4 mt-4">
                                <button
                                    type="button"

                                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    Update
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4 shadow p-8">
                        <h3 className="text-lg font-bold border-b-2 border-black-300 pb-2">Coaches</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full table-auto">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="px-4 py-2 text-left">Image</th>
                                        <th className="px-4 py-2 text-left">Name</th>
                                        <th className="px-4 py-2 text-center">Remove</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {coachList.map((coach: any) => (
                                        <tr className="border-t" key={coach.id}>
                                            <td className="px-4 py-2">
                                                {coach.image != 'null' ? (
                                                    <img
                                                        src={coach.image}
                                                        alt="Coach"
                                                        className="h-10 w-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <img
                                                        src={'/default.jpg'}
                                                        alt="Coach"
                                                        className="h-10 w-10 rounded-full object-cover"
                                                    />
                                                )}



                                            </td>
                                            <td className="px-4 py-2">{coach.first_name} {coach.last_name}</td>
                                            <td className="px-4 py-2 text-center">
                                                <button className="text-red-500 hover:text-red-700" onClick={() => handleDelete(teamid, coach.coachId, "coach")}>
                                                    <FaTrash />
                                                </button>
                                            </td>
                                        </tr>

                                    ))}
                                    {/* Repeat rows as needed */}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="space-y-4 shadow p-8">
                        <h3 className="text-lg font-bold border-b-2 border-black-300 pb-2">Players</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full table-auto">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="px-4 py-2 text-left">Image</th>
                                        <th className="px-4 py-2 text-left">Name</th>
                                        <th className="px-4 py-2 text-center">Remove</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {playerList.map((player: any) => (
                                        <tr className="border-t" key={player.id}>
                                            <td className="px-4 py-2">
                                                {player.image != null ? (
                                                    <img
                                                        src={player.image}
                                                        alt="Coach"
                                                        className="h-10 w-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <img
                                                        src={'/default.jpg'}
                                                        alt="player"
                                                        className="h-10 w-10 rounded-full object-cover"
                                                    />
                                                )}



                                            </td>
                                            <td className="px-4 py-2">{player.first_name} {player.last_name}</td>
                                            <td className="px-4 py-2 text-center">
                                                <button className="text-red-500 hover:text-red-700"
                                                    onClick={() => handleDelete(teamid, player.playerId, "player")}>
                                                    <FaTrash />
                                                </button>
                                            </td>
                                        </tr>

                                    ))}
                                    {/* Repeat rows as needed */}
                                </tbody>
                            </table>
                        </div>
                    </div>


                    </form>
                </div>

               

            </main>
        </div>
    );
}
export default EditTeam;
