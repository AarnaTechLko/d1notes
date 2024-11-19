"use client";
import { useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import Brand from '../../public/images/brand.jpg';
import Image from 'next/image';
import { showError, showSuccess } from '../../components/Toastr';
import { z } from 'zod';
import { FaCheck, FaSpinner } from 'react-icons/fa';
import TermsAndConditions from '@/app/components/TermsAndConditions';

// Zod schema for validation
const formSchema = z.object({
  email: z.string().email('Invalid email format.'),
  password: z.string().min(6, 'Password must be at least 6 characters long.'),
  otp: z.string().min(6, 'OTP must be 6 characters.'),
  loginAs: z.literal('coach'), // In case loginAs should always be 'player'
});

type FormValues = z.infer<typeof formSchema>;

export default function Register() {
  const [formValues, setFormValues] = useState<FormValues>({ email: '', password: '', loginAs: 'coach', otp:'' });
  const [error, setError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [otpLoading, setOtpLoading] = useState<boolean>(false); 
  const { data: session } = useSession();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const sendOtp = async () => {
    if (!formSchema.shape.email.safeParse(formValues.email).success) {
      return; // Don't send OTP if email is invalid
    }

    setOtpLoading(true); // Set OTP loading state to true
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
      setOtpLoading(false); // Reset OTP loading state
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
if (!termsAccepted) {
      return showError('You must accept the terms and conditions.');
    }
    // Validate form data using Zod
    const validationResult = formSchema.safeParse(formValues);

    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors[0].message;
      showError(errorMessage); // Show the first validation error
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/coach/signup', {
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

      window.location.href = '/coach/completeprofile';
    } catch (err) {
      setLoading(false);
      showError(err instanceof Error ? err.message : 'Something went wrong!'); 
  
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormValues({ ...formValues, [name]: value });
    if (name === "email") {
      setOtpSent(false); // Reset OTP sent status if email changes
    }
  };

  useEffect(() => {
    if (session && !session.user.name) {
      window.location.href = '/coach/completeprofile';
    }
  }, [session]);

  return (
    <>
      <div className="flex flex-col md:flex-row">
        {/* Form Section */}
        <div className="flex-1 bg-white p-4 md:p-8">
          <div className="bg-white rounded-lg p-12 max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-0 text-left">Coach Sign Up</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-6">
  If you are a Coach! Please signup to get evaluation requests as per your desired fee.
</p>
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
                  onFocus={() => {
                    if (!otpSent) sendOtp(); // Trigger OTP when focusing on the password field
                  }}
                />
                 {otpLoading && <FaSpinner className="animate-spin ml-2 text-blue-500" />}
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
                  <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={() => setTermsAccepted(!termsAccepted)}
                className="mr-2"
              />
              <label htmlFor="terms" className="text-gray-700 text-sm">
                I accept the{' '}
                <a href="#"  onClick={() => setIsModalOpen(true)} className="text-blue-500 hover:underline">
                  terms & conditions
                </a>
              </label>
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
          <TermsAndConditions  isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}/>
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
