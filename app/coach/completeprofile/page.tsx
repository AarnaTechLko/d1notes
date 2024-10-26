"use client"; // Important for using hooks in Next.js 13+

import { useState, useRef, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import DefaultPic from "../../public/default.jpg";
import Brand from '../../public/images/brand.jpg';
import CertificateImage from '../../public/certificate.png'
import Image from 'next/image';
import { FaCheck, FaSpinner } from 'react-icons/fa';

interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender: string;
  location: string;
  sport: string;
  clubName: string;
  qualifications: string;
  expectedCharge: string;
  password: string;
  image: string | null; 
  country: string | null; 
  state: string | null; 
  city: string | null; 
  certificate: string | null; 
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  gender?: string;
  location?: string;
  sport?: string;
  clubName?: string;
  qualifications?: string;
  expectedCharge?: string;
  password?: string;
  country?: string;
  state?: string;
  city?: string;
  image: string | null;
  
}

export default function Register() {
  const [formValues, setFormValues] = useState<FormValues>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    gender: '',
    location: '',
    sport: '',
    clubName: '',
    qualifications: '',
    expectedCharge: '',
    password: '',
    country: '',
    state: '',
    city: '',
    image: null,
    certificate:null
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({
    firstName: undefined,
    lastName: undefined,
    email: undefined,
    phoneNumber: undefined,
    gender: undefined,
    location: undefined,
    sport: undefined,
    clubName: undefined,
    qualifications: undefined,
    expectedCharge: undefined,
    password: undefined,
    country: undefined,
    state: undefined,
    city: undefined,
    image: null,
    
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const certificateInputRef = useRef<HTMLInputElement | null>(null);
  const { data: session } = useSession();
  const [validationErrors, setValidationErrors] = useState<Partial<FormValues>>({});
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
  // Validation function
  const validateForm = (): boolean => {
    const errors: FormErrors = {
      firstName: undefined,
      lastName: undefined,
     
      phoneNumber: undefined,
      gender: undefined,
      location: undefined,
      sport: undefined,
      clubName: undefined,
      qualifications: undefined,
      expectedCharge: undefined,
      
      image: null, // Ensure this property is included
    };
  
    if (!formValues.image) {
      errors.image = 'Profile image is required';
    } 
    if (!formValues.firstName) errors.firstName = 'First Name is required';
    if (!formValues.lastName) errors.lastName = 'Last Name is required';
     
    if (!formValues.phoneNumber) errors.phoneNumber = 'Phone Number is required';
    if (formValues.phoneNumber.length < 10) errors.phoneNumber = 'Phone Number Must be of 10 Digits Minimum';
    if (!/^\d+$/.test(formValues.phoneNumber)) {
      errors.phoneNumber = 'Phone Number must contain only numeric characters';
    }
    if (formValues.phoneNumber.length > 10) errors.phoneNumber = 'Phone Number Must be of 10 Digits Maximum';
    if (!formValues.gender) errors.gender = 'Gender is required';
    if (!formValues.location) errors.location = 'Location is required';
    if (!formValues.sport) errors.sport = 'Sport is required';
    if (!formValues.clubName) errors.clubName = 'Club Name is required';
    if (!formValues.qualifications) errors.qualifications = 'Qualifications are required';
    if (!formValues.expectedCharge) {
      errors.expectedCharge = 'Expected Charge is required';
    } else if (!/^\d+(\.\d{1,2})?$/.test(formValues.expectedCharge)) {
      errors.expectedCharge = 'Expected Charge must be a valid number with up to 2 decimal places';
    }

    if (!formValues.country) errors.country = 'Country  is required';

    if (!formValues.state) errors.state = 'State is required';

    if (!formValues.city) errors.city = 'City is required';
   
    setFormErrors(errors); // Set errors once validation is done
    return Object.keys(errors).every(key => errors[key as keyof FormErrors] === undefined || errors[key as keyof FormErrors] === null);
  };
  

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    
    if (!validateForm()) return;

    setLoading(true);
    const formData = new FormData();
    
    for (const key in formValues) {
      const value = formValues[key as keyof FormValues];
      formData.append(key, value as string | Blob);
    }
    if (session && session.user.id) {
        formData.append("coachId", session.user.id); // Assuming user.id is the ID
      } else {
        setError("User is not authenticated");
        return;
      }
    try {
      const response = await fetch('/api/coach/signup', {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Something went wrong!');
      }
      
      const data = await response.json();
      localStorage.setItem("userImage", data.image);
    

     window.location.href = '/coach/dashboard'; 
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormValues({ ...formValues, [name]: value });

    // Clear the corresponding error when the user types
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors({ ...formErrors, [name]: undefined });
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files[0];
      const reader = new FileReader();
  
      reader.onloadend = () => {
        setFormValues({ ...formValues, image: reader.result as string }); // Set the base64 string
      };
  
      if (file) {
        reader.readAsDataURL(file); // Convert the image file to base64
      }
    }
  };

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleCertificateClick = () => {
    if (certificateInputRef.current) {
      certificateInputRef.current.click();
    }
  };


  const handleCertificateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files[0];
      const reader = new FileReader();
  
      reader.onloadend = () => {
        setFormValues({ ...formValues, certificate: reader.result as string }); // Set the base64 string
      };
  
      if (file) {
        reader.readAsDataURL(file); // Convert the image file to base64
      }
    }
  };

  useEffect(() => {
    if (session) {
    //   if (session.user.type === 'coach') {
    //     window.location.href = '/coach/dashboard';
    //   } else if (session.user.type === 'player') {
    //     window.location.href = '/dashboard';
    //   } else if (!session.user.name) {
    //     window.location.href = '/completeprofile';
    //   }
    }
  }, [session]);

  return (
    <>
     <div className="container mx-auto p-4">
      <div className="flex flex-col justify-center bg-white p-4 w-full">
        <div className="flex-1 bg-white p-1 md:p-8">
          <div className="bg-white rounded-lg p-4  mx-auto">
          <h2 className="text-2xl lg:text-3xl font-bold mb-2 text-left">Add Your Personal Information</h2>
          <p className="text-red-500">( All fiels are mandatory including photo upload.)</p>
            {error && <p className="text-red-600">{error}</p>}
            {successMessage && <p className="text-green-600">{successMessage}</p>}
            {loading && <p className="text-blue-600">Submitting your information... Please wait.</p>}
            
            <form onSubmit={handleSubmit}>
              {/* Profile Image */}
              
              <div className="mb-4">
                <label htmlFor="image" className="block text-gray-700 text-sm text-center font-semibold mb-2">Profile Image</label>
                <div className="relative items-center cursor-pointer" onClick={handleImageClick}>
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-300 m-auto">
                    <Image  
                      src={formValues.image ? formValues.image : DefaultPic} 
                      alt="Profile Image"
                      width={100}
                      height={100}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    ref={fileInputRef}
                  />
                  {formErrors.image && <p className="text-red-600 text-sm text-center">{formErrors.image}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-5">
                <div>
                  <label htmlFor="firstName" className="block text-gray-700 text-sm font-semibold mb-2">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    className="border border-gray-300 rounded-lg py-2 px-4 w-full"
                    value={formValues.firstName}
                    onChange={handleChange}
                  />
                  {formErrors.firstName && <p className="text-red-600 text-sm">{formErrors.firstName}</p>}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-gray-700 text-sm font-semibold mb-2">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    className="border border-gray-300 rounded-lg py-2 px-4 w-full"
                    value={formValues.lastName}
                    onChange={handleChange}
                  />
                  {formErrors.lastName && <p className="text-red-600 text-sm">{formErrors.lastName}</p>}
                </div>
                <div >
                <label htmlFor="expectedCharge" className="block text-gray-700 text-sm font-semibold mb-2">Expected Charge (per session)</label>
                <input
                  type="text"
                  name="expectedCharge"
                  className="border border-gray-300 rounded-lg py-2 px-4 w-full"
                  value={formValues.expectedCharge}
                  onChange={handleChange}
                />
                {formErrors.expectedCharge && <p className="text-red-600 text-sm">{formErrors.expectedCharge}</p>}
              </div>
              <div>
                <label htmlFor="phoneNumber" className="block text-gray-700 text-sm font-semibold mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  className="border border-gray-300 rounded-lg py-2 px-4 w-full"
                  value={formValues.phoneNumber}
                  onChange={handleChange}
                />
                {formErrors.phoneNumber && <p className="text-red-600 text-sm">{formErrors.phoneNumber}</p>}
              </div>
              </div>
              
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-5">

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
                  <option value="Other">Other</option>
                </select>
                {formErrors.gender && <p className="text-red-600 text-sm">{formErrors.gender}</p>}
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
                {formErrors.location && <p className="text-red-600 text-sm">{formErrors.location}</p>}
              </div>
              <div>
                <label htmlFor="sport" className="block text-gray-700 text-sm font-semibold mb-2">Sport you coach</label>
                <select
                  name="sport"
                  className="border border-gray-300 rounded-lg py-2 px-4 w-full"
                  value={formValues.sport}
                  onChange={handleChange}
                >
                  <option value="">Select Sport</option>
                  <option value="Soccer">Soccer</option>
                  <option value="Basketball">Basketball</option>
                  <option value="Tennis">Tennis</option>
                </select>
                {formErrors.sport && <p className="text-red-600 text-sm">{formErrors.sport}</p>}
              </div>
              <div>
                <label htmlFor="clubName" className="block text-gray-700 text-sm font-semibold mb-2">Club/Company name</label>
                <input
                  type="text"
                  name="clubName"
                  className="border border-gray-300 rounded-lg py-2 px-4 w-full"
                  value={formValues.clubName}
                  onChange={handleChange}
                />
                {formErrors.clubName && <p className="text-red-600 text-sm">{formErrors.clubName}</p>}
              </div>
              </div>
             
              {/* Qualifications */}
              <div className="mb-4">
                <label htmlFor="qualifications" className="block text-gray-700 text-sm font-semibold mb-2">Qualifications</label>
                <textarea
                placeholder='Specify your qualification(s)'
                  name="qualifications"
                  className="border border-gray-300 rounded-lg py-2 px-4 w-full"
                  value={formValues.qualifications}
                  onChange={handleChange}
                  rows={4}
                />
                {formErrors.qualifications && <p className="text-red-600 text-sm">{formErrors.qualifications}</p>}
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
            <option value="Freshman">United States of America</option>
           
          </select>
          
          {formErrors.country && <p className="text-red-500 text-sm">{formErrors.country}</p>}
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
          {formErrors.state && <p className="text-red-500 text-sm">{formErrors.state}</p>}
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
          {formErrors.city && <p className="text-red-500 text-sm">{formErrors.city}</p>}
        </div>

        </div>
             
 
<div className="mb-4">
                <label htmlFor="image" className="block text-gray-700 text-sm font-semibold mb-2">Include any 
coaching certifications, relevant past and current experience, team(s) and/ or coaching accolades, 
relevant soccer affiliations, personal soccer links (eg, training business, current club), etc.</label>
                <div className="relative items-center cursor-pointer" onClick={handleCertificateClick}>
                  <div className="w-44 h-24   overflow-hidden border-2 border-gray-300 m-auto">
                    <Image  
                      src={formValues.certificate ? formValues.certificate : CertificateImage} 
                      alt="Certificate "
                      width={400}
                      height={200}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCertificateChange}
                    className="hidden"
                    ref={certificateInputRef}
                  />
                 
                </div>
              </div>
              {/* Submit Button */}
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
      </div>
    </>
  );
}

