"use client";
import { useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import Brand from '../public/images/brand.jpg';
import Image from 'next/image';
import { showError, showSuccess } from '../components/Toastr';
import { z } from 'zod';
import { FaCheck, FaSpinner } from 'react-icons/fa';

// Zod schema for validation
const formSchema = z.object({
  email: z.string().email('Invalid email format.'),
  password: z.string().min(6, 'Password must be at least 6 characters long.'),
  loginAs: z.literal('player'), // In case loginAs should always be 'player'
});

type FormValues = z.infer<typeof formSchema>;

export default function Register() {
  const [formValues, setFormValues] = useState<FormValues>({ email: '', password: '', loginAs: 'player' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { data: session } = useSession();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    // Validate form data using Zod
    const validationResult = formSchema.safeParse(formValues);

    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors[0].message;
      showError(errorMessage); // Show the first validation error
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formValues),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Something went wrong!');
        setError(errorData.message || 'Something went wrong!');
      }

      const res = await signIn('credentials', {
        redirect: false,
        email: formValues.email,
        password: formValues.password,
        loginAs: formValues.loginAs,
      });

      window.location.href = '/completeprofile';
    } catch (err) {
      setLoading(false);
      showError(err instanceof Error ? err.message : 'Something went wrong!'); 
  
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormValues({ ...formValues, [name]: value });
  };

  useEffect(() => {
    if (session && !session.user.name) {
      window.location.href = '/completeprofile';
    }
  }, [session]);

  return (
    <>
      <div className="flex flex-col md:flex-row">
        {/* Form Section */}
        <div className="flex-1 bg-white p-4 md:p-8">
          <div className="bg-white rounded-lg p-12 max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-left">Sign Up</h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">
                  Email
                </label>
                <input
                  type="text"
                  className="border border-gray-300 rounded-lg py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="email"
                  value={formValues.email}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-4">
                <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formValues.password}
                  className="border border-gray-300 rounded-lg py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={handleChange}
                />
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
        <FaCheck className="mr-2" /> Sign Up
      </>
    )}
  </button>
  </div>
             
            </form>
            <p className="text-center text-gray-600 text-sm mt-4">
              Already have an account?{' '}
              <a href="/login" className="text-blue-500 hover:underline">
                Login
              </a>
            </p>
          </div>
        </div>

        {/* Brand Section */}
        <div className="flex-1 bg-white">
          <Image
            src={Brand}
            alt="brand"
            layout="responsive"
            width={500}
            height={500}
            className="object-cover"
          />
        </div>
      </div>
    </>
  );
}
