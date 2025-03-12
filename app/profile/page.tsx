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
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Profile: React.FC = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [playerId, setPlayerId] = useState<number | undefined>(undefined);
  const [countriesArray, setCountriesArray] = useState([]);
  const [nationality, setNationality] = useState<{ label: string; value: string }>({ label: '', value: '' });
  const [position, setPosition] = useState<{ label: string; value: string }>({ label: '', value: '' });
  const [photoUpoading, setPhotoUpoading] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
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
    team_year: "",
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
          setProfileData(data);
          console.log("Testing:" + data.birth_year);
          if (data.age_group != '') {
            setSelectedOption('ageGroup')
          }
          if (data.birth_year != '') {
            setSelectedOption('birthYear')
          }

          if (data.playingcountries.includes(',')) {
            nationalities = data.playingcountries
              .split(',')
              .map((country: string) =>
                countries.find(option => option.value.trim() === country.trim())
              )
              .filter(Boolean);
          } else {

            nationalities = [data.playingcountries.trim()];
          }

          setNationality({ label: nationalities, value: nationalities });


          if (data.position.includes(',')) {
            ppositons = data.position
              .split(',')
              .map((country: string) =>
                positionOptionsList.find(option => option.value.trim() === country.trim())
              )
              .filter(Boolean);
          } else {

            ppositons = [data.position.trim()];
          }
          console.log(ppositons);
          setPosition(ppositons);


        } else {
          console.error("Error fetching profile data:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData();
  }, []);


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
  const handleSubmit = async () => {
    try {
      console.log(profileData);
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
    const playingcountries = selectedOptions ? selectedOptions.map((option: any) => option.label).join(", ") : "";
    setProfileData({ ...profileData, playingcountries: playingcountries });

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
    // Convert selected options into a comma-separated string
    const positions = selectedOptions ? selectedOptions.map((option: any) => option.value).join(", ") : "";
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
                  setIsEditMode(!isEditMode);
                }}
                className={`px-5 py-2 rounded-lg transition-all duration-200 ease-in-out shadow-md ${isEditMode ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
              >
                {isEditMode ? 'Save Profile' : 'Edit Profile'}
              </button>
            </div>

            {/* Profile Image Section */}
            <div className="flex flex-col items-center mb-8">
              <label className="block text-gray-700 text-sm font-semibold mb-2">Profile Image</label>
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
                <label className="block text-gray-700 text-sm font-semibold mb-2">Player First Name<span className='mandatory'>*</span></label>
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
                <label className="block text-gray-700 text-sm font-semibold mb-2">Player Last Name<span className='mandatory'>*</span></label>
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
                <label className="block text-gray-700 text-sm font-semibold mb-2">Height <span className="text-xs text-gray-500">(Optional)</span></label>
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
                <label className="block text-gray-700 text-sm font-semibold mb-2">Weight (lbs) <span className="text-xs text-gray-500">(Optional)</span></label>
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
                <label htmlFor="graduation" className="block text-gray-700 text-sm font-semibold mb-2">High School Graduation Year<span className='mandatory'>*</span></label>
                {isEditMode ? (
                  <select
                    name="graduation"
                    className="border border-gray-300 rounded-lg py-2 px-4 w-full"
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
                <label htmlFor="school_name" className="block text-gray-700 text-sm font-semibold mb-2">School Name <span className="text-xs text-gray-500">(Optional)</span></label>
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
                <label htmlFor="gpa" className="block text-gray-700 text-sm font-semibold mb-2">GPA <span className="text-xs text-gray-500">(Optional)</span></label>
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
                <label htmlFor="jersey" className="block text-gray-700 text-sm font-semibold mb-2">Jersey Number (Optional)</label>
                {isEditMode ? (
                  <input
                    type="text"
                    name="jersey"
                    className="border border-gray-300 rounded-lg py-2 px-4 w-full"
                    value={profileData.jersey}
                    onChange={handleChange}
                  />


                ) : (
                  <p className="block text-gray-700 text-sm font-semibold mb-2">{profileData.jersey}</p>
                )}
              </div>
              <div>
                <label htmlFor="sport" className="block text-gray-700 text-sm font-semibold mb-2">Sport(s)<span className='mandatory'>*</span></label>
                {isEditMode ? (
                  <select
                    name="sport"
                    className="border border-gray-300 rounded-lg py-2 px-4 w-full"
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
                <label htmlFor="playingcountries" className="block text-gray-700 text-sm font-semibold mb-2">{nationalities}Nationality(ies)<span className='mandatory'>*</span></label>
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
                <label className="block text-gray-700 text-sm font-semibold mb-2">Country<span className='mandatory'>*</span></label>
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

                       <option value="" disabled>Select a Country</option>
  {countryCodesList.map(({ id, country }) => (
    <option key={id} value={id}>{country}</option>
  ))}

                    {/* <option value="">Select</option> */}
                    {/* <option value="USA">USA</option> */}

                  </select>
                ) : (
                  <p className="mt-2 text-[12px] font-medium text-gray-800">{profileData.countryName}</p>
                )}
              </div>

              <div >
                <label className="block text-gray-700 text-sm font-semibold mb-2">State/Province<span className='mandatory'>*</span></label>
                {isEditMode ? (

                  <select
                    name="state"
                    id="state"
                    value={profileData.state}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  >
                    <option value="">Select a state</option>
                    {states.map((state) => (
                      <option key={state.abbreviation} value={state.name}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="mt-2 text-[12px] font-medium text-gray-800">{profileData.state}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">City<span className='mandatory'>*</span></label>
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
                <label htmlFor="birthday" className="block text-gray-700 text-sm font-semibold mb-2">Birth Date<span className='mandatory'>*</span></label>
                {isEditMode ? (
                  <DatePicker
                    selected={profileData.birthday ? new Date(profileData.birthday) : null}
                    onChange={handleDateChange}
                    dateFormat="MM-DD-YYYY" // Correct format
                    className="border border-gray-300 rounded-lg py-2 px-4 w-full"
                    placeholderText="Select a date"
                  />
                ) : (
                  <p className="block text-gray-700 text-sm font-semibold mb-2">{profileData.birthday}</p>
                )}
              </div>
              {/* level */}
              <div>
                <label htmlFor="grade_level" className="block text-gray-700 text-sm font-semibold mb-2"> Level<span className='mandatory'>*</span></label>
                {isEditMode ? (
                  <select name="grade_level" onChange={handleChange} className="border border-gray-300 rounded-lg py-2 px-4 w-full" value={profileData.grade_level}>
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
                <label htmlFor="gender" className="block text-gray-700 text-sm font-semibold mb-2">Gender <span className="text-xs text-gray-500">(Optional)</span></label>
                {isEditMode ? (
                  <select
                    name="gender"
                    className="border border-gray-300 rounded-lg py-2 px-4 w-full"
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
  <label className="block font-semibold">Age: <span className="text-red-500">*</span></label>

  {isEditMode ? (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
      {/* Age Group Selection */}
      {["ageGroup", "birthYear"].map((option) => (
        <label key={option} className="inline-flex items-center cursor-pointer">
          <input
            type="radio"
            name="ageOption"
            value={option}
            checked={selectedOption === option}
            onChange={() => {
              setSelectedOption(option);
              setProfileData((prev) => ({
                ...prev,
                birth_year: option === "ageGroup" ? "" : prev.birth_year,
                age_group: option === "birthYear" ? "" : prev.age_group,
              }));
            }}
            className="hidden"
            aria-checked={selectedOption === option}
          />
          <span
            className={`px-4 py-2 rounded-full min-w-[120px] text-center transition ${
              selectedOption === option ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"
            }`}
          >
            {option === "ageGroup" ? "Age Group" : "Birth Year"}
          </span>
        </label>
      ))}

      {/* Conditional Select Inputs */}
      {selectedOption === "ageGroup" && (
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

      {selectedOption === "birthYear" && (
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
      {selectedOption === "ageGroup" && profileData.age_group && `Age Group: ${profileData.age_group}`}
      {selectedOption === "birthYear" && profileData.birth_year && `Birth Year: ${profileData.birth_year}`}
    </p>
  )}
</div>



            {/* Team */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-5">
              <div>
                <label htmlFor="team" className="block text-gray-700 text-sm font-semibold mb-2">Team Name<span className='mandatory'>*</span></label>
                {isEditMode ? (
                  <input
                    placeholder="Ex. LA Stars / 2011 or LA Tigers / U15"
                    type="text"
                    name="team"
                    className="border border-gray-300 rounded-lg py-2 px-4 w-full"
                    value={profileData.team}
                    onChange={handleChange}
                  />

                ) : (
                  <p className="block text-gray-700 text-sm font-semibold mb-2">{profileData.team}</p>
                )}
              </div>
              {/* Position */}
              <div>
                <label htmlFor="position" className="block text-gray-700 text-sm font-semibold mb-2">Position(s)<span className='mandatory'>*</span></label>
                {isEditMode ? (
                  <Select
                    isMulti
                    options={positionOptionsList}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    onChange={handlePositionChange}
                    placeholder="Select"
                  />
                ) : (
                  <p className="block text-gray-700 text-sm font-semibold mb-2">{profileData.team}</p>
                )}
              </div>




              <div>
                <label className="block text-gray-700 text-sm font-semibold ">Mobile Number<span className='mandatory'>*</span></label>
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
              <label className="block text-gray-700 text-sm font-semibold mb-2">League<span className='mandatory'>*</span></label>
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
              <label className="block text-gray-700 text-sm font-semibold mb-2">Experience/Accolades<span className='mandatory'>*</span></label>
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
                <label htmlFor="facebook" className="block text-gray-700 text-sm font-semibold mb-2">Facebook Link<span className="text-xs text-gray-500"> (Optional)</span></label>

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
                <label htmlFor="instagram" className="block text-gray-700 text-sm font-semibold mb-2">Instagram Link<span className="text-xs text-gray-500"> (Optional)</span></label>

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
                <label htmlFor="linkedin" className="block text-gray-700 text-sm font-semibold mb-2">Linkedin Link<span className="text-xs text-gray-500"> (Optional)</span></label>

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
              {/* xlink */}
              <div>
                <label htmlFor="xlink" className="block text-gray-700 text-sm font-semibold mb-2">XLink <span className="text-xs text-gray-500"> (Optional)</span></label>

                {isEditMode ? (
                  <input
                    type="text"
                    name="xlink"
                    value={profileData.xlink}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="mt-2 text-[12px] font-medium text-gray-800">{profileData.xlink}</p>
                )}
              </div>
              {/* youtube */}
              <div>
                <label htmlFor="youtube" className="block text-gray-700 text-sm font-semibold mb-2">YouTube Link<span className="text-xs text-gray-500"> (Optional)</span></label>

                {isEditMode ? (
                  <input
                    type="text"
                    name="youtube"
                    value={profileData.youtube}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="mt-2 text-[12px] font-medium text-gray-800">{profileData.youtube}</p>
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
