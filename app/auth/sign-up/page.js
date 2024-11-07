"use client";
import React, { useState } from 'react';
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { FaGoogle } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { auth } from '../../../firebase-auth/index';


import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleEmailSignUp = async () => {
    try {
 
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await sendEmailVerification(user);

      const response = await fetch('/api/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid, email: user.email }),
      });

      if (response.ok) {
        toast.success('Verification email sent. Please check your inbox.');
        router.push('/auth/verify-email');
      } else {
        const errorData = await response.json();
        toast.error(`Error saving user data: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error during email sign-up:', error);
      toast.error(error.message);
    }
  };

  const handleGoogleSignUp = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      const response = await fetch('/api/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid, email: user.email }),
      });

      if (response.ok) {
        router.push('/');
      } else {
        const errorData = await response.json();
        toast.error(`Error saving user data: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error during Google sign-up:', error);
      toast.error(error.message);
    }
  };

  return (
    <div className='flex justify-center items-center h-screen'>
      <div className='flex w-[1280px] h-[1000px] bg-cover rounded-md'>
        <div className='basis-1/2 flex flex-col justify-center items-center space-y-6'>
          <h1 className='text-3xl font-bold'>Sign Up</h1>
          <Input
            placeholder='Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='w-3/4'
          />
          <Input
            type='password'
            placeholder='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className='w-3/4'
          />
          <Button onClick={handleEmailSignUp} className='w-3/4'>
            Sign Up with Email
          </Button>
          <div className='flex items-center w-3/4'>
            <hr className='flex-grow border-t border-gray-300' />
            <span className='mx-4 text-gray-500'>OR</span>
            <hr className='flex-grow border-t border-gray-300' />
          </div>
          <Button
            onClick={handleGoogleSignUp}
            className='w-3/4 flex items-center justify-center space-x-2'
            variant='outline'
          >
            <FaGoogle />
            <span>Sign Up with Google</span>
          </Button>

          <div>
            Already have an account?
            <Link href="/auth/sign-in" className='ml-2 text-blue-600 hover:underline'>
              Sign in!
            </Link>
          </div>
        </div>

        <div className="basis-1/2 bg-cover bg-[url('/bgs/sign-up.jpg')] rounded-r-md"></div>
      </div>
    </div>
  );
};

export default SignUp;
