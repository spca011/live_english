import dotenv from 'dotenv';

dotenv.config();

console.log('=== ENVIRONMENT VARIABLES CHECK ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'SET' : 'NOT SET');

if (!process.env.JWT_SECRET) {
    console.log('WARNING: JWT_SECRET is not set - this could cause authentication issues');
}

if (!process.env.GOOGLE_CLIENT_ID) {
    console.log('WARNING: GOOGLE_CLIENT_ID is not set');
}

console.log('=== END CHECK ==='); 