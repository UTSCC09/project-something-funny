"use client"
import React,{useEffect} from 'react'
import { 
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuContent 
} from '../ui/dropdown-menu'
import useAuthStore from '../../hooks/useAuthStore'


import { useRouter } from 'next/navigation'

const Navbar = () => {

  const user = useAuthStore((state) => state.user);
  const signOutUser = useAuthStore((state) => state.signOutUser);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOutUser();
      router.push('/auth/sign-in'); 
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

   return (
    <div className='h-[60px] border-b flex justify-center items-center'>
      <div className='w-[1280px] flex justify-between'>
        <div>

        </div>

        <div>
          <DropdownMenu>
            <DropdownMenuTrigger>
              {user ? user.email : 'Account'}
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>
                {user ? user.email : 'Guest'}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {user ? (
                <>
                  <DropdownMenuItem onClick={() => router.push('/ profile')}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    Logout
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem onClick={() => router.push('/auth/sign-in')}>
                    Sign In
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/auth/sign-up')}>
                    Sign Up
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default Navbar;