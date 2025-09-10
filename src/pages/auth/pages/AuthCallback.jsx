import React, { useEffect } from 'react'
import { useAuthStore } from '@/store/authstore'

const AuthCallback = () => {
  const { handleAuthCallback } = useAuthStore();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('accessToken');
    
    if (accessToken) {
      handleAuthCallback(accessToken);
    }
  }, [handleAuthCallback]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
