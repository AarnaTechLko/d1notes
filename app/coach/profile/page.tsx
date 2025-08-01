"use client";

import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../../components/coach/Sidebar';
import { useSession } from 'next-auth/react';
import { getSession } from "next-auth/react";
import { countryCodesList, states } from '@/lib/constants';
import { upload } from '@vercel/blob/client';
import FileUploader from '@/app/components/FileUploader';
import { showError } from '@/app/components/Toastr';
import { FaFileAlt } from 'react-icons/fa';
import CropEasy from '@/app/components/crop/CropEasy';
import ViewLicenseModal from '@/app/components/LicenseModal';

const Profile: React.FC = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [coachId, setCoachId] = useState<number | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const LisenseInputRef = useRef<HTMLInputElement | null>(null);
  const CvInputRef = useRef<HTMLInputElement | null>(null);
  const [loadingProfile, setLoadingprofile] = useState<boolean>(false);
  const [licenseUpoading, setLicenseUpoading] = useState<boolean>(false);
  const [cvUpoading, setCvUpoading] = useState<boolean>(false);
  const [openCrop, setOpenCrop] = useState<boolean>(false);
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
    countryName: "",
    facebook: "",
    instagram: "",
    linkedin: "",
    website: "",
    xlink: "",
    youtube: "",
    city: "",
    license_type: "",
    license: "",
    cv: "",
  });

  const { data: session, status } = useSession();

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const certificateInputRef = useRef<HTMLInputElement | null>(null);
  const [photoUploading, setPhotoUploading] = useState<boolean>(false);
  const [countriesList, setCountriesList] = useState([]);
  const [statesList, setStatesList] = useState([]);
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
          fetchStates(data.country);
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


  const fetchStates = async (country: string) => {
    const response = await fetch(`/api/masters/states?country=${country}`)
      .then((response) => response.json())
      .then((data) => setStatesList(data || []))
      .catch((error) => console.error('Error fetching states:', error));
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    // console.log("Looking at values: ", e.target)
    const { name, value } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (name === 'country') {

      setProfileData((prevData) => ({
        ...prevData,
        "state": "",
      }));

      fetchStates(value);
    }

  };

  const handleImageUpload = async (file: File, closeCrop: boolean = false) => {
    if (!file) throw new Error('No file selected');
  
    setPhotoUploading(true);
    const imageUrl = await uploadImage(file);
    setPhotoUploading(false);
  
    if (imageUrl) {
      setProfileData(prev => ({ ...prev, image: imageUrl }));
      if (closeCrop) setOpenCrop(false);
      else setOpenCrop(true);
    }
  };

  const handleImageChange = async () => {
    if (!fileInputRef.current?.files) {
      throw new Error('No file selected');
    }
    const file = fileInputRef.current.files[0];
    await handleImageUpload(file)

  };

  const handleCropImage = async (file: File) => {
    handleImageUpload(file, true)
  }
  const uploadImage = async (file: File, options?: object): Promise<string> => {
    try {
      const newBlob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/uploads',
        ...options,
      });
      return newBlob.url;
    } catch (error) {
      console.error('Error uploading file:', error);
      return ''
    }
  }

  const validateUpdates = (): boolean => {

    const errors = {
      firstName: "",//
      lastName: "",//
      expectedCharge: "",//
      countrycode: "",//
      phoneNumber: "",//
      email: "",//
      gender: "",//
      sport: "",//
      clubName: "",//
      license_type: "",//


      // image: "",
      // certificate: "",
      // password: "",
      country: "",//
      state: "",//
      // countryName: "",
      // facebook: "",
      // instagram: "",
      // linkedin: "",
      // website: "",
      // xlink: "",
      // youtube: "",
      city: "",//
      qualifications: "",//
      cv: "",//
      license: "",//
      location: "",

    };




    if (!profileData.firstName) errors.firstName = 'First Name is required';
    if (!profileData.lastName) errors.lastName = 'Last Name is required';
    if (!profileData.expectedCharge) errors.expectedCharge = 'Base Evaluation Rate is required';
    if (!profileData.countrycode) errors.countrycode = "Country Code is required";
    if (!profileData.phoneNumber) errors.phoneNumber = "Phone Number is required";
    if (!profileData.email) errors.email = "Email is required";
    if (!profileData.gender) errors.gender = "Gender is required"
    if (!profileData.sport) errors.sport = 'Sport is required';
    if (!profileData.clubName) errors.clubName = "Organization name is required";
    if (!profileData.license_type) errors.license_type = "License Type is required";
    if (!profileData.country) errors.country = 'Country is required';
    if (!profileData.state) errors.state = "State is required";
    if (!profileData.city) errors.city = "City is required";
    if (!profileData.qualifications) errors.qualifications = "Background/Qualifications is required";
    if (!profileData.cv) errors.cv = "CV is required";
    if (!profileData.license) errors.license = "License is required";


    // Collect errors to display in SweetAlert
    Object.entries(errors).reverse()
      .filter(([_, value]) => value !== "")
      .forEach(([field, message]) => {
        showError(message); // Display each error in a separate toastr
      });

    // Return false if there are any errors
    if (Object.values(errors).some(value => value !== "")) {
      // console.log("I'm here")
      return false; // Validation failed
    }

    return true;
  }




  const handleSubmit = async () => {

    if (!validateUpdates()) return;


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
        // window.location.reload();
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


  const handleCVChange = async () => {

    if (!CvInputRef.current?.files) {
      throw new Error('No file selected');
    }

    setCvUpoading(true);
    const file = CvInputRef.current.files[0];

    try {
      const newBlob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/uploads/documentupload',
      });
      setCvUpoading(false);
      const imageUrl = newBlob.url;
      setProfileData({ ...profileData, cv: imageUrl });

    } catch (error: any) {
      setCvUpoading(false);
      showError('Only JPG and PNG Images Allowed.');
    }
  }

  const handleDownload = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      // Extract file extension from URL
      const extension = url.split('.').pop()?.split('?')[0] || "file";
      const filename = `download.${extension}`;

      // Create a download link
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename; // Ensure proper file download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Revoke object URL to free memory
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const handleLicenseChange = async () => {

    if (!LisenseInputRef.current?.files) {
      throw new Error('No file selected');
    }

    setLicenseUpoading(true);
    const file = LisenseInputRef.current.files[0];

    try {
      const newBlob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/uploads/documentupload',
      });
      setLicenseUpoading(false);
      const imageUrl = newBlob.url;
      setProfileData({ ...profileData, license: imageUrl });

    } catch (error: any) {
      setLicenseUpoading(false);
      showError('Error While Uplading File.');
    }
  }
  return (
    <>
      <div className="flex  bg-gradient-to-r from-blue-50 to-indigo-100">
        <Sidebar />
        <main className="flex-grow p-8">
          <div className="bg-white shadow-lg rounded-md p-8 mx-auto max-w-6xl">
            {/* Profile Header */}
            <div className="flex justify-between items-center mb-6">

              <button
                onClick={() => {
                  if (isEditMode) {
                    handleSubmit(); // Call the submit function when in edit mode
                  }
                  else {
                    setIsEditMode(!isEditMode);
                  }
                }}
                className={`px-5 py-2 rounded-md transition-all duration-200 ease-in-out shadow-md ${isEditMode ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
              >
                {isEditMode ? 'Save Profile' : 'Edit Profile'}
              </button>
            </div>

            {/* Profile Image Section */}
            <div className="flex flex-col items-center mb-8">
              {loadingProfile && (
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

              {isEditMode ? (
                <>
                  <label className="block lg:text-3xl font-bold mb-2">Profile Image</label>

                  <span className='text-xs text-gray-500'>(.jpg, .png, .gif)</span>
                </>
              ) : (
                <label className="block lg:text-3xl font-bold mb-2">Profile Image</label>
              )}
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
              {openCrop && (
                <CropEasy
                  photoUrl={profileData.image}
                  setOpenCrop={setOpenCrop}
                  handleCropImage={handleCropImage}
                />
              )}

            </div>
            {photoUploading ? (
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
                <label className="block text-base font-bold mb-2">First Name{isEditMode ? <span className='mandatory'>*</span> : ""}</label>
                {isEditMode ? (
                  <input
                    type="text"
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="block text-gray-700 text-sm font-semibold mb-2">{profileData.firstName}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-base font-bold mb-2">Last Name{isEditMode ? <span className='mandatory'>*</span> : ""}</label>
                {isEditMode ? (
                  <input
                    type="text"
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="block text-gray-700 text-sm font-semibold mb-2">{profileData.lastName}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-5">
              <div>
                <label className="block text-base font-bold mb-2"> Base Evaluation Rate ${isEditMode ? <span className='mandatory'>*</span> : ""}</label>
                {isEditMode ? (
                  <input
                    type="text"
                    name="expectedCharge"
                    value={profileData.expectedCharge}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="block text-gray-700 text-sm font-semibold mb-2">{profileData.expectedCharge}</p>
                )}
              </div>

              <div>
                <label htmlFor="phoneNumber" className="block text-base font-bold mb-2">Mobile Number{isEditMode ? <span className='mandatory'>*</span> : ""}</label>

                <div className="flex">
                  {isEditMode ? (
                    <>
                      <select
                        name="countrycode"
                        className="border border-gray-300 rounded-md py-2 px-4 w-2/5 mr-1" // Added mr-4 for margin-right
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
                        className="border border-gray-300 rounded-md py-2 px-4 w-3/5"
                        value={profileData.phoneNumber}
                        onChange={handlePhoneNumberChange}
                        maxLength={14} // (123) 456-7890 is 14 characters long
                      /></>
                  ) : (
                    <p className="block text-gray-700 text-sm font-semibold mb-2">{profileData.countrycode} {profileData.phoneNumber}</p>
                  )}
                </div>



              </div>

              {/* Email */}
              <div>
                <label className="block text-base font-bold mb-2">Email{isEditMode ? <span className='mandatory'>*</span> : ""}</label>
                {isEditMode ? (
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="block text-gray-700 text-sm font-semibold mb-2">{profileData.email}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-5">
              {/* Gender */}
              <div>
                <label className="block text-base font-bold mb-2">Gender{isEditMode ? <span className='mandatory'>*</span> : ""}</label>
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
                  <p className="block text-gray-700 text-sm font-semibold mb-2">{profileData.gender}</p>
                )}
              </div>




              <div>
                <label className="block text-base font-bold mb-2">Sport{isEditMode ? <span className='mandatory'>*</span> : ""}</label>
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
                  <p className="block text-gray-700 text-sm font-semibold mb-2">{profileData.sport}</p>
                )}
              </div>

              {/* Club Name */}
              {/*Issue with text needs to be discussed, specifically with styling */}
              <div>
                <label className="block text-sm font-bold mb-2">Title/Organization(s)/Affiliation(s){isEditMode ? <span className='mandatory'>*</span> : ""}</label>
                {isEditMode ? (
                  <input
                    type="text"
                    name="clubName"
                    value={profileData.clubName}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="block text-gray-700 text-sm font-semibold mb-2">{profileData.clubName}</p>
                )}
              </div>

              


              <div>
                <label className="block text-base font-bold mb-2">Coaching License Type{isEditMode ? <span className='mandatory'>*</span> : ""}</label>
                {isEditMode ? (
                  <select
                    name="license_type"
                    value={profileData.license_type}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  >

                    <option value="">Select</option>
                    <option value="PRO">PRO</option>
                    <option value="Elite-A">Elite-A</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="E">E</option>
                  </select>
                ) : (
                  <p className="block text-gray-700 text-sm font-semibold mb-2">{profileData.license_type}</p>
                )}
              </div>


            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-5">
              <div>
                <label htmlFor="country" className="block text-base font-bold mb-2">Country{isEditMode ? <span className='mandatory'>*</span> : ""}</label>
                {isEditMode ? (
                  <select
                    name="country"
                    className="border border-gray-300 rounded-md py-2 px-4 w-full"
                    value={profileData.country ?? ""}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    {countriesList
                      .map((country: any) => (
                        <option key={country.id} value={country.id}>
                          {country.name}
                        </option>
                      ))}

                  </select>
                ) : (
                  <p className="block text-gray-700 text-sm font-semibold mb-2">{profileData.countryName}</p>
                )}
              </div>

              <div>
                <label htmlFor="state" className="block text-base font-bold mb-2">State/Province{isEditMode ? <span className='mandatory'>*</span> : ""}</label>

                {isEditMode ? (
                  <select
                    name="state"
                    id="state"
                    value={profileData.state ?? ""}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-md py-2 px-4 w-full"
                  >
                    <option value="">Select</option>
                    {statesList.map((state: any) => (
                      <option key={state.id} value={state.name}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="block text-gray-700 text-sm font-semibold mb-2">{profileData.state}</p>
                )}

              </div>
              <div>
                <label htmlFor="city" className="block text-base font-bold mb-2">City{isEditMode ? <span className='mandatory'>*</span> : ""}</label>
                {isEditMode ? (
                  <input
                    type="text"
                    name="city"
                    className="border border-gray-300 rounded-md py-2 px-4 w-full"
                    value={profileData.city ?? ""}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="block text-gray-700 text-sm font-semibold mb-2">{profileData.city}</p>
                )}

              </div>
            </div>
            <div>
              <label className="block text-base font-bold mb-2">Background/Qualifications{isEditMode ? <span className='mandatory'>*</span> : ""}</label>
              {isEditMode ? (
                <textarea
                  name="qualifications"
                  rows={4}
                  value={profileData.qualifications}
                  onChange={handleChange}
                  className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                />
              ) : (
                <p className="block text-gray-700 text-sm font-semibold mb-2">
                  {profileData.qualifications}
                </p>
              )}
            </div>


            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-5 mt-5">

              <div>
                <label htmlFor="facebook" className="block text-base font-bold mb-2">Facebook Link</label>
                {isEditMode ? (
                  <input
                    placeholder=''
                    type="text"
                    name="facebook"
                    className="border border-gray-300 rounded-md py-2 px-4 w-full"
                    value={profileData.facebook}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="block text-gray-700 text-sm font-semibold mb-2">
                    {profileData.facebook}
                  </p>
                )}
              </div>
              <div >
                <label htmlFor="instagram" className="block text-base font-bold mb-2">Instagram Link</label>
                {isEditMode ? (
                  <input
                    placeholder=''
                    type="text"
                    name="instagram"
                    className="border border-gray-300 rounded-md py-2 px-4 w-full"
                    value={profileData.instagram}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="block text-gray-700 text-sm font-semibold mb-2">
                    {profileData.instagram}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="linkedin" className="block text-base font-bold mb-2">Linkedin Link</label>
                {isEditMode ? (
                  <input
                    placeholder=''
                    type="text"
                    name="linkedin"
                    className="border border-gray-300 rounded-md py-2 px-4 w-full"
                    value={profileData.linkedin}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="block text-gray-700 text-sm font-semibold mb-2">
                    {profileData.linkedin}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-5 mt-5">

              <div>
                <label htmlFor="xlink" className="block text-base font-bold mb-2">X Link</label>
                {isEditMode ? (
                  <input
                    placeholder=''
                    type="text"
                    name="xlink"
                    className="border border-gray-300 rounded-md py-2 px-4 w-full"
                    value={profileData.xlink}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="block text-gray-700 text-sm font-semibold mb-2">
                    {profileData.xlink}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="youtube" className="block text-base font-bold mb-2">YouTube Link</label>
                {isEditMode ? (
                  <input
                    placeholder=''
                    type="text"
                    name="youtube"
                    className="border border-gray-300 rounded-md py-2 px-4 w-full"
                    value={profileData.youtube}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="block text-gray-700 text-sm font-semibold mb-2">
                    {profileData.youtube}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="website" className="block text-base font-bold mb-2">Website Link</label>
                {isEditMode ? (
                  <input
                    placeholder=''
                    type="text"
                    name="website"
                    className="border border-gray-300 rounded-md py-2 px-4 w-full"
                    value={profileData.website}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="block text-gray-700 text-sm font-semibold mb-2">
                  {profileData.website}
                </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 pb-5">
              {isEditMode ? (
                <div>

                  <label htmlFor="youtube" className="block text-gray-700 text-sm font-semibold mb-2">Upload CV {isEditMode ? <span className='mandatory'>*</span> : ""}</label>
                  <input
                    placeholder=' '
                    type="file"
                    name="youtube"
                    accept="image/*,application/pdf"
                    className="border border-gray-300 rounded-md py-2 px-4 w-full"
                    onChange={handleCVChange}

                    ref={CvInputRef}
                  />
                  {cvUpoading ? (
                    <>
                      <FileUploader />
                    </>
                  ) : (
                    <>
                      {/* Optional: Placeholder for additional content */}
                    </>
                  )}
                </div>
              ) : (
                <div>
                  <p className="flex items-center">
                    <FaFileAlt className="text-blue-500 mr-2" /> {/* Add margin to the right of the icon */}
                    {profileData.cv ? (
                      <span>
                        <ViewLicenseModal fileurl={profileData.cv} controlName="View CV" />
                      </span>
                    ) : (
                      <span>No CV Uploaded</span>
                    )}
                  </p>
                </div>
              )}
              {isEditMode ? (
                <div>
                  <label htmlFor="license" className="block text-gray-700 text-sm font-semibold mb-2">Upload Coaching License {isEditMode ? <span className='mandatory'>*</span> : ""}</label>
                  <input
                    placeholder='Ex: https://youtube.com/username'
                    type="file"
                    name="license"
                    accept="image/*,application/pdf"
                    className="border border-gray-300 rounded-md py-2 px-4 w-full"
                    onChange={handleLicenseChange}

                    ref={LisenseInputRef}
                  />
                  {licenseUpoading ? (
                    <>
                      <FileUploader />
                    </>
                  ) : (
                    <>
                      {/* Optional: Placeholder for additional content */}
                    </>
                  )}
                </div>
              ) : (
              <div>
                <p className="flex items-center">
                  <FaFileAlt className="text-blue-500 mr-2" /> {/* Add margin to the right of the icon */}
                  {profileData.license ? (
                    <span>
                      <ViewLicenseModal fileurl={profileData.license} controlName="View License" />
                    </span>
                  ) : (
                    <span>No License Uploaded</span>
                  )}
                </p>
              </div>
              )}
            </div>
          </div>

        </main>
      </div>
    </>
  );
};

export default Profile;
