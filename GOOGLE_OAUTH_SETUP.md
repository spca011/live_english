# Google OAuth Setup Guide - Fix Authorization Error

## The Error You're Seeing
```
Access blocked: Authorization Error
The OAuth client was not found.
Error 401: invalid_client
```

This means your Google OAuth client is not properly configured. Follow these steps:

## Step 1: Go to Google Cloud Console
1. Open [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account (spca011@gmail.com)

## Step 2: Create or Select a Project
1. Click on the project dropdown at the top
2. Either select an existing project or click "New Project"
3. If creating new: Name it "Live English" and click "Create"

## Step 3: Enable Required APIs
1. Go to **APIs & Services** > **Library**
2. Search for "**People API**" and click **Enable**. This is for getting user profile information.
3. Search for "**Google Identity Services API**" and click **Enable**. This is for the sign-in functionality.

## Step 4: Configure OAuth Consent Screen
1. Go to **APIs & Services** > **OAuth consent screen**
2. Choose **External** (for testing)
3. Fill in the required information:
   - **App name**: Live English
   - **User support email**: spca011@gmail.com
   - **Developer contact information**: spca011@gmail.com
4. Click **Save and Continue**
5. Skip "Scopes" (click **Save and Continue**)
6. Under "Test users", click **Add Users** and add: spca011@gmail.com
7. Click **Save and Continue**

## Step 5: Create OAuth 2.0 Credentials
1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client ID**
3. Choose **Web application**
4. Name it "Live English Web Client"
5. Under **Authorized JavaScript origins**, add:
   - `http://localhost:3000`
   - `http://127.0.0.1:3000`
6. Under **Authorized redirect URIs**, add:
   - `http://localhost:3000`
   - `http://127.0.0.1:3000`
7. Click **Create**

## Step 6: Get Your New Client ID
1. After creation, you'll see a popup with your credentials
2. Copy the **Client ID** (it should look like: `xxxxx-xxxxx.apps.googleusercontent.com`)
3. Copy the **Client Secret**

## Step 7: Update Your Application
Update your `.env` file with the NEW credentials:

```bash
GOOGLE_CLIENT_ID=YOUR_NEW_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_NEW_CLIENT_SECRET_HERE
```

## Step 8: Test the Application
1. Stop your current server (Ctrl+C)
2. Start it again: `npm start`
3. Try signing in again

## Important Notes:
- The old Client ID you had might be from a deleted project or incorrectly configured
- Make sure your Google Cloud project has billing enabled (required for OAuth)
- The OAuth consent screen must be properly configured
- Test users must be added during development

## If You Still Have Issues:
1. Check the browser console for errors
2. Make sure the URLs match exactly (including http/https)
3. Wait a few minutes for changes to propagate
4. Try signing in with the email you added as a test user

## Production Checklist:
- [ ] OAuth consent screen configured
- [ ] Test users added
- [ ] Correct authorized origins
- [ ] Billing enabled on Google Cloud project
- [ ] APIs enabled (Google+ API, Google Identity) 