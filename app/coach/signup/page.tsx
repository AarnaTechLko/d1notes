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
    image: null,
    
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const certificateInputRef = useRef<HTMLInputElement | null>(null);
  const { data: session } = useSession();
  const [validationErrors, setValidationErrors] = useState<Partial<FormValues>>({});

  // Validation function
  const validateForm = (): boolean => {
    const errors: FormErrors = {
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
      image: null, // Ensure this property is included
    };
  
    if (!formValues.image) {
      errors.image = 'Profile image is required';
    } 
    if (!formValues.firstName) errors.firstName = 'First Name is required';
    if (!formValues.lastName) errors.lastName = 'Last Name is required';
    if (!formValues.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formValues.email)) {
      errors.email = 'Email is invalid';
    }
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
    if (!formValues.password) errors.password = 'Password is required';
    if (formValues.password.length < 8) errors.password = 'Password must be at least 8 characters long';
  
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

    try {
      const response = await fetch('/api/coach/signup', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Something went wrong!');
      }
      
      const data = await response.json();
      localStorage.setItem("userImage", data.image);
      await signIn('credentials', {
        redirect: false,
        email: formValues.email,
        password: formValues.password,
        loginAs: "coach",
      });

     /// window.location.href = '/coach/dashboard'; 
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
      if (session.user.type === 'coach') {
        window.location.href = '/coach/dashboard';
      } else if (session.user.type === 'player') {
        window.location.href = '/dashboard';
      } else if (!session.user.name) {
        window.location.href = '/completeprofile';
      }
    }
  }, [session]);

  return (
    <>
     <div className="container mx-auto p-4">
      <div className="flex flex-col justify-center bg-white p-4 w-full">
        <div className="flex-1 bg-white p-1 md:p-8">
          <div className="bg-white rounded-lg p-4  mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-left">Coach Sign Up</h2>
            {error && <p className="text-red-600">{error}</p>}
            {successMessage && <p className="text-green-600">{successMessage}</p>}
            {loading && <p className="text-blue-600">Submitting your information... Please wait.</p>}
            
            <form onSubmit={handleSubmit}>
              {/* Profile Image */}
              
              <div className="mb-4">
                <label htmlFor="image" className="block text-gray-700 text-sm font-semibold mb-2">Profile Image</label>
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
                  {formErrors.image && <p className="text-red-600 text-sm">{formErrors.image}</p>}
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
                <div>
                <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  className="border border-gray-300 rounded-lg py-2 px-4 w-full"
                  value={formValues.email}
                  onChange={handleChange}
                />
                {formErrors.email && <p className="text-red-600 text-sm">{formErrors.email}</p>}
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

              <div className="flex mb-4 space-x-4">
              <div className="flex-1">
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

              {/* Password */}
              <div className="flex-1">
                <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  className="border border-gray-300 rounded-lg py-2 px-4 w-full"
                  value={formValues.password}
                  onChange={handleChange}
                />
                {formErrors.password && <p className="text-red-600 text-sm">{formErrors.password}</p>}
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
