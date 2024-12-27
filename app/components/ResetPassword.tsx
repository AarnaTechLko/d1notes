'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { showError, showSuccess } from './Toastr';

interface ResetPasswordProps {
  isOpen: boolean;
  type: string;
  userId: number;
  onClose: () => void;
  onSuccess?: () => void;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ isOpen, onClose, onSuccess, type ,userId}) => {
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const { data: session } = useSession();

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

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

     

    try {
      const response = await fetch('/api/resetpassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, userId, type }),
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess('Password has been changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        onSuccess?.();
        onClose();
      } else {
        showError(data.message || 'Failed to change password.');
      }
    } catch (err) {
      showError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg dark:bg-gray-800 p-6">
        <h2 className="text-2xl font-semibold text-center text-gray-800 dark:text-white mb-6">
          Change Password
        </h2>
        <form onSubmit={handlePasswordChange}>
          <div className="space-y-4">
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
                placeholder="Enter new password"
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
                placeholder="Re-enter new password"
                className="mt-1 block w-full px-4 py-2 text-gray-800 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-300 dark:bg-gray-700"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 focus:ring-2 focus:ring-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`py-2 px-4 text-white font-semibold rounded-lg focus:outline-none ${
                loading
                  ? 'bg-blue-300 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 focus:ring-2 focus:ring-blue-300'
              }`}
            >
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
