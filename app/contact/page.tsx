"use client";
import { useState } from 'react';
import Head from 'next/head';
import { showError, showSuccess } from '../components/Toastr';
import { countryCodesList } from '@/lib/constants';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    message: '',
    countrycode: '+1'
  });
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    mobile: '',
    countrycode: '',
    message: ''
  });
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null); // Track submission status
  const [isLoading, setIsLoading] = useState(false); // Loading state

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
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
    setFormData({ ...formData, mobile: formattedNumber });
  };
  const validateForm = () => {
    const newErrors = { name: '', email: '', mobile: '', message: '' , countrycode:''};
    let isValid = true;

    // Validate name
    if (!formData.name) {
      newErrors.name = 'Name is required.';
      isValid = false;
    }

    // Validate email
    if (!formData.email) {
      newErrors.email = 'Email is required.';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid.';
      isValid = false;
    }

    // Validate mobile
    if (!formData.countrycode) {
      newErrors.countrycode = 'Country Code is required.';
      isValid = false;
    } 
    
    if (!formData.mobile)
      {
        newErrors.mobile = 'Mobile Number is required';
      }
    if (formData.mobile.length < 14)
      {
        newErrors.mobile = 'Mobile Number must be 10 digits minimum';
      } 

    if (formData.mobile.length > 14)
      {
        newErrors.mobile = 'Mobile Number must be 10 digits minimum';
      } 
 

    // Validate message
    if (!formData.message) {
      newErrors.message = 'Message is required.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      setIsLoading(true); // Set loading to true
      try {
        const response = await fetch('/api/contact', { // Adjust this endpoint URL as needed
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          showSuccess("Your message has been sent successfully!");
          setFormData({ name: '', email: '', mobile: '', message: '', countrycode:'' }); // Clear form on success
        } else {
          showError("There was an error sending your message. Please try again.");
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        setSubmissionStatus("An unexpected error occurred. Please try again later.");
      } finally {
        setIsLoading(false); // Set loading to false
      }
    }
  };

  return (
    <>
      <Head>
        <title>Contact Us</title>
      </Head>

      <div className="container mx-auto px-4 md:px-8 lg:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-1 gap-8 mb-12">
          <div className="flex justify-center items-center">
            <div className="w-full max-w-lg">
              <h2 className="text-2xl font-bold mb-4 text-center">Get in Touch</h2>
              {submissionStatus && <p className="text-center mb-4">{submissionStatus}</p>}
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name<span className='mandatory'>*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email<span className='mandatory'>*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                    <label htmlFor="phoneNumber" className="block text-gray-700 text-sm font-semibold mb-2">Mobile Number<span className='mandatory'>*</span></label>

                    <div className="flex">
                      <select
                        name="countrycode"
                        id="countrycode"
                        className="border border-gray-300 rounded-lg py-2 px-4 w-[115px] p-0 mr-1" // Added mr-4 for margin-right
                        value={formData.countrycode}
                        onChange={handleInputChange}
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
                        className="border border-gray-300 rounded-lg py-2 px-4 w-4/5"
                        value={formData.mobile}
                        onChange={handlePhoneNumberChange}
                        maxLength={14} // (123) 456-7890 is 14 characters long
                      />
                    </div>


                    {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
                  </div>
                

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    Message<span className='mandatory'>*</span>
                  </label>
                  <textarea
                    id="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    
                  />
                  {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700"
                  disabled={isLoading} // Disable button while loading
                >
                  {isLoading ? "Sending..." : "Send Message"} {/* Change text based on loading */}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;
