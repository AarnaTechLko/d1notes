"use client"
import { useState, ChangeEvent, FormEvent } from 'react';
import Logo from './public/images/logo.png'

interface FormData {
  name: string;
  email: string;
  message: string;
}

export default function UnderDevelopment() {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState<boolean>(false);
  const [responseMessage, setResponseMessage] = useState<string>('');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (response.ok) {
        setResponseMessage('Message sent successfully!');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setResponseMessage(result.error || 'Something went wrong.');
      }
    } catch (error) {
      setResponseMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <img src='/logo.png' className='mx-auto mb-20'/>
        <h1 className="text-5xl font-bold text-gray-800">We Under Development</h1>
        <p className="mt-4 mb-6 text-lg text-gray-600">
          This page is currently under construction. Contact us for more information.
        </p>
        <a 
          href='/contact'
          className="mt-6 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg  hover:bg-blue-700 transition"
        >
          Contact Us
        </a>
      </div>

      
    </div>
  );
}
