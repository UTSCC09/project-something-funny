import redis from '../../../lib/redis';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { email, password } = req.body;

  // Check if the user already exists
  const existingUser = await redis.get(`user:${email}`);
  if (existingUser) return res.status(409).json({ error: 'User already exists' });

  // Generate a verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');

  // Save the user data, including the verification token
  await redis.set(`user:${email}`, JSON.stringify({
    email,
    password,
    verified: false,
    verificationToken,
  }));

  // Set up Nodemailer transport with your Gmail credentials
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL, // Your Gmail email from .env
      pass: process.env.PASSWORD, // Your App Password from .env
    },
  });

  // Construct the verification URL
  const verificationUrl = `http://localhost:3000/api/verify?token=${verificationToken}&email=${encodeURIComponent(email)}`;

  try {
    // Send the verification email
    await transporter.sendMail({
      from: process.env.EMAIL, // Your Gmail email
      to: email,
      subject: 'Verify Your Email',
      html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>`,
    });

    res.status(201).json({ message: 'User registered successfully. Check your email to verify your account.' });
  } catch (error) {
    console.error('Failed to send verification email:', error);
    res.status(500).json({ error: 'Failed to send verification email' });
  }
}
