"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import DefaultPic from "../../../public/default.jpg";
import { z } from "zod";
import { type PutBlobResult } from '@vercel/blob';
import { upload } from "@vercel/blob/client";
import { getSession } from "next-auth/react";
import FileUploader from "../FileUploader";

const formSchema = z.object({
  team_name: z.string().min(1, "Team Name is required."),
  description: z.string().min(1, "Description is required."),
  logo: z.string(), // URL for logo
  created_by: z.string(), // Name of the creator
  creator_id: z.string(), 
});

type FormValues = z.infer<typeof formSchema>;

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
  const [creatorId, setCreatorId] = useState<string | null>(null);
const [creatorName, setCreatorName] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<FormValues>({
    team_name: "",
    description: "",
    logo: "",
    created_by:"",
    creator_id:""
  });
  const [photoUploading, setPhotoUploading] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormValues({ ...formValues, [name]: value });
    setFormValues((prevValues) => ({
        ...prevValues,
        [name]: value,
        created_by: "Coach",
        creator_id: creatorId || "",
      }));
  };

  useEffect(() => {
    const fetchUserData = async () => {
        const session = await getSession(); // Replace with your auth/session retrieval logic
        setCreatorId(session?.user?.id || ""); // Replace `id` with your session's user ID field
         // Replace `name` with your session's user name field
      };
    
      fetchUserData();
    if (team) {
      setFormValues(team);
    }
  }, [team]);

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Trigger file input click
    }
  };

  const handleImageChange = async () => {
    if (!fileInputRef.current?.files) {
        throw new Error('No file selected');
      }
      setPhotoUploading(true);
      const file = fileInputRef.current.files[0];
  
      try {
        const newBlob = await upload(file.name, file, {
          access: 'public',
          handleUploadUrl: '/api/uploads',
        });
        setPhotoUploading(false);
        const imageUrl = newBlob.url;
        setFormValues({ ...formValues, logo: imageUrl });
        
      } catch (error) {
        setPhotoUploading(false);
        console.error('Error uploading file:', error);
      }
};

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = formSchema.safeParse(formValues);
    if (!validation.success) {
      alert(validation.error.issues.map((issue) => issue.message).join("\n"));
      return;
    }

    onSubmit(validation.data);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
        <h2 className="text-xl font-bold mb-4">{team ? "Edit Team" : "Add Team"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={formValues.team_name}
              onChange={handleChange}
              name="team_name"
              className="border border-gray-300 rounded-lg py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formValues.description}
              onChange={handleChange}
              name="description"
              className="border border-gray-300 rounded-lg py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
          <div onClick={handleImageClick} className="cursor-pointer">
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
             {photoUploading ? (
                                            <>
                                                <FileUploader/>
                                            </>
                                        ) : (
                                            <>
                                                
                                            </>
                                        )}
          </div>
          <div className="flex justify-end space-x-4">
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
