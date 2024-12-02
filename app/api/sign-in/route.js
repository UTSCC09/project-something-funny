import { auth } from "../../../firebase-auth/index";
import { signInWithEmailAndPassword } from "firebase/auth";
import redis from "../../../lib/redisClient";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        {
          message: "Email and password must be provided.",
          status: 400,
        },
        { status: 400 }
      );
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await user.reload();

    if (!user.emailVerified) {
      await auth.signOut();
      return NextResponse.json(
        {
          message: "Please verify your email before signing in.",
          status: 403,
        },
        { status: 403 }
      );
    }

    const userData = await redis.hgetall(`user:${user.uid}`);

    if (!userData) {
      return NextResponse.json(
        {
          message: "Unable to fetch user data. Please try again later.",
          status: 500,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "User signed in successfully",
      status: 200,
      userData,
    });
  } catch (error) {
    console.error("Error during email sign-in:", error);
    // Generic error message for users
    return NextResponse.json(
      {
        message: "Unable to sign in. Please check your credentials.",
        status: 401,
      },
      { status: 401 }
    );
  }
}
