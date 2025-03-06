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
interface CoachFormProps {
    onSubmit: (formData: any) => void;
}
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

const CoachForm: React.FC<CoachFormProps> = ({ onSubmit }) => {
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
        countrycode: '',
        enterprise_id: '',
        image: null,
        certificate: null,
        license: ''
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
        enterprise_id: null,
        countrycode: null,
        license: null,
        image: null,

    });
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [photoUpoading, setPhotoUploading] = useState<boolean>(false);
    const [certificateUploading, setCertificateUploading] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [blob, setBlob] = useState<PutBlobResult | null>(null);
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
            countrycode: null,
            enterprise_id: null,
            license: null,

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
        if (!formValues.clubName) errors.clubName = 'Club Name is required';
        if (!formValues.qualifications) errors.qualifications = 'Qualifications are required';
        if (!formValues.expectedCharge) {
            errors.expectedCharge = 'Expected Rate is required';
        } else if (!/^\d+(\.\d{1,2})?$/.test(formValues.expectedCharge)) {
            errors.expectedCharge = 'Expected Rate must be a valid number with up to 2 decimal places';
        }

        if (!formValues.country) errors.country = 'Country  is required';

        if (!formValues.state) errors.state = 'State is required';

        if (!formValues.city) errors.city = 'City is required';
        if (!formValues.license) errors.license = 'License is required';

        setFormErrors(errors); // Set errors once validation is done
        return Object.keys(errors).every(key => errors[key as keyof FormErrors] === undefined || errors[key as keyof FormErrors] === null);
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
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong!');
        } finally {
            setLoading(false);
        }
    };

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


    const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = event.target;
        setFormValues({ ...formValues, [name]: value });

        // Clear the corresponding error when the user types
        if (formErrors[name as keyof FormErrors]) {
            setFormErrors({ ...formErrors, [name]: undefined });
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


    const handleCertificateChange = async() => {
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

    return (
        <>
            <div className="container mx-auto">
                <div className="flex flex-col justify-center bg-white  w-full">
                    <div className="flex-1 bg-white p-1 md:p-8">
                        <div className="bg-white rounded-lg p-4  mx-auto">

                            <p className="text-red-500">( All fields are mandatory including coach&lsquo;s photo upload.)</p>
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
                                      {photoUpoading ? (
                                            <>
                                                <FileUploader/>
                                            </>
                                        ) : (
                                            <>
                                                
                                            </>
                                        )}
                                       
                                        {formErrors.image && <p className="text-red-600 text-sm text-center">{formErrors.image}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-5">
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
                                        <label htmlFor="expectedCharge" className="block text-gray-700 text-sm font-semibold mb-2">$ rates ( per evaluation )</label>
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
                                        <label htmlFor="phoneNumber" className="block text-gray-700 text-sm font-semibold mb-2">Mobile Number</label>

                                        <div className="flex">
                                            <select
                                                name="countrycode"
                                                className="border border-gray-300 rounded-lg py-2 px-4 w-2/5 mr-1" // Added mr-4 for margin-right
                                                value={formValues.countrycode}
                                                onChange={handleChange}
                                            >
                                                <option value="">Select</option>
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
                                                className="border border-gray-300 rounded-lg py-2 px-4 w-3/5"
                                                value={formValues.phoneNumber}
                                                onChange={handlePhoneNumberChange}
                                                maxLength={14} // (123) 456-7890 is 14 characters long
                                            />
                                        </div>


                                        {formErrors.phoneNumber && <p className="text-red-600 text-sm">{formErrors.phoneNumber}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">Email</label>
                                        <input
                                            type="text"
                                            name="email"
                                            className="border border-gray-300 rounded-lg py-2 px-4 w-full"
                                            value={formValues.email}
                                            onChange={handleChange}
                                        />
                                        {formErrors.email && <p className="text-red-600 text-sm">{formErrors.email}</p>}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-5">
                                    <div>
                                        <label htmlFor="country" className="block text-gray-700 text-sm font-semibold mb-2">Country</label>
                                        <select
                                            name="country"
                                            className="border border-gray-300 rounded-lg py-2 px-4 w-full"
                                            value={formValues.country ?? ""}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select</option>
                                            <option value="USA">USA</option>

                                        </select>

                                        {formErrors.country && <p className="text-red-500 text-sm">{formErrors.country}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="state" className="block text-gray-700 text-sm font-semibold mb-2">State</label>


                                        <select
                                            name="state"
                                            id="state"
                                            value={formValues.state ?? ""}
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
                                            value={formValues.city ?? ""}
                                            onChange={handleChange}
                                        />
                                        {formErrors.city && <p className="text-red-500 text-sm">{formErrors.city}</p>}
                                    </div>

                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-5">

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
                                        <label htmlFor="sport" className="block text-gray-700 text-sm font-semibold mb-2">You coach</label>
                                        <select
                                            name="sport"
                                            className="border border-gray-300 rounded-lg py-2 px-4 w-full"
                                            value={formValues.sport}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select Sport</option>
                                            <option value="Soccer">Soccer</option>

                                        </select>
                                        {formErrors.sport && <p className="text-red-600 text-sm">{formErrors.sport}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="clubName" className="block text-gray-700 text-sm font-semibold mb-2">Title/Organization(s)/Affilication(s)</label>
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
                                    <label htmlFor="qualifications" className="block text-gray-700 text-sm font-semibold mb-2">Backgound</label>
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
          <label htmlFor="license" className="block text-gray-700 text-sm font-semibold mb-2">License Key</label>
          <input
            type="text"
            name="license"
            className="border border-gray-300 rounded-lg py-2 px-4 w-full"
            value={formValues.license}
            onChange={handleChange}
          />
          <p className="text-xs text-gray-500">( You can copy License key from <a href="/coach/licenses" target="_blank">Here</a> )</p>
          {formErrors.license && <p className="text-red-500 text-sm">{formErrors.license}</p>}
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
                                                <FileUploader/>
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

