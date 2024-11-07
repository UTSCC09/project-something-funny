"use client"
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from "../../../firebase-auth/index";
import { Button } from '../../../components/ui/button';

const VerifyEmail = () => {
  const [message, setMessage] = useState('');
  const user = auth.currentUser;
  const router = useRouter();



  const handleGoToSignIn = async () => {
    router.push('/auth/sign-in');
  };

  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      <h1 className='text-2xl font-bold mb-4'>Verify Your Email Address</h1>
      <p className='mb-4'>
        A verification email has been sent to <strong>{user?.email}</strong>.
      </p>

      <Button variant='outline' onClick={handleGoToSignIn}>
        Sign In
      </Button>
      {message && <p className='mt-4 text-green-500'>{message}</p>}
    </div>
  );
};

export default VerifyEmail;
