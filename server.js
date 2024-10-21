import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import url from 'url';


import { forgotPassword, resetPassword, loginUser, registerUser } from './controllers/authController.js';

dotenv.config();

const app = express();

const corsOptions = {
    origin: "https://aquamarine-jalebi-01eea5.netlify.app",
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
};

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "https://aquamarine-jalebi-01eea5.netlify.app"); // Adjust to your frontend's origin
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
  });
  

app.use(cors(corsOptions));
app.use(express.json());

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected successfully');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err.message);
        process.exit(1);
    }
};

connectDB();

// Routes
app.post('/forgot-password', forgotPassword);
app.post('/reset-password', resetPassword);
app.post('/login', loginUser);
app.post('/register', registerUser);

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, '../password-reset-fe/dist')));

app.get('/reset-password', (req, res) => {
    res.sendFile(path.join(__dirname, '../password-reset-fe/dist', 'index.html'));
});
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../password-reset-fe/dist', 'index.html'));
});

// Start server
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
