import { useState, useEffect, useRef } from "react";
import Select, { components } from "react-select";
import Image from "next/image";
import DefaultPic from "../../../public/default.jpg";
import { z } from "zod";
import { type PutBlobResult } from '@vercel/blob';
import { upload } from "@vercel/blob/client";
import { getSession, useSession } from "next-auth/react";
import FileUploader from "../FileUploader";
import { showError } from "../Toastr";
import CoverImage from '../../../public/coverImage.jpg'

 
type Coach = {
  id: number;
  firstName: string;
  clubName: string;
  image: string;
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
};

export default function TeamModal({
  team,
  onClose,
  onSubmit,
}: {
  team: FormValues | null;
  onClose: () => void;
  onSubmit: (formValues: FormValues) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const coverImageInputRef = useRef<HTMLInputElement | null>(null);
  const [creatorId, setCreatorId] = useState<string | null>(null);
  const [creatorName, setCreatorName] = useState<string | null>(null);
  const [coaches, setCoaches] = useState<{ value: string; label: string }[]>([]);
  const { data: session } = useSession();
  const [selectedCoach, setSelectedCoach] = useState<{ value: string; label: string } | null>(null);
  const [formValues, setFormValues] = useState<FormValues>({
    team_name: "",  // Default to empty string
    description: "",
    logo: "",
    created_by: "Coach",
    creator_id: 0,
    cover_image: "",
    team_type: "Men",
    team_year: "",
    coach_id:0,
    manager_name: "",
    manager_email: "",
    manager_phone: "",
    club_id:''
  });
  const [photoUploading, setPhotoUploading] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    
    const creatorId = session?.user?.id;
    const { name, value } = event.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
      created_by: "Coach",
      creator_id: typeof creatorId === "number" ? creatorId : Number(creatorId),
    }));
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

 
  useEffect(() => {
    

    if (team) {
      setFormValues({
        team_name: team.team_name || "",  // Ensure team_name is not undefined
        description: team.description || "",
        logo: team.logo || "",
        created_by: team.created_by || "Coach",
        creator_id: team.creator_id || 0,
        cover_image: team.cover_image || "",
        team_type: team.team_type || "",
        team_year: team.team_year || "",
        coach_id: team.coach_id || 0, 
      });
    }
  }, [team]);

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

  const handleCoachChange = (selectedOption: { value: string; label: string } | null) => {
    setSelectedCoach(selectedOption);
    setFormValues((prevValues) => ({
      ...prevValues,
      coach_id: Number(selectedOption?.value),

    }));
  };
  
    
    const handleSubmit = (e: React.FormEvent) => {
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
  
      if (!formValues.description) {
        showError("Description is required.");
        return;
      }

      // if (!formValues.manager_name) {
      //   showError("Manager Name is required.");
      //   return;
      // }
  
      // if (!formValues.manager_email) {
      //   showError("Manager Email is required.");
      //   return;
      // }

      // if (!formValues.manager_phone) {
      //   showError("Manager Phone is required.");
      //   return;
      // }

      if (!formValues.logo) {
        showError("Logo is required.");
        return;
      }
  
      if (!formValues.cover_image) {
        showError("Cover Image is required.");
        return;
      }
      if (session?.user.club_id) {
        formValues.club_id = session.user.club_id;
      } else {
        formValues.club_id = session?.user.id || '';
      }
   
     onSubmit(formValues);
    };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
  <div
    className="bg-white rounded-lg shadow-lg w-full max-w-6xl p-6 overflow-y-auto"
    style={{ maxHeight: '90vh' }}
  >
    <h2 className="text-xl font-bold mb-4">{team ? "Edit Team" : "Add Team"}</h2>
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* First Column: Team Details */}
      <div className="space-y-4 shadow p-8">
        <h3 className="text-lg font-bold border-b-2 border-black-300 pb-2">Team Details</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Name<span className="mandatory">*</span>
          </label>
          <input
            type="text"
            value={formValues.team_name}
            onChange={handleChange}
            name="team_name"
            className="border border-gray-300 rounded-lg py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
   
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Year<span className="mandatory">*</span>
          </label>
          <select
            value={formValues.team_year}
            onChange={handleChange}
            name="team_year"
            className="border border-gray-300 rounded-lg py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Year</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Team for<span className="mandatory">*</span>
          </label>
          <div className="flex space-x-6">
            <div className="flex items-center">
              <input
                type="radio"
                id="men"
                name="team_type"
                value="Men"
                checked={formValues.team_type === 'Men' || !formValues.team_type}
                onChange={handleChange}
                className="focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="men" className="ml-2 text-sm text-gray-700">Men</label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="women"
                name="team_type"
                value="Women"
                checked={formValues.team_type === 'Women'}
                onChange={handleChange}
                className="focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="women" className="ml-2 text-sm text-gray-700">Women</label>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description<span className="mandatory">*</span>
          </label>
          <textarea
            value={formValues.description}
            onChange={handleChange}
            name="description"
            className="border border-gray-300 rounded-lg py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>
      </div>

      {/* Second Column: Management Details */}
      {/* <div className="space-y-4 shadow p-8">
        <h3 className="text-lg font-bold border-b-2 border-black-300 pb-2">Manager Details</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Manager Name<span className="mandatory">*</span>
          </label>
          <input
            type="text"
            value={formValues.manager_name}
            onChange={handleChange}
            name="manager_name"
            className="border border-gray-300 rounded-lg py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Manager Email<span className="mandatory">*</span>
          </label>
          <input
            type="email"
            value={formValues.manager_email}
            onChange={handleChange}
            name="manager_email"
            className="border border-gray-300 rounded-lg py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Manager Phone<span className="mandatory">*</span>
          </label>
          <input
            type="tel"
            value={formValues.manager_phone}
            onChange={handleChange}
            name="manager_phone"
            className="border border-gray-300 rounded-lg py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div> */}

      {/* Third Column: Image Upload */}
      <div className="space-y-4 shadow p-8">
        <h3 className="text-lg font-bold border-b-2 border-black-300 pb-2">Images</h3>

        {/* Logo Image */}
        <div onClick={handleImageClick} className="cursor-pointer relative">
          <label className="block text-sm font-medium text-gray-700">
            Upload Logo<span className="mandatory">*</span>
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

        {/* Cover Image */}
        <div onClick={handleCoverImageClick} className="cursor-pointer relative">
          <label className="block text-sm font-medium text-gray-700">
            Upload Cover Image<span className="mandatory">*</span>
          </label>
          <div className="relative">
            <Image
              src={formValues.cover_image || CoverImage}
              alt="Cover Image"
              width={300}
              height={150}
              className="rounded-lg mx-auto"
            />
            <div className="text-xs absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white font-bold">
             Click to Upload
            </div>
          </div>
          <input
            type="file"
            accept="image/*"
            ref={coverImageInputRef}
            onChange={handleCoverImageChange}
            className="hidden"
          />
          {photoUploading && <FileUploader />}
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex justify-center space-x-4 mt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {team ? "Update" : "Add"}
        </button>
      </div>
    </form>
  </div>
</div>

  




  );
}
