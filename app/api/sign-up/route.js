
import { NextResponse } from 'next/server';
import redis from '../../../lib/redisClient';



export async function POST(request) {
  const { uid, email } = await request.json();

  try {
    await redis.hmset(`user:${uid}`, 'uid', uid, 'email', email);

    return NextResponse.json({
      message: 'User data saved successfully',
      status: 200,
    });
  } catch (error) {
    console.error('Error saving user data to Redis:', error);

    return NextResponse.json(
      {
        message: `Error saving user data: ${error.message}`,
        status: 500,
      },
      { status: 500 }
    );
  }
}
