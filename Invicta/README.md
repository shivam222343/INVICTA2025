# Invicta - React + Firebase Event Registration App

A modern React.js application built with Tailwind CSS and Firebase for event registration and admin management.

## Features

- **Public Registration**: Simple form for workshop registration
- **Admin Authentication**: Google Sign-In for administrators
- **Admin Dashboard**: View all registrations with export functionality
- **Responsive Design**: Beautiful UI with Tailwind CSS
- **Real-time Data**: Firebase Firestore integration

## Tech Stack

- React.js (JavaScript)
- Tailwind CSS
- Firebase (Firestore + Authentication)
- React Router
- Vite

## Setup Instructions

### 1. Install Dependencies

```bash
npm install firebase react-router-dom
```

### 2. Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable Authentication with Google Sign-In
4. Create Firestore database
5. Copy your Firebase config and update `src/firebase/config.js`:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### 3. Firestore Security Rules

Update your Firestore rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow public read/write to registrations
    match /registrations/{document} {
      allow read, write: if true;
    }
  }
}
```

### 4. Run the Application

```bash
npm run dev
```

## Routes

- `/` or `/register` - Public registration page
- `/login` - Admin login page
- `/admin` - Admin dashboard (protected)

## Workshop Options

- Build it Better
- Camvision
- Crystal Clear
- Blendforge
- Think Blink and Build

## Admin Features

- View all registrations in a table
- Export registrations to CSV
- Google Authentication
- Responsive dashboard

## Project Structure

```
src/
├── components/
│   └── ProtectedRoute.jsx
├── contexts/
│   └── AuthContext.jsx
├── firebase/
│   └── config.js
├── pages/
│   ├── Admin.jsx
│   ├── Login.jsx
│   └── Register.jsx
├── App.jsx
└── main.jsx
```

## Development

This project uses Vite for fast development and hot module replacement.

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
