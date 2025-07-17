# LiveEnglish - MongoDB Deployment Guide

## Overview
This guide explains how to deploy LiveEnglish with MongoDB instead of the file-based database.

## Prerequisites
1. MongoDB Atlas account (free tier available)
2. Render.com account
3. Gemini API key

## Setup Instructions

### 1. Set up MongoDB Atlas
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account and cluster
3. Create a database user with read/write permissions
4. Get your connection string (it should look like: `mongodb+srv://username:password@cluster.mongodb.net/live_english`)

### 2. Environment Variables
Set these environment variables in your Render.com service:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/live_english
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Data Migration (Optional)
If you have existing data in `db.json`, you can migrate it:

```bash
npm run migrate
```

### 4. Deploy to Render.com
1. Connect your GitHub repository to Render.com
2. Create a new Web Service
3. Set the following:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**: Add `MONGODB_URI` and `GEMINI_API_KEY`

## Benefits of MongoDB
- ✅ **Persistent storage**: Data survives server restarts and deployments
- ✅ **Scalability**: Can handle thousands of expressions
- ✅ **Performance**: Faster queries and indexing
- ✅ **Reliability**: Built-in replication and backup
- ✅ **Cloud-native**: Works perfectly with Render.com

## Local Development
For local development, you can use either:
1. MongoDB Atlas (recommended)
2. Local MongoDB installation

If using local MongoDB:
```
MONGODB_URI=mongodb://localhost:27017/live_english
```

## Troubleshooting
- Make sure your MongoDB Atlas cluster allows connections from anywhere (0.0.0.0/0)
- Check that your connection string includes the database name
- Verify environment variables are set correctly in Render.com 