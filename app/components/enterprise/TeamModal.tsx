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
  age_group?: string;
  club_id?: string;
  status?: string;
  leage?: string;
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
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const ageGroups = ["U6", "U7", "U8", "U9", "U10","U11","U12","U13","U14","U15","U16","U17","U18","U19","High School","College","Semi Pro","Pro"];
  const birthYears = Array.from({ length: 36 }, (_, i) => 1985 + i);
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
    created_by: "Enterprise",
    creator_id: 0,
    cover_image: "",
    team_type: "Men",
    team_year: "",
    coach_id:0,
    manager_name: "",
    manager_email: "",
    manager_phone: "",
    club_id: "",
    leage: "",
    status: "Active"
  });
  const [photoUploading, setPhotoUploading] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
      created_by: "Enterprise",
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

  const CustomOption = (props: any) => {
    const { data, innerRef, innerProps } = props;
    return (
      <div ref={innerRef} {...innerProps} className="p-4">
        {data.photo !='null' && (
          <img
            src={data.photo ?? '/default.jpg'}
            alt={data.label}
            width={40}
            height={40}
            className="rounded-full mr-4"
          />
        )}
         {data.photo =='null' && (
          <img
            src={'/default.jpg'}
            alt={data.label}
            width={40}
            height={40}
            className="rounded-full mr-4"
          />
        )}
         <span className="font-bold">{data.label}</span>
          <div>{data.firstName}</div>
          <div>{data.clubName}</div>
        <div>
         
          {/* Add any other information you want */}
        </div>
      </div>
    );
  };

  const getOptionLabel = (data: any) => (
    <div className="flex flex-col space-y-1 text-center">
      {data.photo !='null' && (
          <img
            src={data.photo ?? '/default.jpg'}
            alt={data.label}
            width={40}
            height={40}
            className="rounded-full m-auto"
          />
        )}
         {data.photo =='null' && (
          <img
            src={'/default.jpg'}
            alt={data.label}
            width={40}
            height={40}
            className="rounded-full m-auto"
          />
        )}
      <div className="text-center font-bold">{data.label}</div>

      {/* Add any other information you want */}
    </div>
  );
  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        const session = await getSession();
        const enterprise_id = session?.user?.id;
        const response = await fetch(`/api/enterprise/coach?enterprise_id=${enterprise_id}`);
        const data = await response.json();
        const formattedCoaches = data.map((coach: Coach) => ({
          value: coach.id.toString(),
          label: `${coach.firstName} (${coach.clubName})`,
          photo: coach.image,
        }));
        setCoaches(formattedCoaches);
        if (team?.coach_id) {
          const matchedCoach = formattedCoaches.find(
            (coach:any) => coach.value === team?.coach_id?.toString() || undefined
          );
          setSelectedCoach(matchedCoach || null);
        }
      } catch (error) {
        console.error("Error fetching coaches:", error);
      }
    };
    const fetchUserData = async () => {
      const session = await getSession();
      setCreatorId(session?.user?.id || "");
      setCreatorName(session?.user?.name || "");
    };
    fetchCoaches();
    fetchUserData();

    if (team) {
      setFormValues({
        team_name: team.team_name || "",  // Ensure team_name is not undefined
        description: team.description || "",
        logo: team.logo || "",
        created_by: team.created_by || "Enterprise",
        creator_id: team.creator_id || 0,
        cover_image: team.cover_image || "",
        team_type: team.team_type || "",
        team_year: team.team_year || "",
        leage: team.leage || "",
        coach_id: team.coach_id || 0, 
        status: team.status || "", 
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
  
      // if (!formValues.coach_id) {
      //   showError("Coach is required.");
      //   return;
      // }
     
  if(!selectedOption)
  {
    showError("Select Age Group or Birth Year");
    return;
  }
  if(selectedOption!='ageGroup')
  {
    if (!formValues.team_year) {
      showError("Select Birth Year.");
      return;
    }
  }
  else{
    if (!formValues.age_group) {
      showError("Select Age Group.");
      return;
    }
  }
      
  
      if (!formValues.team_type) {
        showError("Team Type is required.");
        return;
      }
  
      if (!formValues.leage) {
        showError("Leage is required.");
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
        formValues.logo = session?.user.image || '';
         //setFormValues({ ...formValues, logo: session?.user.image || '' });
        // showError("Logo is required.");
        // return;
      }
  
      // if (!formValues.cover_image) {
      //   showError("Cover Image is required.");
      //   return;
      // }

      if (session?.user.club_id) {
        formValues.club_id = session.user.club_id;
      } else {
        formValues.club_id = session?.user.id || '';
      }
   console.log(formValues);
     onSubmit(formValues);
    };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
  <div
    className="bg-white rounded-lg shadow-lg w-[500px] max-w-6xl p-6 overflow-y-auto"
    style={{ maxHeight: '90vh' }}
  >
    <h2 className="text-xl font-bold mb-4">{team ? "Edit Team Manually" : "Add Team Manually"}</h2>
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-1 gap-6">
      {/* First Column: Team Details */}
      
      <div className="space-y-4 shadow p-8">
        
        <div>
      <div onClick={handleImageClick} className="cursor-pointer relative">
          <label className="block text-sm font-medium text-gray-700">
            Team Logo
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
        {/* <div>
          <label className="block text-sm font-medium text-gray-700">
            Year <span className="mandatory">*</span>
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
        </div> */}
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
        <div className="space-x-4 mb-4">
          Age<span className="mandatory">*</span>:
          </div>
        <div className="space-x-4 mb-4">
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="radio"
            name="option"
            value="ageGroup"
            checked={selectedOption === "ageGroup"}
            onChange={() => setSelectedOption("ageGroup")}
            className="hidden"
          />
          <span
            className={`px-4 py-2 rounded-full ${
              selectedOption === "ageGroup"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            Age Group
          </span>
        </label>

        <label className="inline-flex items-center cursor-pointer">
          <input
            type="radio"
            name="option"
            value="birthYear"
            checked={selectedOption === "birthYear"}
            onChange={() => setSelectedOption("birthYear")}
            className="hidden"
          />
          <span
            className={`px-4 py-2 rounded-full ${
              selectedOption === "birthYear"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            Birth Year
          </span>
        </label>
      </div>

      {/* Dropdowns */}
      {selectedOption === "ageGroup" && (
        <select className="w-full p-2 border rounded-md" name="age_group" onChange={handleChange} value={formValues.age_group}>
          <option value="">Select Age Group</option>
          {ageGroups.map((group) => (
            <option key={group} value={group}>
              {group}
            </option>
          ))}
        </select>
      )}

      {selectedOption === "birthYear" && (
        <select className="w-full p-2 border rounded-md" name="team_year" onChange={handleChange} value={formValues.team_year}>
          <option value="">Select Birth Year</option>
          {birthYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      )}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            League<span className="mandatory">*</span>
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
      </div>

     
     
     
    </form>
  </div>
</div>

  




  );
}
