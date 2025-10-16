import { useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useToast } from '../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';

const Certificates = () => {
  const [searchType, setSearchType] = useState('email');
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [certificates, setCertificates] = useState([]);
  const [searched, setSearched] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Get time-based greeting
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    const workshopGreetings = {
      morning: [
        "☀️ Good Morning, Code Warrior! Ready to hunt for your Build It Better certificate?",
        "🌅 Rise and Shine! Time to see if your Think, Blink & Build skills earned you that digital badge!",
        "🌞 Morning, BlendForge Master! Let's see if you blended your way to success!",
        "🌄 Good Morning, CamVision Expert! Your certificate hunt begins now!"
      ],
      afternoon: [
        "🌤️ Good Afternoon, Workshop Champion! Time to claim your Build It Better trophy!",
        "☀️ Afternoon Greetings! Did your Think, Blink & Build magic work? Let's find out!",
        "🌻 Hey there, BlendForge Ninja! Ready to forge your certificate path?",
        "🌞 Afternoon, CamVision Guru! Let's focus on finding your achievement!"
      ],
      evening: [
        "🌅 Good Evening, Tech Explorer! Time to build your certificate collection!",
        "🌆 Evening, Innovation Seeker! Let's blink and build your success story!",
        "🌇 Hey Night Owl! Ready to blend your way to certificate glory?",
        "🌃 Evening, Vision Master! Time to capture your certificate moment!"
      ],
      night: [
        "🌙 Burning the midnight oil? Perfect time to hunt for your Build It Better badge!",
        "⭐ Late night certificate hunting? Your Think, Blink & Build journey awaits!",
        "🌟 Night Shift Developer! Let's forge your BlendForge certificate!",
        "🌌 Midnight Vision Quest! Time to focus on your CamVision achievement!"
      ]
    };

    let timeOfDay;
    if (hour >= 5 && hour < 12) timeOfDay = 'morning';
    else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
    else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
    else timeOfDay = 'night';

    const greetings = workshopGreetings[timeOfDay];
    return greetings[Math.floor(Math.random() * greetings.length)];
  };

  const showError = (message) => {
    setErrorMessage(message);
    setShowErrorModal(true);
  };

  const searchCertificates = async () => {
    if (!searchValue.trim()) {
      showError('Please enter your email or mobile number to search for certificates.');
      return;
    }

    console.log('🔍 Starting certificate search:', {
      searchType,
      searchValue: searchValue.trim()
    });

    try {
      setLoading(true);
      
      // Simplified query to avoid complex index requirements
      const q = query(
        collection(db, 'registrations'),
        where(searchType, '==', searchValue.trim())
      );
      
      const querySnapshot = await getDocs(q);
      let foundCertificates = [];
      
      console.log('📊 Primary search results:', querySnapshot.size, 'documents found');
      
      let hasAbsentUser = false;
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('📄 Document data:', {
          id: doc.id,
          hasURL: !!data.certificateURL,
          attendance: data.attendance,
          name: data.name || data.fullName,
          email: data.email,
          mobile: data.mobile
        });
        
        // Check if user exists but is marked absent
        if (data.attendance === 'absent') {
          hasAbsentUser = true;
        }
        
        // Filter for certificates with URL and present attendance
        if (data.certificateURL && data.attendance === 'present') {
          foundCertificates.push({
            id: doc.id,
            ...data
          });
        }
      });
      
      // If no certificates found but user exists as absent, show specific message
      if (foundCertificates.length === 0 && hasAbsentUser) {
        console.log('❌ User found but marked as absent');
        setCertificates([]);
        setSearched(true);
        showError('Oops! Looks like you were marked absent for the workshop. Please contact the organizers if this is incorrect.');
        return;
      }
      
      // If no certificates found with attendance filter, try without attendance requirement
      if (foundCertificates.length === 0) {
        console.log('🔄 No results with attendance filter, trying fallback search...');
        
        // Use the same query but filter differently
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          console.log('📄 Fallback document:', {
            id: doc.id,
            hasURL: !!data.certificateURL,
            attendance: data.attendance,
            name: data.name || data.fullName
          });
          
          // Just check for certificate URL, ignore attendance
          if (data.certificateURL) {
            foundCertificates.push({
              id: doc.id,
              ...data
            });
          }
        });
        
        console.log('📊 Fallback search results:', foundCertificates.length, 'certificates found');
      }
      
      console.log('✅ Final search results:', foundCertificates.length, 'certificates found');
      
      if (foundCertificates.length > 0) {
        console.log('🎉 Redirecting to user certificate page with:', foundCertificates);
        
        // Redirect to user-specific certificate page
        const userInfo = {
          searchType,
          searchValue: searchValue.trim(),
          certificates: foundCertificates
        };
        navigate('/my-certificates', { state: userInfo });
      } else {
        console.log('❌ No certificates found, showing error state');
        setCertificates([]);
        setSearched(true);
        showError('No certificates found for the provided information. Please check your details or contact support.');
      }
    } catch (error) {
      console.error('❌ Error searching certificates:', error);
      showError('Something went wrong while searching. Please try again or contact support if the issue persists.');
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = (certificateURL, participantName, workshop) => {
    const link = document.createElement('a');
    link.href = certificateURL;
    link.download = `${participantName}_${workshop}_Certificate.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-auto h-10  rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  <img className=" h-10" src="Invicta.png" alt="" />
                   <div>
                <p className="text-sm text-gray-600">Certificate Portal</p>
              </div>
                </span>
              </div>
             
            </div>
            <div className="flex space-x-6">
              <a href="/" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Home</a>
              <a href="/about" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">About</a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Time-based Greeting */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            {getTimeBasedGreeting()}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Enter your details below to discover your achievements
          </p>
        </div>

        {/* Professional Search Form */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
            <div className="flex items-center space-x-3">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <div>
                <h3 className="text-xl font-semibold text-white">Certificate Search</h3>
                <p className="text-blue-100">Find your INVICTA workshop certificates</p>
              </div>
            </div>
          </div>
          
          <div className="p-8">
            <div className="space-y-6">
              {/* Search Type Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-4">
                  How would you like to search?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    searchType === 'email' 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}>
                    <input
                      type="radio"
                      value="email"
                      checked={searchType === 'email'}
                      onChange={(e) => setSearchType(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center space-x-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        searchType === 'email' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                      }`}>
                        {searchType === 'email' && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <svg className={`w-5 h-5 ${searchType === 'email' ? 'text-blue-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                      <span className={`font-medium ${searchType === 'email' ? 'text-blue-900' : 'text-gray-700'}`}>
                        Email Address
                      </span>
                    </div>
                  </label>
                  
                  <label className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    searchType === 'mobile' 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}>
                    <input
                      type="radio"
                      value="mobile"
                      checked={searchType === 'mobile'}
                      onChange={(e) => setSearchType(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center space-x-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        searchType === 'mobile' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                      }`}>
                        {searchType === 'mobile' && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <svg className={`w-5 h-5 ${searchType === 'mobile' ? 'text-blue-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className={`font-medium ${searchType === 'mobile' ? 'text-blue-900' : 'text-gray-700'}`}>
                        Mobile Number
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Search Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  {searchType === 'email' ? 'Your Email Address' : 'Your Mobile Number'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    {searchType === 'email' ? (
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    )}
                  </div>
                  <input
                    type={searchType === 'email' ? 'email' : 'tel'}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder={searchType === 'email' ? 'Enter your email address' : 'Enter your mobile number'}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg placeholder-gray-400 transition-all"
                    onKeyPress={(e) => e.key === 'Enter' && searchCertificates()}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  {searchType === 'email' 
                    ? 'Use the exact email address from your registration'
                    : 'Use the exact mobile number from your registration'
                  }
                </p>
              </div>

              {/* Search Button */}
              <button
                onClick={searchCertificates}
                disabled={loading || !searchValue.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                    <span>Searching for your certificates...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Find My Certificates</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Workshop Info Section - After Form */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-3xl p-8 mb-8 border border-indigo-100">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
               <img className="w-8 h-8" src="Mavericks.png" alt="" />
            </div>
            <h3 className="text-xl font-bold text-indigo-900 mb-3">About INVICTA 2025</h3>
            <p className="text-indigo-700 text-sm leading-relaxed max-w-3xl mx-auto">
              <strong>INVICTA - The Workshop Series</strong> was conducted on <strong>12th & 13th October 2025</strong> by Team Mavericks at KIT's College of Engineering, Kolhapur. 
              Four specialized workshops: <strong>Build It Better</strong>, <strong>Think, Blink & Build</strong>, <strong>BlendForge</strong>, and <strong>CamVision</strong> enhanced practical learning through hands-on sessions.
            </p>
          </div>
        </div>

        {/* Error Modal */}
        {showErrorModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-pink-500 px-6 py-4">
                <div className="flex items-center space-x-3">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Oops!</h3>
                    <p className="text-red-100 text-sm">Something went wrong</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <p className="text-gray-700 mb-6 leading-relaxed">{errorMessage}</p>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setShowErrorModal(false)}
                    className="flex-1 bg-gray-600 text-white px-4 py-3 rounded-xl hover:bg-gray-700 transition-colors font-medium"
                  >
                    Got it
                  </button>
                  <button
                    onClick={() => {
                      setShowErrorModal(false);
                      setSearchValue('');
                      setSearched(false);
                    }}
                    className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Certificates;
