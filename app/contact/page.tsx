"use client";
import { useState } from 'react';
import Head from 'next/head';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    message: ''
  });
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    mobile: '',
    message: ''
  });
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null); // Track submission status

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = { name: '', email: '', mobile: '', message: '' };
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
    if (!formData.mobile) {
      newErrors.mobile = 'Mobile number is required.';
      isValid = false;
    } else if (!/^\d+$/.test(formData.mobile)) {
      newErrors.mobile = 'Mobile number should only contain digits.';
      isValid = false;
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
      try {
        const response = await fetch('/api/contact', { // Adjust this endpoint URL as needed
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          setSubmissionStatus("Your message has been sent successfully!");
          setFormData({ name: '', email: '', mobile: '', message: '' }); // Clear form on success
        } else {
          setSubmissionStatus("There was an error sending your message. Please try again.");
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        setSubmissionStatus("An unexpected error occurred. Please try again later.");
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
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    placeholder="Your Name"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    placeholder="Your Email"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    id="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    placeholder="Your Mobile Number"
                  />
                  {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    Message
                  </label>
                  <textarea
                    id="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    placeholder="Your Message"
                  />
                  {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  Send Message
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
