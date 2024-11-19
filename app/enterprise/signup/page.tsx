"use client";
import { useEffect, useState, useRef } from 'react';
import { signIn, useSession } from 'next-auth/react';
import Brand from '../../public/images/brand.jpg';
import Image from 'next/image';
import { showError, showSuccess } from '../../components/Toastr';
import { z } from 'zod';
import { type PutBlobResult } from '@vercel/blob';
import { upload } from '@vercel/blob/client';
import DefaultPic from "../../public/default.jpg";
import { FaCheck, FaSpinner } from 'react-icons/fa';
import { countryCodesList } from '@/lib/constants';
import TermsAndConditions from '@/app/components/TermsAndConditions';
import FileUploader from '@/app/components/FileUploader';

// Zod schema for validation
const formSchema = z.object({
  organizationName: z.string().min(1, 'Organization Name is required.'),
  contactPerson: z.string().min(1, 'Contact Person is required.'),
  email: z.string().email('Invalid email format.'),
  mobileNumber: z.string().min(14, 'Mobile Number must be at least 10 digits.'),
  address: z.string().min(1, 'Address is required.'),
  country: z.string().min(1, 'Country is required.'),
  countryCodes: z.string().min(1, 'Country Code is required.'),
  state: z.string().min(1, 'State is required.'),
  city: z.string().min(1, 'City is required.'),
  password: z.string().min(6, 'Password must be at least 6 characters long.'),
  otp: z.string().min(6, 'OTP must be 6 characters.'), // Now required
  loginAs: z.literal('enterprise'),
  logo:z.string(), // File instance for logo
  affiliationDocs: z.string(), // File instance for PDF docs
});

type FormValues = z.infer<typeof formSchema>;

export default function Signup() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);
    const [formValues, setFormValues] = useState<FormValues>({
    organizationName: '',
    contactPerson: '',
    email: '',
    mobileNumber: '',
    countryCodes: '',
    address: '',
    country: '',
    state: '',
    city: '',
    password: '',
    otp: '',
    loginAs: 'enterprise',
    logo: '',
    affiliationDocs:'',
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [otpLoading, setOtpLoading] = useState<boolean>(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [photoUpoading, setPhotoUploading] = useState<boolean>(false);
  const [pdfUpoading, setPdfUploading] = useState<boolean>(false);
  const { data: session } = useSession();
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
    setFormValues({ ...formValues, mobileNumber: formattedNumber });
  };
 

  const sendOtp = async () => {
 
  
    setOtpLoading(true);
    try {
      const response = await fetch('/api/sendemailotp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formValues.email }),
      });

      if (!response.ok) throw new Error('Failed to send OTP.');

      showSuccess('OTP sent to your email.');
      setOtpSent(true);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Something went wrong!');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!termsAccepted) {
      return showError('You must accept the terms and conditions.');
    }

    const validationResult = formSchema.safeParse(formValues);
    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors[0].message;
      showError(errorMessage);
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(formValues).forEach(([key, value]) => {
        if (value) formData.append(key, value as any);
      });

      const response = await fetch('/api/enterprise/signup', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Something went wrong!');
      }

      await signIn('credentials', {
        redirect: false,
        email: formValues.email,
        password: formValues.password,
        loginAs: formValues.loginAs,
      });

     window.location.href = '/enterprise/dashboard';
    } catch (err) {
      setLoading(false);
      showError(err instanceof Error ? err.message : 'Something went wrong!');
    }
  };

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Trigger file input click
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormValues({ ...formValues, [name]: value });
    if (name === "email") setOtpSent(false);
  };
  const handleImageChange = async () => {
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
        setFormValues({ ...formValues, logo: imageUrl });
        
      } catch (error) {
        setPhotoUploading(false);
        console.error('Error uploading file:', error);
      }
};

  const handleFileChange = async() => {
    if (!pdfInputRef.current?.files) {
      throw new Error('No file selected');
    }
    setPdfUploading(true);
    const file = pdfInputRef.current.files[0];

    try {
      const newBlob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/uploads',
      });
      setPdfUploading(false);
      const fileUrl = newBlob.url;
      setFormValues({ ...formValues, affiliationDocs: fileUrl });
      
    } catch (error) {
      setPdfUploading(false);
      console.error('Error uploading file:', error);
    }
  };

  return (
    <div className="flex flex-col md:flex-row w-full space-y-6 md:space-y-0 md:space-x-6">
      {/* Form Section */}
      <div className="flex-1 bg-white p-6 md:p-12 rounded-lg shadow-md">
        <div className="w-full">
          <h2 className="text-2xl font-bold mb-4 text-left">Enterprise Sign Up</h2>

          <form onSubmit={handleSubmit}>
            {/* Organization Name */}
            <div className="mb-4">
              <label htmlFor="organizationName" className="block text-gray-700 text-sm font-semibold mb-2">
                Organization Name
              </label>
              <input
                type="text"
                name="organizationName"
                value={formValues.organizationName}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Contact Person */}
            <div className="mb-4">
              <label htmlFor="contactPerson" className="block text-gray-700 text-sm font-semibold mb-2">
                Contact Person
              </label>
              <input
                type="text"
                name="contactPerson"
                value={formValues.contactPerson}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Email and Mobile Number */}
            <div className="mb-4 md:flex md:space-x-4">
              <div className="flex-1">
                <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">
                  Email
                </label>
                <input
                  type="text"
                  name="email"
                  value={formValues.email}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  
                />
              </div>
              
              <div className="flex-1">
                <label htmlFor="mobileNumber" className="block text-gray-700 text-sm font-semibold mb-2">
                  Mobile Number
                </label>
                <div className="flex">
    <select  
      name="countryCodes" 
      className="border border-gray-300 rounded-lg py-2 px-4 w-1/3 mr-1" // Added mr-4 for margin-right
      value={formValues.countryCodes} 
      onChange={handleChange}
    >
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
      value={formValues.mobileNumber}
      onChange={handlePhoneNumberChange}
      maxLength={14} 
      onFocus={() => {
        if (!otpSent) sendOtp(); // Trigger OTP when focusing on the password field
      }}
    />
  </div>
          
                 {otpLoading && <FaSpinner className="animate-spin ml-2 text-blue-500" />}
              </div>
            </div>

            {/* Address */}
            <div className="mb-4">
              <label htmlFor="address" className="block text-gray-700 text-sm font-semibold mb-2">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formValues.address}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Country, State, and City */}
            <div className="mb-4 md:flex md:space-x-4">
              <div className="flex-1">
                <label htmlFor="country" className="block text-gray-700 text-sm font-semibold mb-2">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={formValues.country}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="state" className="block text-gray-700 text-sm font-semibold mb-2">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={formValues.state}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="city" className="block text-gray-700 text-sm font-semibold mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formValues.city}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Logo Upload */}
            <div className="col-span-2 sm:col-span-2 lg:col-span-3 mb-4">
              <div onClick={handleImageClick}>
                <label className="block text-gray-700 text-sm font-semibold mb-2 text-center">Organization Logo</label>
                <Image
                  src={formValues.logo || DefaultPic}
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
                {photoUpoading ? (
                                            <>
                                                <FileUploader/>
                                            </>
                                        ) : (
                                            <>
                                                
                                            </>
                                        )}
              </div>
            </div>

            {/* Affiliation Documents */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2">Affiliation Documents (PDF)</label>
              <input type="file" name="affiliationDocs" accept="application/pdf" onChange={handleFileChange}  ref={pdfInputRef} />
              {pdfUpoading ? (
                                            <>
                                                <FileUploader/>
                                            </>
                                        ) : (
                                            <>
                                                
                                            </>
                                        )}
            </div>
            <div className="mb-4 md:flex md:space-x-4">
            <div className="flex-1">
              <label className="block text-gray-700 text-sm font-semibold mb-2">Password</label>
              <input type="password" name="password" className='border border-gray-300 rounded-lg py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500' accept="application/pdf"  value={formValues.password}
                onChange={handleChange} />
            </div>
            </div>
            {otpSent && (
              <div className="mb-4">
                <label htmlFor="otp" className="block text-gray-700 text-sm font-semibold mb-2">
                  OTP
                </label>
                <div className="flex space-x-2">
                  {[...Array(6)].map((_, index) => (
                    <input
                      key={index}
                      type="text"
                      name={`otp-${index}`}
                      value={formValues.otp[index] || ''} // Ensure OTP value is a string
                      maxLength={1}
                      className="w-12 h-12 text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => {
                        const newOtp = formValues.otp.split('');
                        newOtp[index] = e.target.value;
                        setFormValues({
                          ...formValues,
                          otp: newOtp.join(''),
                        });

                        // Move focus to next input if current input is filled
                        if (e.target.value && index < 5) {
                          const nextInput = document.querySelector(`input[name="otp-${index + 1}"]`) as HTMLInputElement;
                          nextInput?.focus();
                        }
                      }}
                      onKeyUp={(e) => {
                        // Move focus to previous input if backspace is pressed
                        if (e.key === 'Backspace' && index > 0) {
                          const prevInput = document.querySelector(`input[name="otp-${index - 1}"]`) as HTMLInputElement;
                          prevInput?.focus();
                        }
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
            {/* Terms & Conditions */}
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-gray-700 text-sm font-semibold">I accept the <a href="#" className="text-blue-500 hover:underline" onClick={() => setIsModalOpen(true)}>terms and conditions</a>.</span>
              </label>
            </div>
            

            <div className="flex items-center justify-center ">
  <button
    type="submit"
    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg flex items-center justify-center"
    disabled={loading}
  >
    {loading ? (
      <FaSpinner className="animate-spin mr-2" />
    ) : (
      <FaCheck className="mr-2" />
    )}
    <span>Sign Up</span>
  </button>
</div>
          </form>
          <TermsAndConditions  isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}/>
      
        </div>
      </div>
      
       
      {/* Brand Section */}
      <div className="flex-1 hidden md:block">
        <Image src={Brand} alt="brand" layout="responsive" width={550} height={500} className="object-cover" />
      </div>
    </div>
  );
}
