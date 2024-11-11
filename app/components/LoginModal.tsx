"use client"; // Ensure this is a client component
import { useState } from 'react';
import { signIn, useSession  } from 'next-auth/react';
import { showSuccess, showError } from '../components/Toastr';
import jwt from 'jsonwebtoken';
interface LoginModalProps {
  isOpen: boolean;
  coachslug: string;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose,coachslug }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const { data: session } = useSession();
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const loginAs="player";
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
     
    // Simulating an API call
    try {
      const response = await signIn('credentials', {
        redirect: false,
        email: email,
        password:password,
        loginAs:loginAs,
      });

      if (!response || !response.ok) {
        showError('Email or Password Incorrect.');
      }

    
      
      setIsAuthenticated(true);
       window.location.href = '/coach/'+coachslug;
      onClose(); // Close the modal after successful login
    } catch (err: any) {
        setIsAuthenticated(false);
      setError(err.message || 'An error occurred.');
    } finally {
        setIsAuthenticated(false);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          ✖
        </button>
 
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4"> 
            <label htmlFor="email" className="block text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-200"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
