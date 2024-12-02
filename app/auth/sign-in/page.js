"use client";
import React, { useState } from 'react';
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { FaGoogle } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { auth } from '../../../firebase-auth/index';
import Cookie from 'js-cookie';
import {
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import useAuthStore from '../../../hooks/useAuthStore';



const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const handleEmailSignIn = async () => {
    try {
      const response = await fetch('/api/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        toast.success('Sign in successful!');
        const data = await response.json();
        console.log(data.userData);
        setUser(data.userData)
        Cookie.set('userEmail', data.userData.email, { expires: 7 });
        router.push('/');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message);
      }
    } catch (error) {
      console.error('Error during email sign-in:', error);
      toast.error('An error occurred during sign-in.');
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userData = {
        uid: user.uid,
        email: user.email,
      };
      setUser(userData);
      toast.success('Sign in successful!');
      router.push('/');
    } catch (error) {
      console.error('Error during Google sign-in:', error.message);
      toast.error(error.message);
    }
  };

  return (
    <div className='flex justify-center items-center h-screen'>
      <div className='flex w-[1280px] h-[1000px] bg-cover rounded-md'>
        <div className='basis-1/2 flex flex-col justify-center items-center space-y-6'>
          <h1 className='text-3xl font-bold'>Sign In</h1>
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
          <Button onClick={handleEmailSignIn} className='w-3/4'>
            Sign In with Email
          </Button>
          <div className='flex items-center w-3/4'>
            <hr className='flex-grow border-t border-gray-300' />
            <span className='mx-4 text-gray-500'>OR</span>
            <hr className='flex-grow border-t border-gray-300' />
          </div>
          <Button
            onClick={handleGoogleSignIn}
            className='w-3/4 flex items-center justify-center space-x-2'
            variant='outline'
          >
            <FaGoogle />
            <span>Sign In with Google</span>
          </Button>

          <div>
            Don&apos;t have an account?
            <Link href="/auth/sign-up" className="ml-2 text-blue-600 hover:underline">
              Sign up!
            </Link>
          </div>

        </div>

        <div className="basis-1/2 bg-cover bg-[url('/bgs/sign-in.jpg')] rounded-r-md"></div>
      </div>
    </div>
  );
};

export default SignIn;
