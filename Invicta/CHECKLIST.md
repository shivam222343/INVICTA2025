# Invicta App Testing Checklist

## Pre-Launch Setup ✅

- [x] Dependencies installed (Firebase, React Router)
- [x] Project structure created
- [x] Environment variables template created
- [x] Firebase configuration updated
- [x] Security rules documented
- [x] Setup documentation created

## Firebase Configuration (Your Action Required)

- [ ] Create Firebase project
- [ ] Enable Google Authentication
- [ ] Create Firestore database
- [ ] Copy Firebase config to `.env` file
- [ ] Set Firestore security rules

## Application Testing

### Registration Form (`/register`)
- [ ] Form loads without errors
- [ ] All fields are present (Name, Email, Phone, College, Workshop)
- [ ] Workshop dropdown shows all 5 options
- [ ] Form validation works (required fields)
- [ ] Success message appears after submission
- [ ] Data appears in Firestore console

### Admin Login (`/login`)
- [ ] Login page loads correctly
- [ ] Google Sign-In button works
- [ ] Redirects to admin dashboard after login
- [ ] Shows error if login fails

### Admin Dashboard (`/admin`)
- [ ] Requires authentication (redirects to login if not signed in)
- [ ] Shows user info in header
- [ ] Displays registrations in table format
- [ ] Shows correct registration count
- [ ] CSV export button works
- [ ] Downloaded CSV contains correct data
- [ ] Logout button works

### Navigation & Security
- [ ] Direct access to `/admin` redirects to login when not authenticated
- [ ] After login, can access admin dashboard
- [ ] Logout clears authentication state
- [ ] All routes work correctly

## Performance & UI
- [ ] Pages load quickly
- [ ] Responsive design works on mobile
- [ ] Forms are user-friendly
- [ ] Loading states show during operations
- [ ] Error messages are clear and helpful

## Browser Compatibility
- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Edge
- [ ] Works on mobile browsers

## Production Readiness
- [ ] Environment variables are secure
- [ ] Firebase rules are properly configured
- [ ] No console errors in production build
- [ ] All sensitive data is protected

---

## Quick Start Commands

```bash
# 1. Set up environment
cp .env.example .env
# Edit .env with your Firebase credentials

# 2. Start development server
npm run dev

# 3. Open in browser
# http://localhost:5173
```

## Need Help?

1. Check `FIREBASE_SETUP.md` for detailed Firebase configuration
2. Check `README.md` for project overview
3. Look at browser console for error messages
4. Verify `.env` file has correct Firebase credentials
