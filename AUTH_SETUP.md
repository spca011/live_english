# Google OAuth Authentication Setup Guide

This guide will help you set up Google OAuth authentication for your Live English web service.

## Prerequisites

- Node.js and npm installed
- A Google Cloud Platform account
- Your Live English application running

## Step 1: Install Dependencies

Run the following command to install the new authentication dependencies:

```bash
npm install
```

## Step 2: Set up Google OAuth

### 2.1 Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (for user information)

### 2.2 Create OAuth 2.0 Credentials

1. Navigate to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client ID**
3. Configure the OAuth consent screen:
   - Choose **External** for testing
   - Fill in the required information:
     - App name: "Live English"
     - User support email: your email
     - Developer contact information: your email
4. Create OAuth 2.0 Client ID:
   - Application type: **Web application**
   - Name: "Live English Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - Your production domain (for production)
   - Authorized redirect URIs:
     - `http://localhost:3000` (for development)
     - Your production domain (for production)

### 2.3 Get Your Client ID

After creating the credentials, you'll get:
- Client ID (something like `123456789-abcdef.apps.googleusercontent.com`)
- Client Secret (keep this secret!)

## Step 3: Configure Environment Variables

Create a `.env` file in your project root with the following variables:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_here
SESSION_SECRET=your_session_secret_here

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/live_english

# Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Frontend Configuration
FRONTEND_URL=http://localhost:3000
```

## Step 4: Update Client-Side Configuration

In your `public/index.html` and `public/script.js` files, replace `YOUR_GOOGLE_CLIENT_ID` with your actual Google Client ID:

### In `public/index.html`:
```html
<div id="g_id_onload"
     data-client_id="YOUR_ACTUAL_CLIENT_ID_HERE"
     data-callback="handleCredentialResponse"
     data-auto_prompt="false">
</div>
```

### In `public/script.js`:
Replace all instances of `YOUR_GOOGLE_CLIENT_ID` with your actual client ID.

## Step 5: Database Migration

The authentication system adds a `userId` field to expressions. You may need to run a migration for existing data:

```bash
npm run migrate
```

## Step 6: Run the Application

```bash
npm start
```

## Security Considerations

1. **Environment Variables**: Never commit your `.env` file to version control
2. **JWT Secret**: Use a strong, random secret for JWT tokens
3. **Session Secret**: Use a different strong secret for sessions
4. **HTTPS**: Use HTTPS in production
5. **CORS**: Configure CORS properly for your frontend domain

## Testing the Authentication

1. Open your browser and navigate to `http://localhost:3000`
2. You should see a Google Sign-In button
3. Click it and sign in with your Google account
4. After successful authentication, you should see:
   - Your profile picture and name in the header
   - Access to all app features
   - Your expressions are now tied to your account

## Troubleshooting

### Common Issues

1. **"Invalid client" error**: Check that your Client ID is correct
2. **CORS errors**: Ensure your domain is added to authorized origins
3. **Token verification fails**: Check your JWT_SECRET configuration
4. **Database connection issues**: Verify your MONGODB_URI

### Debug Mode

Add this to your `.env` for more detailed logging:
```bash
NODE_ENV=development
DEBUG=true
```

## Production Deployment

For production:

1. Update your Google OAuth settings with your production domain
2. Set `NODE_ENV=production` in your environment variables
3. Use a reverse proxy (like Nginx) with SSL/TLS certificates
4. Configure your database for production use
5. Set secure cookie settings

## Features Implemented

- ✅ Google OAuth 2.0 authentication
- ✅ JWT token management
- ✅ User session handling
- ✅ Protected API routes
- ✅ User-specific data isolation
- ✅ Automatic token refresh
- ✅ Logout functionality
- ✅ Mobile-responsive authentication UI

## Support

If you encounter issues:
1. Check the browser console for errors
2. Check the server logs
3. Verify your environment variables
4. Ensure all dependencies are installed

Your Live English application now supports secure Google authentication! 🎉 