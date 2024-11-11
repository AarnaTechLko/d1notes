"use client";
import { useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import Brand from '../public/images/brand.jpg';
import Image from 'next/image';
import { showSuccess, showError } from '../components/Toastr';

interface FormValues {
  email: string;
  password: string;
  loginAs: 'coach' | 'player';
}

export default function Login() {
  const [formValues, setFormValues] = useState<FormValues>({ email: '', password: '', loginAs: 'coach' });
  const [loading, setLoading] = useState<boolean>(false);
  const { data: session } = useSession();

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    const { email, password } = formValues;

    // Validate email and password
    if (!validateEmail(email)) {
      showError('Invalid email format.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      showError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      const response = await signIn('credentials', {
        redirect: false,
        email,
        password,
        loginAs: formValues.loginAs,
      });

      if (!response || !response.ok) {
        showError('Email or Password Incorrect.');
      } else {
        
        showSuccess('Logged In Successfully.');
      }

    } catch (err) {
      showError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormValues({ ...formValues, [name]: value });
  };

  useEffect(() => {
    if (session) {
      
      // Redirect based on session type
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
      <div className="flex flex-col md:flex-row">
        <div className="flex-1 bg-white p-4 md:p-8">
          <div className="bg-white rounded-lg p-12 max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-left">Sign In</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <span className="block text-gray-700 text-sm font-semibold mb-2">Login as:</span>
                <label className="inline-flex items-center mr-4">
                  <input
                    type="radio"
                    name="loginAs"
                    value="coach"
                    checked={formValues.loginAs === 'coach'}
                    onChange={handleChange}
                    disabled={loading}
                    className="form-radio"
                  />
                  <span className="ml-2">Coach</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="loginAs"
                    value="player"
                    checked={formValues.loginAs === 'player'}
                    onChange={handleChange}
                    disabled={loading}
                    className="form-radio"
                  />
                  <span className="ml-2">Player</span>
                </label>
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="border border-gray-300 rounded-lg py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="email"
                  value={formValues.email}
                  onChange={handleChange}
                  
                  disabled={loading}
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
                  
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-500 text-white font-semibold py-2 rounded-lg hover:bg-blue-600 transition duration-200"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            {loading && (
              <div className="flex justify-center mt-4">
                <div className="loader"></div>
              </div>
            )}

            <p className="text-center text-gray-600 text-sm mt-4">
              Do not have an account?{' '}
              <a href="/register" className="text-blue-500 hover:underline">
                Register
              </a>
            </p>
            <p className="text-center text-gray-600 text-sm mt-4">
             Forgot password?{' '}
              <a href="/register" className="text-blue-500 hover:underline">
                Click to Reset
              </a>
            </p>
          </div>
        </div>

        <div className="flex-1 bg-white">
          <Image src={Brand} alt="brand" layout="responsive" width={500} height={500} className="object-cover" />
        </div>
      </div>

      
    </>
  );
}
