
import { auth } from "../../../firebase-auth/index";
import { signInWithEmailAndPassword } from 'firebase/auth';
import redis from '../../../lib/redisClient';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const { email, password } = await request.json();

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await user.reload();

    if (!user.emailVerified) {
      await auth.signOut();
      return NextResponse.json(
        {
          message: 'Please verify your email before signing in.',
          status: 403,
        },
      );
    }

    const userData = await redis.hgetall(`user:${user.uid}`);
    
    console.log('User data from Redis:', userData);

    return NextResponse.json({
      message: 'User signed in successfully',
      status: 200,
      userData
    });
  } catch (error) {
    console.error('Error during email sign-in:', error);
    return NextResponse.json(
      {
        message: `Error during email sign-in: ${error.message}`,
        status: 400,
      },

    );
  }
}
