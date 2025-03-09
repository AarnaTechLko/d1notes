"use client"; // Important for using hooks in Next.js 13+

import { useState, useRef, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import DefaultPic from "../../public/default.jpg";
import Brand from '../../public/images/brand.jpg';
import CertificateImage from '../../public/certificate.png'
import Image from 'next/image';
import { FaCheck, FaSpinner } from 'react-icons/fa';
import { type PutBlobResult } from '@vercel/blob';
import { upload } from '@vercel/blob/client';
import FileUploader from '@/app/components/FileUploader';
import { countryCodesList, states, currencies } from '@/lib/constants';
import { useRouter } from "next/navigation";
import { showError } from '@/app/components/Toastr';
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
  countrycode: string;
  currency: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  xlink: string;
  youtube: string;
  license: string;
  cv: string;
  license_type: string;
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
  city?: string | null;
  image: string | null;
  countrycode: string | null;
  currency: string | null;
  license: string | null;
  cv: string | null;
  license_type: string | null;

}

export default function Register() {
  const router = useRouter();
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
    currency: '$',
    countrycode: '+1',
    image: null,
    certificate: null,
    facebook: '',
    instagram: '',
    linkedin: '',
    xlink: '',
    youtube: '',
    license: '',
    cv: '',
    license_type: '',
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
    currency: null,
    city: undefined,
    countrycode: null,
    image: null,
    license: null,
    cv: null,
    license_type: null,

  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const LisenseInputRef = useRef<HTMLInputElement | null>(null);
  const CvInputRef = useRef<HTMLInputElement | null>(null);
  const certificateInputRef = useRef<HTMLInputElement | null>(null);
  const { data: session } = useSession();
  const [certificateUploading, setCertificateUploading] = useState<boolean>(false);
  const [photoUpoading, setPhotoUpoading] = useState<boolean>(false);
  const [licenseUpoading, setLicenseUpoading] = useState<boolean>(false);
  const [cvUpoading, setCvUpoading] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<Partial<FormValues>>({});
  const [countriesList, setCountriesList] = useState([]);
  const [statesList, setStatesList] = useState([]);
  const fetchStates = async (country: number) => {
    try {
      const response = await fetch(`/api/masters/states?country=${country}`);
      const data = await response.json();
      setStatesList(data); // Adjust key if necessary based on your API response structure
    } catch (error) {
      console.error('Failed to fetch states:', error);
    }
  };
  useEffect(() => {
    fetch('/api/masters/countries')
      .then((response) => response.json())
      .then((data) => setCountriesList(data || []))
      .catch((error) => console.error('Error fetching countries:', error));
  }, []);
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
      countrycode: null,
      currency: null,
      license: null,
      cv: null,
      license_type: null,

      image: null, // Ensure this property is included
    };

      if (!formValues.image) {
        errors.image = "Profile image is required";
    } else {
        // Calculate the approximate size of the base64 string
        const imageSizeInBytes = (formValues.image.length * 3) / 4;
        if (imageSizeInBytes > 5 * 1024 * 1024) {
          errors.image = "Image size must be less than 5MB";
        }
    }
    if (!formValues.firstName) errors.firstName = 'First Name is required';
    if (!formValues.lastName) errors.lastName = 'Last Name is required';

    if (!formValues.phoneNumber) errors.phoneNumber = 'Phone Number is required';
    if (formValues.phoneNumber.length < 14) errors.phoneNumber = 'Phone Number Must be of 10 Digits Minimum';

    if (formValues.phoneNumber.length > 14) errors.phoneNumber = 'Phone Number Must be of 10 Digits Maximum';
   /// if (!formValues.gender) errors.gender = 'Gender is required';

    if (!formValues.sport) errors.sport = 'Sport is required';
    if (!formValues.clubName) errors.clubName = 'Club Name is required';
    if (!formValues.qualifications) errors.qualifications = 'Qualifications are required';
    if (!formValues.currency) errors.currency = 'Currency required';
    if (!formValues.expectedCharge) {
      errors.expectedCharge = 'Expected Rate is required';
    } else if (!/^\d+(\.\d{1,2})?$/.test(formValues.expectedCharge)) {
      errors.expectedCharge = 'Expected Rate must be a valid number with up to 2 decimal places';
    }

    if (!formValues.country) errors.country = 'Country  is required';

    if (!formValues.state) errors.state = 'State/Province is required';

    if (!formValues.city) errors.city = 'City is required';

    ///setFormErrors(errors); // Set errors once validation is done

    // Collect errors to display in SweetAlert
    Object.entries(errors) .reverse()
    .filter(([_, value]) => value !== undefined && value !== null)
    .forEach(([field, message]) => {
      showError(message); // Display each error in a separate toastr
    });
  
  // Return false if there are any errors
  if (Object.values(errors).some(value => value !== undefined && value !== null)) {
    return false; // Validation failed
  }
  
    return true;
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
      formData.append("coachId", session.user.id); 
      
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
      session.user.name = formValues.firstName;
      session.user.image = formValues.image;
      session.user.expectedCharge = formValues.expectedCharge;

     console.log(session.user.expectedCharge);

      const res = await signIn('credentials', {
        redirect: false,
        email:  localStorage.getItem('email'),
        password: localStorage.getItem('key'),
        loginAs:'coach',
      });
      if (response.ok) {
        localStorage.clear();
        router.push("/coach/dashboard");

      }
   
     //window.location.href = '/coach/dashboard';
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
    if (name === 'country') {
      fetchStates(Number(value));
    }
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
      setFormValues({ ...formValues, cv: imageUrl });

    } catch (error:any) {
      setCvUpoading(false);
      showError('Only JPG and PNG Images Allowed.');
    }
  }
  
  
  
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
      setFormValues({ ...formValues, license: imageUrl });

    } catch (error:any) {
      setLicenseUpoading(false);
      showError('Error While Uplading File.');
    }
  }
 

 
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
      setFormValues({ ...formValues, image: imageUrl });

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
    setFormValues({ ...formValues, phoneNumber: formattedNumber });
  };

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleLicenseClick = () => {
    if (LisenseInputRef.current) {
      LisenseInputRef.current.click();
    }
  };

  const handleCertificateClick = () => {
    if (certificateInputRef.current) {
      certificateInputRef.current.click();
    }
  };


  const handleCertificateChange = async () => {
    if (!certificateInputRef.current?.files) {
      throw new Error('No file selected');
    }
    setCertificateUploading(true);
    const file = certificateInputRef.current.files[0];

    try {
      const newBlob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/uploads',
      });
      setCertificateUploading(false);
      const certificate = newBlob.url;
      setFormValues({ ...formValues, certificate: certificate });

    } catch (error) {
      setCertificateUploading(false);
      console.error('Error uploading file:', error);
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
              {/* <p className="text-red-500">( Fields marked with * are mandatory.)</p> */}
              {error && <p className="text-red-600">{error}</p>}
              {successMessage && <p className="text-green-600">{successMessage}</p>}


              <form onSubmit={handleSubmit}>
                {/* Profile Image */}

                <div className="mb-4">
                  <label htmlFor="image" className="block text-gray-700 text-sm text-center font-semibold mb-2">Coach Image<span className='mandatory'>*</span></label>
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
                    {formErrors.image && <p className="text-red-600 text-sm text-center">{formErrors.image}</p>}
                  </div>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-5">
                  <div>
                    <label htmlFor="firstName" className="block text-gray-700 text-sm font-semibold mb-2">Coach First Name<span className='mandatory'>*</span></label>
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
                    <label htmlFor="lastName" className="block text-gray-700 text-sm font-semibold mb-2">Coach Last Name<span className='mandatory'>*</span></label>
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
                  <label htmlFor="expectedCharge" className="block text-gray-700 text-sm font-semibold mb-2">Base Evaluation Rate $<span className='mandatory'>*</span></label>
                  <div className="flex">
                      <select
                        name="currency" 
                        className="border border-gray-300 rounded-lg py-2 px-4 w-1/2 mr-1 hidden" // Added mr-4 for margin-right
                        value={formValues.currency}
                        onChange={handleChange}
                      >
                        {/* <option value="">Select</option> */}
                        {currencies.map((crn) => (
                          <option key={crn.currency} value={crn.unicode}>
                            {crn.unicode} ({crn.currency})
                          </option>
                        ))}
                      </select>
                      <input
                      placeholder='Ex: 100'
                      type="text"
                      name="expectedCharge"
                      className="border border-gray-300 rounded-lg py-2 px-4 w-full"
                      value={formValues.expectedCharge}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d*$/.test(value)) { // Allow only whole numbers (no decimals or non-numeric chars)
                            handleChange(e);
                        }
                    }}
                    />
                    </div>
                    {formErrors.currency && <p className="text-red-600 text-sm">{formErrors.currency}</p>}
                    {formErrors.expectedCharge && <p className="text-red-600 text-sm">{formErrors.expectedCharge}</p>}
                  </div>
                  <div>
                    <label htmlFor="phoneNumber" className="block text-gray-700 text-sm font-semibold mb-2">Mobile Number<span className='mandatory'>*</span></label>

                    <div className="flex">
                      <select
                        name="countrycode"
                        className="border border-gray-300 rounded-lg py-2 px-4 w-[115px] p-0 mr-1" // Added mr-4 for margin-right
                        value={formValues.countrycode}
                        onChange={handleChange}
                      >
                        <option value="">Select</option>
                        {countryCodesList.map((item) => (
                          <option key={item.id} value={item.code}>
                            {item.code}-{item.country}
                          </option>
                        ))}
                      </select>

                      <input
                        placeholder="(XXX) XXX-XXXX"
                        type="text"
                        name="number"
                        className="border border-gray-300 rounded-lg py-2 px-4 w-3/5"
                        value={formValues.phoneNumber}
                        onChange={handlePhoneNumberChange}
                        maxLength={14} // (123) 456-7890 is 14 characters long
                      />
                    </div>


                    {formErrors.phoneNumber && <p className="text-red-600 text-sm">{formErrors.phoneNumber}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-5">

                  {/* Gender */}
                  <div>
                    <label htmlFor="gender" className="block text-gray-700 text-sm font-semibold mb-2">Gender <span className="text-xs text-gray-500">(Optional)</span></label>
                    <select
                      name="gender"
                      className="border border-gray-300 rounded-lg py-2 px-4 w-full"
                      value={formValues.gender}
                      onChange={handleChange}
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    {formErrors.gender && <p className="text-red-600 text-sm">{formErrors.gender}</p>}
                  </div>

                  {/* Location */}

                  <div>
                    <label htmlFor="sport" className="block text-gray-700 text-sm font-semibold mb-2">Sport<span className='mandatory'>*</span></label>
                    <select
                      name="sport"
                      className="border border-gray-300 rounded-lg py-2 px-4 w-full"
                      value={formValues.sport}
                      onChange={handleChange}
                    >
                      <option value="">Select</option>
                      <option value="Soccer">Soccer</option>

                    </select>
                    {formErrors.sport && <p className="text-red-600 text-sm">{formErrors.sport}</p>}
                  </div>
                  <div>
                    <label htmlFor="clubName" className="block text-gray-700 text-sm font-semibold mb-2">Title/Organization(s)/Affiliation(s)<span className='mandatory'>*</span></label>
                    <input
                    placeholder='Ex. Director/LA Stars or Trainer/Elite Performance'
                      type="text"
                      name="clubName"
                      className="border border-gray-300 rounded-lg py-2 px-4 w-full"
                      value={formValues.clubName}
                      onChange={handleChange}
                    />
                    {formErrors.clubName && <p className="text-red-600 text-sm">{formErrors.clubName}</p>}
                  </div>

                  <div>
                    <label htmlFor="license_type" className="block text-gray-700 text-sm font-semibold mb-2">Coaching License Type (Optional)</label>
                    <select
                      name="license_type"
                      className="border border-gray-300 rounded-lg py-2 px-4 w-full"
                      value={formValues.license_type}
                      onChange={handleChange}
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
                    {formErrors.license_type && <p className="text-red-600 text-sm">{formErrors.license_type}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-5">
                  <div>
                    <label htmlFor="country" className="block text-gray-700 text-sm font-semibold mb-2">Country<span className='mandatory'>*</span></label>
                    <select
                      name="country"
                      className="border border-gray-300 rounded-lg py-2 px-4 w-full"
                      value={formValues.country ?? ""}
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

                    {formErrors.country && <p className="text-red-500 text-sm">{formErrors.country}</p>}
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-gray-700 text-sm font-semibold mb-2">State/Province<span className='mandatory'>*</span></label>


                    <select
                      name="state"
                      id="state"
                      value={formValues.state ?? ""}
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
                    {formErrors.state && <p className="text-red-500 text-sm">{formErrors.state}</p>}
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-gray-700 text-sm font-semibold mb-2">City<span className='mandatory'>*</span></label>
                    <input
                    placeholder=''
                      type="text"
                      name="city"
                      className="border border-gray-300 rounded-lg py-2 px-4 w-full"
                      value={formValues.city ?? ""}
                      onChange={handleChange}
                    />
                    {formErrors.city && <p className="text-red-500 text-sm">{formErrors.city}</p>}
                  </div>

                </div>
                {/* Qualifications */}
                <div className="mb-4">
                  <label htmlFor="qualifications" className="block text-gray-700 text-sm font-semibold mb-2">Background<span className='mandatory'>*</span></label>
                  <textarea
                    placeholder='Include any
                    coaching certifications, relevant past and current experience, team(s) and/ or coaching accolades,
                    relevant soccer affiliations, personal soccer links (eg, training business, current club), etc.'
                    name="qualifications"
                    className="border border-gray-300 rounded-lg py-2 px-4 w-full"
                    value={formValues.qualifications}
                    onChange={handleChange}
                    rows={4}
                  />
                  {formErrors.qualifications && <p className="text-red-600 text-sm">{formErrors.qualifications}</p>}
                </div>







                {/* <div className="mb-4">
                  <label htmlFor="image" className="block text-gray-700 text-sm font-semibold mb-2"></label>
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
                    {certificateUploading ? (
                      <>
                        <FileUploader />
                      </>
                    ) : (
                      <>

                      </>
                    )}
                  </div>
                </div> */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 pb-5">

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

                 
                 
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 pb-5">
                <div>
                    <label htmlFor="youtube" className="block text-gray-700 text-sm font-semibold mb-2">Upload CV <span className="text-xs text-gray-500">(Optional)</span></label>
                    <input
                    placeholder=' '
                      type="file"
                      name="youtube"
                      accept="image/*,application/pdf"
                      className="border border-gray-300 rounded-lg py-2 px-4 w-full"
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
                <div>
                    <label htmlFor="license" className="block text-gray-700 text-sm font-semibold mb-2">Upload Coaching License <span className="text-xs text-gray-500">(Optional)</span></label>
                    <input
                    placeholder='Ex: https://youtube.com/username'
                      type="file"
                      name="license"
                      accept="image/*,application/pdf"
                      className="border border-gray-300 rounded-lg py-2 px-4 w-full"
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
      </div>
    </>
  );
}

