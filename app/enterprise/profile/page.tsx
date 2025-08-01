"use client";

import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../../components/enterprise/Sidebar'
import { useSession } from 'next-auth/react';
import { getSession } from "next-auth/react";
import Select from "react-select";
import { countryCodesList, countries, states, positionOptionsList } from '@/lib/constants';
import { upload } from '@vercel/blob/client';
import CropEasy from '@/app/components/crop/CropEasy';
import { showError } from '@/app/components/Toastr';


const Profile: React.FC = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [playerId, setPlayerId] = useState<number | undefined>(undefined);
  const [countriesArray, setCountriesArray] = useState([]);
  const [openCrop, setOpenCrop] = useState<boolean>(false);
  const [photoUploading, setPhotoUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [profileData, setProfileData] = useState({
    id: "",
    organizationName: "",
    contactPerson: "",
    countryName: "",
    owner_name: "",
    email: "",
    mobileNumber: "",
    countryCodes: "",
    stateName: "",
    address: "",
    country: "",
    state: "",
    city: "",
    logo: "",
    affiliationDocs: "",
    sport: "",
    description: "",
    facebook: "",
    linkedin: "",
    instagram: "",
    xlink: "",
    youtube: "",
    website: "",
  });


  interface Country {
    id: number;
    name: string;
  }

  interface State {
    id: number;
    name: string;
    countryId: number;
  }
  const { data: session, status } = useSession();

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const certificateInputRef = useRef<HTMLInputElement | null>(null);
  const [countriesList, setCountriesList] = useState<any[]>([]);
  const [statesList, setStatesList] = useState<any[]>([]);



  const fetchStates = async (countryId: number) => {
    try {
      const response = await fetch(`/api/masters/states?country=${countryId}`);
      const data = await response.json();
  
      // console.log("Testing: ", data)

      if (Array.isArray(data)) {
        setStatesList(data);
      } else {
        console.error('Invalid state data:', data);
        setStatesList([]);
      }
    } catch (error) {
      console.error('Failed to fetch states:', error);
      setStatesList([]);
    }
  };
  
  
  

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const session = await getSession();
        const clubid = session?.user.id;
        const response = await fetch('/api/enterprise/profilebyid', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ clubid }), // Send playerId in the request body
        });

        if (response.ok) {
          const data = await response.json();
          setProfileData(data[0]);

        } else {
          console.error("Error fetching profile data:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData();
  }, []);

  useEffect(() => {
    fetch('/api/masters/countries')
      .then((response) => response.json())
      .then((data) => setCountriesList(data || []))
      .catch((error) => console.error('Error fetching countries:', error));
      fetchStates(231);
  }, []);

  const mapCountriesToOptions = (playingCountries: any) => {
    return playingCountries
      .split(',')
      .map((country: string) => ({ label: country.trim(), value: country.trim() }));
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (name === 'country') {
      fetchStates(Number(value));
    }

  };

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // const handleImageChange = async () => {
  //   if (fileInputRef.current?.files?.length) {
  //     const file = fileInputRef.current.files[0];
  //     setPhotoUploading(true);

  //     try {
  //       const newBlob = await upload(file.name, file, {
  //         access: 'public',
  //         handleUploadUrl: '/api/uploads',
  //       });
  //       setPhotoUploading(false);
  //       const imageUrl = newBlob.url;
  //       setProfileData({ ...profileData, logo: imageUrl });
  //     } catch (error) {
  //       setPhotoUploading(false);
  //       console.error('Error uploading file:', error);
  //     }
  //   } else {
  //     console.error('No file selected');
  //   }
  // };

  const handleImageUpload = async (file: File, closeCrop: boolean = false) => {
      if (!file) throw new Error('No file selected');
    
      setPhotoUploading(true);
      const imageUrl = await uploadImage(file);
      setPhotoUploading(false);
    
      if (imageUrl) {
        setProfileData({ ...profileData, logo: imageUrl });
        if (closeCrop) {
          setOpenCrop(false)
        }
        else {
          setOpenCrop(true)
        }
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
    setProfileData({ ...profileData, mobileNumber: formattedNumber });
  };

  const validateUpdates = (): boolean =>{

    const errors ={

      organizationName: "",
      countryName: "",
      owner_name: "",
      email: "",
      mobileNumber: "",
      countryCodes: "",
      address: "",
      country: "",
      state: "",
      city: "",
      logo: "",
      sport: "",
      description: "",
    };

    if(!profileData.organizationName) errors.organizationName = "Name of Organization is required";
    if(!profileData.owner_name) errors.owner_name = "Name of Administrator is required";
    if(!profileData.email) errors.email = "Administrator Email is required";
    if(!profileData.sport) errors.sport = "Sport is required";
    if(!profileData.countryCodes) errors.countryCodes = "Country code is required";
    if(!profileData.mobileNumber) errors.mobileNumber = "Mobile phone number is required";
    if(!profileData.country) errors.country = "Country is required";
    if(!profileData.state) errors.state = "State is required";
    if(!profileData.city) errors.city = "City is required";
    if(!profileData.address) errors.address = "Street address is required";
    if(!profileData.description) errors.description = "Organization description is required";

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
      console.log(profileData);
      const session = await getSession();
      const clubid = session?.user.id;
      const response = await fetch('/api/enterprise/profilebyid', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...profileData,
          logo: profileData.logo || ""
        }), // Include playerId and profileData
      });

      if (response.ok) {
        // Fetch the updated data again
        const updatedResponse = await fetch('/api/enterprise/profilebyid', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ clubid }),
        });
        if (updatedResponse.ok) {
          const updatedData = await updatedResponse.json();
          setProfileData(updatedData[0]); // Update state with the new profile data
        } else {
          console.error("Failed to fetch updated profile data:", updatedResponse.statusText);
        }

        setIsEditMode(false); // Exit edit mode after saving
      } else {
        console.error("Failed to update profile:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long", // Use "numeric" for numeric month
      day: "numeric",
    });
  };

  const triggerImageUpload = () => {
    imageInputRef.current?.click();
  };

  const triggerCertificateUpload = () => {
    certificateInputRef.current?.click();
  };

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
                  else{
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
              {isEditMode ? (
                  <>
                    <label className="block lg:text-3xl font-bold mb-2">Profile Image</label>

                    <span className='text-xs text-gray-500'>(.jpg, .png, .gif)</span>
                  </>
                ): (
                    <label className="block lg:text-3xl font-bold mb-2">Profile Image</label>
                )}
              <div
                onClick={handleImageClick}
                className="mt-4 cursor-pointer rounded-full border-4 border-indigo-300 p-2 hover:shadow-lg transition-all"
              >
                {profileData.logo ? (
                  <img
                    src={profileData.logo}
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
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  ref={fileInputRef}
                />
              )}
              {openCrop && (
                <CropEasy
                  photoUrl={profileData.logo}
                  setOpenCrop={setOpenCrop}
                  handleCropImage={handleCropImage}
                />
              )}
            </div>

            {/* Profile Information Form */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mt-5 mb-2">
              {/* First Name */}
              <div>
                <label className="block text-base font-bold mb-2">Organization Name{isEditMode ? <span className='mandatory'>*</span> : ""}</label>
                {isEditMode ? (
                  <input
                    type="text"
                    name="organizationName"
                    value={profileData.organizationName}
                    onChange={handleChange}
                    className="mt-2 block w-full border mb-2 border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="block text-gray-700 text-sm font-semibold mb-2">{profileData.organizationName}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
              <div>
                <label className="block text-base font-bold mb-2">Administrator Name{isEditMode ? <span className='mandatory'>*</span> : ""}</label>
                {isEditMode ? (
                  <input
                    type="text"
                    name="owner_name"
                    value={profileData.owner_name}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="block text-gray-700 text-sm font-semibold mb-2">{profileData.owner_name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-base font-bold mb-2">Administrator Email{isEditMode ? <span className='mandatory'>*</span> : ""}</label>
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

              {/* Sports */}

              <div className="flex-1">
                <label htmlFor="sport" className="block text-base font-bold mb-2">Sport(s){isEditMode ? <span className='mandatory'>*</span> : ""}</label>
                {isEditMode ? (
                  <select
                    name="sport"
                    className="border border-gray-300 rounded-md py-2 px-4 w-full"
                    value={profileData.sport}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    <option value="Soccer">Soccer</option>

                  </select>
                ) : (
                  <p className="block text-gray-700 text-sm font-semibold mb-2">{profileData.sport}</p>
                )}
              </div>

              <div>
                <label className="block text-base font-bold mb-2">Administrator Mobile Number{isEditMode ? <span className='mandatory'>*</span> : ""}</label>
                {isEditMode ? (
                  <div className="flex">
                    <select
                      name="countryCodes"
                      className="mt-2 block  border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500 w-1/3 mr-1" // Added mr-4 for margin-right
                      value={profileData.countryCodes}
                      onChange={handleChange}
                    >
                      {countryCodesList.map((item) => (
                        <option key={item.id} value={item.code}>
                          {item.code} ({item.country})
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      name="number"
                      value={profileData.mobileNumber}
                      onChange={handlePhoneNumberChange}
                      className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                    />
                  </div>
                ) : (
                  <p className="block text-gray-700 text-sm font-semibold mb-2">{profileData.countryCodes} {profileData.mobileNumber}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-5">
              <div>
                <label className="block text-base font-bold mb-2">Organization Country{isEditMode ? <span className='mandatory'>*</span> : ""}</label>
                {isEditMode ? (
                  <select
                    name="country"
                    className="border border-gray-300 rounded-md py-2 px-4 w-full"
                    value={profileData.country}
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
                <label className="block text-base font-bold mb-2">Organization State/Province{isEditMode ? <span className='mandatory'>*</span> : ""}</label>
                {isEditMode ? (

                  // <select>


                    
                  // </select>

                  // <select
                  // name="state"
                  // id="state"
                  // value={formValues.state ?? ""}
                  // onChange={handleChange}
                  // className="border border-gray-300 rounded-lg py-2 px-4 w-full"
                  // >
                  // <option value="">Select</option>
                  // {statesList.map((state: any, index) => (
                  //   <option key={index} value={state.name}>
                  //     {state.name}
                  //   </option>
                  // ))}
                  // </select>

                  <select
                  name="state"
                  id="state"
                  value={profileData.state}
                  onChange={handleChange}
                  className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                >
                  <option value="">Select a state</option>
                  {statesList.map((state: any, index) => (
                      <option key={index} value={state.name}>
                        {state.name}
                      </option>
                    ))}
                </select>

                //   <Select
                //   options={statesList.map((state) => ({ label: state.name, value: state.id }))}
                //   value={statesList.find((state) => state.id === profileData.state) || null}
                //   onChange={(selectedOption) =>
                //     setProfileData((prevData) => ({ ...prevData, state: selectedOption?.value || "" }))
                //   }
                // />
                
                ) : (
                  <p className="block text-gray-700 text-sm font-semibold mb-2">{profileData.state}</p>
                )}


              </div>

              {/* Location */}
              <div>
                <label className="block text-base font-bold mb-2">Organization City{isEditMode ? <span className='mandatory'>*</span> : ""}</label>
                {isEditMode ? (
                  <input
                    type="text"
                    name="city"
                    value={profileData.city}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="block text-gray-700 text-sm font-semibold mb-2">{profileData.city}</p>
                )}
              </div>

              <div className="col-span-2 sm:col-span-2 lg:col-span-3 mb-4">

                <label className="block text-base font-bold mb-2">Organization Street Address{isEditMode ? <span className='mandatory'>*</span> : ""}</label>
                {isEditMode ? (

                  <textarea name="address" maxLength={1500} className='w-full border border-gray-300 rounded-md py-2 px-4  focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='Ex. LA Storm FC is a boys and girls soccer club based in Los Angeles.'
                    value={profileData.address}
                    onChange={handleChange}
                  ></textarea>

                ) : (
                  <p className="block text-gray-700 text-sm font-semibold mb-2">{profileData.address}</p>
                )}

              </div>

              <div className="col-span-2 sm:col-span-2 lg:col-span-3 mb-4">
                <label htmlFor="city" className="block text-base font-bold mb-2">Organization Description{isEditMode ? <span className='mandatory'>*</span> : ""}</label>

                {isEditMode ? (
                  <textarea name="description" maxLength={1500} className='w-full border border-gray-300 rounded-md py-2 px-4  focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='Ex. LA Storm FC is a boys and girls soccer club based in Los Angeles.'
                    value={profileData.description}
                    onChange={handleChange}
                  ></textarea>
                ) : (
                  <p className="block text-gray-700 text-sm font-semibold mb-2">{profileData.description}</p>
                )}
              </div>
            </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-5">
              {/* facebook */}
              <div>
                <label className="block text-base font-bold mb-2">Facebook Link<span className="text-xs text-gray-500"> (Optional)</span></label>
                {isEditMode ? (
                  <input
                    type="text"
                    name="facebook"
                    value={profileData.facebook}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="block text-gray-700 text-sm font-semibold  mb-2 break-words">{profileData.facebook}</p>
                )}
              </div>

              {/* Instagram Link */}
              <div>
                <label className="block text-base font-bold mb-2">Instagram Link<span className="text-xs text-gray-500"> (Optional)</span></label>
                {isEditMode ? (
                  <input
                    type="text"
                    name="instagram"
                    value={profileData.instagram}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="block text-gray-700 text-sm font-semibold mb-2 break-words">{profileData.instagram}</p>
                )}
              </div>

              {/* LinkedIn */}
              <div>
                <label className="block text-base font-bold mb-2">LinkedIn Link<span className="text-xs text-gray-500"> (Optional)</span></label>
                {isEditMode ? (
                  <input
                    type="text"
                    name="linkedin"
                    value={profileData.linkedin}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="block text-gray-700 text-sm font-semibold mb-2 break-words">{profileData.linkedin}</p>
                )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-5">
              {/* X (Twitter) */}
              <div>
                <label className="block text-base font-bold mb-2">X (Twitter) Link<span className="text-xs text-gray-500"> (Optional)</span></label>
                {isEditMode ? (
                  <input
                    type="text"
                    name="xlink"
                    value={profileData.xlink}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="block text-gray-700 text-sm font-semibold mb-2">{profileData.xlink}</p>
                )}
              </div>

              {/* YouTube */}
              <div>
                <label className="block text-base font-bold mb-2">YouTube Link<span className="text-xs text-gray-500"> (Optional)</span></label>
                {isEditMode ? (
                  <input
                    type="text"
                    name="youtube"
                    value={profileData.youtube}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="block text-gray-700 text-sm font-semibold mb-2">{profileData.youtube}</p>
                )}
                </div>
              
                <div>
                <label className="block text-base font-bold mb-2">Website Link<span className="text-xs text-gray-500"> (Optional)</span></label>
                {isEditMode ? (
                  <input
                    type="text"
                    name="website"
                    value={profileData.website}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="block text-gray-700 text-sm font-semibold mb-2">{profileData.website}</p>
                )}
                </div>
              </div>

          </div>
        </main>
      </div>
    </>
  );
};

export default Profile;
