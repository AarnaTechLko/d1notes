"use client";
import React, { useState, useRef, useEffect } from 'react';
import { getSession, useSession } from 'next-auth/react';
import Sidebar from '../components/Sidebar';
import Image from 'next/image'; // Ensure Image is imported for proper image rendering
import { showError, showSuccess } from '../components/Toastr'; // Assuming showError is defined in Toastr
import { upload } from "@vercel/blob/client";
import DefaultPic from "../../public/default.jpg";
import FileUploader from '../components/FileUploader';
import { FaTrash } from 'react-icons/fa';
import DefaultBanner from  '../../public/defaultBanner.png'

const Banners: React.FC = () => {
    const [playerId, setPlayerId] = useState<number | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [photoUploading, setPhotoUploading] = useState<boolean>(false);
    const [banners, setBanners] = useState<any[]>([]);
    const { data: session } = useSession();
    const coverImageInputRef = useRef<HTMLInputElement | null>(null);
    const [bannerPhoto,setBannerPhoto]=useState<string | null>(null)
 

    // Handle file input change
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files ? e.target.files[0] : null;
        setFile(selectedFile);
    };

    // Handle click on the cover image to open file input
    const handleCoverImageClick = () => {
        if (coverImageInputRef.current) {
            coverImageInputRef.current.click(); // Trigger the input click event
        }
    };

    // Handle cover image change and upload
    const handleCoverImageChange = async () => {
        if (!coverImageInputRef.current?.files) {
            showError('No file selected');
            return;
        }
        setPhotoUploading(true);

        const file = coverImageInputRef.current.files[0];
        const img = new window.Image();

        img.onload = async () => {
            try {
                // Use the @vercel/blob client for uploading the image
                const newBlob = await upload(file.name, file, { access: "public", handleUploadUrl: "/api/uploads" });
                setPhotoUploading(false);
                const imageUrl = newBlob.url;
                setBannerPhoto(imageUrl); // Save new image URL
            } catch (error) {
                setPhotoUploading(false);
                showError("Error uploading cover image.");
            }
        };

        img.onerror = () => {
            setPhotoUploading(false);
            showError("Error loading image.");
        };

        img.src = URL.createObjectURL(file); // Trigger the image loading
    };

    // Handle form submission
    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        const session = await getSession();
        const playerId = session?.user?.id;
        const usertype = session?.user?.type;

        if (!bannerPhoto || !playerId) {
            showError('Please select an image and ensure you are logged in.');
            return;
        }

        // Construct the JSON object to send
        const requestBody = {
            user_id: Number(playerId),
            filepath:bannerPhoto,
            usertype:usertype
        };

        try {
            const response = await fetch('/api/banners', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody), // Send the request body as JSON
            });

            const result = await response.json();
            if (response.ok) {
                showSuccess('Banner uploaded successfully!');
                fetchBanners();

            } else {
                showError(`Error: ${result.error}`);
            }
        } catch (error) {
            showError('An error occurred while uploading the banner');
        }
    };

    const handleDelete = async (bannerId: number) => {
        try {
            const response = await fetch(`/api/banners/${bannerId}`, {
                method: 'DELETE',
            });
    
            if (response.ok) {
                fetchBanners();
                showError('Banner deleted successfully!');
            } else {
                showError('Failed to delete banner');
            }
        } catch (error) {
            showError('An error occurred while deleting the banner');
        }
    };
    async function fetchBanners() {
        try {
            const session = await getSession();
            const user_id = session?.user?.id;
            const usertype = session?.user?.type;
            const response = await fetch(`/api/banners?user_id=${user_id}&usertype=${usertype}`);
    
            // Check if the response is successful
            if (response.ok) {
                const data = await response.json();
                if (data) {
                    setBanners(data);
                } else {
                    console.log(data.message); // No banners found
                }
            } else {
                console.error('Failed to fetch banners:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching banners:', error);
        }
    }
    // Placeholder default image URL
    const defaultImage = '/images/default-banner.jpg'; // Make sure this image exists in your public folder
useEffect(() => {
    fetchBanners();
}, [session]);
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-grow bg-gray-100 p-4 overflow-auto">
                <div className="bg-white shadow-md rounded-lg p-6 h-auto">
                    <h3 className='text-xl'>Upload Banners</h3>
                    <form onSubmit={handleUpload}>
    <div 
        onClick={handleCoverImageClick} 
        className="cursor-pointer mt-5 relative group"
    >
        {/* Use Image component to show the preview */}
        <Image
            src={bannerPhoto || DefaultBanner}
            alt="Cover Image"
            className="rounded-lg mx-auto w-full"
        />
        <input
            type="file"
            accept="image/*"
            ref={coverImageInputRef}
            onChange={handleCoverImageChange}
            className="hidden"
        />

        {/* Overlay with text */}
        <div 
            className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
            <p className="text-white font-medium text-lg">Click to Upload</p>
        </div>

        {photoUploading && <FileUploader />}
    </div>
    <div className="flex justify-center">
        <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg mt-4 m-auto"
        >
            Upload Banner
        </button>
    </div>
</form>

                    <h3 className='text-xl mt-10'>Your Banners</h3>
                    <div className="grid grid-cols-3 gap-4 mt-4">
    {banners.length > 0 ? (
        banners.map((banner: any, index: number) => (
            <div key={index} className="relative rounded-lg shadow-md">
                
                <Image
                    src={banner.filepath || DefaultPic}
                    alt={`Banner ${index + 1}`}
                    layout="responsive"
                    width={300}
                    height={150}
                    className="rounded-lg"
                />
               
                <button
                    onClick={() => handleDelete(banner.id)} // Pass the banner ID to the delete handler
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    aria-label="Delete Banner"
                >
                    <FaTrash size={24} />
                </button>
            </div>
        ))
    ) : (
        <p>No banners available</p>
    )}
</div>


                </div>
            </main>
        </div>
    );
};

export default Banners;
