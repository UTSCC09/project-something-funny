import { hash } from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import nodemailer from "nodemailer";
import { getRedisClient } from "../../../lib/redis"; // Assuming this exports your configured Redis client
import { getTransport } from "../../mail/transport"; // Function to create a nodemailer transport
import { generateVerificationEmail } from "../../mail/verifyAccount"; // Function to generate email content
import { registrationValidation } from "../../utils/registrationValidation"; // Function for validating registration input

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { email, password, username } = req.body;

  // Validate registration input
  await registrationValidation.validate({ email, password, username });

  // Check if the user already exists
  const existingUser = await getRedisClient().hgetall(`user:${email}`);
  if (existingUser) return res.status(409).json({ error: 'User already exists' });

  // Hash the password
  const hashedPass = await hash(password, 7);
  
  // Generate a unique verification key
  const verificationToken = uuidv4();

  // Create a user object to save in Redis
  const userObj = {
    username,
    email,
    password: hashedPass,
    verified: false,
    verificationToken,
  };

  // Save the user data in Redis with an expiration time
  await getRedisClient().multi()
    .hmset(`user:${email}`, userObj)
    .expire(`user:${email}`, 60 * 60 * 24) // Expire in 24 hours
    .exec();

  // Set up Nodemailer transport
  const transport = await getTransport();

  // Construct the verification email
  const mailOptions = generateVerificationEmail({
    username,
    email,
    verificationToken, // Pass the verification token for the email link
  });

  try {
    // Send the verification email
    await transport.sendMail(mailOptions);
    res.status(201).json({ message: 'User registered successfully. Check your email to verify your account.' });
  } catch (error) {
    console.error('Failed to send verification email:', error);
    res.status(500).json({ error: 'Failed to send verification email' });
  }
}
