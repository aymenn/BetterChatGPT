import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PopupModal from '@components/PopupModal';
import SpinnerIcon from '@icon/SpinnerIcon';
import { useAuth } from './AuthProvider';

interface AuthModalProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, setIsOpen }) => {
  const { t } = useTranslation();
  const { signIn, signUp, loading } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const { error } = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password);
      
      if (error) {
        setError(error.message);
      } else {
        setIsOpen(false);
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    }
  };

  if (!isOpen) return null;

  return (
    <PopupModal
      title={isSignUp ? 'Sign Up' : 'Sign In'}
      setIsModalOpen={setIsOpen}
      cancelButton={false}
    >
      <div className='p-6 border-b border-gray-200 dark:border-gray-600'>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2'>
              Email
            </label>
            <input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='w-full p-3 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
              required
            />
          </div>
          
          <div>
            <label className='block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2'>
              Password
            </label>
            <input
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='w-full p-3 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
              required
            />
          </div>
          
          {isSignUp && (
            <div>
              <label className='block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2'>
                Confirm Password
              </label>
              <input
                type='password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className='w-full p-3 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
                required
              />
            </div>
          )}
          
          {error && (
            <div className='p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md'>
              {error}
            </div>
          )}
          
          <button
            type='submit'
            disabled={loading}
            className='w-full btn btn-primary flex items-center justify-center gap-2'
          >
            {loading && <SpinnerIcon className='w-4 h-4 animate-spin' />}
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>
        
        <div className='mt-4 text-center'>
          <button
            type='button'
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            className='text-sm text-blue-600 dark:text-blue-400 hover:underline'
          >
            {isSignUp 
              ? 'Already have an account? Sign in' 
              : "Don't have an account? Sign up"
            }
          </button>
        </div>
      </div>
    </PopupModal>
  );
};

export default AuthModal;