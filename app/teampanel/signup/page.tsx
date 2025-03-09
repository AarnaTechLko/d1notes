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
import { FaCheck, FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';
import { countryCodesList } from '@/lib/constants';
import TermsAndConditions from '@/app/components/TermsAndConditions';
import FileUploader from '@/app/components/FileUploader';

// Zod schema for validation
const formSchema = z.object({
  organizationName: z.string().min(1, 'Team Name is required.'),
  ////contactPerson: z.string().min(1, 'Contact Person is required.'),
  owner_name: z.string().min(1, 'Administrator Name is required.'),
  email: z.string().email('Invalid email format.'),
  mobileNumber: z.string().min(14, 'Mobile Number must be at least 10 digits.'),
  address: z.string().min(1, 'Address is required.'),
  country: z.string().min(1, 'Country is required.'),
  countryCodes: z.string().min(1, 'Country Code is required.'),
  state: z.string().min(1, 'State is required.'),
  city: z.string().min(1, 'City is required.'),
  facebook: z.string().optional(),
  linkedin: z.string().optional(),
  xlink: z.string().optional(),
  instagram: z.string().optional(),
  youtube: z.string().optional(),
  password: z
      .string()
      .refine(
        (value) =>
          /^(?=.*\d)(?=.*[!@#$%^&*()_\-+=|:;<>,.?]).{6,}$/.test(value),
        {
          message:
            "Password must contain at least 6 characters, including at least 1 number and 1 special character",
        }
      ),
    confirm_password: z.string(),
  //otp: z.string().min(6, 'OTP must be 6 characters.'), // Now required
  loginAs: z.literal('team'),
  logo:z.string().min(1,'Logo Required'),
  affiliationDocs: z.string(), // File instance for PDF docs
  description: z.string().min(1, 'Organization Description is required.'),
}) .refine((data) => data.password === data.confirm_password, {
  message: "Confirm Password must match Password.",
  path: ['confirm_password'], // Point the error at the confirm_password field
});;

type FormValues = z.infer<typeof formSchema>;

export default function Signup() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);
    const [formValues, setFormValues] = useState<FormValues>({
    organizationName: '',
    owner_name: '',
    
    email: '',
    mobileNumber: '',
    countryCodes: '+1',
    address: '',
    country: '',
    state: '',
    city: '',
    password: '',
    confirm_password: '',
    //otp: '',
    loginAs: 'team',
    logo: '',
    affiliationDocs:'',
    description:'',
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
  const [countriesList, setCountriesList] = useState([]);
  const [statesList, setStatesList] = useState([]);
const [showPassword, setShowPassword] = useState(false);
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

      showSuccess('A verification passcode has been sent to your email.');
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

      const response = await fetch('/api/teampanel/signup', {
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

     window.location.href = '/teampanel/dashboard';
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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormValues({ ...formValues, [name]: value });
    if (name === "email") setOtpSent(false);
    if (name === 'country') {
      fetchStates(Number(value));
    }
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
    <>
    <head>
    <title>Club Signup - D1 NOTES</title>
    <meta name="description" content="This is the home page of my Next.js application." />
  </head>
    <div className="flex flex-col md:flex-row w-full space-y-6 md:space-y-0 md:space-x-6">
      {/* Form Section */}
      <div className="flex-1 bg-white p-6 md:p-12 rounded-lg shadow-md">
        <div className="w-full">
          <h2 className="text-2xl font-bold mb-4 text-left">Team Sign Up</h2>

          <form onSubmit={handleSubmit}>
            {/* Organization Name */}
            <div className="mb-4">
              <label htmlFor="organizationName" className="block text-gray-700 text-sm font-semibold mb-2">
                Team Name<span className="mandatory">*</span>
              </label>
              <input
              placeholder='Ex. LA Storm FC'
                type="text"
                name="organizationName"
                value={formValues.organizationName}
                onChange={handleChange}
                maxLength={50}
                className="border border-gray-300 rounded-lg py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Contact Person */}
            <div className="mb-4 md:flex md:space-x-4">
            <div className="flex-1">
              <label htmlFor="contactPerson" className="block text-gray-700 text-sm font-semibold mb-2">
              Administrator Name<span className="mandatory">*</span>
              </label>
              <input
              placeholder='Ex. Rod Smith'
                type="text"
                name="owner_name"
                value={formValues.owner_name}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
 
            </div>

            {/* Email and Mobile Number */}
            <div className="mb-4 md:flex md:space-x-4">
              <div className="flex-1">
                <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">
                Administrator Email<span className="mandatory">*</span>
                </label>
                <input
                placeholder=''
                  type="text"
                  name="email"
                  value={formValues.email}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  
                />
              </div>
              
              <div className="flex-1">
                <label htmlFor="mobileNumber" className="block text-gray-700 text-sm font-semibold mb-2">
                Administrator Mobile Number<span className="mandatory">*</span>
                </label>
                <div className="flex">
    <select  
      name="countryCodes" 
      className="border border-gray-300 rounded-lg py-2 px-4 w-2/5 mr-1" // Added mr-4 for margin-right
      value={formValues.countryCodes} 
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
      className="border border-gray-300 rounded-lg py-2 px-4 w-3/5"
      value={formValues.mobileNumber}
      onChange={handlePhoneNumberChange}
      maxLength={14} 
      // onFocus={() => {
      //   if (!otpSent) sendOtp(); // Trigger OTP when focusing on the password field
      // }}
    />
  </div>
          
                 {otpLoading && <FaSpinner className="animate-spin ml-2 text-blue-500" />}
              </div>
            </div>

            {/* Address */}
            <div className="mb-4 md:flex md:space-x-4">
            <div className="flex-1">
              <label htmlFor="address" className="block text-gray-700 text-sm font-semibold mb-2">
              Team Street Address
              </label>
              <input
              placeholder='Ex. 12 Fireside Road Suite 200'
                type="text"
                name="address"
                value={formValues.address}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              </div>

<div className="flex-1">
                <label htmlFor="sport" className="block text-gray-700 text-sm font-semibold mb-2">Sport<span className='mandatory'>*</span></label>
                  <select
                    name="sport"
                    className="border border-gray-300 rounded-lg py-2 px-4 w-full"
                    
                    onChange={handleChange}
                  >
                   <option value="">Select</option>
                    <option value="Soccer">Soccer</option>

                  </select>
                  </div>
            </div>

            {/* Country, State, and City */}
            <div className="mb-4 md:flex md:space-x-4">
              <div className="flex-1">
                <label htmlFor="country" className="block text-gray-700 text-sm font-semibold mb-2">
                Team Country<span className="mandatory">*</span>
                </label>
                <select
                    name="country"
                    className="border border-gray-300 rounded-lg py-2 px-4 w-full"
                    value={formValues.country}
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
            
              </div>
              <div className="flex-1">
                <label htmlFor="state" className="block text-gray-700 text-sm font-semibold mb-2">
                Team State/Province<span className="mandatory">*</span>
                </label>
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
              <div className="flex-1">
                <label htmlFor="city" className="block text-gray-700 text-sm font-semibold mb-2">
                Team City<span className="mandatory">*</span>
                </label>
                <input
                placeholder=''
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
            <label  htmlFor="city" className="block text-gray-700 text-sm font-semibold mb-2">Team Description<span className='mandatory'>*</span></label>
            <textarea name="description"   maxLength={1500} className='w-full border border-gray-300 rounded-lg py-2 px-4  focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='Ex. LA Storm FC is a boys and girls soccer club based in Los Angeles.'
            value={formValues.description}
            onChange={handleChange}
            ></textarea>
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

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 pb-5">

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
              <div className="mb-4">
                <label htmlFor="image" className="block text-gray-700 text-sm text-center font-semibold mb-2">Team Logo<span className='mandatory'>*</span></label>
                <div className="relative items-center cursor-pointer" onClick={handleImageClick}>
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-300 m-auto">
                    <Image
                      src={formValues.logo ? formValues.logo : '/defaultlogo.jpeg'}
                      alt="Profile Image"
                      width={100}
                      height={100}
                      className="object-cover w-full h-full"
                    />
                    {!formValues.logo && (
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

            {/* Affiliation Documents */}
            {/* <div className="mb-4">
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
            </div> */}
            <div className="mb-4 md:flex md:space-x-4">
            <div className="flex-1">
              <label className="block text-gray-700 text-sm font-semibold mb-2">Create Password<span className='mandatory'>*</span></label>
              <p className="text-gray-400 text-xs">(Password must contain at least 6 characters, including at least 1 number and 1 special character)</p>
              <div className="relative">
              <input type={showPassword ? "text" : "password"} name="password" className='border border-gray-300 rounded-lg py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500' accept="application/pdf"  value={formValues.password}
                onChange={handleChange} />
                 <span
          className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-gray-500"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </span>
            </div>
            </div>

            <div className="flex-1 md:pt-8 pt-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2">Confirm Password<span className='mandatory'>*</span></label>
             
              <div className="relative">
              <input type={showPassword ? "text" : "password"} name="confirm_password" className='border border-gray-300 rounded-lg py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500' accept="application/pdf"  value={formValues.confirm_password}
                onChange={handleChange} />
                 <span
          className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-gray-500"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </span>
            </div>
            </div>
            </div>
            {otpSent && (
              <div className="mb-4">
                <label htmlFor="otp" className="block text-gray-700 text-sm font-semibold mb-2">
                Enter Verification code, sent to your email.
                </label>
                <span className="text-xs text-gray-500">(Check Spam also if not found in inbox.)</span>
                <div className="flex space-x-2">
                  {[...Array(6)].map((_, index) => (
                    <input
                      key={index}
                      type="number"
                      name={`otp-${index}`}
                     /// value={formValues.otp[index] || ''} // Ensure OTP value is a string
                      maxLength={1}
                      className="w-12 h-12 text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      // onChange={(e) => {
                      //   const newOtp = formValues.otp.split('');
                      //   newOtp[index] = e.target.value;
                      //   setFormValues({
                      //     ...formValues,
                      //     otp: newOtp.join(''),
                      //   });

                      //   // Move focus to next input if current input is filled
                      //   if (e.target.value && index < 5) {
                      //     const nextInput = document.querySelector(`input[name="otp-${index + 1}"]`) as HTMLInputElement;
                      //     nextInput?.focus();
                      //   }
                      // }}
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
                <span className="text-gray-700 text-sm font-semibold">I accept the <a href="#" className="text-blue-500 " onClick={() => setIsModalOpen(true)}>terms and conditions</a>.</span>
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
    </>
  );
}
