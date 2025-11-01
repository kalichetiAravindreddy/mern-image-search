# MERN Image Search App

A full-stack MERN application that allows users to **search for images using the Unsplash API**, with **Google OAuth login**, **search history**, and **multi-select download** features.

## Tech Stack
Frontend:
React.js
CSS3
Context API

Backend:
Node.js
Express.js
MongoDB with Mongoose
Passport.js (OAuth)

APIs:
Unsplash API
Google OAuth 2.0

###  Project Structure
# React frontend
mern-image-search
client                 
  public
  src
    App.js
    App.css
    index.js
    package.json

# Express backend
#├── server/                 
#│   ├── models/
#│   │   ├── User.js
#│   │   └── Search.js
#│   ├── routes.js
#│   ├── passport.js
#│   ├── index.js
#│   └── package.json
#├── screenshots/            # Visual proof     
#└── README.md

## Setup Instructions
Prerequisites
Node.js (v14 or higher)

MongoDB (local or Atlas)

Google OAuth credentials

Unsplash API access key

## Environment Variables
Create .env file in server/ folder:
# Database
MONGO_URI=mongodb://localhost:27017/mern-image-search

# OAuth - Google
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Unsplash API
UNSPLASH_ACCESS_KEY=your_unsplash_access_key

# Session
SESSION_SECRET=your_session_secret

# URLs
CLIENT_URL=http://localhost:3000
SERVER_URL=http://localhost:5000

git clone https://github.com/username/mern-image-search.git
cd mern-image-search

cd server
npm install
# Add .env file with your keys
npm run dev

cd client
npm install
npm start

Access Application
Frontend: http://localhost:3000
Backend: http://localhost:5000

## API Endpoints
Authentication
GET /api/auth/google - Google OAuth login

GET /api/auth/user - Get current user

POST /api/logout - Logout user

## Search & History
POST /api/search - Search images (requires auth)

GET /api/top-searches - Get top 5 searches

GET /api/history - Get user search history

## visual proof
check the screenshots folder for:
1.login.png
2.top-searches.png
3.Search-results.png
4.Search-history.png

done by
aravind reddy 
