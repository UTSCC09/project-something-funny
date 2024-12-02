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
      console.warn(`User data not found in Redis for user ID: ${user.uid}`);
      return NextResponse.json(
        {
          message: "User data not found.",
          status: 404,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "User signed in successfully",
      status: 200,
      userData,
    });
  } catch (error) {
    console.error("Error during email sign-in:", error);

    let status = 400;
    if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
      status = 401;
    } else if (error.code === "auth/too-many-requests") {
      status = 429;
    }

    return NextResponse.json(
      {
        message: `Error during email sign-in: ${error.message}`,
        status,
      },
      { status }
    );
  }
}
