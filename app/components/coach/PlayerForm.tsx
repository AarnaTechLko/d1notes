"use client";

import { useState, useRef, useEffect } from "react";
import Header from "../../components/Header";
import Brand from "../../public/images/brand.jpg";
import Image from "next/image";
import DefaultPic from "../../public/default.jpg";
import { useSession } from "next-auth/react";
import { type PutBlobResult } from '@vercel/blob';
import { upload } from '@vercel/blob/client';
import Select, { NonceProvider } from "react-select";
import { FaCheck, FaSpinner } from "react-icons/fa";
import { showError, showSuccess } from "../Toastr";
import FileUploader from "../FileUploader";
import { countryCodesList, states, positionOptionsList,genders ,playingLevels, countries, Grades} from "@/lib/constants";
interface PlayerFormProps {
    onSubmit: (formData: any) => void;
}
interface FormValues {
  first_name: string;
  last_name: string;
  grade_level: string;
  email: string;
  location: string;
  birthday: string;
  gender: string;
  sport: string;
  team: string;
  position: string;
  number: string;
  bio:string;
  country:string;
  state:string;
  city:string;
  jersey:string;
  enterprise_id:number;
  coach_id:number;
  parent_id:number;
  league:string;
  countrycode:string;
  license:string;
  height:string;
  weight:string;
  playingcountries:string;
  teamId?:string;
  ownerType:string;
  graduation:string;
  image: string | null; // Updated to store Base64 string
}
const PlayerForm: React.FC<PlayerFormProps> = ({ onSubmit }) => {
 
  const [formValues, setFormValues] = useState<FormValues>({
    first_name: "",
    last_name: "",
    email: "",
    grade_level: "",
    location: "",
    birthday: "",
    gender: "",
    sport: "",
    team: "",
    position: "",
    number: "",
    bio:"",
    country:"",
    state:"",
    city:"",
    jersey:"",
    league:"",
    countrycode:"",
    enterprise_id:0,
    license:"",
    playingcountries:"",
    graduation:"",
    height:"",
    weight:"",
    ownerType:"",
    teamId:"",
    coach_id:0,
    parent_id:0,
    image: null,
  });

  const { data: session } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [usertype, setUsertype] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Partial<FormValues>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false); 
  const [loadingKey, setLoadingKey] = useState<boolean>(false); 
  const [maxDate, setMaxDate] = useState('');
  const [photoUpoading, setPhotoUploading] = useState<boolean>(false);
 
  const formatHeight = (value: string) => {
    // Remove non-numeric characters
    const numericValue = value.replace(/\D/g, "");

    if (numericValue.length === 0) return ""; // Return empty if no input
    if (numericValue.length === 1) return `${numericValue}'`; // Format single digit as feet only

    // Format as feet and inches
    const feet = numericValue.slice(0, -1);
    const inches = numericValue.slice(-1);

    return `${feet}'${inches}"`;
  };

  const handleHeightChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const formattedValue = formatHeight(value);
    setFormValues((prevValues) => ({ ...prevValues, height: formattedValue }));
  }; 


  const handleAssignLicense = async () => {
        
    try {
        setLoadingKey(true);
        const userId = session?.user.type !== 'team' ? session?.user.id : session?.user.club_id;
        const type = session?.user.type !== 'team' ? session?.user.type : 'Enterprise';

        
        const response = await fetch("/api/fetchlicense", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId:userId,
                type:type,
            }),
        });
 
        if (!response.ok) {
          const data = await response.json();
           
            showError(data.message);
        }
        setLoadingKey(false);
        const data = await response.json();

        // Update the license value in formValues
        setFormValues((prev) => ({ ...prev, license: data.licenseKey }));
    } catch (error) {
       //showError("Failed to fetch licenses");
    }
};

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setFormValues({
      ...formValues,
      enterprise_id: session?.user?.club_id ? Number(session.user.club_id) : 0,
  });
  setFormValues({
    ...formValues,
    coach_id: session?.user?.id ? Number(session.user.id) : 0,
});
    
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
    if (!formValues.location.trim()) newErrors.location = "Playing Location is required.";
    const heightRegex = /^\d{1,2}'\d{1,2}"$/;
    if (!formValues.height.trim()) {
      newErrors.height = "Height is required.";
    } else if (!heightRegex.test(formValues.height.trim())) {
      newErrors.height = "Height must be in the format X'Y\" (e.g., 5'6\").";
    }

    const weightRegex = /^\d+(\.\d{1,2})?$/;
if (!formValues.weight.trim()) {
    newErrors.weight = "Weight is required.";
} else if (!weightRegex.test(formValues.weight.trim())) {
    newErrors.weight = "Weight must be a valid decimal number (e.g., 70.5).";
}
    if (!formValues.email) {
        newErrors.email = 'Email is required';
    } else if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email)
    ) {
        newErrors.email = 'Invalid email format';
    }
    if (!formValues.birthday) newErrors.birthday = "Birthday is required.";
    if (!formValues.grade_level) newErrors.grade_level = "Grade level is required.";
    if (!formValues.gender) newErrors.gender = "Gender is required.";
    if (!formValues.sport) newErrors.sport = "Sport is required.";
    
    if (!formValues.position.trim()) newErrors.position = "Position is required.";
    
    if (!formValues.countrycode.trim()) newErrors.countrycode = "Country Code is required.";
    if (!formValues.number.trim()) newErrors.number = "Mobile Number is required.";
    if (formValues.number.length < 14) newErrors.number = 'Mobile Number Must be of 14 Digits Minimum';
    if (!/^\(\d{3}\) \d{3}-\d{4}$/.test(formValues.number)) {
      newErrors.number = 'Mobile Number must be in the format (XXX) XXX-XXXX';
    }
    if (formValues.number.length > 14) newErrors.number = 'Mobile Number Must be of 14 Digits Maximum';
    

    if (!formValues.bio.trim()) newErrors.bio = "Bio is required.";
    if (!formValues.country.trim()) newErrors.country = "Country is required.";
    if (!formValues.state.trim()) newErrors.state = "State is required.";
    if (!formValues.city.trim()) newErrors.city = "city is required.";
    if (!formValues.league.trim()) newErrors.league = "League is required.";
    if(session?.user.type!='player')
    {
      if (!formValues.license.trim()) newErrors.license = "License key is required.";
    }
   

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

    
    if (session && session.user.id) {
      if(session.user.type=='team')
      {
        formValues.enterprise_id = Number(session.user.club_id); // Add user ID to the form values
        formValues.ownerType = 'enterprise';
        formValues.teamId=session.user.id;
      }
      if(session.user.type=='enterprise')
        {
        formValues.enterprise_id = Number(session.user.id); // Add user ID to the form values
        formValues.ownerType = session.user.type;
      }
      if(session.user.type=='coach')
        {
          formValues.coach_id = Number(session.user.id); // Add user ID to the form values
          formValues.enterprise_id = Number(session.user.club_id); // Add user ID to the form values
          formValues.ownerType = session.user.type;
      }
      else{
        formValues.parent_id = Number(session.user.id); // Add user ID to the form values
        formValues.enterprise_id = Number(session.user.club_id); // Add user ID to the form values
        formValues.ownerType = session.user.type;
      }
         
    } else {
      setError("User is not authenticated");
      return;
    }
    setLoading(true);
   
    try {
    
      const token = localStorage.getItem("token");
      const response = await fetch("/api/coach/player/signup", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // Send token in Authorization header
        },
        body: JSON.stringify(formValues),
      });
 
if (!response.ok) {
    // Check for server-side errors (e.g., 500)
    if (response.status === 500) {
      const data = await response.json();
        showError(data.message);
        setLoading(false);
    } 
    return; // Stop further processing if there's an error
  }

      const data = await response.json();
     
      showSuccess('Player added successfully.');
      onSubmit(formValues);
    } catch (err) {
      setLoading(false);
      
      ///showSuccess("Invalid or Used key.");
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormValues({ ...formValues, [name]: value });
    setValidationErrors({ ...validationErrors, [name]: "" }); // Clear error when input is changed
    
  };

  const handleImageChange = async() => {
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
        setFormValues({ ...formValues, image: imageUrl });
     
      } catch (error) {
        setPhotoUploading(false);
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
    setFormValues({ ...formValues, number: formattedNumber });
  };
  
  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Trigger file input click
    }
    
  };
  const handleCountryChange = (selectedOptions: any) => {
    const playingcountries = selectedOptions ? selectedOptions.map((option: any) => option.label).join(", ") : "";
    setFormValues({ ...formValues, playingcountries: playingcountries });
  };
  const handlePositionChange = (selectedOptions: any) => {
    // Convert selected options into a comma-separated string
    const positions = selectedOptions ? selectedOptions.map((option: any) => option.value).join(", ") : "";
    setFormValues({ ...formValues, position: positions });
  };
 
  return (
    <>
     <div className="container mx-auto p-1">
  <div className="flex flex-col justify-center bg-white p-2 w-full">
    <div className="bg-white rounded-lg p-0 w-full md:max-w-3xl lg:max-w-5xl m-auto">
     
      <p className="text-red-500">( Fields marked with * are mandatory.)</p>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
      <form onSubmit={handleSubmit} >
        
        <div className="col-span-1 sm:col-span-2 lg:col-span-3 mb-4 text-center">
          <label>Profile Photo</label>
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
  {photoUpoading ? (
    <>
      <FileUploader />
    </>
  ) : (
    <>
      {/* Optional: Placeholder for additional content */}
    </>
  )}
   
</div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-5">
        <div>
          <label htmlFor="first_name" className="block text-gray-700 text-sm font-semibold mb-2">
            First Name<span className="mandatory">*</span>
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
          <label htmlFor="last_name" className="block text-gray-700 text-sm font-semibold mb-2">Last Name<span className="mandatory">*</span></label>
          <input
            type="text"
            name="last_name"
            className="border border-gray-300 rounded-lg py-2 px-4 w-full"
            value={formValues.last_name}
            onChange={handleChange}
          />
         
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-gray-700 text-sm font-semibold mb-2">Playing Location<span className="mandatory">*</span></label>
          <input
            type="text"
            name="location"
            className="border border-gray-300 rounded-lg py-2 px-4 w-full"
            value={formValues.location}
            onChange={handleChange}
          />
          
        </div>
        <div>
          <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">Email<span className="mandatory">*</span></label>
          <input
            type="text"
            name="email"
            className="border border-gray-300 rounded-lg py-2 px-4 w-full"
            value={formValues.email}
            onChange={handleChange}
          />
         
        </div>
       </div>

       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-5">
       <div>
          <label htmlFor="height" className="block text-gray-700 text-sm font-semibold mb-2">Height</label>
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
          <label htmlFor="weight" className="block text-gray-700 text-sm font-semibold mb-2">Weight (in Lbs)</label>
          <input
            type="text"
            name="weight"
            className="border border-gray-300 rounded-lg py-2 px-4 w-full"
            value={formValues.weight}
            onChange={handleChange}
          />
          
        </div>

        <div>
                  <label htmlFor="weight" className="block text-gray-700 text-sm font-semibold mb-2">Graduation</label>
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
          <label htmlFor="position" className="block text-gray-700 text-sm font-semibold mb-2">Playing for Country</label>
          <Select
            isMulti
            options={countries}
            className="basic-multi-select"
            classNamePrefix="select"
            onChange={handleCountryChange}
            placeholder="Select Position(s)"
          />
          
        </div>

       </div>
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-5">
        <div>
          <label htmlFor="country" className="block text-gray-700 text-sm font-semibold mb-2">Country<span className="mandatory">*</span></label>
          <select
            name="country"
            className="border border-gray-300 rounded-lg py-2 px-4 w-full"
            value={formValues.country}
            onChange={handleChange}
          >
            <option value="">Select</option>
            {countries.map((country) => (
                      <option key={country.label} value={country.label}>
                        {country.label}
                      </option>
                    ))}

           
          </select>
          
         
        </div>
        <div>
          <label htmlFor="state" className="block text-gray-700 text-sm font-semibold mb-2">State<span className="mandatory">*</span></label>
          
        
          <select
        name="state"
        id="state"
        value={formValues.state}
        onChange={handleChange}
        className="border border-gray-300 rounded-lg py-2 px-4 w-full"
      >
        <option value="">Select a state</option>
        {states.map((state) => (
          <option key={state.abbreviation} value={state.abbreviation}>
            {state.name}
          </option>
        ))}
      </select>
         
        </div>
        <div>
          <label htmlFor="city" className="block text-gray-700 text-sm font-semibold mb-2">City<span className="mandatory">*</span></label>
          <input
            type="text"
            name="city"
            className="border border-gray-300 rounded-lg py-2 px-4 w-full"
            value={formValues.city}
            onChange={handleChange}
          />
         
        </div>
       

        </div>
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-5">
        <div>
          <label htmlFor="birthday" className="block text-gray-700 text-sm font-semibold mb-2">Birth Date<span className="mandatory">*</span></label>
          <input
            type="date"
            name="birthday"
            className="border border-gray-300 rounded-lg py-2 px-4 w-full"
            
            value={formValues.birthday}
            onChange={handleChange}
          />
         
        </div>

        {/* Grade Level */}
        <div>
          <label htmlFor="grade_level" className="block text-gray-700 text-sm font-semibold mb-2">Level<span className="mandatory">*</span></label>
          <select name="grade_level" onChange={handleChange} className="border border-gray-300 rounded-lg py-2 px-4 w-full" value={formValues.grade_level}>
                    {playingLevels.map((level) => (


                      <option value={level.label} key={level.label}>{level.label}</option>
                    ))}


                  </select>
          
        
        </div>

        {/* Gender */}
        <div>
          <label htmlFor="gender" className="block text-gray-700 text-sm font-semibold mb-2">Gender<span className="mandatory">*</span></label>
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
        <div>
          <label htmlFor="jersey" className="block text-gray-700 text-sm font-semibold mb-2">Jersey Number <span className="text-xs text-gray-500">(Optional)</span></label>
          <input
            type="text"
            name="jersey"
            className="border border-gray-300 rounded-lg py-2 px-4 w-full"
            value={formValues.jersey}
            onChange={handleChange}
          />
           
        </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-5">
        <div>
          <label htmlFor="sport" className="block text-gray-700 text-sm font-semibold mb-2">Sport<span className="mandatory">*</span></label>
          <select
            name="sport"
            className="border border-gray-300 rounded-lg py-2 px-4 w-full"
            value={formValues.sport}
            onChange={handleChange}
          >
            <option value="">Select</option>
            <option value="Soccer">Soccer</option>
            
          </select>
          <p className="text-xs text-gray-500">( Right now, D1 Notes is only available for soccer coaching )</p>
         
        </div>

        {/* Team */}
        <div style={{display:'none'}}>
          <label htmlFor="team" className="block text-gray-700 text-sm font-semibold mb-2">Team Name/ Year<span className="mandatory">*</span></label>
          <input
          placeholder="Team Name/ 2024"
            type="text"
            name="team"
            className="border border-gray-300 rounded-lg py-2 px-4 w-full"
            value={formValues.team}
            onChange={handleChange}
          />
          
        </div>

        {/* Position */}
        <div>
          <label htmlFor="position" className="block text-gray-700 text-sm font-semibold mb-2">Position (s)<span className="mandatory">*</span></label>
          <Select
            isMulti
            options={positionOptionsList}
            className="basic-multi-select"
            classNamePrefix="select"
            onChange={handlePositionChange}
            placeholder="Select Position(s)"
          />
         
        </div>

        {/* Number */}
        <div>
  <label htmlFor="number" className="block text-gray-700 text-sm font-semibold mb-2">Mobile Number<span className="mandatory">*</span></label>
  
  <div className="flex">
    <select  
      name="countrycode" 
      className="border border-gray-300 rounded-lg py-2 px-4 w-1/3 mr-1" // Added mr-4 for margin-right
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
      placeholder="(342) 342-3423"
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
          <label htmlFor="bio" className="block text-gray-700 text-sm font-semibold mb-2">League<span className="mandatory">*</span></label>
          <input
          type="text"
            placeholder="Specify experience league (AYSO, club, school, etc.)"
            name="league"
            className="border border-gray-300 rounded-lg py-2 px-4 w-full"
            value={formValues.league}
            onChange={handleChange}
          /> 
          
        </div> 
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 pb-5">
        <div>
          <label htmlFor="bio" className="block text-gray-700 text-sm font-semibold mb-2">Experience/Accolades<span className="mandatory">*</span></label>
          <textarea
            placeholder="Tell us about your player’s experience/ competition level, any 
          accolades and goals."
            name="bio"
            className="border border-gray-300 rounded-lg py-2 px-4 w-full"
            value={formValues.bio}
            onChange={handleChange}
          ></textarea>
         
        </div>
        </div>
        {session?.user.type!='player' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-6 pb-5">
        <div>
          <label htmlFor="license" className="block text-gray-700 text-sm font-semibold mb-2">License Key<span className="mandatory">*</span></label>
          <input
            type="text"
            name="license"
            className="border border-gray-300 rounded-lg py-2 px-4 w-full"
            value={formValues.license}
            onChange={handleChange}
            readOnly
          />
          {loadingKey ? (
                                            <>
                                                <p><FaSpinner className="animate-spin mr-2" /> Finding Key...</p>
                                            </>
                                        ) : (
                                            <>
                                               
                                            </>
                                        )}
          <button
          type='button'
  className="text-xs text-gray-500 underline"
  onClick={() => handleAssignLicense()}
>
  Assign License
</button>
         
        </div>
        </div>
       )} 
        
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
export default PlayerForm;
