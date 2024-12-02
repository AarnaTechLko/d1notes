import { useState, useEffect, useRef } from "react";
import Select, { components } from "react-select";
import Image from "next/image";
import DefaultPic from "../../../public/default.jpg";
import { z } from "zod";
import { type PutBlobResult } from '@vercel/blob';
import { upload } from "@vercel/blob/client";
import { getSession } from "next-auth/react";
import FileUploader from "../FileUploader";
import { showError } from "../Toastr";
import CoverImage from '../../../public/coverImage.jpg'

const formSchema = z.object({
  team_name: z.string().min(1, "Team Name is required.").optional(),
  description: z.string().min(1, "Description is required.").optional(),
  logo: z.string().optional(), // URL for logo
  created_by: z.string().optional(),
  creator_id: z.number().optional(),
  cover_image: z.string().optional(),
  team_type: z.string().optional(),
  team_year: z.string().optional(),
  coach_id: z.number().optional(),
});
type Coach = {
  id: number;
  firstName: string;
  clubName: string;
  image: string;
};
type FormValues = z.infer<typeof formSchema> & {
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

  const [selectedCoach, setSelectedCoach] = useState<{ value: string; label: string } | null>(null);
  const [formValues, setFormValues] = useState<FormValues>({
    team_name: "",  // Default to empty string
    description: "",
    logo: "",
    created_by: "Enterprise",
    creator_id: 0,
    cover_image: "",
    team_type: "",
    team_year: "",
    coach_id:0
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
        {data.photo && (
          <img
            src={data.photo}
            alt={data.label}
            width={40}
            height={40}
            className="rounded-full mr-4"
          />
        )}
        <div>
          <span className="font-bold">{data.label}</span>
          <div>{data.firstName}</div>
          <div>{data.clubName}</div>
          {/* Add any other information you want */}
        </div>
      </div>
    );
  };

  const getOptionLabel = (data: any) => (
    <div className="flex flex-col space-y-1">
      {data.photo && (
        <img
          src={data.photo}
          alt={data.label}
          width={40}
          height={40}
          className="rounded-full mx-auto"
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

      // Validate aspect ratio (16:9)
      if (width / height !== 16 / 9) {
        setPhotoUploading(false);
        showError("Cover image must have a 16:9 aspect ratio.");
        return;
      }

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
    console.log("hitting");
    const validation = formSchema.safeParse(formValues);
    console.log(formValues);
    if (!validation.success) {
      showError(validation.error.issues.map((issue) => issue.message).join("\n"));
      return;
    }

    onSubmit(validation.data);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6">
        <h2 className="text-xl font-bold mb-4">{team ? "Edit Team" : "Add Team"}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First Column */}
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
                Coach<span className="mandatory">*</span>
              </label>
              <Select
                options={coaches ?? []}
                value={selectedCoach}
                onChange={handleCoachChange}
                isClearable
                placeholder="Select a Coach"
                formatOptionLabel={getOptionLabel}  // Use formatOptionLabel instead of getOptionLabel
                components={{ Option: CustomOption }} // Use custom Option component
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

          {/* Second Column */}
          <div className="space-y-4 shadow p-8 ml-1">

            <h3 className="text-lg font-bold border-b-2 border-black-300 pb-2">Images</h3>
            <div onClick={handleImageClick} className="cursor-pointer">
              <label className="block text-sm font-medium text-gray-700">
                Upload Logo<span className="mandatory">*</span>
              </label>
              <Image
                src={formValues.logo || DefaultPic}
                alt="Team Logo"
                width={100}
                height={100}
                className="rounded-full mx-auto"
              />
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
              />
              {photoUploading && <FileUploader />}
            </div>
            <div onClick={handleCoverImageClick} className="cursor-pointer">
              <label className="block text-sm font-medium text-gray-700">
                Upload Cover Image <span className="mandatory">(Aspect ratio 16:9 mandatory)</span>
              </label>
              <Image
                src={formValues.cover_image || CoverImage}
                alt="Cover Image"
                width={300}
                height={150}
                className="rounded-lg mx-auto"
              />
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

          <div className="flex">
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
