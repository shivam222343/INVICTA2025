# Two-Step Registration System - Setup Guide

## Overview

Your Invicta registration system now features a comprehensive two-step registration process with admin controls:

### Step 1: Personal Information
- Full Name, Email, Mobile Number
- College (dropdown with "Other" option)
- PRN Number, Year of Study, Stream
- Workshop Selection
- Email uniqueness validation

### Step 2: Payment & Proof Upload
- Dynamic payment instructions
- QR code display and download
- Payment proof screenshot upload
- Transaction ID entry

## New Features Added

### ✅ **Two-Step Registration Form**
- **Progress bar** showing current step
- **Form validation** at each step
- **Email duplicate checking**
- **Conditional fields** (Other college/stream)
- **File upload** for payment proof
- **Beautiful responsive UI**

### ✅ **Admin Settings Panel**
- **Dynamic QR code** upload and management
- **Payment details** (UPI ID, Account Name, Amount)
- **Form options management**:
  - Add/remove colleges
  - Add/remove streams  
  - Add/remove workshops
- **Real-time updates** to registration form

### ✅ **Enhanced Admin Dashboard**
- **Tabbed interface** (Registrations / Settings)
- **Registration status management** (Approve/Reject)
- **Payment proof viewing**
- **Enhanced CSV export** with all fields
- **Status-based filtering** and statistics

## Firebase Collections Structure

### `registrations` Collection
```javascript
{
  fullName: "John Doe",
  email: "john@example.com",
  mobile: "9876543210",
  college: "Kit's College of Engineering Kolhapur",
  prnNumber: "21CS001",
  yearOfStudy: "Third Year",
  stream: "Computer Science",
  workshop: "Build it Better",
  transactionId: "TXN123456789",
  paymentProofUrl: "https://firebase-storage-url/proof.jpg",
  registrationDate: Timestamp,
  status: "pending" // pending, approved, rejected
}
```

### `adminSettings` Collection
```javascript
// Document ID: formConfig
{
  qrCodeUrl: "https://firebase-storage-url/qr.png",
  upiId: "shivamdombe1@okaxis",
  accountName: "Google User",
  amount: 200,
  colleges: ["Kit's College of Engineering Kolhapur"],
  years: ["First Year", "Second Year", "Third Year", "Fourth Year"],
  streams: ["Computer Science and Business System", "Computer Science", ...],
  workshops: ["Build it Better", "Camvision", "Crystal Clear", ...]
}
```

## Setup Instructions

### 1. Firebase Storage Setup
Enable Firebase Storage in your Firebase console:
1. Go to Firebase Console → Storage
2. Click "Get started"
3. Choose security rules (start in test mode)
4. Select storage location

### 2. Update Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read/write for registrations
    match /registrations/{document} {
      allow read, write: if true;
    }
    
    // Admin settings - read by all, write by authenticated users
    match /adminSettings/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 3. Firebase Storage Security Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Payment proofs - allow upload by anyone, read by authenticated users
    match /payment-proofs/{allPaths=**} {
      allow write: if true;
      allow read: if request.auth != null;
    }
    
    // Admin files - only authenticated users
    match /admin/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Admin Usage Guide

### Managing Form Settings
1. **Login as admin** → Go to "Form Settings" tab
2. **Upload QR Code**: Upload payment QR code image
3. **Update Payment Details**: Change UPI ID, account name, amount
4. **Manage Dropdowns**: Add/remove options for colleges, streams, workshops
5. **Save Settings**: Click "Save Settings" to apply changes

### Managing Registrations
1. **View Registrations**: See all submissions with status
2. **Review Payment Proofs**: Click 📄 icon to view uploaded screenshots
3. **Approve/Reject**: Use ✓ and ✗ buttons to update status
4. **Export Data**: Download CSV with all registration details

## User Registration Flow

### Step 1: Personal Info
1. User fills personal details
2. System validates email uniqueness
3. Form validates all required fields
4. Click "Next" to proceed

### Step 2: Payment
1. User sees payment instructions with QR code
2. User makes payment via UPI
3. User uploads payment screenshot
4. User enters transaction ID
5. Submits complete registration

## Testing Checklist

### Registration Form Testing
- [ ] Step 1 form validation works
- [ ] Email uniqueness check works
- [ ] "Other" options show input fields
- [ ] Progress bar updates correctly
- [ ] Step 2 shows payment instructions
- [ ] File upload accepts images only
- [ ] Form submission saves to Firestore
- [ ] Success message appears

### Admin Panel Testing
- [ ] Settings tab loads admin settings
- [ ] QR code upload works
- [ ] Dropdown management works
- [ ] Settings save successfully
- [ ] Registration table shows new fields
- [ ] Status update buttons work
- [ ] Payment proof links work
- [ ] CSV export includes all data

## Deployment Notes

1. **Environment Variables**: Ensure all Firebase config is in `.env`
2. **Storage Rules**: Update Firebase Storage security rules
3. **Firestore Rules**: Update Firestore security rules
4. **Admin Access**: Only authenticated users can access admin settings

## Troubleshooting

### Common Issues
1. **File upload fails**: Check Firebase Storage rules and configuration
2. **Settings don't load**: Verify `adminSettings/formConfig` document exists
3. **Email validation slow**: Check Firestore indexes for email field
4. **QR code not showing**: Verify storage URL and permissions

Your two-step registration system is now complete and ready for production use!
