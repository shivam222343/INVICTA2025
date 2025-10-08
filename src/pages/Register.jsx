import { useState, useEffect } from 'react';
import { collection, addDoc, query, where, getDocs, doc, getDoc, runTransaction } from 'firebase/firestore';
import { db } from '../firebase/config';
import { uploadToCloudinary } from '../utils/cloudinary';
import { useToast } from '../contexts/ToastContext';
import ReCaptcha from '../components/ReCaptcha';
import CelebrationModal from '../components/CelebrationModal';

export default function Register() {
  const { success: showSuccess, error: showError, warning: showWarning } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Info
    fullName: '',
    email: '',
    mobile: '',
    college: '',
    otherCollege: '',
    prnNumber: '',
    yearOfStudy: '',
    stream: '',
    otherStream: '',
    workshop: '',
    preferredLanguage: '',
    // Payment Info
    transactionId: '',
    paymentProof: null
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [registeredUserData, setRegisteredUserData] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [workshopExists, setWorkshopExists] = useState(false);
  const [adminSettings, setAdminSettings] = useState({
    qrCodeUrl: '',
    upiId: 'shivamdombe1@okaxis',
    accountName: 'Google User',
    amount: 200,
    registrationActive: true, // Default to active
    paymentRequired: true, // Default to payment required
    spotEntryEnabled: true, // Default to enabled
    spotEntryMessage: 'Spot entries will be allowed if seats become available due to cancellations or no-shows. Please arrive at the venue early on the workshop day to secure your spot.',
    languages: ['Hindi', 'Marathi', 'English'], // Available language options
    colleges: ['Kit\'s College of Engineering Kolhapur'],
    years: ['First Year', 'Second Year', 'Third Year', 'Fourth Year'],
    streams: ['Computer Science and Business System', 'Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil'],
    workshops: ['Build it Better', 'Camvision', 'Crystal Clear', 'Blendforge', 'Think Blink and Build']
  });
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [showClosedModal, setShowClosedModal] = useState(false);

  // Load admin settings on component mount
  useEffect(() => {
    const loadAdminSettings = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, 'adminSettings', 'formConfig'));
        if (settingsDoc.exists()) {
          const newSettings = { ...adminSettings, ...settingsDoc.data() };
          setAdminSettings(newSettings);
          
          // Check if registrations are closed and show modal
          if (newSettings.registrationActive === false) {
            setShowClosedModal(true);
          }
        }
      } catch (error) {
        console.error('Error loading admin settings:', error);
      } finally {
        setSettingsLoading(false);
      }
    };
    loadAdminSettings();
  }, []);

  // Validation functions
  const validateField = (name, value) => {
    const errors = {};

    switch (name) {
      case 'fullName':
        if (!value.trim()) {
          errors.fullName = 'Full name is required';
        } else if (value.trim().length < 2) {
          errors.fullName = 'Full name must be at least 2 characters';
        } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
          errors.fullName = 'Full name should only contain letters and spaces';
        }
        break;

      case 'email':
        if (!value.trim()) {
          errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          errors.email = 'Please enter a valid email address';
        }
        break;

      case 'mobile':
        if (!value.trim()) {
          errors.mobile = 'Mobile number is required';
        } else if (!/^\d{10}$/.test(value.trim())) {
          errors.mobile = 'Mobile number must be exactly 10 digits';
        } else if (!/^[6-9]\d{9}$/.test(value.trim())) {
          errors.mobile = 'Please enter a valid Indian mobile number';
        }
        break;

      case 'prnNumber':
        if (value.trim() && !/^[A-Z0-9]{8,15}$/.test(value.trim().toUpperCase())) {
          errors.prnNumber = 'PRN should be 8-15 characters (letters and numbers only)';
        }
        break;

      case 'college':
        if (!value.trim()) {
          errors.college = 'College selection is required';
        }
        break;

      case 'otherCollege':
        if (formData.college === 'other' && !value.trim()) {
          errors.otherCollege = 'Please specify your college name';
        }
        break;

      case 'yearOfStudy':
        if (!value.trim()) {
          errors.yearOfStudy = 'Year of study is required';
        }
        break;

      case 'stream':
        if (!value.trim()) {
          errors.stream = 'Stream selection is required';
        }
        break;

      case 'otherStream':
        if (formData.stream === 'other' && !value.trim()) {
          errors.otherStream = 'Please specify your stream';
        }
        break;

      case 'workshop':
        if (!value.trim()) {
          errors.workshop = 'Workshop selection is required';
        }
        break;

      case 'preferredLanguage':
        if (!value.trim()) {
          errors.preferredLanguage = 'Language preference is required';
        }
        break;

      case 'transactionId':
        if (!value.trim()) {
          errors.transactionId = 'Transaction ID is required';
        } else if (value.trim().length < 8) {
          errors.transactionId = 'Transaction ID should be at least 8 characters';
        }
        break;

      case 'paymentProof':
        if (!value) {
          errors.paymentProof = 'Payment proof screenshot is required';
        }
        break;

      default:
        break;
    }

    return errors;
  };

  const validateForm = () => {
    const errors = {};
    
    // Validate all fields
    Object.keys(formData).forEach(key => {
      const fieldErrors = validateField(key, formData[key]);
      Object.assign(errors, fieldErrors);
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep1 = () => {
    const errors = {};
    const step1Fields = ['fullName', 'email', 'mobile', 'college', 'otherCollege', 'prnNumber', 'yearOfStudy', 'stream', 'otherStream', 'workshop', 'preferredLanguage'];
    
    // Validate only step 1 fields
    step1Fields.forEach(key => {
      const fieldErrors = validateField(key, formData[key]);
      Object.assign(errors, fieldErrors);
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    let newValue = value;
    
    // Handle file input
    if (name === 'paymentProof') {
      setFormData({ ...formData, [name]: files[0] });
      // Clear validation error for file
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
      return;
    }
    
    // Format mobile number (remove non-digits)
    if (name === 'mobile') {
      newValue = value.replace(/\D/g, '').slice(0, 10);
    }
    
    // Format PRN to uppercase
    if (name === 'prnNumber') {
      newValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15);
    }
    
    // Format full name (remove numbers and special characters)
    if (name === 'fullName') {
      newValue = value.replace(/[^a-zA-Z\s]/g, '');
    }
    
    setFormData({ ...formData, [name]: newValue });
    
    // Real-time validation
    const fieldErrors = validateField(name, newValue);
    setValidationErrors(prev => ({ ...prev, ...fieldErrors, [name]: fieldErrors[name] || '' }));
    
    // Clear email exists error when user types
    if (name === 'email') {
      setEmailExists(false);
      setWorkshopExists(false);
    }
    
    // Clear workshop exists error when user changes workshop
    if (name === 'workshop') {
      setWorkshopExists(false);
    }
  };

  const checkEmailExists = async (email) => {
    const q = query(collection(db, 'registrations'), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const checkWorkshopRegistration = async (email, mobile, prnNumber) => {
    // Check if user is already registered for any workshop using email, mobile, or PRN
    const emailQuery = query(collection(db, 'registrations'), where('email', '==', email));
    const mobileQuery = query(collection(db, 'registrations'), where('mobile', '==', mobile));
    
    const queries = [
      getDocs(emailQuery),
      getDocs(mobileQuery)
    ];
    
    // Only check PRN if it's provided
    if (prnNumber && prnNumber.trim()) {
      const prnQuery = query(collection(db, 'registrations'), where('prnNumber', '==', prnNumber.toUpperCase()));
      queries.push(getDocs(prnQuery));
    }
    
    const snapshots = await Promise.all(queries);
    
    // Check if any of the queries returned results
    return snapshots.some(snapshot => !snapshot.empty);
  };

  const checkWorkshopLimit = async (workshopName) => {
    try {
      // Get workshop details from admin settings
      const settingsDoc = await getDoc(doc(db, 'adminSettings', 'aboutWorkshops'));
      if (!settingsDoc.exists()) {
        return { hasLimit: false, isFull: false };
      }

      const workshops = settingsDoc.data().workshops || [];
      // Case-insensitive workshop matching
      let selectedWorkshop = workshops.find(w => 
        w.name.toLowerCase().trim() === workshopName.toLowerCase().trim()
      );
      
      // If no exact match, try fuzzy matching for common variations
      if (!selectedWorkshop) {
        selectedWorkshop = workshops.find(w => {
          const workshopSettingName = w.name.toLowerCase().replace(/[^a-z0-9]/g, '');
          const workshopFormName = workshopName.toLowerCase().replace(/[^a-z0-9]/g, '');
          return workshopSettingName === workshopFormName;
        });
      }
      
      if (!selectedWorkshop || !selectedWorkshop.registrationLimit) {
        return { hasLimit: false, isFull: false };
      }

      // Count current approved registrations for this workshop (case-insensitive)
      const registrationsSnapshot = await getDocs(
        query(collection(db, 'registrations'), where('status', '==', 'approved'))
      );
      
      let currentCount = 0;
      registrationsSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.workshop) {
          // Try exact match first
          let isMatch = data.workshop.toLowerCase().trim() === workshopName.toLowerCase().trim();
          
          // If no exact match, try fuzzy matching
          if (!isMatch) {
            const registrationName = data.workshop.toLowerCase().replace(/[^a-z0-9]/g, '');
            const formName = workshopName.toLowerCase().replace(/[^a-z0-9]/g, '');
            isMatch = registrationName === formName;
          }
          
          if (isMatch) {
            currentCount++;
          }
        }
      });

      console.log(`Workshop: ${workshopName}, Current Count: ${currentCount}, Limit: ${selectedWorkshop.registrationLimit}`);

      return {
        hasLimit: true,
        isFull: currentCount >= selectedWorkshop.registrationLimit,
        currentCount,
        limit: selectedWorkshop.registrationLimit
      };
    } catch (error) {
      console.error('Error checking workshop limit:', error);
      return { hasLimit: false, isFull: false };
    }
  };

  const handleNextStep = async () => {
    // Validate step 1 fields
    if (!validateStep1()) {
      showError('Please fix the validation errors before proceeding.');
      return;
    }

    setLoading(true);

    try {
      // Check for duplicate registrations
      const isAlreadyRegistered = await checkWorkshopRegistration(
        formData.email.trim(),
        formData.mobile.trim(),
        formData.prnNumber.trim()
      );

      if (isAlreadyRegistered) {
        setWorkshopExists(true);
        showError('You are already registered for a workshop. Each participant can only register for one workshop.');
        setLoading(false);
        return;
      }

      // Check workshop registration limit
      const workshopLimitCheck = await checkWorkshopLimit(formData.workshop);
      if (workshopLimitCheck.isFull) {
        showError(`Sorry, the ${formData.workshop} workshop is full. Registration limit of ${workshopLimitCheck.limit} participants has been reached.`);
        setLoading(false);
        return;
      }

      // If all validations pass, proceed to step 2 or complete registration if payment not required
      if (!adminSettings.paymentRequired) {
        // Skip payment step and complete registration directly
        handleSubmit({ preventDefault: () => {} });
      } else {
        setCurrentStep(2);
        showSuccess('Step 1 completed! Please proceed with payment details.');
      }
    } catch (error) {
      console.error('Error checking registration:', error);
      showError('Error checking registration. Please try again.');
    }
    
    setLoading(false);
  };

  const handleRecaptchaVerify = (token) => {
    setRecaptchaToken(token);
  };

  const handleRecaptchaExpire = () => {
    setRecaptchaToken(null);
  };

  const handleRecaptchaError = () => {
    setRecaptchaToken(null);
    showError('reCAPTCHA verification failed. Please try again.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if registrations are closed
    if (adminSettings.registrationActive === false) {
      showError('Registrations are currently closed.');
      return;
    }
    
    // Check reCAPTCHA only if enabled
    if (adminSettings.enableRecaptcha && !recaptchaToken) {
      showWarning('Please complete the reCAPTCHA verification.');
      return;
    }

    setLoading(true);

    try {
      let paymentProofUrl = '';
      
      // Upload payment proof if provided
      if (formData.paymentProof) {
        paymentProofUrl = await uploadToCloudinary(formData.paymentProof, 'payment-proofs');
      }

      // Use transaction to ensure atomic registration with limit checking
      await runTransaction(db, async (transaction) => {
        // Re-check workshop limit within transaction
        const settingsDoc = await transaction.get(doc(db, 'adminSettings', 'aboutWorkshops'));
        if (settingsDoc.exists()) {
          const workshops = settingsDoc.data().workshops || [];
          let selectedWorkshop = workshops.find(w => 
            w.name.toLowerCase().trim() === formData.workshop.toLowerCase().trim()
          );
          
          // If no exact match, try fuzzy matching for common variations
          if (!selectedWorkshop) {
            selectedWorkshop = workshops.find(w => {
              const workshopSettingName = w.name.toLowerCase().replace(/[^a-z0-9]/g, '');
              const workshopFormName = formData.workshop.toLowerCase().replace(/[^a-z0-9]/g, '');
              return workshopSettingName === workshopFormName;
            });
          }
          
          if (selectedWorkshop && selectedWorkshop.registrationLimit) {
            // Count current approved registrations within transaction
            const registrationsSnapshot = await getDocs(
              query(collection(db, 'registrations'), where('status', '==', 'approved'))
            );
            
            let currentCount = 0;
            registrationsSnapshot.forEach(doc => {
              const data = doc.data();
              if (data.workshop) {
                // Try exact match first
                let isMatch = data.workshop.toLowerCase().trim() === formData.workshop.toLowerCase().trim();
                
                // If no exact match, try fuzzy matching
                if (!isMatch) {
                  const registrationName = data.workshop.toLowerCase().replace(/[^a-z0-9]/g, '');
                  const formName = formData.workshop.toLowerCase().replace(/[^a-z0-9]/g, '');
                  isMatch = registrationName === formName;
                }
                
                if (isMatch) {
                  currentCount++;
                }
              }
            });

            if (currentCount >= selectedWorkshop.registrationLimit) {
              throw new Error(`Workshop is full. Registration limit of ${selectedWorkshop.registrationLimit} participants has been reached.`);
            }
          }
        }

        // Prepare registration data
        const registrationData = {
          fullName: formData.fullName,
          email: formData.email,
          mobile: formData.mobile,
          college: formData.college === 'other' ? formData.otherCollege : formData.college,
          prnNumber: formData.prnNumber,
          yearOfStudy: formData.yearOfStudy,
          stream: formData.stream === 'other' ? formData.otherStream : formData.stream,
          workshop: formData.workshop,
          preferredLanguage: formData.preferredLanguage,
          transactionId: adminSettings.paymentRequired ? formData.transactionId : 'FREE_REGISTRATION',
          paymentProofUrl: adminSettings.paymentRequired ? paymentProofUrl : '',
          registrationDate: new Date(),
          status: adminSettings.paymentRequired ? 'pending' : 'approved' // Auto-approve free registrations
        };

        // Add registration within transaction
        const registrationRef = doc(collection(db, 'registrations'));
        transaction.set(registrationRef, registrationData);
        
        // Add notification within transaction
        const notificationRef = doc(collection(db, 'notifications'));
        transaction.set(notificationRef, {
          type: 'new_registration',
          title: 'New Registration Received',
          message: `${formData.fullName} registered for ${formData.workshop}`,
          email: formData.email,
          workshop: formData.workshop,
          createdAt: new Date(),
          read: false
        });
      });
      
      // Set registered user data for celebration modal
      setRegisteredUserData({
        name: formData.fullName,
        workshop: formData.workshop,
        whatsappLink: adminSettings.whatsappGroups?.[formData.workshop] || null,
        isFreeRegistration: !adminSettings.paymentRequired
      });
      
      showSuccess('Registration submitted successfully! We will review your payment and contact you soon.');
      setShowCelebration(true);
      // setSuccess(true); // Removed to prevent success modal popup
    } catch (error) {
      console.error('Error submitting registration:', error);
      if (error.message.includes('Workshop is full')) {
        showError(error.message);
      } else {
        showError('Registration failed. Please try again.');
      }
    }

    setLoading(false);
  };

  // Show loading screen while settings are being loaded
  if (settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading registration form...</p>
        </div>
      </div>
    );
  }


  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>
          <p className="text-gray-600 mb-6">
            Your registration has been submitted successfully. We'll review your payment and contact you soon.
          </p>
          <button
            onClick={() => {
              setSuccess(false);
              setCurrentStep(1);
              setRecaptchaToken(null);
              setFormData({
                fullName: '', email: '', mobile: '', college: '', otherCollege: '',
                prnNumber: '', yearOfStudy: '', stream: '', otherStream: '', workshop: '',
                preferredLanguage: '', transactionId: '', paymentProof: null
              });
            }}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Register Another Person
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center mb-4 sm:mb-0">
              <img className="h-20 sm:h-24" src={"./Invicta.png"} alt="INVICTA 2025" />
              <div className="ml-4 text-left hidden lg:block">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">INVICTA 2025</h1>
                <p className="text-sm text-gray-600 ">Workshop Registration</p>
              </div>
            </div>
            
            {/* Highlighted About Button */}
            <div className="flex flex-col items-center sm:items-end">
              <button
                onClick={() => window.location.href = '/about'}
                className="group relative bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white font-bold py-3 px-6 rounded-full hover:from-purple-700 hover:via-indigo-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-xl animate-pulse hover:animate-none"
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span className="text-sm sm:text-base">View About INVICTA</span>
                </div>
                
                {/* Glowing effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-full blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
              </button>
              
              <p className="text-xs text-gray-500 mt-2 text-center">
                🎯 Discover all workshops & benefits
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Sidebar - Steps & Info */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Registration Steps</h3>
              
              {/* Step Indicators */}
              <div className="space-y-4">
                <div className={`flex items-center p-3 rounded-lg transition-colors ${
                  currentStep === 1 ? 'bg-indigo-50 border-2 border-indigo-200' : 
                  currentStep > 1 ? 'bg-green-50 border-2 border-green-200' : 'bg-gray-50 border-2 border-gray-200'
                }`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    currentStep === 1 ? 'bg-indigo-600 text-white' :
                    currentStep > 1 ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>
                    {currentStep > 1 ? '✓' : '1'}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Personal Information</p>
                    <p className="text-xs text-gray-500">Basic details & academic info</p>
                  </div>
                </div>
                
                {adminSettings.paymentRequired && (
                  <div className={`flex items-center p-3 rounded-lg transition-colors ${
                    currentStep === 2 ? 'bg-indigo-50 border-2 border-indigo-200' : 
                    currentStep > 2 ? 'bg-green-50 border-2 border-green-200' : 'bg-gray-50 border-2 border-gray-200'
                  }`}>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      currentStep === 2 ? 'bg-indigo-600 text-white' :
                      currentStep > 2 ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
                    }`}>
                      {currentStep > 2 ? '✓' : '2'}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Payment Details</p>
                      <p className="text-xs text-gray-500">Payment & verification</p>
                    </div>
                  </div>
                )}
                
                {!adminSettings.paymentRequired && (
                  <div className="flex items-center p-3 rounded-lg bg-green-50 border-2 border-green-200">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold bg-green-600 text-white">
                      ✓
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">FREE Registration</p>
                      <p className="text-xs text-gray-500">No payment required</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Event Info */}
              <div className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Event Highlights</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Technical workshops</li>
                  <li>• Domain experts</li>
                  <li>• Networking opportunities</li>
                  <li>• Certificates & prizes</li>
                </ul>
              </div>

              {/* Learn More About INVICTA - Highlighted */}
              <div className="mt-6 p-4 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-xl shadow-lg relative overflow-hidden">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0 bg-white transform rotate-12 scale-150"></div>
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    <h4 className="text-sm font-bold text-white">Want to Know More?</h4>
                  </div>
                  
                  <p className="text-xs text-white/90 mb-4 leading-relaxed">
                    Explore detailed workshop information, schedules, and benefits before registering!
                  </p>
                  
                  <button
                    onClick={() => window.location.href = '/about'}
                    className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 text-xs backdrop-blur-sm border border-white/30 hover:scale-105 transform"
                  >
                    <div className="flex items-center justify-center">
                      <span>View All Workshops</span>
                      <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                      </svg>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Form Area */}
          <div className="lg:col-span-9">

        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <div className="bg-white py-6 px-4 shadow sm:rounded-lg sm:px-8 lg:px-10 transform transition-all duration-500 ease-in-out animate-fade-in">
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleNextStep(); }}>
              <div className="text-center mb-8">
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">Step 1: Personal Information</h3>
                <p className="text-sm text-gray-600">Please fill in your details carefully</p>
              </div>
              
              {emailExists && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm">
                    ⚠️ You have already registered with this email address.
                  </p>
                </div>
              )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Section - Personal Details */}
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-gray-900 border-b border-indigo-200 pb-2 mb-4">👤 Personal Details</h4>
                
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                    Full Name *
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 sm:text-sm ${
                      validationErrors.fullName ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {validationErrors.fullName && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.fullName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 sm:text-sm ${
                      validationErrors.email || emailExists ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'
                    }`}
                    placeholder="Enter your email address"
                  />
                  {validationErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
                    Mobile Number *
                  </label>
                  <input
                    id="mobile"
                    name="mobile"
                    type="tel"
                    required
                    value={formData.mobile}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 sm:text-sm ${
                      validationErrors.mobile ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'
                    }`}
                    placeholder="Enter 10-digit mobile number"
                    maxLength="10"
                  />
                  {validationErrors.mobile && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.mobile}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="prnNumber" className="block text-sm font-medium text-gray-700">
                    PRN Number <span className="text-gray-500 font-normal">(Optional)</span>
                  </label>
                  <input
                    id="prnNumber"
                    name="prnNumber"
                    type="text"
                    value={formData.prnNumber}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 sm:text-sm ${
                      validationErrors.prnNumber ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'
                    }`}
                    placeholder="Enter your PRN number (optional, 8-15 characters)"
                  />
                  {validationErrors.prnNumber && (
                    <p className="mt-1 text-xs text-red-600">{validationErrors.prnNumber}</p>
                  )}
                </div>
              </div>

              {/* Right Section - Academic & Workshop Details */}
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-gray-900 border-b border-indigo-200 pb-2 mb-4">🎓 Academic & Workshop Details</h4>
                
                <div>
                  <label htmlFor="college" className="block text-sm font-medium text-gray-700">
                    College *
                  </label>
                  <select
                    id="college"
                    name="college"
                    required
                    value={formData.college}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 sm:text-sm ${
                      validationErrors.college ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'
                    }`}
                  >
                    <option value="">Select college</option>
                    {adminSettings.colleges.map((college) => (
                      <option key={college} value={college}>{college}</option>
                    ))}
                    <option value="other">Other</option>
                  </select>
                  {validationErrors.college && (
                    <p className="mt-1 text-xs text-red-600">{validationErrors.college}</p>
                  )}
                </div>

                {formData.college === 'other' && (
                  <div>
                    <label htmlFor="otherCollege" className="block text-sm font-medium text-gray-700">
                      Other College Name *
                    </label>
                    <input
                      id="otherCollege"
                      name="otherCollege"
                      type="text"
                      required
                      value={formData.otherCollege}
                      onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 sm:text-sm ${
                        validationErrors.otherCollege ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'
                      }`}
                      placeholder="Enter your college name"
                    />
                    {validationErrors.otherCollege && (
                      <p className="mt-1 text-xs text-red-600">{validationErrors.otherCollege}</p>
                    )}
                  </div>
                )}

                <div>
                  <label htmlFor="yearOfStudy" className="block text-sm font-medium text-gray-700">
                    Year of Study *
                  </label>
                  <select
                    id="yearOfStudy"
                    name="yearOfStudy"
                    required
                    value={formData.yearOfStudy}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 sm:text-sm ${
                      validationErrors.yearOfStudy ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'
                    }`}
                  >
                    <option value="">Select year</option>
                    {adminSettings.years.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  {validationErrors.yearOfStudy && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.yearOfStudy}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="stream" className="block text-sm font-medium text-gray-700">
                    Stream *
                  </label>
                  <select
                    id="stream"
                    name="stream"
                    required
                    value={formData.stream}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 sm:text-sm ${
                      validationErrors.stream ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'
                    }`}
                  >
                    <option value="">Select stream</option>
                    {adminSettings.streams.map((stream) => (
                      <option key={stream} value={stream}>{stream}</option>
                    ))}
                    <option value="other">Other</option>
                  </select>
                  {validationErrors.stream && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.stream}</p>
                  )}
                </div>

                {formData.stream === 'other' && (
                  <div>
                    <label htmlFor="otherStream" className="block text-sm font-medium text-gray-700">
                      Other Stream *
                    </label>
                    <input
                      id="otherStream"
                      name="otherStream"
                      type="text"
                      required
                      value={formData.otherStream}
                      onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 sm:text-sm ${
                        validationErrors.otherStream ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'
                      }`}
                      placeholder="Enter your stream"
                    />
                    {validationErrors.otherStream && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.otherStream}</p>
                    )}
                  </div>
                )}

                <div>
                  <label htmlFor="workshop" className="block text-sm font-medium text-gray-700">
                    Workshop Selection *
                  </label>
                  <select
                    id="workshop"
                    name="workshop"
                    required
                    value={formData.workshop}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 sm:text-sm ${
                      validationErrors.workshop ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'
                    }`}
                  >
                    <option value="">Select a workshop</option>
                    {adminSettings.workshops.map((workshop) => (
                      <option key={workshop} value={workshop}>{workshop}</option>
                    ))}
                  </select>
                  {validationErrors.workshop && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.workshop}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="preferredLanguage" className="block text-sm font-medium text-gray-700">
                    Preferred/Native Language *
                  </label>
                  <div className="mt-2 space-y-2">
                    {adminSettings.languages.map((language) => (
                      <label key={language} className="flex items-center">
                        <input
                          type="radio"
                          name="preferredLanguage"
                          value={language}
                          checked={formData.preferredLanguage === language}
                          onChange={handleChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700 flex items-center">
                          {language}
                          {formData.preferredLanguage === language && (
                            <span className="ml-2 text-green-600">✓</span>
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                  {validationErrors.preferredLanguage && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.preferredLanguage}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button
                type="button"
                onClick={handleNextStep}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {adminSettings.paymentRequired ? 'Next: Payment Information →' : 'Complete Free Registration'}
              </button>
            </div>
            </form>
          </div>
        )}

        {/* Step 2: Payment Information - Only show if payment is required */}
        {currentStep === 2 && adminSettings.paymentRequired && (
          <div className="bg-white rounded-lg shadow-lg p-8 transform transition-all duration-500 ease-in-out animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Step 2: Complete Payment</h3>
              <button
                onClick={() => setCurrentStep(1)}
                className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
              >
                ← Back to Personal Info
              </button>
            </div>

            {/* Payment Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h4 className="text-lg font-medium text-blue-900 mb-4">Payment Instructions</h4>
              
              {/* QR Code Section */}
              <div className="text-center mb-6">
                {adminSettings.qrCodeUrl ? (
                  <div>
                    <img 
                      src={adminSettings.qrCodeUrl} 
                      alt="Payment QR Code" 
                      className="mx-auto w-48 h-48 border border-gray-300 rounded-lg"
                    />
                    <a 
                      href={adminSettings.qrCodeUrl} 
                      download="payment-qr.png"
                      className="inline-block mt-2 text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                    >
                      📥 Download QR Code
                    </a>
                  </div>
                ) : (
                  <div className="w-48 h-48 mx-auto bg-gray-200 border border-gray-300 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">QR Code will appear here</span>
                  </div>
                )}
              </div>

              {/* Step-by-Step Process */}
              <div className="space-y-3 mb-6">
                <h5 className="font-medium text-gray-900">Step-by-Step Payment Process:</h5>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-medium mr-3">1</span>
                    <span>Download the QR code above or scan it directly</span>
                  </div>
                  <div className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-medium mr-3">2</span>
                    <span>Open any UPI payment app (PhonePe, GPay, Paytm, etc.)</span>
                  </div>
                  <div className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-medium mr-3">3</span>
                    <span>Scan the QR code or use UPI ID: {adminSettings.upiId}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-medium mr-3">4</span>
                    <span>Pay exactly ₹{adminSettings.amount}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-medium mr-3">5</span>
                    <span>Take a screenshot of the payment confirmation</span>
                  </div>
                  <div className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-medium mr-3">6</span>
                    <span>Upload the screenshot below and enter transaction ID</span>
                  </div>
                </div>
              </div>

              {/* Account Details */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h5 className="font-medium text-gray-900 mb-3">Account Details</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Account Name:</span>
                    <p className="text-gray-900">{adminSettings.accountName}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">UPI ID:</span>
                    <p className="text-gray-900">{adminSettings.upiId}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Amount:</span>
                    <p className="text-gray-900 font-semibold">₹{adminSettings.amount}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="transactionId" className="block text-sm font-medium text-gray-700">
                  Payment Transaction ID *
                </label>
                <input
                  id="transactionId"
                  name="transactionId"
                  type="text"
                  required
                  value={formData.transactionId}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter payment transaction ID"
                />
              </div>

              <div>
                <label htmlFor="paymentProof" className="block text-sm font-medium text-gray-700">
                  Payment Proof Screenshot *
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="paymentProof" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                        <span>Click to upload payment screenshot</span>
                        <input
                          id="paymentProof"
                          name="paymentProof"
                          type="file"
                          required
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleChange}
                          className="sr-only"
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">
                      Upload screenshot of ₹{adminSettings.amount} payment. Supported formats: JPEG, PNG, WebP (Max 5MB)
                    </p>
                    {formData.paymentProof && (
                      <p className="text-sm text-green-600 font-medium">
                        ✓ {formData.paymentProof.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* reCAPTCHA - Only show if enabled in admin settings */}
              {adminSettings.enableRecaptcha && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Security Verification
                  </label>
                  <ReCaptcha 
                    onVerify={handleRecaptchaVerify}
                    onExpire={handleRecaptchaExpire}
                    onError={handleRecaptchaError}
                  />
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : 'Complete Registration'}
                </button>
              </div>
            </form>
          </div>
        )}
          </div>
        </div>
      </div>

      {/* Celebration Modal */}
      <CelebrationModal
        isOpen={showCelebration}
        onClose={() => {
          setShowCelebration(false);
          // Keep the success state and form data - no reset functionality
        }}
        userName={registeredUserData?.name}
        workshop={registeredUserData?.workshop}
        whatsappLink={registeredUserData?.whatsappLink}
        isFreeRegistration={registeredUserData?.isFreeRegistration}
      />

      {/* Registration Closed Modal */}
      {showClosedModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <img className="h-12 w-auto mr-3" src="/Invicta.png" alt="INVICTA 2025" />
                    <h3 className="text-xl font-bold text-gray-900">INVICTA 2025</h3>
                  </div>
                  <button
                    onClick={() => setShowClosedModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="text-center">
                  <div className="mb-6">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                      <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                      </svg>
                    </div>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Registrations Closed</h2>
                  <p className="text-gray-600 mb-6">
                    Registration for INVICTA 2025 workshops is currently closed as all workshops have reached their maximum capacity.
                  </p>
                  
                  {/* Dynamic Spot Entry Message */}
                  {adminSettings.spotEntryEnabled && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
                      <div className="flex items-center justify-center mb-3">
                        <svg className="h-6 w-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-lg font-semibold text-blue-900">Spot Entry Available</h3>
                      </div>
                      <p className="text-blue-800 text-sm leading-relaxed">
                        <strong>Good news!</strong> {adminSettings.spotEntryMessage}
                      </p>
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-2">
                      <strong>For inquiries and updates:</strong>
                    </p>
                    <p className="text-sm text-gray-600">
                      Please contact the event organizers or follow our official announcements for real-time updates on seat availability.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => setShowClosedModal(false)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
