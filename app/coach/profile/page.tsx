"use client";

import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../../components/coach/Sidebar';
import { useSession } from 'next-auth/react';
import { getSession } from "next-auth/react";
import { countryCodesList, states } from '@/lib/constants';
import { upload } from '@vercel/blob/client';
import FileUploader from '@/app/components/FileUploader';

const Profile: React.FC = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [coachId, setCoachId] = useState<number | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loadingProfile,setLoadingprofile]=useState<boolean>(false);
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    gender: "",
    location: "",
    sport: "",
    clubName: "",
    qualifications: "",
    expectedCharge: "",
    image: "",
    certificate: "",
    password: "",
    countrycode: "", 
    country: "",
    state: "",
     countryName:"",
     facebook:"",
     instagram:"",
     linkedin:"",
     xlink:"",
     youtube:"",
    city: "",
  });

  const { data: session, status } = useSession();

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const certificateInputRef = useRef<HTMLInputElement | null>(null);
  const [photoUpoading, setPhotoUpoading] = useState<boolean>(false);
  const [countriesList, setCountriesList] = useState([]);
  useEffect(() => {
    fetch('/api/masters/countries')
      .then((response) => response.json())
      .then((data) => setCountriesList(data || []))
      .catch((error) => console.error('Error fetching countries:', error));
  }, []);


  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoadingprofile(true)
        const session = await getSession();
        const coachId = session?.user.id;
        const response = await fetch('/api/coach/profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ coachId }), // Send coachId in the request body
        });

        if (response.ok) {
          const data = await response.json();
          setProfileData(data);
          setLoadingprofile(false)
        } else {
          setLoadingprofile(false)
          console.error("Error fetching profile data:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageChange = async () => {
    if (!fileInputRef.current?.files) {
      throw new Error('No file selected');
    }
    setPhotoUpoading(true);
    const file = fileInputRef.current.files[0];

    try {
      const newBlob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/uploads',
      });
      setPhotoUpoading(false);
      const imageUrl = newBlob.url;
      setProfileData({ ...profileData, image: imageUrl });

    } catch (error) {
      setPhotoUpoading(false);
      console.error('Error uploading file:', error);
    }
  };

 
  const handleSubmit = async () => {
    try {
      const session = await getSession();
      const coachId = session?.user.id;
     
      const response = await fetch('/api/coach/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coachId, 
          profileData: {
            ...profileData,
            image: profileData.image || "", // Send base64 image
            certificate: profileData.certificate || ""
          }
        }), // Include coachId and profileData
      });
  
      if (response.ok) {
        // Fetch the updated data again
        const updatedResponse = await fetch('/api/coach/profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ coachId }),
        });
        if (updatedResponse.ok) {
          const updatedData = await updatedResponse.json();
          setProfileData(updatedData); // Update state with the new profile data
        } else {
          console.error("Failed to fetch updated profile data:", updatedResponse.statusText);
        }
        
        setIsEditMode(false); // Exit edit mode after saving
        window.location.reload(); 
      } else {
        console.error("Failed to update profile:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
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
  const handlePhoneNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const formattedNumber = formatPhoneNumber(event.target.value);
    setProfileData({ ...profileData, phoneNumber: formattedNumber });
  };

  const triggerImageUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const triggerCertificateUpload = () => {
    certificateInputRef.current?.click();
  };

  return (
    <>
      <div className="flex  bg-gradient-to-r from-blue-50 to-indigo-100">
        <Sidebar />
        <main className="flex-grow p-8">
          <div className="bg-white shadow-lg rounded-lg p-8 mx-auto max-w-6xl">
            {/* Profile Header */}
            <div className="flex justify-between items-center mb-6">
            
              <button
                onClick={() => {
                  if (isEditMode) {
                    handleSubmit(); // Call the submit function when in edit mode
                  }
                  setIsEditMode(!isEditMode);
                }}
                className={`px-5 py-2 rounded-lg transition-all duration-200 ease-in-out shadow-md ${
                  isEditMode ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isEditMode ? 'Save Profile' : 'Edit Profile'}
              </button>
            </div>

            {/* Profile Image Section */}
            <div className="flex flex-col items-center mb-8">
{loadingProfile &&(
  <div className="flex justify-center items-center gap-2">
  <svg
    className="animate-spin h-5 w-5 text-gray-500"
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
      d="M4 12a8 8 0 018-8v8H4z"
    ></path>
  </svg>
  <span>Loading Profile...</span>
</div>
)}
              </div>
            <div className="flex flex-col items-center mb-8">
              <label className="block text-gray-700 text-sm font-semibold mb-2">Profile Image</label>
              <div
                onClick={triggerImageUpload}
                className="relative items-center cursor-pointer"
              >
                {profileData.image ? (
                  <img
                  src={
                    !profileData.image || profileData.image === 'null'
                      ? '/default.jpg'
                      : profileData.image
                  }
                    alt="Profile"
                    className="h-32 w-32 object-cover rounded-full"
                  />
                ) : (
                  <div className="h-32 w-32 bg-gray-200 flex items-center justify-center rounded-full">
                    <span className="text-gray-500">Upload Image</span>
                  </div>
                )}
              </div>
              {isEditMode && (
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                />
              )}
             
            </div>
            {photoUpoading ? (
                      <>
                        <FileUploader />
                      </>
                    ) : (
                      <>
                        {/* Optional: Placeholder for additional content */}
                      </>
                    )}
            {/* Profile Information Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 pb-5">
              {/* First Name */}
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">First Name<span className='mandatory'>*</span></label>
                {isEditMode ? (
                  <input
                    type="text"
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="mt-2 text-sm font-medium  text-gray-500">{profileData.firstName}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">Last Name<span className='mandatory'>*</span></label>
                {isEditMode ? (
                  <input
                    type="text"
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="mt-2 text-sm font-medium  text-gray-500">{profileData.lastName}</p>
                )}
              </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-5">
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2"> Base Evaluation Rate $<span className='mandatory'>*</span></label>
                {isEditMode ? (
                  <input
                    type="text"
                    name="expectedCharge"
                    value={profileData.expectedCharge}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="mt-2 text-sm font-medium  text-gray-500">{profileData.expectedCharge}</p>
                )}
              </div>

              <div>
                <label htmlFor="phoneNumber" className="block text-gray-700 text-sm font-semibold mb-2">Mobile Number<span className='mandatory'>*</span></label>

                <div className="flex">
                {isEditMode ? (
                  <>
    <select 
      name="countrycode" 
      className="border border-gray-300 rounded-lg py-2 px-4 w-2/5 mr-1" // Added mr-4 for margin-right
      value={profileData.countrycode} 
      onChange={handleChange}
    >
      <option value="">Select</option>
     {countryCodesList.map((item) => (
        <option key={item.id} value={item.code}>
          {item.code} ({item.country})
        </option>
      ))}
    </select>

    <input
      placeholder="(342) 342-3423"
      type="text"
      name="number"
      className="border border-gray-300 rounded-lg py-2 px-4 w-3/5"
      value={profileData.phoneNumber}
      onChange={handlePhoneNumberChange}
      maxLength={14} // (123) 456-7890 is 14 characters long
    /></>
                ):(
                  <p className="mt-2 text-sm font-medium  text-gray-500">{profileData.countrycode} {profileData.phoneNumber}</p>
                )}
  </div>

 
               
              </div>

              {/* Email */}
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">Email<span className='mandatory'>*</span></label>
                {isEditMode ? (
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="mt-2 text-sm font-medium  text-gray-500">{profileData.email}</p>
                )}
              </div>
 

              {/* Gender */}
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">Gender<span className='mandatory'>*</span></label>
                {isEditMode ? (
                  <select
                    name="gender"
                    value={profileData.gender}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <p className="mt-2 text-sm font-medium  text-gray-500">{profileData.gender}</p>
                )}
              </div>

           

              
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">Sport<span className='mandatory'>*</span></label>
                {isEditMode ? (
                  <select
                    name="sport"
                    value={profileData.sport}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  >
                    <option value="">Select</option>
                    <option value="Soccer">Soccer</option>
                    {/* Add other sports as options */}
                  </select>
                ) : (
                  <p className="mt-2 text-sm font-medium  text-gray-500">{profileData.sport}</p>
                )}
              </div>

              {/* Club Name */}
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">Title/Organization(s)/Affiliation(s)<span className='mandatory'>*</span></label>
                {isEditMode ? (
                  <input
                    type="text"
                    name="clubName"
                    value={profileData.clubName}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="mt-2 text-sm font-medium  text-gray-500">{profileData.clubName}</p>
                )}
              </div>


              <div>
          <label htmlFor="country" className="block text-gray-700 text-sm font-semibold mb-2">Country<span className='mandatory'>*</span></label>
          {isEditMode ? (
          <select
            name="country"
            className="border border-gray-300 rounded-lg py-2 px-4 w-full"
            value={profileData.country  ?? ""}
            onChange={handleChange}
          >
            <option value="">Select</option>
            {countriesList
                      .map((country:any) => (
                        <option key={country.id} value={country.id}>
                          {country.name}
                        </option>
                      ))}
           
          </select>
           ) : (
            <p className="mt-2 text-sm font-medium  text-gray-500">{profileData.countryName}</p>
          )}
        </div>

        <div>
          <label htmlFor="state" className="block text-gray-700 text-sm font-semibold mb-2">State<span className='mandatory'>*</span></label>
          
          {isEditMode ? (
          <select
        name="state"
        id="state"
        value={profileData.state  ?? ""}
        onChange={handleChange}
        className="border border-gray-300 rounded-lg py-2 px-4 w-full"
      >
        <option value="">Select</option>
        {states.map((state) => (
          <option key={state.abbreviation} value={state.abbreviation}>
            {state.name}
          </option>
        ))}
      </select>
          ):(
<p className="mt-2 text-sm font-medium  text-gray-500">{profileData.state}</p>
          )}
          
        </div>
        <div>
          <label htmlFor="city" className="block text-gray-700 text-sm font-semibold mb-2">City<span className='mandatory'>*</span></label>
          {isEditMode ? (
          <input
            type="text"
            name="city"
            className="border border-gray-300 rounded-lg py-2 px-4 w-full"
            value={profileData.city  ?? ""}
            onChange={handleChange}
          />
          ):(
            <p className="mt-2 text-sm font-medium  text-gray-500">{profileData.city}</p>
          )}
          
        </div>
        </div>
        <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">Background/Qualifications<span className='mandatory'>*</span></label>
                {isEditMode ? (
                  <textarea
                    name="qualifications"
                    rows={4}
                    value={profileData.qualifications}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="mt-2 text-sm font-medium  text-gray-500 whitespace-pre-wrap">
                    {profileData.qualifications}
                  </p>
                )}
              </div>

            
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 pb-5 mt-5">

<div>
  <label htmlFor="facebook" className="block text-gray-700 text-sm font-semibold mb-2">Facebook Link<span className="text-xs text-gray-500"> (Optional)</span></label>
  {isEditMode ? (
  <input
  placeholder='Ex: https://www.facebook.com/username'
    type="text"
    name="facebook"
    className="border border-gray-300 rounded-lg py-2 px-4 w-full"
    value={profileData.facebook}
    onChange={handleChange}
  />
) : (
  <p className="mt-2 text-sm font-medium  text-gray-500 whitespace-pre-wrap">
    {profileData.facebook}
  </p>
)}
</div>
<div >
  <label htmlFor="instagram" className="block text-gray-700 text-sm font-semibold mb-2">Instagram Link <span className="text-xs text-gray-500">(Optional)</span></label>
  {isEditMode ? (
  <input
  placeholder='Ex: https://www.instagram.com/username'
    type="text"
    name="instagram"
    className="border border-gray-300 rounded-lg py-2 px-4 w-full"
    value={profileData.instagram}
    onChange={handleChange}
  />
) : (
  <p className="mt-2 text-sm font-medium text-gray-500 whitespace-pre-wrap">
    {profileData.instagram}
  </p>
)}
</div>
<div>
  <label htmlFor="linkedin" className="block text-gray-700 text-sm font-semibold mb-2">Linkedin Link <span className="text-xs text-gray-500">(Optional)</span></label>
  {isEditMode ? (
  <input
  placeholder='Ex: https://www.linkedin.com/in/john-doe'
    type="text"
    name="linkedin"
    className="border border-gray-300 rounded-lg py-2 px-4 w-full"
    value={profileData.linkedin}
    onChange={handleChange}
  />
) : (
  <p className="mt-2 text-sm font-medium  text-gray-500 whitespace-pre-wrap">
    {profileData.linkedin}
  </p>
)}
</div>
<div>
  <label htmlFor="xlink" className="block text-gray-700 text-sm font-semibold mb-2">X Link <span className="text-xs text-gray-500">(Optional)</span></label>
  {isEditMode ? (
  <input
  placeholder='Ex: https://x.com/username'
    type="text"
    name="xlink"
    className="border border-gray-300 rounded-lg py-2 px-4 w-full"
    value={profileData.xlink}
    onChange={handleChange}
  />
) : (
  <p className="mt-2 text-sm font-medium  text-gray-500 whitespace-pre-wrap">
    {profileData.xlink}
  </p>
)}
</div>
<div>
  <label htmlFor="youtube" className="block text-gray-700 text-sm font-semibold mb-2">YouTube Link <span className="text-xs text-gray-500">(Optional)</span></label>
  {isEditMode ? (
  <input
  placeholder='Ex: https://youtube.com/username'
    type="text"
    name="youtube"
    className="border border-gray-300 rounded-lg py-2 px-4 w-full"
    value={profileData.youtube}
    onChange={handleChange}
  />
) : (
  <p className="mt-2 text-sm font-medium  text-gray-500 whitespace-pre-wrap">
    {profileData.youtube}
  </p>
)}
</div>



</div>

            {/* Certificate Image Thumbnail */}
            {/* <div className="mt-8">
              <div className="flex flex-col items-center">
                <label className="block text-sm font-medium text-gray-700">Certificate Image</label>
                <div onClick={triggerCertificateUpload} className="mt-4 cursor-pointer">
                  {profileData.certificate ? (
                    <img
                    src={
                      !profileData.certificate || profileData.certificate === 'null'
                        ? '/certificate.png'
                        : profileData.certificate
                    }
                      alt="Certificate"
                      className="h-32 w-32 object-cover rounded-lg border-4 border-indigo-300 hover:shadow-lg transition-all"
                    />
                  ) : (
                    <div className="h-32 w-32 bg-gray-200 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-400">
                      <span className="text-gray-500">Upload Image</span>
                    </div>
                  )}
                </div>
                {isEditMode && (
                  <input
                    type="file"
                    name="certificate"
                    accept="image/*"
                    ref={certificateInputRef}
                    onChange={handleImageChange}
                    className="hidden"
                  />
                )}
              </div>
            </div> */}
          </div>
        </main>
      </div>
    </>
  );
};

export default Profile;
