"use client"
import { useState, useEffect } from 'react';
import Loading from '../components/Loading';
import { showError, showSuccess } from '../components/Toastr';

const ResetPasswordPage = () => {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<{
    password: string;
    confirm_password: string;
    token: string | null;
  }>({
    password: '',
    confirm_password: '',
    token: null, // token will be fetched from the URL
  });

  const [errors, setErrors] = useState({
    password: '',
    confirm_password: '',
    token: ''
  });

  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    if (tokenFromUrl) {
      setFormData((prevData) => ({
        ...prevData,
        token: tokenFromUrl,
      }));
      validateToken(tokenFromUrl);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = { password: '', confirm_password: '', token: '' };
    let isValid = true;

    if (!formData.password) {
      newErrors.password = 'Password is required.';
      isValid = false;
    }

    if (!formData.token) {
      newErrors.token = 'Password is required.';
      isValid = false;
    }

    if (!formData.confirm_password) {
      newErrors.confirm_password = 'Please confirm your password.';
      isValid = false;
    } else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (validateForm()) {
      try {
        const response = await fetch('/api/updatepassword', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          showSuccess('Your message has been sent successfully!');
          setFormData({ password: '', confirm_password: '', token: '' });
          setLoading(false);
          window.location.href = '/login';
        } else {
          showError('There was an error sending your message. Please try again.');
          setLoading(false);
        }
      } catch (error) {
        showError('There was an error sending your message. Please try again.');
        setLoading(false);
      }
    }
  };

  const validateToken = async (token: string) => {
    try {
      const response = await fetch(`/api/validate-token?token=${token}`);
      const data = await response.json();
      if (data.isValid) {
        setIsValid(true);
      } else {
        setIsValid(false);
      }
    } catch (error) {
      console.error('Error validating token:', error);
      setIsValid(false);
    }
  };

  return (
    <div>
      {isValid === null ? (
        <Loading/>
      ) : isValid ? (
        <div className="container mx-auto px-4 md:px-8 lg:px-12 py-12">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-8 mb-12">
            <div className="flex justify-center items-center">
              <div className="w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-4 text-center">Update Password</h2>
                {submissionStatus && <p className="text-center mb-4">{submissionStatus}</p>}
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      New Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                      placeholder="*******"
                    />
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                  </div>

                  <div>
                    <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirm_password"
                      value={formData.confirm_password}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                      placeholder="*******"
                    />
                    {errors.confirm_password && <p className="text-red-500 text-xs mt-1">{errors.confirm_password}</p>}
                  </div>

                  <button
                    type="submit"
                    className="mr-auto bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700"
                  >
                    {loading ? 'Updating Password...' : 'Update Password'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 md:px-8 lg:px-12 py-12">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
            <h3 className="font-semibold text-lg">Invalid Token</h3>
            <p className="mt-2">The token you provided is invalid or has expired. Please try again with a valid token.</p>
            <a href="/forgot-password" className="mt-4 text-blue-600 hover:text-blue-800 font-semibold">
              Request a new token
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResetPasswordPage;
