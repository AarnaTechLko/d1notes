"use client";

import { useState, useRef, useEffect } from "react";
import Header from "../components/Header";
import Brand from "../public/images/brand.jpg";
import Image from "next/image";
import DefaultPic from "../public/default.jpg";
import { useSession } from "next-auth/react";

import Select from "react-select";
import { FaCheck, FaSpinner } from "react-icons/fa";
interface FormValues {
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
  bio:string;
  country:string;
  state:string;
  city:string;
  jersey:string;
  league:string;
  countrycode:string;
  image: string | null; // Updated to store Base64 string
}

export default function Register() {
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
    bio:"",
    country:"",
    state:"",
    city:"",
    jersey:"",
    league:"",
    countrycode:"",
    image: null,
  });

  const { data: session } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Partial<FormValues>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false); 
  const [maxDate, setMaxDate] = useState('');
  const positionOptions = [
    { value: "Goalkeeper", label: "Goalkeeper" },
    { value: "Defender", label: "Defender" },
    { value: "Midfielder", label: "Midfielder" },
    { value: "Forward", label: "Forward" },
    { value: "Striker", label: "Striker" },
    { value: "Wingback", label: "Wingback" },
    { value: "Center Back", label: "Center Back" },
    // Add more positions as needed
  ];

  const countryCodes = [
    { id: 1, code: "+1", country: "USA" },
    { id: 2, code: "+44", country: "UK" },
    { id: 3, code: "+91", country: "India" },
    { id: 4, code: "+61", country: "Australia" },
    { id: 5, code: "+33", country: "France" },
    { id: 6, code: "+49", country: "Germany" },
    { id: 7, code: "+81", country: "Japan" },
    { id: 8, code: "+55", country: "Brazil" },
    { id: 9, code: "+34", country: "Spain" },
    { id: 10, code: "+39", country: "Italy" },
    { id: 11, code: "+52", country: "Mexico" },
    { id: 12, code: "+7", country: "Russia" },
    { id: 13, code: "+86", country: "China" },
    { id: 14, code: "+27", country: "South Africa" },
    { id: 15, code: "+20", country: "Egypt" },
    { id: 16, code: "+62", country: "Indonesia" },
    { id: 17, code: "+60", country: "Malaysia" },
    { id: 18, code: "+34", country: "Spain" },
    { id: 19, code: "+91", country: "India" },
    { id: 20, code: "+63", country: "Philippines" },
    { id: 21, code: "+90", country: "Turkey" },
    { id: 22, code: "+94", country: "Sri Lanka" },
    { id: 23, code: "+971", country: "UAE" },
    { id: 24, code: "+34", country: "Spain" },
    { id: 25, code: "+27", country: "South Africa" },
    { id: 26, code: "+44", country: "United Kingdom" },
    { id: 27, code: "+55", country: "Brazil" },
    { id: 28, code: "+49", country: "Germany" },
    { id: 29, code: "+62", country: "Indonesia" },
    { id: 30, code: "+52", country: "Mexico" },
    { id: 31, code: "+61", country: "Australia" },
    { id: 32, code: "+33", country: "France" },
    { id: 33, code: "+44", country: "United Kingdom" },
    { id: 34, code: "+1", country: "USA" },
    { id: 35, code: "+968", country: "Oman" },
    { id: 36, code: "+972", country: "Israel" },
    { id: 37, code: "+886", country: "Taiwan" },
    { id: 38, code: "+90", country: "Turkey" },
    { id: 39, code: "+351", country: "Portugal" },
    { id: 40, code: "+977", country: "Nepal" },
    { id: 41, code: "+265", country: "Malawi" },
    { id: 42, code: "+234", country: "Nigeria" },
    { id: 43, code: "+254", country: "Kenya" },
    { id: 44, code: "+1", country: "Canada" },
    { id: 45, code: "+54", country: "Argentina" },
    { id: 46, code: "+48", country: "Poland" },
    { id: 47, code: "+351", country: "Portugal" },
    { id: 48, code: "+20", country: "Egypt" },
    { id: 49, code: "+971", country: "UAE" },
    { id: 50, code: "+962", country: "Jordan" },
    { id: 51, code: "+975", country: "Bhutan" },
    { id: 52, code: "+977", country: "Nepal" },
    { id: 53, code: "+1", country: "USA" },
    { id: 54, code: "+49", country: "Germany" },
    { id: 55, code: "+7", country: "Russia" },
    { id: 56, code: "+60", country: "Malaysia" },
    { id: 57, code: "+92", country: "Pakistan" },
    { id: 58, code: "+370", country: "Lithuania" },
    { id: 59, code: "+502", country: "Guatemala" },
    { id: 60, code: "+504", country: "Honduras" },
    { id: 61, code: "+852", country: "Hong Kong" },
    { id: 62, code: "+63", country: "Philippines" },
    { id: 63, code: "+33", country: "France" },
    { id: 64, code: "+55", country: "Brazil" },
    { id: 65, code: "+56", country: "Chile" },
    { id: 66, code: "+57", country: "Colombia" },
    { id: 67, code: "+60", country: "Malaysia" },
    { id: 68, code: "+503", country: "El Salvador" },
    { id: 69, code: "+91", country: "India" },
    { id: 70, code: "+1", country: "USA" }
  ];
  

  
  const states = [
    { name: "Alabama", abbreviation: "AL" },
    { name: "Alaska", abbreviation: "AK" },
    { name: "Arizona", abbreviation: "AZ" },
    { name: "Arkansas", abbreviation: "AR" },
    { name: "California", abbreviation: "CA" },
    { name: "Colorado", abbreviation: "CO" },
    { name: "Connecticut", abbreviation: "CT" },
    { name: "Delaware", abbreviation: "DE" },
    { name: "Florida", abbreviation: "FL" },
    { name: "Georgia", abbreviation: "GA" },
    { name: "Hawaii", abbreviation: "HI" },
    { name: "Idaho", abbreviation: "ID" },
    { name: "Illinois", abbreviation: "IL" },
    { name: "Indiana", abbreviation: "IN" },
    { name: "Iowa", abbreviation: "IA" },
    { name: "Kansas", abbreviation: "KS" },
    { name: "Kentucky", abbreviation: "KY" },
    { name: "Louisiana", abbreviation: "LA" },
    { name: "Maine", abbreviation: "ME" },
    { name: "Maryland", abbreviation: "MD" },
    { name: "Massachusetts", abbreviation: "MA" },
    { name: "Michigan", abbreviation: "MI" },
    { name: "Minnesota", abbreviation: "MN" },
    { name: "Mississippi", abbreviation: "MS" },
    { name: "Missouri", abbreviation: "MO" },
    { name: "Montana", abbreviation: "MT" },
    { name: "Nebraska", abbreviation: "NE" },
    { name: "Nevada", abbreviation: "NV" },
    { name: "New Hampshire", abbreviation: "NH" },
    { name: "New Jersey", abbreviation: "NJ" },
    { name: "New Mexico", abbreviation: "NM" },
    { name: "New York", abbreviation: "NY" },
    { name: "North Carolina", abbreviation: "NC" },
    { name: "North Dakota", abbreviation: "ND" },
    { name: "Ohio", abbreviation: "OH" },
    { name: "Oklahoma", abbreviation: "OK" },
    { name: "Oregon", abbreviation: "OR" },
    { name: "Pennsylvania", abbreviation: "PA" },
    { name: "Rhode Island", abbreviation: "RI" },
    { name: "South Carolina", abbreviation: "SC" },
    { name: "South Dakota", abbreviation: "SD" },
    { name: "Tennessee", abbreviation: "TN" },
    { name: "Texas", abbreviation: "TX" },
    { name: "Utah", abbreviation: "UT" },
    { name: "Vermont", abbreviation: "VT" },
    { name: "Virginia", abbreviation: "VA" },
    { name: "Washington", abbreviation: "WA" },
    { name: "West Virginia", abbreviation: "WV" },
    { name: "Wisconsin", abbreviation: "WI" },
    { name: "Wyoming", abbreviation: "WY" }
  ];
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    
    
    // Validation
    const newErrors: Partial<FormValues> = {};
    if (!formValues.image) {
        newErrors.image = "Profile image is required";
    } else {
        // Calculate the approximate size of the base64 string
        const imageSizeInBytes = (formValues.image.length * 3) / 4;
        if (imageSizeInBytes > 5 * 1024 * 1024) {
            newErrors.image = "Image size must be less than 5MB";
        }
    }
    if (!formValues.first_name.trim()) newErrors.first_name = "First name is required.";
    if (!formValues.last_name.trim()) newErrors.last_name = "Last name is required.";
    if (!formValues.location.trim()) newErrors.location = "Location is required.";
    if (!formValues.birthday) newErrors.birthday = "Birthday is required.";
    if (!formValues.grade_level) newErrors.grade_level = "Grade level is required.";
    if (!formValues.gender) newErrors.gender = "Gender is required.";
    if (!formValues.sport) newErrors.sport = "Sport is required.";
    if (!formValues.team.trim()) newErrors.team = "Team is required.";
    if (!formValues.position.trim()) newErrors.position = "Position is required.";
    
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
    if (!formValues.league.trim()) newErrors.league = "city is required.";

    // Set validation errors if any
    if (Object.keys(newErrors).length > 0) {
      setValidationErrors(newErrors);
      return;
    }

    const formData = new FormData();

    // Append all form values to FormData
    for (const key in formValues) {
      const value = formValues[key as keyof FormValues];
      formData.append(key, value as string | Blob);
    }

    if (session && session.user.id) {
      formData.append("playerID", session.user.id); // Assuming user.id is the ID
    } else {
      setError("User is not authenticated");
      return;
    }
    setLoading(true);
    try {
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

      const data = await response.json();
     
      localStorage.setItem("userImage", data.image);
      window.location.href = "/dashboard"; // Redirect after successful registration
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : "Something went wrong!");
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormValues({ ...formValues, [name]: value });
    setValidationErrors({ ...validationErrors, [name]: "" }); // Clear error when input is changed
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onloadend = () => {
        setFormValues({ ...formValues, image: reader.result as string });
      };

      if (file) {
        reader.readAsDataURL(file); // Convert the image file to base64
      }
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

  const handlePositionChange = (selectedOptions: any) => {
    // Convert selected options into a comma-separated string
    const positions = selectedOptions ? selectedOptions.map((option: any) => option.value).join(", ") : "";
    setFormValues({ ...formValues, position: positions });
  };
 
  return (
    <>
     <div className="container mx-auto p-4">
  <div className="flex flex-col justify-center bg-white p-4 w-full">
    <div className="bg-white rounded-lg p-0 w-full md:max-w-3xl lg:max-w-5xl m-auto">
      <h2 className="text-2xl lg:text-3xl font-bold mb-2 text-left">Add Your Personal Information</h2>
      <p className="text-red-500">( All fiels are mandatory including player&lsquo;s photo upload.)</p>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
      <form onSubmit={handleSubmit} >
        
        <div className="col-span-1 sm:col-span-2 lg:col-span-3 mb-4">
          <div className="items-center cursor-pointer" onClick={handleImageClick}>
            <Image
              src={formValues.image ? formValues.image : DefaultPic}
              alt="Profile Image"
              width={100}
              height={100}
              className="rounded-full mx-auto"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              ref={fileInputRef}
            />
            {validationErrors.image && <p className="text-red-500 text-sm text-center mt-2">{validationErrors.image}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-5">
        <div>
          <label htmlFor="first_name" className="block text-gray-700 text-sm font-semibold mb-2">
            First Name
          </label>
          <input
            type="text"
            name="first_name"
            className="border border-gray-300 rounded-lg py-2 px-4 w-full"
            value={formValues.first_name}
            onChange={handleChange}
          />
          {validationErrors.first_name && <p className="text-red-500 text-sm">{validationErrors.first_name}</p>}
        </div>

        {/* Last Name */}
        <div>
          <label htmlFor="last_name" className="block text-gray-700 text-sm font-semibold mb-2">Last Name</label>
          <input
            type="text"
            name="last_name"
            className="border border-gray-300 rounded-lg py-2 px-4 w-full"
            value={formValues.last_name}
            onChange={handleChange}
          />
          {validationErrors.last_name && <p className="text-red-500 text-sm">{validationErrors.last_name}</p>}
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-gray-700 text-sm font-semibold mb-2">Location</label>
          <input
            type="text"
            name="location"
            className="border border-gray-300 rounded-lg py-2 px-4 w-full"
            value={formValues.location}
            onChange={handleChange}
          />
          {validationErrors.location && <p className="text-red-500 text-sm">{validationErrors.location}</p>}
        </div>

       </div>
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-5">
        <div>
          <label htmlFor="birthday" className="block text-gray-700 text-sm font-semibold mb-2">Birth Date</label>
          <input
            type="date"
            name="birthday"
            className="border border-gray-300 rounded-lg py-2 px-4 w-full"
            
            value={formValues.birthday}
            onChange={handleChange}
          />
          {validationErrors.birthday && <p className="text-red-500 text-sm">{validationErrors.birthday}</p>}
        </div>

        {/* Grade Level */}
        <div>
          <label htmlFor="grade_level" className="block text-gray-700 text-sm font-semibold mb-2"> Level</label>
          <input
          placeholder="Specify level"
            type="text"
            name="grade_level"
            className="border border-gray-300 rounded-lg py-2 px-4 w-full"
            value={formValues.grade_level}
            onChange={handleChange}
          />
          
          {validationErrors.grade_level && <p className="text-red-500 text-sm">{validationErrors.grade_level}</p>}
        </div>

        {/* Gender */}
        <div>
          <label htmlFor="gender" className="block text-gray-700 text-sm font-semibold mb-2">Gender</label>
          <select
            name="gender"
            className="border border-gray-300 rounded-lg py-2 px-4 w-full"
            value={formValues.gender}
            onChange={handleChange}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            
          </select>
          {validationErrors.gender && <p className="text-red-500 text-sm">{validationErrors.gender}</p>}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-5">
        <div>
          <label htmlFor="sport" className="block text-gray-700 text-sm font-semibold mb-2">Sport</label>
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
          {validationErrors.sport && <p className="text-red-500 text-sm">{validationErrors.sport}</p>}
        </div>

        {/* Team */}
        <div>
          <label htmlFor="team" className="block text-gray-700 text-sm font-semibold mb-2">Team Name/ Year</label>
          <input
          placeholder="Team Name/ 2024"
            type="text"
            name="team"
            className="border border-gray-300 rounded-lg py-2 px-4 w-full"
            value={formValues.team}
            onChange={handleChange}
          />
          {validationErrors.team && <p className="text-red-500 text-sm">{validationErrors.team}</p>}
        </div>

        {/* Position */}
        <div>
          <label htmlFor="position" className="block text-gray-700 text-sm font-semibold mb-2">Position (s)</label>
          <Select
            isMulti
            options={positionOptions}
            className="basic-multi-select"
            classNamePrefix="select"
            onChange={handlePositionChange}
            placeholder="Select Position(s)"
          />
          {validationErrors.position && <p className="text-red-500 text-sm">{validationErrors.position}</p>}
        </div>

        {/* Number */}
        <div>
  <label htmlFor="number" className="block text-gray-700 text-sm font-semibold mb-2">Mobile Number</label>
  
  <div className="flex">
    <select  
      name="countryCode" 
      className="border border-gray-300 rounded-lg py-2 px-4 w-1/3 mr-1" // Added mr-4 for margin-right
      value={formValues.countrycode} 
      onChange={handleChange}
    >
     {countryCodes.map((item) => (
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

  {validationErrors.number && <p className="text-red-500 text-sm">{validationErrors.number}</p>}
</div>

        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 pb-5">
        <div>
          <label htmlFor="bio" className="block text-gray-700 text-sm font-semibold mb-2">League</label>
          <input
          type="text"
            placeholder="Specify experience league (AYSO, club, school, etc.)"
            name="league"
            className="border border-gray-300 rounded-lg py-2 px-4 w-full"
            value={formValues.league}
            onChange={handleChange}
          /> 
          {validationErrors.bio && <p className="text-red-500 text-sm">{validationErrors.league}</p>}
        </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 pb-5">
        <div>
          <label htmlFor="bio" className="block text-gray-700 text-sm font-semibold mb-2">Experience/Accolades</label>
          <textarea
            placeholder="Tell us about your player’s experience/ competition level, any 
          accolades and goals."
            name="bio"
            className="border border-gray-300 rounded-lg py-2 px-4 w-full"
            value={formValues.bio}
            onChange={handleChange}
          ></textarea>
          {validationErrors.bio && <p className="text-red-500 text-sm">{validationErrors.bio}</p>}
        </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-5">
        <div>
          <label htmlFor="country" className="block text-gray-700 text-sm font-semibold mb-2">Country</label>
          <select
            name="country"
            className="border border-gray-300 rounded-lg py-2 px-4 w-full"
            value={formValues.country}
            onChange={handleChange}
          >
            <option value="">Select</option>
            <option value="United States of America">United States of America</option>
           
          </select>
          
          {validationErrors.country && <p className="text-red-500 text-sm">{validationErrors.country}</p>}
        </div>
        <div>
          <label htmlFor="state" className="block text-gray-700 text-sm font-semibold mb-2">State</label>
          
        
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
          {validationErrors.state && <p className="text-red-500 text-sm">{validationErrors.state}</p>}
        </div>
        <div>
          <label htmlFor="city" className="block text-gray-700 text-sm font-semibold mb-2">City</label>
          <input
            type="text"
            name="city"
            className="border border-gray-300 rounded-lg py-2 px-4 w-full"
            value={formValues.city}
            onChange={handleChange}
          />
          {validationErrors.city && <p className="text-red-500 text-sm">{validationErrors.city}</p>}
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
