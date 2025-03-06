"use client"; // Important for using hooks in Next.js 13+

import { useState, useRef, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import DefaultPic from "../../public/default.jpg";
import { type PutBlobResult } from '@vercel/blob';
import { upload } from '@vercel/blob/client';
import Brand from '../../public/images/brand.jpg';
import CertificateImage from '../../public/certificate.png'
import Image from 'next/image';
import { showError, showSuccess } from '../../components/Toastr';
import { FaCheck, FaSpinner } from 'react-icons/fa';
import FileUploader from '../FileUploader';
import { states, countryCodesList } from '@/lib/constants';

interface CoachFormProps {
    onSubmit: (formData: any) => void;
    teamId?:string;
}
interface FormValues {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    gender: string;
    location: string;
    sport: string;
    clubName?: string;
    qualifications: string;
    expectedCharge: string;
    password: string;
    image: string | null;
    country: string | null;
    state: string | null;
    city: string | null;
    certificate: string | null;
    countrycode: string;
    enterprise_id: string;
    license: string;
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
    enterprise_id: string | null;
    license: string | null;

}

const CoachForm: React.FC<CoachFormProps> = ({ onSubmit, teamId }) => {
    const [formValues, setFormValues] = useState<FormValues>({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        gender: '',
        location: '',
        sport: '',
        
        qualifications: '',
        expectedCharge: '',
        password: '',
        country: '',
        state: '',
        city: '',
        countrycode: '',
        enterprise_id: '',
        image: null,
        certificate: null,
        license: ''
    });
    const resetForm = () => {
        setFormValues({
            firstName: '',
            lastName: '',
            email: '',
            phoneNumber: '',
            gender: '',
            location: '',
            sport: '',
           
            qualifications: '',
            expectedCharge: '',
            password: '',
            country: '',
            state: '',
            city: '',
            countrycode: '',
            enterprise_id: '',
            image: null,
            certificate: null,
            license: ''
        });
      };
    const [formErrors, setFormErrors] = useState<FormErrors>({
        firstName: undefined,
        lastName: undefined,
        email: undefined,
        phoneNumber: undefined,
        gender: undefined,
        location: undefined,
        sport: undefined,
       
        qualifications: undefined,
        expectedCharge: undefined,
        password: undefined,
        country: undefined,
        state: undefined,
        city: undefined,
        enterprise_id: null,
        countrycode: null,
        license: null,
        image: null,

    });
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingKey, setLoadingKey] = useState<boolean>(false);
    const [photoUpoading, setPhotoUploading] = useState<boolean>(false);
    const [certificateUploading, setCertificateUploading] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [blob, setBlob] = useState<PutBlobResult | null>(null);
    const certificateInputRef = useRef<HTMLInputElement | null>(null);
    const { data: session } = useSession();
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
            enterprise_id: null,
            license: null,

            image: null, // Ensure this property is included
        };

        // if (!formValues.image) {
        //     errors.image = "Profile image is required";
        // } else {
        //     // Calculate the approximate size of the base64 string
        //     const imageSizeInBytes = (formValues.image.length * 3) / 4;
        //     if (imageSizeInBytes > 5 * 1024 * 1024) {
        //         errors.image = "Image size must be less than 5MB";
        //     }
        // }
        if (!formValues.firstName) errors.firstName = 'First Name is required';
        if (!formValues.lastName) errors.lastName = 'Last Name is required';

        if (!formValues.countrycode) errors.countrycode = 'Country Code required';
        if (!formValues.phoneNumber) errors.phoneNumber = 'Mobile Number is required';
        if (!formValues.email) {
            errors.email = 'Email is required';
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email)
        ) {
            errors.email = 'Invalid email format';
        }

        if (formValues.phoneNumber.length < 14) errors.phoneNumber = 'Mobile Number must be 10 digits minimum';

        if (formValues.phoneNumber.length > 14) errors.phoneNumber = 'Mobile Number must be 10 digits minimum';
        if (!formValues.gender) errors.gender = 'Gender is required';

        if (!formValues.sport) errors.sport = 'Sport is required';
       
        if (!formValues.qualifications) errors.qualifications = 'Qualifications are required';
        if (!formValues.expectedCharge) {
            errors.expectedCharge = 'Expected Rate is required';
        } else if (!/^\d+(\.\d{1,2})?$/.test(formValues.expectedCharge)) {
            errors.expectedCharge = 'Expected Rate must be a valid number with up to 2 decimal places';
        }

        if (!formValues.country) errors.country = 'Country  is required';

        if (!formValues.state) errors.state = 'State/Province is required';

        if (!formValues.city) errors.city = 'City is required';
        if (!formValues.license) errors.license = 'License is required';

        setFormErrors(errors); // Set errors once validation is done

        // Display errors in Toastr
        Object.keys(errors).forEach((key) => {
            const errorMessage = errors[key as keyof FormErrors];
            if (errorMessage) {
                showError(errorMessage);

            }
        });

        return Object.keys(errors).every(
            (key) => errors[key as keyof FormErrors] === undefined || errors[key as keyof FormErrors] === null
        );
    };


    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        console.log(formErrors);
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

        if(teamId)
        {
            formData.append("teamId",teamId); // Assuming user.id is the ID
        }
        try {
            const response = await fetch('/api/enterprise/coach/signup', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                // Check for server-side errors (e.g., 500)
                if (response.status === 500) {
                    showError('Invalid Key or Used Key.');
                    setLoading(false);
                }
                return; // Stop further processing if there's an error
            }

            const data = await response.json();
            showSuccess('Coach added successfully.');
            onSubmit(formData);
            resetForm()
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
            setFormValues({ ...formValues, image: imageUrl });
            setBlob(newBlob);
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
        setFormValues({ ...formValues, phoneNumber: formattedNumber });
    };

    const handleAssignLicense = async () => {

        try {
            setLoadingKey(true);
            const userId = session?.user.id;
            const response = await fetch("/api/fetchlicense", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: userId,
                    type: "Enterprise",
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to fetch license");
            }
            setLoadingKey(false);
            const data = await response.json();

            // Update the license value in formValues
            setFormValues((prev) => ({ ...prev, license: data.licenseKey }));
        } catch (error) {
            console.error("Error fetching license:", error);
            alert("Failed to assign license");
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
            setBlob(newBlob);
        } catch (error) {
            setCertificateUploading(false);
            console.error('Error uploading file:', error);
        }
    };

    useEffect(() => {
        if (session) {
            setFormValues({ ...formValues, enterprise_id: session.user.id });
        }
    }, [session]);
    
    useEffect(() => {
        if (session?.user?.type === 'enterprise') {
          setFormValues((prevFormValues) => ({
            ...prevFormValues,
            clubName: session?.user?.name || '', // Set the clubName to the logged-in user's name
          }));
        }
      }, [session]);
    return (
        <>
            <div className="container mx-auto">
                <div className="flex flex-col justify-center bg-white  w-full">
                    <div className="flex-1 bg-white p-1 md:p-8">
                        <div className="bg-white rounded-lg p-4  mx-auto">

                            {/* <p className="text-red-500">( Fields marked with * are mandatory.)</p> */}
                            {error && <p className="text-red-600">{error}</p>}
                            {successMessage && <p className="text-green-600">{successMessage}</p>}
                            {loading && <p className="text-blue-600">Submitting your information... Please wait.</p>}

                            <form onSubmit={handleSubmit}>
                                {/* Profile Image */}

                                <div className="mb-4">
                <label htmlFor="image" className="block text-gray-700 text-sm text-center font-semibold mb-2">Profile Image</label>
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

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-5">
                                    <div>
                                        <label htmlFor="firstName" className="block text-gray-700 text-sm font-semibold mb-2">First Name<span className='mandatory'>*</span></label>
                                        <input
                                        placeholder='Ex: Sam'
                                            type="text"
                                            name="firstName"
                                            className="border border-gray-300 rounded-lg py-2 px-4 w-full"
                                            value={formValues.firstName}
                                            onChange={handleChange}
                                        />

                                    </div>

                                    <div>
                                        <label htmlFor="lastName" className="block text-gray-700 text-sm font-semibold mb-2">Last Name<span className='mandatory'>*</span></label>
                                        <input
                                        placeholder='Ex: Thomas'
                                            type="text"
                                            name="lastName"
                                            className="border border-gray-300 rounded-lg py-2 px-4 w-full"
                                            value={formValues.lastName}
                                            onChange={handleChange}
                                        />

                                    </div>
                                    <div >
                                        <label htmlFor="expectedCharge" className="block text-gray-700 text-sm font-semibold mb-2">USD $ rates ( per Evaluation )<span className='mandatory'>*</span></label>
                                        <input
                                        placeholder='Ex: 50'
                                            type="text"
                                            name="expectedCharge"
                                            className="border border-gray-300 rounded-lg py-2 px-4 w-full"
                                            value={formValues.expectedCharge}
                                            onChange={handleChange}
                                        />

                                    </div>
                                    <div>
                                        <label htmlFor="phoneNumber" className="block text-gray-700 text-sm font-semibold mb-2">Mobile Number<span className='mandatory'>*</span></label>

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
                                                placeholder="(342) 342-3423"
                                                type="text"
                                                name="number"
                                                className="border border-gray-300 rounded-lg py-2 px-4 w-3/5"
                                                value={formValues.phoneNumber}
                                                onChange={handlePhoneNumberChange}
                                                maxLength={14} // (123) 456-7890 is 14 characters long
                                            />
                                        </div>


                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">Email<span className='mandatory'>*</span></label>
                                        <input
                                        placeholder='abcdz@gmail.com'
                                            type="text"
                                            name="email"
                                            className="border border-gray-300 rounded-lg py-2 px-4 w-full"
                                            value={formValues.email}
                                            onChange={handleChange}
                                        />

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

                                    </div>
                                    <div>
                                        <label htmlFor="city" className="block text-gray-700 text-sm font-semibold mb-2">City<span className='mandatory'>*</span></label>
                                        <input
                                        placeholder='Ex: texas'
                                            type="text"
                                            name="city"
                                            className="border border-gray-300 rounded-lg py-2 px-4 w-full"
                                            value={formValues.city ?? ""}
                                            onChange={handleChange}
                                        />

                                    </div>

                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-5">

                                    {/* Gender */}
                                    <div>
                                        <label htmlFor="gender" className="block text-gray-700 text-sm font-semibold mb-2">Gender<span className='mandatory'>*</span></label>
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

                                    </div>

                                    {/* Location */}

                                    <div>
                                        <label htmlFor="sport" className="block text-gray-700 text-sm font-semibold mb-2">You coach<span className='mandatory'>*</span></label>
                                        <select
                                            name="sport"
                                            className="border border-gray-300 rounded-lg py-2 px-4 w-full"
                                            value={formValues.sport}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select Sport</option>
                                            <option value="Soccer">Soccer</option>

                                        </select>

                                    </div>
                                    <div>
                                        <label htmlFor="clubName" className="block text-gray-700 text-sm font-semibold mb-2">Title/Organization(s)/Affilication(s)<span className='mandatory'>*</span></label>
                                        <input
                                            type="text"
                                            name="clubName"
                                            className="border border-gray-300 rounded-lg py-2 px-4 w-full"
                                            value={session?.user?.type === 'enterprise' ? session?.user?.name || '' : formValues.clubName}
                                            readOnly={session?.user?.type === 'enterprise'}
                                            onChange={(e) => {
                                                if (session?.user?.type !== 'enterprise') {
                                                    handleChange(e);  
                                                }
                                            }}
                                            placeholder={session?.user?.type === 'enterprise' ? '' : 'Enter club name'} // Optional placeholder
                                        />


                                    </div>
                                </div>

                                {/* Qualifications */}
                                <div className="mb-4">
                                    <label htmlFor="qualifications" className="block text-gray-700 text-sm font-semibold mb-2">Backgound<span className='mandatory'>*</span></label>
                                    <textarea
                                        placeholder='Specify your qualification(s)'
                                        name="qualifications"
                                        className="border border-gray-300 rounded-lg py-2 px-4 w-full"
                                        value={formValues.qualifications}
                                        onChange={handleChange}
                                        rows={4}
                                    />

                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-5">
                                    <div>
                                        <label htmlFor="license" className="block text-gray-700 text-sm font-semibold mb-2">License Key<span className='mandatory'>*</span></label>
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
                                            className="text-xs text-gray-500 "
                                            onClick={() => handleAssignLicense()}
                                        >
                                            Assign License
                                        </button>

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
                                        {certificateUploading ? (
                                            <>
                                                <FileUploader />
                                            </>
                                        ) : (
                                            <>

                                            </>
                                        )}
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
export default CoachForm;

