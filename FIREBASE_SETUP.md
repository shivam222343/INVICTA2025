# Firebase Setup Guide for Invicta

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `invicta-event-registration` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In your Firebase project, go to **Authentication** in the left sidebar
2. Click "Get started"
3. Go to **Sign-in method** tab
4. Click on **Google** provider
5. Toggle "Enable"
6. Add your email as a test user (for admin access)
7. Set your project's public-facing name: "Invicta Registration"
8. Add your support email
9. Click "Save"

## Step 3: Create Firestore Database

1. Go to **Firestore Database** in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (we'll update rules later)
4. Select your preferred location (choose closest to your users)
5. Click "Done"

## Step 4: Set Up Firestore Security Rules

1. In Firestore, go to **Rules** tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow public read/write to registrations collection
    match /registrations/{document} {
      allow read, write: if true;
    }
  }
}
```

3. Click "Publish"

## Step 5: Get Firebase Configuration

1. Go to **Project Settings** (gear icon in sidebar)
2. Scroll down to "Your apps" section
3. Click "Web" icon (</>) to add a web app
4. Register app name: "Invicta Web App"
5. Don't check "Firebase Hosting" for now
6. Click "Register app"
7. Copy the `firebaseConfig` object

## Step 6: Configure Your App

1. Create a `.env` file in your project root:

```bash
# Copy .env.example to .env and fill in your values
cp .env.example .env
```

2. Fill in your `.env` file with the values from Firebase:

```env
VITE_FIREBASE_API_KEY=your-actual-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

## Step 7: Test the Application

1. Start the development server:
```bash
npm run dev
```

2. Test the registration form at `http://localhost:5173/register`
3. Test admin login at `http://localhost:5173/login`
4. Check that registrations appear in your Firestore console

## Step 8: Production Deployment (Optional)

For production deployment, you might want to:

1. **Update Firestore Rules** for better security:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /registrations/{document} {
      allow read: if request.auth != null; // Only authenticated users can read
      allow write: if true; // Anyone can register
    }
  }
}
```

2. **Add authorized domains** in Authentication > Settings > Authorized domains

3. **Set up Firebase Hosting** (optional):
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

## Troubleshooting

### Common Issues:

1. **"Firebase config not found"**
   - Make sure your `.env` file exists and has correct variable names
   - Restart your dev server after creating `.env`

2. **"Auth domain not authorized"**
   - Add your domain to authorized domains in Firebase console

3. **"Permission denied" in Firestore**
   - Check your Firestore security rules
   - Make sure the collection name matches ("registrations")

4. **Google Sign-In not working**
   - Verify Google provider is enabled in Authentication
   - Check that your domain is in authorized domains

### Testing Checklist:

- [ ] Registration form submits data to Firestore
- [ ] Success message appears after registration
- [ ] Google Sign-In works on login page
- [ ] Admin dashboard shows registrations
- [ ] CSV export downloads correctly
- [ ] Logout functionality works
- [ ] Protected routes redirect to login when not authenticated

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your Firebase configuration
3. Check Firestore rules and data structure
4. Ensure all environment variables are set correctly
