import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthModal } from '@components/Auth';
import PersonIcon from '@icon/PersonIcon';
import LogoutIcon from '@icon/LogoutIcon';
import { useAuth } from '@components/Auth/AuthProvider';

const AuthButton = () => {
  const { t } = useTranslation();
  const { userRef, signOut, isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  if (isAuthenticated && userRef.current) {
    return (
      <button
        className='flex py-2 px-2 items-center gap-3 rounded-md hover:bg-gray-500/10 transition-colors duration-200 text-white cursor-pointer text-sm'
        onClick={handleSignOut}
      >
        <LogoutIcon />
        Sign Out ({userRef.current.email})
      </button>
    );
  }

  return (
    <>
      <button
        className='flex py-2 px-2 items-center gap-3 rounded-md hover:bg-gray-500/10 transition-colors duration-200 text-white cursor-pointer text-sm'
        onClick={() => setShowAuthModal(true)}
      >
        <PersonIcon />
        Sign In
      </button>
      <AuthModal isOpen={showAuthModal} setIsOpen={setShowAuthModal} />
    </>
  );
};

export default AuthButton;