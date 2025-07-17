# 🌊 Live English

This is a web application for learning English, converted from a Google Apps Script project to a standalone Node.js application.

## Features

-   Get English expression suggestions for a given text using the Gemini API.
-   Save suggested expressions.
-   Review saved expressions using a flashcard system.
-   Mark expressions as "memorized".
-   Filter and shuffle flashcards for effective learning.

## Project Structure

```
/
project-root/
├── public/               # Frontend static files
│   ├── index.html
│   ├── style.css
│   └── script.js
├── server.js             # Backend Express server
├── db.json               # JSON file database
├── package.json          # Project dependencies and scripts
└── .gitignore            # Files to ignore in git
```

## Setup and Installation

Follow these steps to set up and run the project locally.

### 1. Clone the Repository

```bash
git clone https://github.com/spca011/live_english.git
cd live_english
```

### 2. Install Dependencies

Install the necessary Node.js packages.

```bash
npm install
```

### 3. Set Up Environment Variables

You need to provide your Google Gemini API key. Create a file named `.env` in the root of the project.

```
touch .env
```

Then, open the `.env` file and add your API key in the following format:

```
GEMINI_API_KEY="YOUR_API_KEY_HERE"
```

**Important:** Do not share your `.env` file or commit it to Git. It is included in the `.gitignore` file to prevent this.

### 4. Run the Application

Start the backend server.

```bash
npm start
```

The server will start, and you can access the application by navigating to [http://localhost:3000](http://localhost:3000) in your web browser.

## Deployment

This application consists of a Node.js backend and a static frontend.

-   **Hosting**: You can deploy this application to services that support Node.js, such as Heroku, Vercel, Render, or Fly.io.
-   **Database**: The current version uses a `db.json` file. For a production environment, you might consider migrating to a more robust database solution like PostgreSQL, MongoDB, or a cloud-based database service. The JSON file will be reset every time the hosting service's dyno restarts on free tiers.
-   **Environment Variables**: When deploying, make sure to set the `GEMINI_API_KEY` as an environment variable in your hosting provider's settings.

You cannot directly deploy this to static site hosts like GitHub Pages because it requires a running Node.js server.

This is the deployed site:
https://live-english.onrender.com/