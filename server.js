import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import mongoose from 'mongoose';
import session from 'express-session';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import Expression from './models/Expression.js';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// MongoDB connection
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/live_english';
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

// Connect to database
connectDB();

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.static('public'));

app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    next();
});

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Google OAuth configuration
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret';

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Google OAuth login
app.post('/api/auth/google', async (req, res) => {
    try {
        const { token } = req.body;
        
        if (!token) {
            return res.status(400).json({ message: 'Token is required' });
        }

        // Verify Google token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const googleId = payload['sub'];
        const email = payload['email'];
        const name = payload['name'];
        const picture = payload['picture'];

        // Find or create user
        let user = await User.findOne({ googleId });
        
        if (!user) {
            user = new User({
                googleId,
                email,
                name,
                picture
            });
            await user.save();
        } else {
            // Update last login
            user.lastLogin = new Date();
            await user.save();
        }

        // Generate JWT
        const jwtToken = jwt.sign(
            { 
                userId: user._id, 
                googleId: user.googleId, 
                email: user.email, 
                name: user.name 
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ 
            success: true, 
            token: jwtToken, 
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                picture: user.picture
            }
        });

    } catch (error) {
        console.error('Google authentication error:', error);
        res.status(500).json({ message: 'Authentication failed' });
    }
});

// Verify token endpoint
app.post('/api/auth/verify', authenticateToken, (req, res) => {
    res.json({ valid: true, user: req.user });
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// Gemini API Suggestions
app.post('/api/suggestions', authenticateToken, async (req, res) => {
    const { userInput } = req.body;
    if (!userInput) {
        return res.status(400).json({ message: 'User input is required' });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
        return res.status(500).json({ message: 'API key is not configured' });
    }

    const prompt = `Analyze the following user text: "${userInput}"
    Regardless of whether it's Korean or English, suggest the 5 most natural and appropriate English expressions in order of priority.

    Your response MUST be ONLY a valid JSON array format. Do not include any other explanations, comments, or markdown like \`\`\`json.
    The response format must be strictly as follows:
    [
      "First most natural English expression",
      "Second natural English expression", 
      "Third natural English expression",
      "Fourth natural English expression",
      "Fifth natural English expression"
    ]

    Begin your response IMMEDIATELY with "[" and end it with "]". NO OTHER TEXT should be present.`;

    try {
        const payload = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }]
        };

        const apiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            }
        );

        if (!apiResponse.ok) {
            const errorText = await apiResponse.text();
            console.error('Gemini API Error:', errorText);
            throw new Error(`API request failed with status ${apiResponse.status}`);
        }

        const data = await apiResponse.json();

        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            let responseText = data.candidates[0].content.parts[0].text.trim();
            
            const startIndex = responseText.indexOf('[');
            const endIndex = responseText.lastIndexOf(']');

            if (startIndex !== -1 && endIndex !== -1) {
                responseText = responseText.substring(startIndex, endIndex + 1);
                return res.json(JSON.parse(responseText));
            }
        }
        
        throw new Error('Could not parse suggestions from API response.');

    } catch (error) {
        console.error('Gemini API call failed:', error);
        res.status(500).json({ message: 'Failed to get suggestions from Gemini API.' });
    }
});

// Get all expressions for authenticated user
app.get('/api/expressions', authenticateToken, async (req, res) => {
    try {
        const expressions = await Expression.find({ userId: req.user.userId }).sort({ dateTime: -1 });
        res.json(expressions);
    } catch (error) {
        console.error('Failed to get expressions:', error);
        res.status(500).json({ message: 'Error reading from database' });
    }
});

// Save a new expression
app.post('/api/expressions', authenticateToken, async (req, res) => {
    const { draft, english } = req.body;
    if (!draft || !english) {
        return res.status(400).json({ message: 'Draft and English text are required' });
    }

    try {
        // Validate user information
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ success: false, message: 'User authentication required' });
        }

        console.log(`Saving expression for user: ${req.user.userId}`);

        // Create new expression with auto-generated MongoDB ObjectId
        const newExpression = new Expression({
            userId: req.user.userId,
            draft,
            english,
            dateTime: new Date(),
            isMemory: false,
            numberStudy: 0,
            lastStudyDate: null
        });

        const savedExpression = await newExpression.save();
        console.log(`Expression saved successfully with ID: ${savedExpression._id}`);
        
        res.status(201).json({ 
            success: true, 
            message: 'Expression saved successfully!', 
            expression: savedExpression 
        });
    } catch (error) {
        console.error('Failed to save expression:', error);
        
        // Handle specific MongoDB errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                success: false, 
                message: 'Validation error: ' + error.message 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Failed to save expression to database' 
        });
    }
});

// Update memory status
app.put('/api/expressions/:id/memory', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { isMemory } = req.body;

    if (typeof isMemory !== 'boolean') {
        return res.status(400).json({ message: 'isMemory flag is required and must be a boolean' });
    }

    try {
        const expression = await Expression.findOne({ _id: id, userId: req.user.userId });

        if (!expression) {
            return res.status(404).json({ message: 'Expression not found' });
        }

        expression.isMemory = isMemory;
        expression.numberStudy = (expression.numberStudy || 0) + 1;
        expression.lastStudyDate = new Date();

        await expression.save();
        res.json({ success: true, expression });

    } catch (error) {
        console.error('Failed to update memory status:', error);
        res.status(500).json({ success: false, message: 'Failed to update memory status' });
    }
});

// Delete an expression
app.delete('/api/expressions/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        const deletedExpression = await Expression.findOneAndDelete({ _id: id, userId: req.user.userId });

        if (!deletedExpression) {
            return res.status(404).json({ success: false, message: 'Expression not found' });
        }

        res.json({ success: true, message: 'Expression deleted successfully' });

    } catch (error) {
        console.error('Failed to delete expression:', error);
        res.status(500).json({ success: false, message: 'Failed to delete expression' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
}); 