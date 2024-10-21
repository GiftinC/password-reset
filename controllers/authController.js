import User from '../models/User.js';
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// Login function
export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    console.log("Received Email :", email);

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email' });
        }

        // Use await to correctly check the password
        const isMatch = await bcrypt.compare(password, user.password);
        console.log(password);
        console.log("Compared to Password", user.password);
        console.log('Password match:', isMatch);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // If everything is correct
        res.status(200).json({ message: 'Login successful', userId: user._id });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Forgot Password
export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User does not exist' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex'); // Token generation logic
        user.resetToken = resetToken;
        user.resetTokenExpiration = Date.now() + 3600000; // Token valid for 1 hour
        await user.save();

        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD
            },
        });

        const resetLink = `${NETLIFY_URL}/reset-password?token=${resetToken}`;`http://localhost:`
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Password Reset Link',
            text: `Here is your password reset link: ${resetLink}, Link valid for the next 1 hour`,
        };

        await transporter.sendMail(mailOptions);
        res.json({ message: 'Reset link sent to email' });
    } catch (error) {
        console.error('Failed to send email:', error);
        res.status(500).json({ message: 'Error sending reset link', error: error.message });
    }
};

// Reset Password
export const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiration: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Updating password is handled in the pre-save hook
        user.password = newPassword; // Seting the new password, hashing will be done in pre-save hook
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;
        await user.save();

        res.json({ message: 'Password reset successful!' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ message: 'Error resetting password' });
    }
};

// Registration
export const registerUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // To Check if the email is already in use
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email is already registered' });
        }

        // Created the user directly, password will be hashed in the pre-save hook
        const user = new User({ email, password }); // Store password in plain text for hashing in the schema
        await user.save();
        console.log("User registered successfully");

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
