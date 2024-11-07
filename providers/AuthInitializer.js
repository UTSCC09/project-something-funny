
'use client'; 

import { useEffect } from 'react';
import useAuthStore from '../hooks/useAuthStore';

const AuthInitializer = () => {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return null; 
};

export default AuthInitializer;
