"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import Brand from "../public/images/brand.jpg";
import Image from "next/image";
import DefaultPic from "../public/default.jpg";
import { getSession, signIn, useSession } from "next-auth/react";
import { type PutBlobResult } from '@vercel/blob';
import { upload } from '@vercel/blob/client';
import Select from "react-select";
import { FaCheck, FaSpinner } from "react-icons/fa";
import FileUploader from "../components/FileUploader";
import { countryCodesList, states, positionOptionsList, genders, playingLevels, Grades, countries } from "@/lib/constants";
import { showError } from "../components/Toastr";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CropEasy from "../components/crop/CropEasy";
const birthYears = Array.from({ length: 36 }, (_, i) => 1985 + i);
export interface FormValues {
  first_name: string;
  last_name: string;
  grade_level: string;
  location: string;
  birthday: string;
  gender: string;
  sport: string;
  team: string;
  position: string;
  number: string;
  bio: string;
  country: string;
  state: string;
  city: string;
  jersey: string;
  league: string;
  countrycode: string;
  playingcountries: string;
  height: string;
  weight: string;
  graduation: string;
  school_name: string;
  gpa?: number;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  website?: string;
  age_group?: string;
  xlink?: string;
  team_year?: string;
  image: string | null; // Updated to store Base64 string
  isCompletedProfile: boolean;
}

export default function Register() {
  const router = useRouter();
  const [formValues, setFormValues] = useState<FormValues>({
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
    bio: "",
    country: "",
    state: "",
    city: "",
    jersey: "",
    league: "",
    countrycode: "+1",
    playingcountries: "",
    height: "",
    weight: "",
    graduation: "",
    school_name: "",
    facebook: "",
    instagram: "",
    linkedin: "",
    youtube: "",
    website: "",
    age_group: "",
    team_year: "",
    xlink: "",
    gpa: undefined,
    image: null,
    isCompletedProfile: false
  });

  const { data: session, update } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Partial<FormValues>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [photoUploading, setPhotoUploading] = useState<boolean>(false);
  const [maxDate, setMaxDate] = useState('');
  const [height, setHeight] = useState("");
  const [countriesList, setCountriesList] = useState([]);
  const [statesList, setStatesList] = useState([]);
  const [openCrop, setOpenCrop] = useState<boolean>(false);

  const ageGroups = ["U6", "U7", "U8", "U9", "U10", "U11", "U12", "U13", "U14", "U15", "U16", "U17", "U18", "U19", "High School", "College", "Semi Pro", "Pro"];
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
      return `${feet}'${inches}"`; // Format as feet and decimal inches
    } else {
      return `${feet}'`; // Format as feet only
    }
  };



  const handleHeightChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const formattedValue = formatHeight(value);
    setFormValues((prevValues) => ({ ...prevValues, height: formattedValue }));
  };

  const updateIsCompletedField = async () => {
    const formData = new FormData();
    setFormValues(prevFormValues => {
      const updatedValues = {...prevFormValues, isCompletedProfile: true}
      // Append all form values to FormData
      for (const key in updatedValues) {
        const value = updatedValues[key as keyof FormValues];
        formData.append(key, value as string | Blob);
      }
      
      return updatedValues
    });
    return formData;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    
    // Validation
    const newErrors: Partial<FormValues> = {};
    // if (!formValues.image) {
    //     newErrors.image = "Profile image is required";
    // } else {
    //     // Calculate the approximate size of the base64 string
    //     const imageSizeInBytes = (formValues.image.length * 3) / 4;
    //     if (imageSizeInBytes > 5 * 1024 * 1024) {
    //         newErrors.image = "Image size must be less than 5MB";
    //     }
    // }
    if (!formValues.first_name.trim()) newErrors.first_name = "First name is required.";
    if (!formValues.last_name.trim()) newErrors.last_name = "Last name is required.";


    const heightRegex = /^(\d{1,2})'(\d{1,2}(?:\.\d{1,2})?)?"$/;

    if (formValues.height.trim() && !heightRegex.test(formValues.height.trim())) {
      newErrors.height = "Height must be in the format X'Y\" (e.g., 5'6\").";
    }
    const weightRegex = /^\d+(\.\d{1,2})?$/;
    if (formValues.weight.trim() && !weightRegex.test(formValues.weight.trim())) {
      newErrors.weight = "Weight must be a valid decimal number (e.g., 70.5).";
    }



    if (!formValues.graduation.trim()) newErrors.graduation = "Graduation is required.";
    if (!formValues.birthday) newErrors.birthday = "Birthday is required.";
    if (!formValues.grade_level) newErrors.grade_level = "Level is required.";
    /// if (!formValues.gender) newErrors.gender = "Gender is required.";
    if (!formValues.sport) newErrors.sport = "Sports is required.";
    //if (!formValues.jersey) newErrors.jersey = "Jersey number is required.";
    if (!formValues.playingcountries) newErrors.playingcountries = "Nationality is required.";
    if (!formValues.team.trim()) newErrors.team = "Team is required.";
    if (!formValues.position.trim()) newErrors.position = "Position is required.";
    if (!formValues.countrycode.trim()) newErrors.countrycode = "Country code is required.";

    if (!formValues.number.trim()) newErrors.number = "Mobile Number is required.";
    if (formValues.number.length < 14) newErrors.number = 'Mobile Number Must be of 14 Digits Minimum';
    if (!/^\(\d{3}\) \d{3}-\d{4}$/.test(formValues.number)) {
      newErrors.number = 'Mobile Number must be in the format (XXX) XXX-XXXX';
    }
    if (formValues.number.length > 14) newErrors.number = 'Mobile Number Must be of 14 Digits Maximum';


    if (!formValues.bio.trim()) newErrors.bio = "Experience/Accolades is required.";
    if (!formValues.country.trim()) newErrors.country = "Country is required.";
    if (!formValues.state.trim()) newErrors.state = "State/Province is required.";
    if (!formValues.city.trim()) newErrors.city = "City is required.";
    if (!formValues.league.trim()) newErrors.age_group = "Age Group is required.";
    if (!formValues.league.trim()) newErrors.league = "League details is required.";

    // Set validation errors if any
    if (Object.keys(newErrors).length > 0) {
      const orderedErrors = Object.keys(newErrors)
        .reverse() // Reverse the keys array
        .map((key) => newErrors[key as keyof Partial<FormValues>]);  // Cast key to keyof Partial<FormValues>

      orderedErrors.forEach((error) => {
        if (error) {
          showError(error!.toString()); // Safely call toString
        }
      });

      setValidationErrors(newErrors); // Optionally set the errors in the state
      return;
    }
    const formData = await updateIsCompletedField() //don't need to pass formData since we assign formData when returning
    
    if (session && session.user.id) {
      formData.append("playerID", session.user.id); // Assuming user.id is the ID
    } else {
      setError("User is not authenticated");
      return;
    }
    setLoading(true);
    try {
      session.user.name = formValues.first_name;
      session.user.image = formValues.image;
      
      const token = localStorage.getItem("token");
      
      const response = await fetch("/api/register", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`, // Send token in Authorization header
        },
        body: formData,
      });
      
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Something went wrong!");
      }

      const updatedSession  = await getSession();

      if (updatedSession  && updatedSession .user) {
        await update({
          ...updatedSession,
          user: {
            ...updatedSession.user,
            isCompletedProfile: true
          }
        });
        window.location.href = "/dashboard";
      }
      if (session && session.user.id) {
        const email = session?.user?.email;
      }      
      // window.location.href = "/dashboard"; // Redirect after successful registration
    } catch (err) {
      setLoading(false);
      showError(err instanceof Error ? err.message : "Something went wrong!");
    }
  };


//   useEffect(() => {
//     const interceptNavigation = async (event:any) => {
//       // Check if the profile is completed, this could come from context or session
//       const isCompletedProfile = session?.user.isCompletedProfile;  // Replace with actual logic

//       if (!isCompletedProfile) {
//         // Show SweetAlert popup
//         const result = await Swal.fire({
//           title: 'Profile Incomplete',
//           text: 'Please complete your profile before proceeding.',
//           icon: 'warning',
//           confirmButtonText: 'Complete Profile',
//         });

//         if (result.isConfirmed) {
//           // Redirect to the profile completion page after the popup
//           router.push('/completeprofile');
//         } else {
//           // Optionally, handle what to do if the user cancels the popup
//           console.log('User canceled, navigation blocked');
//         }
        
//         // Prevent the default navigation until user response
//         event.preventDefault(); // Stops the navigation from occurring
//       }
//     };

//     // Attach event listener to intercept navigation
//     // window.addEventListener('beforeunload', interceptNavigation);
//       window.addEventListener("beforeunload", function(event) {
//       // Custom logic can go here
//       event.preventDefault(); // Some browsers might require this line
//     });

//     // Clean up the event listener when component unmounts
//     return () => {
//       window.removeEventListener('beforeunload', interceptNavigation);
//     };
//   }, [router]);
  

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormValues({ ...formValues, [name]: value });
    setValidationErrors({ ...validationErrors, [name]: "" }); // Clear error when input is changed
    if (name === 'country') {
      fetchStates(Number(value));
    }
  };

  const handleImageUpload = async (file: File, closeCrop: boolean = false) => {
    if (!file) throw new Error('No file selected');
  
    setPhotoUploading(true);
    const imageUrl = await uploadImage(file);
    setPhotoUploading(false);
  
    if (imageUrl) {
      setFormValues(prev => ({ ...prev, image: imageUrl }));
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

  useEffect(() => {
    fetch('/api/masters/countries')
      .then((response) => response.json())
      .then((data) => setCountriesList(data || []))
      .catch((error) => console.error('Error fetching countries:', error));
  }, []);

  

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
    setFormValues({ ...formValues, number: formattedNumber });
  };
  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Trigger file input click
    }
  };

  const handleDateChange = (date: Date | null) => {
    setFormValues({ ...formValues, birthday: date ? date.toISOString().split("T")[0] : "" });
  };

  const handlePositionChange = (selectedOptions: any) => {
    // Convert selected options into a comma-separated string
    const positions = selectedOptions ? selectedOptions.map((option: any) => option.value).join(", ") : "";
    setFormValues({ ...formValues, position: positions });
  };

  const handleCountryChange = (selectedOptions: any) => {
    const playingcountries = selectedOptions ? selectedOptions.map((option: any) => option.label).join(", ") : "";
    setFormValues({ ...formValues, playingcountries: playingcountries });
  };


  return (
    <>
      <div className="container mx-auto p-4">
        <div className="flex flex-col justify-center bg-white p-4 w-full">
          <div className="bg-white rounded-lg p-0 w-full md:max-w-3xl lg:max-w-5xl m-auto">
            <h2 className="text-2xl lg:text-3xl font-bold mb-2 text-left">Add Your Personal Information</h2>
            {/* <p className="text-red-500">( Fields marked with * are mandatory.)</p> */}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
            <form onSubmit={handleSubmit} >

              <div className="mb-4">
                <label htmlFor="image" className="block text-gray-700 text-sm text-center font-semibold mb-2">Player Image<span className='mandatory'>*</span></label>
                <div className="relative items-center cursor-pointer" onClick={handleImageClick}>
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-300 m-auto">
                    <Image
                      src={formValues.image ? formValues.image : DefaultPic}
                      alt="Profile Image"
                      width={100}
                      height={100}
                      className="object-cover w-full h-full"
                    />
                    {!formValues.image && (
                      <div className="absolute top-8 left-0 w-full h-8 bg-black bg-opacity-60 flex items-center justify-center">
                        <p className="text-white text-xs font-medium">Click to Upload</p>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    ref={fileInputRef}
                  />
                  {photoUploading ? (
                    <>
                      <FileUploader/>
                    </>
                  ) : (
                    <>
                      {/* Optional: Placeholder for additional content */}
                    </>
                  )}

                </div>
                {openCrop && (
                  <CropEasy
                    photoUrl={formValues.image}
                    setOpenCrop={setOpenCrop}
                    handleCropImage={handleCropImage}
                  />
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 pb-5">
                <div>
                  <label htmlFor="first_name" className="block text-gray-700 text-sm font-semibold mb-2">
                    Player First Name<span className='mandatory'>*</span>
                  </label>
                  <input

                    type="text"
                    name="first_name"
                    className="border border-gray-300 rounded-lg py-2 px-4 w-full"
                    value={formValues.first_name}
                    onChange={handleChange}
                  />

                </div>

                {/* Last Name */}
                <div>
                  <label htmlFor="last_name" className="block text-gray-700 text-sm font-semibold mb-2">Player Last Name<span className='mandatory'>*</span></label>
                  <input

                    type="text"
                    name="last_name"
                    className="border border-gray-300 rounded-lg py-2 px-4 w-full"
                    value={formValues.last_name}
                    onChange={handleChange}
                  />

                </div>

                {/* Location */}
                {/* <div style={{ display: 'none' }}>
                  <label htmlFor="location" className="block text-gray-700 text-sm font-semibold mb-2">Playing Location </label>
                  <input
                    type="text"
                    name="location"
                    className="border border-gray-300 rounded-lg py-2 px-4 w-full"
                    value={formValues.location}
                    onChange={handleChange}
                  />

                </div> */}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-5">
                <div>
                  <label htmlFor="height" className="block text-gray-700 text-sm font-semibold mb-2">Height <span className="text-xs text-gray-500">(Optional)</span></label>
                  <input
                    type="text"
                    name="height"
                    className="border border-gray-300 rounded-lg py-2 px-4 w-full"
                    value={formValues.height}
                    onChange={handleHeightChange}
                    placeholder="Feet' Inches&quot;"
                  />

                </div>

                <div>
                  <label htmlFor="weight" className="block text-gray-700 text-sm font-semibold mb-2">Weight (lbs)  <span className="text-xs text-gray-500">(Optional)</span></label>
                  <input
                    type="text"
                    name="weight"
                    className="border border-gray-300 rounded-lg py-2 px-4 w-full"
                    value={formValues.weight}
                    onChange={handleChange}
                  />

                </div>


                <div>
                  <label htmlFor="weight" className="block text-gray-700 text-sm font-semibold mb-2">High School Graduation Year<span className='mandatory'>*</span></label>
                  <select
                    name="graduation"
                    className="border border-gray-300 rounded-lg py-2 px-4 w-full"
                    value={formValues.graduation}
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

                </div>
                <div>
                  <label htmlFor="bio" className="block text-gray-700 text-sm font-semibold mb-2">School Name<span className="text-xs text-gray-500">(Optional)</span></label>
                  <input
                    type="text"
                    placeholder="Ex: St. Thomas International School"
                    name="school_name"
                    className="border border-gray-300 rounded-lg py-2 px-4 w-full"
                    value={formValues.school_name}
                    onChange={handleChange}
                  />

                </div>
                <div>
                  <label htmlFor="bio" className="block text-gray-700 text-sm font-semibold mb-2">GPA<span className="text-xs text-gray-500">(Optional)</span></label>
                  <input
                    type="number"
                    placeholder=""
                    name="gpa"
                    className="border border-gray-300 rounded-lg py-2 px-4 w-full"
                    min="0"
                    step="any"
                    value={formValues.gpa}
                    onChange={handleChange}
                  />

                </div>

                <div>
                  <label htmlFor="jersey" className="block text-gray-700 text-sm font-semibold mb-2">Jersey Number (Optional)</label>
                  <input
                    type="text"
                    name="jersey"
                    className="border border-gray-300 rounded-lg py-2 px-4 w-full"
                    value={formValues.jersey}
                    onChange={handleChange}
                  />

                </div>
                <div>
                  <label htmlFor="sport" className="block text-gray-700 text-sm font-semibold mb-2">Sport(s)<span className='mandatory'>*</span></label>
                  <select
                    name="sport"
                    className="border border-gray-300 rounded-lg py-2 px-4 w-full"
                    value={formValues.sport}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    <option value="Soccer">Soccer</option>

                  </select>


                </div>

                <div>
                  <label htmlFor="nationality" className="block text-gray-700 text-sm font-semibold mb-2">Nationalit(ies) <span className="mandatory">*</span></label>
                  <Select
                    isMulti
                    options={countries}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    onChange={handleCountryChange}
                    placeholder="Select"
                  />

                </div>
              </div>


              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span>Age<span className="text-red-500">*</span>:</span>
                </div>





                <div className="grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-6 gap-6 pb-5">


                  {/* Radio Buttons */}
                  <div>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="option"
                        value="ageGroup"
                        checked={selectedOption === "ageGroup"}
                        onChange={() => {
                          setSelectedOption("ageGroup");
                          setFormValues((prev) => ({ ...prev, team_year: '' })); // Reset age_group
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
                          setFormValues((prev) => ({ ...prev, age_group: '' })); // Reset age_group
                        }}
                        className="hidden"
                      />
                      <span
                        className={`px-4 py-2 rounded-full min-w-[120px] text-center ${selectedOption === "birthYear"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-800"
                          }`}
                      >
                        Birth Year
                      </span>
                    </label>
                  </div>

                  {/* Conditional Select Dropdowns (Always in the Same Line) */}
                  {selectedOption === "ageGroup" && (
                    <div>
                      <select
                        className="  p-2 border rounded-md"
                        name="age_group"
                        onChange={handleChange}
                        value={formValues.age_group}
                      >
                        <option value="">Select Age Group</option>
                        {ageGroups.map((group) => (
                          <option key={group} value={group}>
                            {group}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {selectedOption === "birthYear" && (
                    <div>
                      <select
                        className=" p-2 border rounded-md"
                        name="team_year"
                        onChange={handleChange}
                        value={formValues.team_year}
                      >
                        <option value="">Select Birth Year</option>
                        {birthYears.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}














                </div>

              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-5">
                <div>
                  <label htmlFor="country" className="block text-gray-700 text-sm font-semibold mb-2">Country<span className='mandatory'>*</span></label>
                  <select
                    name="country"
                    className="border border-gray-300 rounded-lg py-2 px-4 w-full"
                    value={formValues.country}
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


                </div>
                <div>
                  <label htmlFor="state" className="block text-gray-700 text-sm font-semibold mb-2">State/Province<span className='mandatory'>*</span></label>


                  <select
                    name="state"
                    id="state"
                    value={formValues.state}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-lg py-2 px-4 w-full"
                  >
                    <option value="">Select</option>
                    {statesList.map((state: any, index) => (
                      <option key={index} value={state.name}>
                        {state.name}
                      </option>
                    ))}
                  </select>

                </div>
                <div>
                  <label htmlFor="city" className="block text-gray-700 text-sm font-semibold mb-2">City<span className='mandatory'>*</span></label>
                  <input
                    placeholder="Ex: Austin"
                    type="text"
                    name="city"
                    className="border border-gray-300 rounded-lg py-2 px-4 w-full"
                    value={formValues.city}
                    onChange={handleChange}
                  />

                </div>

              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-5">


                <div>
                  <label htmlFor="birthday" className="block text-gray-700 text-sm font-semibold mb-2">Birth Date<span className='mandatory'>*</span></label>

                  {/* <DatePicker
                    selected={formValues.birthday ? new Date(formValues.birthday) : null}
                    onChange={handleDateChange}
                    dateFormat="MM-dd-yyyy" // Correct format
                    className="border border-gray-300 rounded-lg py-2 px-4 w-full"
                    placeholderText="Select a date"
                  /> */}
                  <DatePicker
                    selected={formValues.birthday ? new Date(formValues.birthday) : null}
                    onChange={handleDateChange}
                    dateFormat="MM-dd-yyyy"
                    className="border border-gray-300 rounded-lg py-2 px-4 w-full"
                    showYearDropdown
                    scrollableYearDropdown
                    showMonthDropdown
                    minDate={new Date(1985, 0, 1)} // Set minimum selectable date
                    maxDate={new Date(2025, 11, 31)} // Set maximum selectable date
                    yearDropdownItemNumber={41} // Ensures dropdown includes years from 1985 to 2025
                  />

                </div>
                <div>
                  <label htmlFor="grade_level" className="block text-gray-700 text-sm font-semibold mb-2"> Level<span className='mandatory'>*</span></label>

                  <select name="grade_level" onChange={handleChange} className="border border-gray-300 rounded-lg py-2 px-4 w-full" value={formValues.grade_level}>
                    {playingLevels.map((level) => (


                      <option value={level.value} key={level.value}>{level.label}</option>
                    ))}


                  </select>



                </div>

                {/* Gender */}
                <div>
                  <label htmlFor="gender" className="block text-gray-700 text-sm font-semibold mb-2">Gender <span className="text-xs text-gray-500">(Optional)</span></label>
                  <select
                    name="gender"
                    className="border border-gray-300 rounded-lg py-2 px-4 w-full"
                    value={formValues.gender}
                    onChange={handleChange}
                  >
                    {genders.map((gender) => (


                      <option value={gender.value} key={gender.value}>{gender.label}</option>
                    ))}

                  </select>

                </div>


              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-5">


                {/* Team */}
                <div>
                  <label htmlFor="team" className="block text-gray-700 text-sm font-semibold mb-2">Team Name(s)<span className='mandatory'>*</span></label>
                  <input
                    placeholder="Ex. LA Stars / 2011 or LA Tigers / U15"
                    type="text"
                    name="team"
                    className="border border-gray-300 rounded-lg py-2 px-4 w-full"
                    value={formValues.team}
                    onChange={handleChange}
                  />

                </div>

                {/* Position */}
                <div>
                  <label htmlFor="position" className="block text-gray-700 text-sm font-semibold mb-2">Position(s)<span className='mandatory'>*</span></label>
                  <Select
                    isMulti
                    options={positionOptionsList}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    onChange={handlePositionChange}
                    placeholder="Select"
                  />

                </div>

                {/* Number */}
                <div>
                  <label htmlFor="number" className="block text-gray-700 text-sm font-semibold mb-2">Mobile Number<span className='mandatory'>*</span></label>

                  <div className="flex">
                    <select
                      name="countrycode"
                      className="border border-gray-300 rounded-lg py-2 px-4 w-2/5 mr-1" // Added mr-4 for margin-right
                      value={formValues.countrycode}
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
                      placeholder="(XXX) XXX-XXXX"
                      type="text"
                      name="number"
                      className="border border-gray-300 rounded-lg py-2 px-4 w-2/3"
                      value={formValues.number}
                      onChange={handlePhoneNumberChange}
                      maxLength={14} // (123) 456-7890 is 14 characters long
                    />
                  </div>


                </div>

              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 pb-5">
                <div>
                  <label htmlFor="bio" className="block text-gray-700 text-sm font-semibold mb-2">League(s)<span className='mandatory'>*</span></label>
                  <input
                    type="text"
                    placeholder="Ex. MLS, ECNL, NPL, AYSO, etc..."
                    name="league"
                    className="border border-gray-300 rounded-lg py-2 px-4 w-full"
                    value={formValues.league}
                    onChange={handleChange}
                  />

                </div>

              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 pb-5">
                <div>
                  <label htmlFor="bio" className="block text-gray-700 text-sm font-semibold mb-2">Experience/Accolades<span className='mandatory'>*</span></label>
                  <textarea
                    placeholder="Tell us about your experience/competition level, any accolades and aspirations."
                    name="bio"
                    className="border border-gray-300 rounded-lg py-2 px-4 w-full"
                    value={formValues.bio}
                    onChange={handleChange}
                  ></textarea>

                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-5">

                <div>
                  <label htmlFor="facebook" className="block text-gray-700 text-sm font-semibold mb-2">Facebook Link<span className="text-xs text-gray-500"> (Optional)</span></label>
                  <input
                    placeholder=''
                    type="text"
                    name="facebook"
                    className="border border-gray-300 rounded-lg py-2 px-4 w-full"
                    value={formValues.facebook}
                    onChange={handleChange}
                  />

                </div>
                <div>
                  <label htmlFor="instagram" className="block text-gray-700 text-sm font-semibold mb-2">Instagram Link <span className="text-xs text-gray-500">(Optional)</span></label>
                  <input
                    placeholder=''
                    type="text"
                    name="instagram"
                    className="border border-gray-300 rounded-lg py-2 px-4 w-full"
                    value={formValues.instagram}
                    onChange={handleChange}
                  />

                </div>
                <div>
                  <label htmlFor="linkedin" className="block text-gray-700 text-sm font-semibold mb-2">Linkedin Link <span className="text-xs text-gray-500">(Optional)</span></label>
                  <input
                    placeholder=''
                    type="text"
                    name="linkedin"
                    className="border border-gray-300 rounded-lg py-2 px-4 w-full"
                    value={formValues.linkedin}
                    onChange={handleChange}
                  />

                </div>




              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-5">
                <div>
                  <label htmlFor="xlink" className="block text-gray-700 text-sm font-semibold mb-2">X Link <span className="text-xs text-gray-500">(Optional)</span></label>
                  <input
                    placeholder=''
                    type="text"
                    name="xlink"
                    className="border border-gray-300 rounded-lg py-2 px-4 w-full"
                    value={formValues.xlink}
                    onChange={handleChange}
                  />

                </div>
                <div>
                  <label htmlFor="youtube" className="block text-gray-700 text-sm font-semibold mb-2">YouTube Link <span className="text-xs text-gray-500">(Optional)</span></label>
                  <input
                    placeholder=''
                    type="text"
                    name="youtube"
                    className="border border-gray-300 rounded-lg py-2 px-4 w-full"
                    value={formValues.youtube}
                    onChange={handleChange}
                  />

                </div>
                <div>
                  <label
                    htmlFor="website"
                    className="block text-gray-700 text-sm font-semibold mb-2"
                  >
                    Website Link{" "}
                    <span className="text-xs text-gray-500">(Optional)</span>
                  </label>
                  <input
                    placeholder=""
                    type="text"
                    name="website"
                    className="border border-gray-300 rounded-lg py-2 px-4 w-full"
                    value={formValues.website}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="col-span-1 sm:col-span-2 lg:col-span-3 flex justify-center">
                <button
                  type="submit"
                  className="flex items-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" /> Registering...
                    </>
                  ) : (
                    <>
                      <FaCheck className="mr-2" /> Submit
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>


    </>
  );
}
