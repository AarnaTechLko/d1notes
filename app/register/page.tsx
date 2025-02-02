"use client";
import { Suspense, useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import Brand from '../public/images/brand.jpg';
import Image from 'next/image';
import crypto from 'crypto';
import { showError, showSuccess } from '../components/Toastr';
import { z } from 'zod';
import { FaCheck, FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';
import TermsAndConditions from '../components/TermsAndConditions';
import { useSearchParams } from 'next/navigation';
import Email from 'next-auth/providers/email';

// Zod schema for validation - Removed .optional() to make 'otp' a required string
const formSchema = z
  .object({
    email: z.string().email('Invalid email format.'),
    password: z
      .string()
      .refine(
        (value) =>
          /^(?=.*\d)(?=.*[!@#$%^&*()_\-+=|:;<>,.?]).{6,}$/.test(value),
        {
          message:
            "Password must contain at least 6 characters, including at least 1 number and 1 special character.",
        }
      ),
    confirm_password: z.string(),
    loginAs: z.literal('player'),
    referenceId: z.string().optional(),
    teamId: z.string().optional(),
    sendedBy: z.string().optional(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Confirm Password must match Password.",
    path: ['confirm_password'], // Point the error at the confirm_password field
  });


type FormValues = z.infer<typeof formSchema>;

export default function Register() {
  const [formValues, setFormValues] = useState<FormValues>({
    email: '',
    password: '',
    confirm_password: '',
    //otp: '', // Ensure otp is always a string
    loginAs: 'player',
    referenceId: '',
    sendedBy: '',
    teamId: '',
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [otpLoading, setOtpLoading] = useState<boolean>(false); // Loader state for OTP
  const [referenceId, setReferenceId] = useState<string | null | undefined>();
  const [referenceEmail, setReferenceEmail] = useState<string | null | undefined>();
  const [email, setEmail] = useState<string | null | undefined>();
  const [team, setTeam] = useState<string | null | undefined>();
  const [sendedBy, setSendedBy] = useState<string | null | undefined>();
  const [teamId, setTeamId] = useState<string | null | undefined>();
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Set isClient to true once the component has mounted on the client
    setIsClient(true);
  }, []);
  

  useEffect(() => {
    if (!isClient) return;
    const urlParams = new URLSearchParams(window.location.search);
    const encryptedUid = urlParams.get('uid');
    const sendBy = urlParams.get('by'); 
    if (typeof encryptedUid === 'string') {
      try {
        const secretKey = process.env.SECRET_KEY || '0123456789abcdef0123456789abcdef';
        const decryptedData = decryptData(encryptedUid, secretKey);
        console.log('Decrypted data:', decryptedData);
        setReferenceId(decryptedData.userId);
        setTeamId(decryptedData.teamId);
        setReferenceEmail(decryptedData.singleEmail);
        setTeam(decryptedData.teamId);
       
        setFormValues((prevValues) => ({
          ...prevValues,
          email: decryptedData.singleEmail || '',
          team: decryptedData.teamId || '',
        }));
        
        
      } catch (error) {
        console.error('Decryption failed:', error);
      }
    }

    if (sendBy) {

      setSendedBy(sendBy || undefined);
    }
  }, [isClient]);

  useEffect(() => {
    if (session && !session.user.name) {
      window.location.href = '/completeprofile';
    }
  }, [session]);

  const sendOtp = async () => {
   

    setOtpLoading(true); // Set OTP loading state to true
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
      setOtpLoading(false); // Reset OTP loading state
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
      const payload = { ...formValues };
      if (referenceId) {
        payload.referenceId = referenceId;
        payload.email = referenceEmail || '';
        payload.sendedBy = sendedBy || '';
        payload.teamId = teamId || '';
      } else {
        delete payload.referenceId;  
        delete payload.sendedBy; 
         
      }
  
   const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Something went wrong!');
      }
      else {
        const res = await signIn('credentials', {
          redirect: false,
          email: formValues.email,
          password: formValues.password,
          loginAs: formValues.loginAs,
        });

        //window.location.href = '/completeprofile';
      }

    } catch (err) {
      setLoading(false);
      showError(err instanceof Error ? err.message : 'Something went wrong!');
    }
  };

  const decryptData = (encryptedString: string, secretKey: string) => {
    const [ivHex, encrypted] = encryptedString.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(secretKey), iv);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormValues({ ...formValues, [name]: value });
 
    if (name === "email") {
      setOtpSent(false); // Reset OTP sent status if email changes
    }
  };

  return (
    <> <head>
    <title>Player Signup - D1 NOTES</title>
    <meta name="description" content="This is the home page of my Next.js application." />
  </head>

    <div className="flex flex-col md:flex-row">
      {/* Form Section */}
      <div className="flex-1 bg-white p-4 md:p-8">
        <div className="bg-white rounded-lg p-12 max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-left">Player Sign Up</h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">
                Email<span className='mandatory'>*</span>
              </label>
              <input
                type="text"
                className="border border-gray-300 rounded-lg py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="email"
                
                onChange={handleChange}
                value={email || formValues.email}
                readOnly={!!referenceEmail}
                autoComplete="off"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">
                Create Password<span className='mandatory'>*</span>
                <p className="text-gray-400 text-xs">(Password must contain at least 6 characters, including at least 1 number and 1 special character.)</p>
              </label>
              <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
               
                value={formValues.password}
                className="border border-gray-300 rounded-lg py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={handleChange}
              // onFocus={() => {
              //   if (!otpSent) sendOtp(); // Trigger OTP when focusing on the password field
              // }}
              />
              <span
          className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-gray-500"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </span>
              {otpLoading && <FaSpinner className="animate-spin ml-2 text-blue-500 mt-2" />}
            </div></div>

            <div className="mb-4">
              <label htmlFor="confirm_password" className="block text-gray-700 text-sm font-semibold mb-2">
                Confirm Password<span className='mandatory'>*</span>
               
              </label>
              <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="confirm_password"
                
                value={formValues.confirm_password}
                className="border border-gray-300 rounded-lg py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={handleChange}
              // onFocus={() => {
              //   if (!otpSent) sendOtp(); // Trigger OTP when focusing on the password field
              // }}
              />
              <span
          className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-gray-500"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </span>
              {otpLoading && <FaSpinner className="animate-spin ml-2 text-blue-500 mt-2" />}
            </div></div>

            {otpSent && (
              <div className="mb-4">
                <label htmlFor="otp" className="block text-gray-700 text-sm font-semibold mb-0">
                  Enter Verification code, sent to your email.

                </label>
                <span className="text-xs text-gray-500">(Check Spam also if not found in inbox.)</span>
                <div className="flex space-x-2">
                  {[...Array(6)].map((_, index) => (
                    <input
                      key={index}
                      type="number"
                      name={`otp-${index}`}
                      // value={formValues.otp[index] || ''} // Ensure OTP value is a string
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
                <a href="#" className="text-blue-500 hover:underline" onClick={() => setIsModalOpen(true)}>
                  terms and conditions.
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
        <TermsAndConditions isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

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
