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
  
  const { showToast } = useToast();
  const navigate = useNavigate();

  const searchCertificates = async () => {
    if (!searchValue.trim()) {
      if (showToast) {
        showToast('Please enter your email or mobile number', 'error');
      } else {
        alert('Please enter your email or mobile number');
      }
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
        if (showToast) {
          showToast('You didn\'t attend the workshop for two days. Please contact the organizers.', 'error');
        }
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
        if (showToast) {
          showToast('No certificates found for the provided information', 'error');
        }
      }
    } catch (error) {
      console.error('❌ Error searching certificates:', error);
      if (showToast) {
        showToast('Error searching certificates. Please try again.', 'error');
      } else {
        alert('Error searching certificates. Please try again.');
      }
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">INVICTA 2025</h1>
              <p className="text-gray-600">Certificate Portal</p>
            </div>
            <div className="flex space-x-4">
              <a
                href="/"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Home
              </a>
              <a
                href="/about"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                About
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            🎓 Certificate Hunt Begins! 🎓
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
            Ready to claim your digital badge of honor? Let's see if you actually showed up! 😄
          </p>
          
          {/* Workshop Series Information */}
          <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl p-6 mb-8 max-w-4xl mx-auto">
            <div className="text-lg font-semibold text-indigo-800 mb-3">
              📚 About INVICTA - The Workshop Series
            </div>
            <p className="text-indigo-700 text-left leading-relaxed">
              <strong>INVICTA The Workshop Series</strong>, organized by Team Mavericks at Kolhapur Institute of Technology's College of Engineering, Kolhapur (Empowered Autonomous), was successfully conducted on <strong>12th and 13th October 2025</strong>.
            </p>
            <br />
            <p className="text-indigo-700 text-left leading-relaxed">
              The series featured four specialized hands-on workshops namely <strong>Build It Better</strong>, <strong>Think, Blink & Build</strong>, <strong>BlendForge</strong> and <strong>CamVision</strong>. Each workshop was designed to enhance students' practical understanding through immersive and activity-based learning sessions.
            </p>
          </div>
          
          {/* Funny Taunts Carousel */}
          <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl p-6 mb-8 max-w-3xl mx-auto">
            <div className="text-lg text-gray-700 font-medium mb-2">
              💡 Pro Tip of the Day:
            </div>
            <div className="text-gray-600 italic">
              {[
                "Hope you didn't sleep through the workshops like you did in college! 😴",
                "Time to prove you were more than just a WiFi password hunter! 📶",
                "Let's see if your attendance was better than your coding skills! 💻",
                "Searching for certificates? At least you're not searching for bugs this time! 🐛",
                "Certificate loading... Please wait while we check if you actually participated! ⏳",
                "Fun fact: Certificates don't debug themselves, unlike your code! 🔧",
                "Warning: May contain traces of actual learning and skill development! ⚠️"
              ][Math.floor(Math.random() * 7)]
            }
            </div>
          </div>
          
          {/* Good Wishes */}
          <div className="bg-gradient-to-r from-green-100 to-yellow-100 rounded-2xl p-6 max-w-3xl mx-auto">
            <div className="text-lg font-semibold text-green-800 mb-2">
              🌟 Congratulations, Future Tech Star! 🌟
            </div>
            <p className="text-green-700">
              You've completed an amazing journey at INVICTA 2025! Whether you mastered new frameworks, 
              conquered coding challenges, or just survived our coffee-fueled sessions, you're now officially 
              part of the INVICTA family. May your code compile on the first try and your bugs be minimal! 🚀
            </p>
          </div>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Find Your Certificate</h3>
            <p className="text-gray-600">Enter the information you used during registration</p>
          </div>
          
          <div className="space-y-6">
            {/* Search Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Search by:
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    value="email"
                    checked={searchType === 'email'}
                    onChange={(e) => setSearchType(e.target.value)}
                    className="mr-3 text-blue-600"
                  />
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                    <span className="text-gray-700 font-medium">Email Address</span>
                  </div>
                </label>
                <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    value="mobile"
                    checked={searchType === 'mobile'}
                    onChange={(e) => setSearchType(e.target.value)}
                    className="mr-3 text-blue-600"
                  />
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-gray-700 font-medium">Mobile Number</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Search Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {searchType === 'email' ? 'Email Address' : 'Mobile Number'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {searchType === 'email' ? (
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  )}
                </div>
                <input
                  type={searchType === 'email' ? 'email' : 'tel'}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder={searchType === 'email' ? 'Enter your email address' : 'Enter your mobile number'}
                  className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  onKeyPress={(e) => e.key === 'Enter' && searchCertificates()}
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                {searchType === 'email' 
                  ? 'Use the same email address you provided during workshop registration'
                  : 'Use the same mobile number you provided during workshop registration'
                }
              </p>
            </div>

            {/* Search Button */}
            <button
              onClick={searchCertificates}
              disabled={loading || !searchValue.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Searching...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Find My Certificates</span>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        {searched && (
          <div className="space-y-6">
            {certificates.length > 0 ? (
              <>
                <h3 className="text-2xl font-bold text-gray-900 text-center">
                  Your Certificates ({certificates.length})
                </h3>
                <div className="grid gap-6">
                  {certificates.map((cert) => (
                    <div
                      key={cert.id}
                      className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="text-xl font-semibold text-gray-900 mb-2">
                            {cert.workshop}
                          </h4>
                          <div className="space-y-1 text-gray-600">
                            <p><span className="font-medium">Name:</span> {cert.name}</p>
                            <p><span className="font-medium">College:</span> {cert.college}</p>
                            <p><span className="font-medium">Year:</span> {cert.yearOfStudy}</p>
                            {cert.participantId && (
                              <p><span className="font-medium">Certificate ID:</span> {cert.participantId}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col space-y-3 ml-6">
                          <button
                            onClick={() => window.open(cert.certificateURL, '_blank')}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>View</span>
                          </button>
                          
                          <button
                            onClick={() => downloadCertificate(cert.certificateURL, cert.name, cert.workshop)}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Download</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <div className="w-24 h-24 mx-auto mb-6 text-gray-400">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  No Certificates Found
                </h3>
                <p className="text-gray-600 mb-8">
                  We couldn't find any certificates for the provided information.
                </p>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
                  <h4 className="text-lg font-semibold text-yellow-800 mb-3">Please check:</h4>
                  <ul className="text-left text-yellow-700 space-y-2">
                    <li className="flex items-start space-x-2">
                      <span className="text-yellow-500 mt-1">•</span>
                      <span>You entered the correct email/mobile number used during registration</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-yellow-500 mt-1">•</span>
                      <span>Your attendance was marked as "Present" for the workshop</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-yellow-500 mt-1">•</span>
                      <span>The certificate has been uploaded by the admin</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-yellow-500 mt-1">•</span>
                      <span>You completed the workshop and met all requirements</span>
                    </li>
                  </ul>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => {
                      setSearchValue('');
                      setSearched(false);
                    }}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Try Again
                  </button>
                  <a
                    href="mailto:support@invicta2025.com"
                    className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Contact Support
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Certificates;
