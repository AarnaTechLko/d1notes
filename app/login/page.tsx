"use client";
import { useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import Brand from '../public/images/brand.jpg';
import Image from 'next/image';
import { showSuccess, showError } from '../components/Toastr';
import ForgotPassword from '../components/ForgotPassword';
import crypto from 'crypto';
interface FormValues {
  email: string;
  password: string;
  loginAs: string;
  teamId?: string;
}

export default function Login() {
  const [formValues, setFormValues] = useState<FormValues>({ email: '', password: '', loginAs: '', teamId: '' });
  const [loading, setLoading] = useState<boolean>(false);
  const { data: session, status } = useSession();
  const [referenceId, setReferenceId] = useState<string | null | undefined>();
  const [referenceEmail, setReferenceEmail] = useState<string | null | undefined>();
  const [registrationType, setRegistrationType] = useState<string | null | undefined>();
  const [isClient, setIsClient] = useState(false);
  const [team, setTeam] = useState<string | null | undefined>();
  const [sendedBy, setSendedBy] = useState<string | null | undefined>();
  const [teamId, setTeamId] = useState<string | null | undefined>();
  const decryptData = (encryptedString: string, secretKey: string) => {
    const [ivHex, encrypted] = encryptedString.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(secretKey), iv);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  };
  useEffect(() => {

    const urlParams = new URLSearchParams(window.location.search);
    const encryptedUid = urlParams.get('uid');
    const sendBy = urlParams.get('by');
    if (typeof encryptedUid === 'string') {
      try {
        const secretKey = process.env.SECRET_KEY || '0123456789abcdef0123456789abcdef';
        const decryptedData = decryptData(encryptedUid, secretKey);
        console.log('Decrypted data:', decryptedData);
        setReferenceId(decryptedData.userId);
        setRegistrationType(decryptedData.registrationType);
        setTeamId(decryptedData.teamId);
        setReferenceEmail(decryptedData.referenceEmail);

        setTeam(decryptedData.teamId);

        setFormValues((prevValues) => ({
          ...prevValues,
          email: decryptedData.singleEmail || '',
          teamId: decryptedData.teamId || '',
          loginAs: decryptedData.registrationType || 'coach', // Auto-set loginAs
        }));


      } catch (error) {
        console.error('Decryption failed:', error);
      }
    }

    if (sendBy) {

      setSendedBy(sendBy || undefined);
    }
  }, [isClient]);
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
  

    const { email, password,loginAs } = formValues;
    if (!loginAs) {
      showError("Please select a login type.");
      return;
    }
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
    setLoading(true);
    try {
      const response = await signIn('credentials', {
        redirect: false,
        email,
        password,
        loginAs: formValues.loginAs,
        teamId: formValues?.teamId
      });

      if (!response || !response.ok) {
        showError('Email or Password Incorrect.');
      } else {
        if (teamId) {
          const apiResponse = await fetch('/api/player/assignteam', {
            method: 'POST',
            body: JSON.stringify({ teamId:teamId, playerId:session?.user.id, enterpriseId:session?.user.club_id, type:session?.user.type, email:formValues.email }),
            headers: { 'Content-Type': 'application/json' }
          });

          if (!apiResponse.ok) {
            showError('Error occurred while processing team data.');
            return;  
          }

          const apiData = await apiResponse.json();
          
          console.log(apiData);
        }
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

    if (status === "authenticated" && session) {

      // Redirect based on session type
      if (session.user.type === 'coach' && !teamId) {
        window.location.href = '/coach/dashboard';
      }
      else if (session.user.type === 'coach' && teamId) {
        window.location.href = '/coach/joinrequests';
      }

      if (session.user.type === 'player' && !teamId) {
        window.location.href = '/dashboard';
      }
      else if (session.user.type === 'player' && teamId) {
        window.location.href = '/joinrequests';
      }


      else if (session.user.type === 'player') {
        window.location.href = '/dashboard';
      }
      else if (session.user.type === 'enterprise') {

        window.location.href = '/enterprise/dashboard';
      }
      else if (session.user.type === 'team') {

        window.location.href = '/teampanel/dashboard'; 
      }
      else if (!session.user.name && session.user.type == 'player') {
        window.location.href = '/completeprofile';
      }
      else if (!session.user.name && session.user.type == 'coach') {
        window.location.href = '/coach/completeprofile';
      }
    }
  }, [session]);

  return (
    <>

      <div className="flex flex-col md:flex-row">
        <div className="flex-1 bg-white p-4 md:p-8">

          <div className="bg-white rounded-lg p-12 max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-left">Log In {!registrationType ? "" : "as " + (registrationType.charAt(0).toUpperCase() + registrationType.slice(1).toLowerCase())}</h2>
            <form onSubmit={handleSubmit}>
              {!registrationType && (
                <div className="mb-4">
                  <span className="block text-gray-700 text-sm font-semibold mb-2">Login as<span className="mandatory">*</span></span>
                  <label className="inline-flex items-center mr-2">
                    <input
                      type="radio"
                      name="loginAs"
                      value="coach"
                     
                      onChange={handleChange}
                      disabled={loading}
                      className="form-radio"
                    />
                    <span className="ml-2">Coach</span>
                  </label>
                  <label className="inline-flex items-center mr-2">
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
                  <label className="inline-flex items-center mr-2">
                    <input
                      type="radio"
                      name="loginAs"
                      value="enterprise"
                      checked={formValues.loginAs === 'enterprise'}
                      onChange={handleChange}
                      disabled={loading}
                      className="form-radio"
                    />
                    <span className="ml-2">Organization </span>
                  </label>

                  <label className="inline-flex items-center ">
                    <input
                      type="radio"
                      name="loginAs"
                      value="team"
                      checked={formValues.loginAs === 'team'}
                      onChange={handleChange}
                      disabled={loading}
                      className="form-radio"
                    />
                    <span className="ml-2">Team</span>
                  </label>
                </div>
              )}
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">
                  Email<span className='mandatory'>*</span>
                </label>
                <input
                  type="email"
                  className="border border-gray-300 rounded-lg py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="email"
                  value={formValues.email}
                  onChange={handleChange}
                  readOnly={!registrationType ? false : true}
                  disabled={loading}
                />
              </div>

              <div className="mb-4">
                <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">
                  Password<span className='mandatory'>*</span>
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
                {loading ? 'Loging in...' : 'Log In'}
              </button>
            </form>

            {loading && (
              <div className="flex justify-center mt-4">
                <div className="loader"></div>
              </div>
            )}

            <p className="text-center text-gray-600 text-sm mt-4">
              Do not have an account?{' '}
              <a
                href={
                  formValues.loginAs === 'coach' ? '/coach/signup' :
                    formValues.loginAs === 'enterprise' ? '/enterprise/signup' :
                      '/register'
                }
                className="text-blue-500"
              >
                Register
              </a>
            </p>
            <p className="text-center text-gray-600 text-sm mt-4">
              Forgot password?<ForgotPassword type={formValues.loginAs} />
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
