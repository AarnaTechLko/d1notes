"use client";

import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import { useSession } from 'next-auth/react';
import { getSession } from "next-auth/react";
import Select from "react-select";
import { countryCodesList, countries, states, positionOptionsList, Grades, genders, playingLevels } from '@/lib/constants';
import FileUploader from '../components/FileUploader';
import { upload } from '@vercel/blob/client';
import { profile } from 'console';
import { showError } from '@/app/components/Toastr';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CropEasy from '../components/crop/CropEasy';

const Profile: React.FC = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [openCrop, setOpenCrop] = useState<boolean>(false);
  const [playerId, setPlayerId] = useState<number | undefined>(undefined);
  const [countriesArray, setCountriesArray] = useState([]);
  const [statesList, setStatesList] = useState([]);
  const [nationality, setNationality] = useState<{ label: string; value: string }[]>([]);
  const [position, setPosition] = useState<{ label: string; value: string }[]>([]);
  // const [appliedPosition, setAppliedPosition] = useState<{ label: string; value: string}[]>([])
  const [photoUpoading, setPhotoUpoading] = useState<boolean>(false);
  const [selectedDOBOption, setSelectedDOBOption] = useState<string | null>(null);
  const birthYears = Array.from({ length: 36 }, (_, i) => 1985 + i);
  let nationalities;
  let ppositons;
  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    grade_level: "",
    location: "",
    birthday: "",
    gender: "",
    sport: "",
    team: "",
    position: "",
    number: "",
    email: "",
    image: "",
    bio: "",
    country: "",
    state: "",
    city: "",
    jersey: "",
    password: "",
    countrycode: "",
    countryName: "",
    height: "",
    weight: "",
    playingcountries: "",
    league: "",
    graduation: "",
    school_name: "",
    gpa: "",
    age_group: "",
    facebook: "",
    instagram: "",
    linkedin: "",
    xlink: "",
    youtube: "",
    website: "",
    // team_year: "",
    birth_year: "",
  });


  const { data: session, status } = useSession();
  const ageGroups = ["U6", "U7", "U8", "U9", "U10", "U11", "U12", "U13", "U14", "U15", "U16", "U17", "U18", "U19", "High School", "College", "Semi Pro", "Pro"];
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const certificateInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const session = await getSession();
        const playerId = session?.user.id;
        const response = await fetch('/api/profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ playerId }), // Send playerId in the request body
        });

        if (response.ok) {
          const data = await response.json();

          // console.log("Data: ", data)

          setProfileData(data);
          // console.log("country: ", data.country);
          // console.log("state ", data.state);
          // console.log("Testing:" + data.birth_year);
          // console.log("data: ", data)
          if (data.age_group != '') {
            setSelectedDOBOption('ageGroup')
          }
          if (data.birth_year != '') {
            setSelectedDOBOption('birthYear')
          }

          if (data.playingcountries.includes(',')) {
            nationalities = data.playingcountries
              .split(',')
              .map((country: string) =>
                countries.find(option => option.label.trim() === country.trim())
              )
              .filter(Boolean);
          } else {

            // nationalities = [data.playingcountries.trim()];
            nationalities = countries.find(option => option.label.trim() === data.playingcountries)
          }
          // console.log(data.playingcountries)
          // console.log(nationalities);
          setNationality(nationalities);


          if (data.position.includes(',')) {
            ppositons = data.position
              .split(',')
              .map((country: string) =>
                positionOptionsList.find(option => option.value.trim() === country.trim())
              )
              .filter(Boolean);
          } else {

            // ppositons = [data.position.trim()];
            ppositons = positionOptionsList.find(option => option.value.trim() === data.position)
          }
          // console.log(ppositons);
          setPosition(ppositons);

          fetch('/api/masters/countries')
          .then((response) => response.json())
          .then((data) => setCountriesArray(data || []))
          .catch((error) => console.error('Error fetching countries:', error));

          fetchStates(Number(data.country))

        } else {
          console.error("Error fetching profile data:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData();
  }, []);

  const fetchStates = async (country: number) => {
    try {
      const response = await fetch(`/api/masters/states?country=${country}`);
      const data = await response.json();
      setStatesList(data); // Adjust key if necessary based on your API response structure
    } catch (error) {
      console.error('Failed to fetch states:', error);
    }
  };



  const formatHeight = (value: string) => {
    // Remove non-numeric characters except for the decimal point and the apostrophe (for feet)
    const numericValue = value.replace(/[^0-9.'"]/g, "");

    if (numericValue.length === 0) return ""; // Return empty if no input

    // Split the input by the apostrophe (')
    const parts = numericValue.split("'");

    let feet = parts[0]; // The whole number part for feet

    // If there's something after the apostrophe, handle inches
    let inches = parts[1] || "";

    // If there's a decimal point in inches, keep it intact
    if (inches.includes('"')) {
      inches = inches.replace('"', "");
    }

    if (inches) {
      return `${feet}' ${inches}"`; // Format as feet and decimal inches
    } else {
      return `${feet}'`; // Format as feet only
    }
  };

  const handleHeightChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const formattedValue = formatHeight(value);
    setProfileData((prevValues) => ({ ...prevValues, height: formattedValue }));
  };
  // const mapCountriesToOptions = (playingCountries: any) => {
  //   return playingCountries
  //     .split(',')
  //     .map((country: string) => ({ label: country.trim(), value: country.trim() }));
  // };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // console.log("I'm here")
    // console.log({[name]: value})

    // console.log("State: ", profileData.state)

    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (name === 'country') {
      //this looks wrong
      setProfileData((prevData) => ({
        ...prevData,
        "state": "",
      }));

      fetchStates(Number(value));
    }

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
      setOpenCrop(true)

    } catch (error) {
      setPhotoUpoading(false);
      console.error('Error uploading file:', error);
    }
  };

  const handleCropImage = async (file: File) => {
      if (!file) {
        throw new Error('No file selected');
      }
      
      const imageUrl = await uploadImage(file)
  
      if (imageUrl) {
        setProfileData({...profileData, image: imageUrl});
        setOpenCrop(false)
      }
      
    }
    const uploadImage = async (file: File): Promise<string> => {

      // console.log("Stupidity: ", profileData)

      try {
        const newBlob = await upload(file.name, file, {
          access: 'public',
          handleUploadUrl: '/api/uploads',
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
    setProfileData({ ...profileData, number: formattedNumber });
  };


  const validateUpdates = (): boolean => {

    const errors = {
      firstName: "",
      lastName: "",
      graduation: "",
      sport: "",
      playingcountries: "",
      country: "",
      state: "",
      city: "",
      birthday: "",
      grade_level: "",
      // age_group: "",
      // birth_year: "",
      age: "",
      team: "",
      position:"",
      phoneNumber: "",
      league: "",
      bio: "",
      location: "",
      countrycode: "",
    };




    if (!profileData.first_name) errors.firstName = 'First Name is required';
    if (!profileData.last_name) errors.lastName = 'Last Name is required';
    if (!profileData.graduation) errors.graduation = 'Graduation is required';
    if (!profileData.sport) errors.sport = 'Sport is required';
    if (!profileData.playingcountries) errors.playingcountries = "Nations is required"
    if (!profileData.country) errors.country = 'Country is required';
    if (!profileData.state) errors.state = "State is required";
    if (!profileData.city) errors.city = "City is required";
    if (!profileData.birthday) errors.birthday = "Birthday is required";
    if (!profileData.grade_level) errors.grade_level = "Level is required.";

    if (!profileData.age_group && !profileData.birth_year) errors.age = "Input either Age Group or Birth Year.";

    if (!profileData.team) errors.team = "Team name is required";

    if (!profileData.position) errors.position = "Positions are required"
    
    if (!profileData.number) errors.phoneNumber  = "Phone number is required"

    if (!profileData.league) errors.league = "League is required"

    if (!profileData.bio) errors.bio = "Bio is required"
    
    // if (!profileData.countrycode) errors.team_year = "Team year is required"



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
      // console.log(profileData.school_name);
      const session = await getSession();
      const playerId = session?.user.id;
    

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerId,
          profileData: {
            ...profileData,
            image: profileData.image || ""
          }
        }), // Include playerId and profileData
      });

      if (response.ok) {
        // Fetch the updated data again
        const updatedResponse = await fetch('/api/profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ playerId }),
        });
        if (updatedResponse.ok) {
          const updatedData = await updatedResponse.json();
          setProfileData(updatedData); // Update state with the new profile data
        } else {
          console.error("Failed to fetch updated profile data:", updatedResponse.statusText);
        }

        setIsEditMode(false);
        window.location.reload(); // Exit edit mode after saving
      } else {
        console.error("Failed to update profile:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };
  const handleCountryChange = (selectedOptions: any) => {
    // console.log(selectedOptions);
    const playingcountries = selectedOptions ? selectedOptions.map((option: any) => option.label).join(", ") : "";
    setNationality(selectedOptions);
    setProfileData({ ...profileData, playingcountries: playingcountries });
    // console.log(nationality);

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
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const triggerCertificateUpload = () => {
    certificateInputRef.current?.click();
  };
  const handlePositionChange = (selectedOptions: any) => {
    // console.log(selectedOptions)
    // Convert selected options into a comma-separated string
    const positions = selectedOptions ? selectedOptions.map((option: any) => option.value).join(", ") : "";
    setPosition(selectedOptions);
    setProfileData({ ...profileData, position: positions });
  };

  const handleDateChange = (date: Date | null) => {
    setProfileData({ ...profileData, birthday: date ? date.toISOString().split("T")[0] : "" });
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
                ) : (
                  <label className="block lg:text-3xl font-bold mb-2">Profile Image</label>
                )}
              <div
                onClick={triggerImageUpload}
                className="mt-4 cursor-pointer rounded-full border-4 border-indigo-300 p-2 hover:shadow-lg transition-all"
              >
                {profileData.image != 'null' && profileData.image != null ? (
                  <img
                    src={profileData.image}
                    alt=""
                    title=""
                    className="h-32 w-32 object-cover rounded-full"
                  />
                ) : (
                  <div className="h-32 w-32 flex items-center justify-center rounded-full">
                    <img
                      src='/default.jpg'
                      alt="Profile"
                      className="h-32 w-32 object-cover rounded-full"
                    />

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
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
                  <CropEasy
                    photoUrl={profileData.image}
                    setOpenCrop={setOpenCrop}
                    handleCropImage={handleCropImage}
                  />
                </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-5">
              {/* First Name */}
              <div>
                <label className="block text-base font-bold mb-2">Player First Name{isEditMode ? <span className='mandatory'>*</span> : ""}</label>
                {isEditMode ? (
                  <input
                    type="text"
                    name="first_name"
                    value={profileData.first_name}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="mt-2 text-[12px] font-medium text-gray-800">{profileData.first_name}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-base font-bold mb-2">Player Last Name{isEditMode ? <span className='mandatory'>*</span> : ""}</label>
                {isEditMode ? (
                  <input
                    type="text"
                    name="last_name"
                    value={profileData.last_name}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="mt-2 text-[12px] font-medium text-gray-800">{profileData.last_name}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-5">
              <div>
                <label className="block text-base font-bold mb-2">Height <span className="text-xs text-gray-500">(Optional)</span></label>
                {isEditMode ? (
                  <input
                    type="text"
                    name="height"
                    value={profileData.height}
                    onChange={handleHeightChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="block text-gray-700 text-sm font-semibold mb-2">{profileData.height}</p>
                )}
              </div>

              <div>
                <label className="block text-base font-bold mb-2">Weight (lbs) <span className="text-xs text-gray-500">(Optional)</span></label>
                {isEditMode ? (
                  <input
                    type="text"
                    name="weight"
                    value={profileData.weight}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="block text-gray-700 text-sm font-semibold mb-2">{profileData.weight}</p>
                )}
              </div>
              <div>
                <label htmlFor="graduation" className="block text-base font-bold mb-2">High School Graduation Year{isEditMode ? <span className='mandatory'>*</span> : ""}</label>
                {isEditMode ? (
                  <select
                    name="graduation"
                    className="border border-gray-300 rounded-md py-2 px-4 w-full"
                    value={profileData.graduation}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    {Grades
                      .map((grade) => (
                        <option key={grade} value={grade}>
                          {grade}
                        </option>
                      ))}

                  </select>
                ) : (
                  <p className="block text-gray-700 text-sm font-semibold mb-2">{profileData.graduation}</p>
                )}
              </div>


              <div>
                <label htmlFor="school_name" className="block text-base font-bold mb-2">School <span className="text-xs text-gray-500">(Optional)</span></label>
                {isEditMode ? (
                  <input
                    type="text"
                    name="school_name"
                    value={profileData.school_name}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="block text-gray-700 text-sm font-semibold mb-2">{profileData.school_name}</p>
                )}
              </div>


              <div>
                <label htmlFor="gpa" className="block text-base font-bold mb-2">GPA <span className="text-xs text-gray-500">(Optional)</span></label>
                {isEditMode ? (
                  <input
                    type="text"
                    name="gpa"
                    value={profileData.gpa}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="block text-gray-700 text-sm font-semibold mb-2">{profileData.gpa}</p>
                )}
              </div>
              <div>
                <label htmlFor="jersey" className="block text-base font-bold mb-2">Jersey Number (Optional)</label>
                {isEditMode ? (
                  <input
                    type="text"
                    name="jersey"
                    className="border border-gray-300 rounded-md py-2 px-4 w-full"
                    value={profileData.jersey}
                    onChange={handleChange}
                  />


                ) : (
                  <p className="block text-gray-700 text-sm font-semibold mb-2">{profileData.jersey}</p>
                )}
              </div>
              <div>
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
                <label htmlFor="playingcountries" className="block text-gray-700 text-sm font-semibold mb-2">Nationality(ies){isEditMode ? <span className='mandatory'>*</span> : ""}</label>
                {isEditMode ? (<Select
                  isMulti
                  name='playingcountries'
                  options={countries}
                  className="basic-multi-select"
                  classNamePrefix="select"
                  onChange={handleCountryChange}
                  placeholder="Select Country(s)"
                  value={nationality}

                />
                ) : (
                  <p className="block text-gray-700 text-sm font-semibold mb-2">{profileData.playingcountries}</p>
                )}
              </div>

            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-5">
              <div>
                <label className="block text-base font-bold mb-2">Country{isEditMode ? <span className='mandatory'>*</span> : ""}</label>
                {isEditMode ? (
                  <select
                    name="country"
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                    value={profileData.country}
                    onChange={handleChange}
                  >
                     {/* <option value="">Select a Country</option>
                    {countryCodesList 
                      .map((country) => (
                        <option key={country.id} value={country.id}>
                          {country.name}
                        </option>
                      ))} */}

                       <option value="">Select a Country</option>
                       {countriesArray
                        .map((country: any) => (
                          <option key={country.id} value={country.id}>
                            {country.name}
                          </option>
                        ))}

                    {/* <option value="">Select</option> */}
                    {/* <option value="USA">USA</option> */}

                  </select>
                ) : (
                  <p className="mt-2 text-[12px] font-medium text-gray-800">{profileData.countryName}</p>
                )}
              </div>

              <div >
                <label className="block text-base font-bold mb-2">State/Province{isEditMode ? <span className='mandatory'>*</span> : ""}</label>
                {isEditMode ? (

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
                ) : (
                  <p className="mt-2 text-[12px] font-medium text-gray-800">{profileData.state}</p>
                )}
              </div>

              <div>
                <label className="block text-base font-bold mb-2">City{isEditMode ? <span className='mandatory'>*</span> : ""}</label>
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
            </div>
            {/* dob */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-5">
              <div>
                <label htmlFor="birthday" className="block text-base font-bold mb-2">Birth Date{isEditMode ? <span className='mandatory'>*</span> : ""}</label>
                {isEditMode ? (
                  <DatePicker
                    selected={profileData.birthday ? new Date(profileData.birthday) : null}
                    onChange={handleDateChange}
                    dateFormat="MM/dd/yyyy" // Correct format
                    className="border border-gray-300 rounded-md py-2 px-4 w-full"
                  />
                ) : (
                  <p className="block text-gray-700 text-sm font-semibold mb-2">{profileData.birthday ? new Date(profileData.birthday).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit"
                  }).replace(/\//g, "-") : "N/A"}</p>
                )}
              </div>
              {/* level */}
              <div>
                <label htmlFor="grade_level" className="block text-base font-bold mb-2"> Level{isEditMode ? <span className='mandatory'>*</span> : ""}</label>
                {isEditMode ? (
                  <select name="grade_level" onChange={handleChange} className="border border-gray-300 rounded-md py-2 px-4 w-full" value={profileData.grade_level}>
                    {playingLevels.map((level) => (


                      <option value={level.value} key={level.value}>{level.label}</option>
                    ))}


                  </select>

                ) : (
                  <p className="block text-gray-700 text-sm font-semibold mb-2">{profileData.grade_level}</p>
                )}

              </div>
              {/* gender */}
              <div>
                <label htmlFor="gender" className="block text-base font-bold mb-2">Gender <span className="text-xs text-gray-500">(Optional)</span></label>
                {isEditMode ? (
                  <select
                    name="gender"
                    className="border border-gray-300 rounded-md py-2 px-4 w-full"
                    value={profileData.gender}
                    onChange={handleChange}
                  >
                    {genders.map((gender) => (


                      <option value={gender.value} key={gender.value}>{gender.label}</option>
                    ))}

                  </select>
                ) : (
                  <p className="block text-gray-700 text-sm font-semibold mb-2">{profileData.gender}</p>
                )}
              </div>

            </div>

            {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-5">
              <label>Age:<span className='mandatory'>*</span></label>
            </div>
            {isEditMode ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-5">

                <div>
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="option"
                      value="ageGroup"
                      checked={selectedOption === "ageGroup"}
                      onChange={() => {
                        setSelectedOption("ageGroup");
                        setProfileData((prev) => ({ ...prev, team_year: '' })); // Reset age_group
                      }}
                      className="hidden"
                    />
                    <span
                      className={`px-4 py-2 rounded-full min-w-[120px] text-center ${selectedOption === "ageGroup"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-800"
                        }`}
                    >
                      Age Group
                    </span>
                  </label>
                </div>
                <div>
                  <label className="inline-flex items-center cursor-pointer">
      <input
        type="radio"
        name="option"
        value="birthYear"
        checked={selectedOption === "birthYear"}
        
        onChange={() => {
          setSelectedOption("birthYear");
          setProfileData((prev) => ({ ...prev, age_group: '' })); // Reset age_group
        }}
        className="hidden"
      />
      <span
        className={`px-4 py-2 rounded-full min-w-[120px] text-center ${
          selectedOption === "birthYear"
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-800"
        }`}
      >
        Birth Year
      </span>
    </label>
                </div>

                {/* Conditional Select Dropdowns (Always in the Same Line) */}
                {/* {selectedOption === "ageGroup" && (
                  <div>
                    <select
                      className="  p-2 border rounded-md"
                      name="age_group"
                      onChange={handleChange}
                      value={profileData.age_group}
                    >
                      <option value="">Select Age Group</option>
                      {ageGroups.map((group) => (
                        <option key={group} value={group}>
                          {group}
                        </option>
                      ))}
                    </select>
                  </div>
                )} */}

                {/* {selectedOption === "birthYear" && (
                  <div>
                    <select
                      className=" p-2 border rounded-md"
                      name="birth_year"
                      onChange={handleChange}
                      value={profileData.birth_year}
                    >
                      <option value="">Select Birth Year</option>
                      {birthYears.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                )} */}
              {/* </div>
            ) : (
              <>
                <div>
                  {profileData.birth_year != '' && (
                    <p className="block text-gray-700 text-sm font-semibold mb-2">Birth Year: {profileData.birth_year}</p>

                  )}

                  {profileData.age_group != '' && (
                    <p className="block text-gray-700 text-sm font-semibold mb-2">Age Group: {profileData.age_group}</p>

                  )}

                </div>
              </>
            )} */} 

<div className="mb-5">
  <label className="block text-base font-bold mb-2">Age: {isEditMode ? <span className='mandatory'>*</span> : ""}</label>

  {isEditMode ? (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
      {/* Age Group Selection */}
      {["ageGroup", "birthYear"].map((option) => (
        <label key={option} className="inline-flex items-center cursor-pointer">
          <input
            type="radio"
            name="ageOption"
            value={option}
            checked={selectedDOBOption === option}
            onChange={() => {
              setSelectedDOBOption(option);
              setProfileData((prev) => ({
                ...prev,
                birth_year: option === "ageGroup" ? "" : prev.birth_year,
                age_group: option === "birthYear" ? "" : prev.age_group,
              }));
            }}
            className="hidden"
            aria-checked={selectedDOBOption === option}
          />
          <span
            className={`px-4 py-2 rounded-full min-w-[120px] text-center transition ${
              selectedDOBOption === option ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"
            }`}
          >
            {option === "ageGroup" ? "Age Group" : "Birth Year"}
          </span>
        </label>
      ))}

      {/* Conditional Select Inputs */}
      {selectedDOBOption === "ageGroup" && (
        <select
          className="p-2 border rounded-md"
          name="age_group"
          onChange={handleChange}
          value={profileData.age_group}
        >
          <option value="">Select Age Group</option>
          {ageGroups.map((group) => (
            <option key={group} value={group}>{group}</option>
          ))}
        </select>
      )}

      {selectedDOBOption === "birthYear" && (
        <select
          className="p-2 border rounded-md"
          name="birth_year"
          onChange={handleChange}
          value={profileData.birth_year}
        >
          <option value="">Select Birth Year</option>
          {birthYears.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      )}
    </div>
  ) : (
    // Display selected value in View Mode
    <p className="text-gray-700 text-sm font-semibold mt-2">
      {selectedDOBOption === "ageGroup" && profileData.age_group && `Age Group: ${profileData.age_group}`}
      {selectedDOBOption === "birthYear" && profileData.birth_year && `Birth Year: ${profileData.birth_year}`}
    </p>
  )}
</div>



            {/* Team */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-5">
              <div>
                <label htmlFor="team" className="block text-base font-bold mb-2">Team Name(s){isEditMode ? <span className='mandatory'>*</span> : ""}</label>
                {isEditMode ? (
                  <input
                    placeholder="Ex. LA Stars / 2011 or LA Tigers / U15"
                    type="text"
                    name="team"
                    className="border border-gray-300 rounded-md py-2 px-4 w-full"
                    value={profileData.team}
                    onChange={handleChange}
                  />

                ) : (
                  <p className="block text-gray-700 text-sm font-semibold mb-2">{profileData.team}</p>
                )}
              </div>
              {/* Position */}
              <div>
                <label htmlFor="position" className="block text-base font-bold mb-2">Position(s){isEditMode ? <span className='mandatory'>*</span> : ""}</label>
                {isEditMode ? (
                  <Select
                    isMulti
                    options={positionOptionsList}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    onChange={handlePositionChange}
                    placeholder="Select"
                    value={position}
                  />
                ) : (
                  <p className="block text-gray-700 text-sm font-semibold mb-2">{profileData.position}</p>
                )}
              </div>




              <div>
                <label className="block text-base font-bold">Mobile Number{isEditMode ? <span className='mandatory'>*</span> : ""}</label>
                {isEditMode ? (
                  <div className="flex">
                    <select
                      name="countrycode"
                      className="mt-2 block  border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500 w-1/3 mr-1" // Added mr-4 for margin-right
                      value={profileData.countrycode}
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
                      value={profileData.number}
                      onChange={handlePhoneNumberChange}
                      className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                    />
                  </div>
                ) : (
                  <p className="mt-2 text-[12px] font-medium text-gray-800"> {profileData.number}</p>
                )}
              </div>
            </div>



            <div className="col-span-1 mt-5">
              <label className="block text-base font-bold mb-2">League(s){isEditMode ? <span className='mandatory'>*</span> : ""}</label>
              {isEditMode ? (
                <input
                  name="league"
                  placeholder='Pre ECNL, ECNL and ECRL'
                  value={profileData.league}
                  onChange={handleChange}
                  className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                />
              ) : (
                <p className="mt-2 text-sm font-medium text-gray-800 whitespace-pre-wrap">
                  {profileData.league}
                </p>
              )}
            </div>

            <div className="col-span-1 mt-5">
              <label className="block text-base font-bold mb-2">Experience/Accolades{isEditMode ? <span className='mandatory'>*</span> : ""}</label>
              {isEditMode ? (
                <textarea
                  name="bio"
                  rows={4}
                  value={profileData.bio}
                  onChange={handleChange}
                  className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                />
              ) : (
                <p className="mt-2 text-sm font-medium text-gray-800 whitespace-pre-wrap">
                  {profileData.bio}
                </p>
              )}
            </div>
            {/* Facebook */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-5">
              <div>
                <label htmlFor="facebook" className="block text-base font-bold mb-2">Facebook Link<span className="text-xs text-gray-500"> (Optional)</span></label>

                {isEditMode ? (
                  <input
                    type="text"
                    name="facebook"
                    value={profileData.facebook}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="mt-2 text-[12px] font-medium break-words text-gray-800">{profileData.facebook}</p>
                )}
              </div>

              {/* Instagram */}
              <div>
                <label htmlFor="instagram" className="block text-base font-bold mb-2">Instagram Link<span className="text-xs text-gray-500"> (Optional)</span></label>

                {isEditMode ? (
                  <input
                    type="text"
                    name="instagram"
                    value={profileData.instagram}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="mt-2 text-[12px] font-medium break-words text-gray-800">{profileData.instagram}</p>
                )}
              </div>
              {/* Linkedin */}
              <div>
                <label htmlFor="linkedin" className="block text-base font-bold mb-2">Linkedin Link<span className="text-xs text-gray-500"> (Optional)</span></label>

                {isEditMode ? (
                  <input
                    type="text"
                    name="linkedin"
                    value={profileData.linkedin}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="mt-2 text-[12px] font-medium break-words text-gray-800">{profileData.linkedin}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-5">
              {/* xlink */}
              <div>
                <label htmlFor="xlink" className="block text-base font-bold mb-2">XLink <span className="text-xs text-gray-500"> (Optional)</span></label>

                {isEditMode ? (
                  <input
                    type="text"
                    name="xlink"
                    value={profileData.xlink}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="mt-2 text-[12px] font-medium break-words text-gray-800">{profileData.xlink}</p>
                )}
              </div>
              {/* youtube */}
              <div>
                <label htmlFor="youtube" className="block text-base font-bold mb-2">YouTube Link<span className="text-xs text-gray-500"> (Optional)</span></label>

                {isEditMode ? (
                  <input
                    type="text"
                    name="youtube"
                    value={profileData.youtube}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="mt-2 text-[12px] font-medium break-words text-gray-800">{profileData.youtube}</p>
                )}
              </div>
              <div>
                <label htmlFor="website" className="block text-base font-bold mb-2">Website Link<span className="text-xs text-gray-500"> (Optional)</span></label>

                {isEditMode ? (
                  <input
                    type="text"
                    name="website"
                    value={profileData.website}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="mt-2 text-[12px] font-medium break-words text-gray-800">{profileData.website}</p>
                )}
              </div>
            </div>



            {/* Certificate Image Thumbnail */}

          </div>
        </main>
      </div>
    </>
  );
};

export default Profile;
