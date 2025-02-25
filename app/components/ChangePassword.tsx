'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { showError, showSuccess } from './Toastr';
const ChangePassword: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { data: session } = useSession();
  const handlePasswordChange = async (e:any) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      showError('New password and confirm password do not match.');
      return;
    }

    if (newPassword.length < 8) {
        showError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    if (!session) {
        window.location.href = '/login';
        return;
      }
      
      const { id: user_id, type: user_type } = session.user;
    try {
      const response = await fetch('/api/changepassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword,user_id, user_type}),
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess("Password has been changed successfully.");
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
      } else {
        showError(data.message || 'Failed to change password.');
      }
    } catch (err) {
        showError('An unexpected error occurred.');
       
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800 mt-10">
      <h2 className="text-2xl font-semibold text-center text-gray-800 dark:text-white mb-6">
        Change Password
      </h2>
<form  onSubmit={handlePasswordChange}>
      <div className="space-y-4">
        <div className="form-group">
          <label
            htmlFor="currentPassword"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Current Password
          </label>
          <input
            type="password"
            id="currentPassword"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            
            className="mt-1 block w-full px-4 py-2 text-gray-800 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-300 dark:bg-gray-700"
          />
        </div>

        <div className="form-group">
          <label
            htmlFor="newPassword"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            New Password
          </label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            
            className="mt-1 block w-full px-4 py-2 text-gray-800 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-300 dark:bg-gray-700"
          />
        </div>

        <div className="form-group">
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            
            className="mt-1 block w-full px-4 py-2 text-gray-800 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-300 dark:bg-gray-700"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && (
          <p className="text-sm text-green-500">
            Password changed successfully!
          </p>
        )}
      </div>

      <button
       type="submit"
        disabled={loading}
        className={`mt-6 w-full py-2 px-4 text-white font-semibold rounded-lg focus:outline-none ${
          loading
            ? 'bg-blue-300 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600 focus:ring-2 focus:ring-blue-300'
        }`}
      >
        {loading ? 'Changing...' : 'Change Password'}
      </button>
      </form>
    </div>
  );
};

export default ChangePassword;
