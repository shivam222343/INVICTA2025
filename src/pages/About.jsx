import { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function About() {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [registrationCounts, setRegistrationCounts] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [adminSettings, setAdminSettings] = useState({
    spotEntryEnabled: true,
    spotEntryMessage: 'Spot entries will be allowed if seats become available due to cancellations or no-shows. Please arrive at the venue early on the workshop day to secure your spot.'
  });

  useEffect(() => {
    loadWorkshops();
    loadAdminSettings();
    
    // Set up interval to refresh registration counts every 30 seconds
    const interval = setInterval(() => {
      if (workshops.length > 0) {
        loadRegistrationCounts(workshops);
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [workshops.length]);

  const loadAdminSettings = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, 'adminSettings', 'formConfig'));
      if (settingsDoc.exists()) {
        const data = settingsDoc.data();
        setAdminSettings({
          spotEntryEnabled: data.spotEntryEnabled ?? true,
          spotEntryMessage: data.spotEntryMessage || 'Spot entries will be allowed if seats become available due to cancellations or no-shows. Please arrive at the venue early on the workshop day to secure your spot.'
        });
      }
    } catch (error) {
      console.error('Error loading admin settings:', error);
    }
  };

  const loadWorkshops = async () => {
    try {
      // Load workshops from admin settings
      const settingsDoc = await getDoc(doc(db, 'adminSettings', 'aboutWorkshops'));
      if (settingsDoc.exists()) {
        const workshopsData = settingsDoc.data().workshops || [];
        setWorkshops(workshopsData);
        
        // Load registration counts for each workshop
        await loadRegistrationCounts(workshopsData);
      }
    } catch (error) {
      console.error('Error loading workshops:', error);
    }
    setLoading(false);
  };

  const loadRegistrationCounts = async (workshopsData) => {
    try {
      const counts = {};
      
      // Get all approved registrations
      const registrationsSnapshot = await getDocs(
        query(collection(db, 'registrations'), where('status', '==', 'approved'))
      );
      
      // Count registrations per workshop with case-insensitive matching
      const allRegistrations = [];
      registrationsSnapshot.forEach(doc => {
        const data = doc.data();
        const workshop = data.workshop;
        if (workshop) {
          allRegistrations.push(workshop);
          // Find matching workshop name from workshopsData (case-insensitive)
          let matchingWorkshop = workshopsData.find(w => 
            w.name.toLowerCase().trim() === workshop.toLowerCase().trim()
          );
          
          // If no exact match, try fuzzy matching for common variations
          if (!matchingWorkshop) {
            matchingWorkshop = workshopsData.find(w => {
              const workshopName = w.name.toLowerCase().replace(/[^a-z0-9]/g, '');
              const registrationName = workshop.toLowerCase().replace(/[^a-z0-9]/g, '');
              return workshopName === registrationName;
            });
          }
          
          const workshopKey = matchingWorkshop ? matchingWorkshop.name : workshop;
          counts[workshopKey] = (counts[workshopKey] || 0) + 1;
        }
      });
      
      console.log('All workshop names in registrations:', [...new Set(allRegistrations)]);
      console.log('Workshop names from admin settings:', workshopsData.map(w => w.name));
      console.log('Registration counts loaded:', counts);
      setRegistrationCounts(counts);
    } catch (error) {
      console.error('Error loading registration counts:', error);
    }
  };

  const refreshCounts = async () => {
    setRefreshing(true);
    await loadRegistrationCounts(workshops);
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'TBA';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading INVICTA workshops...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img className="h-16 w-auto" src="/Invicta.png" alt="INVICTA 2025" />
              <div className="ml-4 hidden lg:block">
                <h1 className="text-2xl font-bold text-gray-900">About INVICTA 2025</h1>
                <p className="text-gray-600">Workshop Series</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={refreshCounts}
                disabled={refreshing}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Register Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 mb-6">
            INVICTA 2025
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8">
            A comprehensive workshop series designed to empower students and professionals with cutting-edge skills 
            in both technical and non-technical fields. Join us for an immersive learning experience that will 
            shape your future.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Multi-day Workshop Series
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Tech & Non-Tech Fields
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              Expert Instructors
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
              Hands-on Learning
            </div>
          </div>
        </div>

        {/* Workshops Grid */}
        {workshops.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {workshops.map((workshop, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                onClick={() => setSelectedWorkshop(workshop)}
              >
                {/* Workshop Image */}
                <div className="relative h-48 bg-gradient-to-br from-indigo-500 to-purple-600">
                  {workshop.posterImages && workshop.posterImages.length > 0 ? (
                    <img
                      src={workshop.posterImages[0]}
                      alt={workshop.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-white">
                      <div className="text-center">
                        <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <p className="font-semibold">{workshop.name}</p>
                      </div>
                    </div>
                  )}
                  <div className="absolute top-4 right-4 flex flex-col gap-1">
                    <span className="bg-white/90 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                      ₹{workshop.registrationFees || 'TBA'}
                    </span>
                    {workshop.registrationLimit && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        (registrationCounts[workshop.name] || 0) >= workshop.registrationLimit
                          ? 'bg-red-500 text-white'
                          : (registrationCounts[workshop.name] || 0) >= workshop.registrationLimit * 0.8
                          ? 'bg-yellow-500 text-white'
                          : 'bg-green-500 text-white'
                      }`}>
                        {registrationCounts[workshop.name] || 0}/{workshop.registrationLimit}
                      </span>
                    )}
                  </div>
                </div>

                {/* Workshop Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{workshop.name}</h3>
                  
                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(workshop.date)}
                    {workshop.duration && (
                      <>
                        <span className="mx-2">•</span>
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {workshop.duration}
                      </>
                    )}
                  </div>

                  <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                    {workshop.description}
                  </p>

                  {workshop.advantages && workshop.advantages.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Key Benefits:</h4>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {workshop.advantages.slice(0, 3).map((advantage, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="w-1 h-1 bg-indigo-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            {advantage}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {workshop.registrationLimit && (registrationCounts[workshop.name] || 0) >= workshop.registrationLimit ? (
                    <div className="w-full space-y-2">
                      <div className="bg-red-100 text-red-700 py-2 px-4 rounded-md text-sm font-medium text-center border border-red-200">
                        <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        Workshop Full
                      </div>
                      {adminSettings.spotEntryEnabled && (
                        <div className="bg-blue-50 text-blue-700 py-1 px-3 rounded-md text-xs text-center border border-blue-200">
                          Spot entries available on workshop day
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedWorkshop(workshop);
                      }}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-4 rounded-md hover:from-indigo-700 hover:to-purple-700 transition-colors text-sm font-medium"
                    >
                      View Details
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Workshops Coming Soon!</h3>
            <p className="text-gray-600 mb-6">
              We're preparing exciting workshops for INVICTA 2025. Stay tuned for updates!
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Register for Updates
            </button>
          </div>
        )}
      </div>

      {/* Workshop Detail Modal */}
      {selectedWorkshop && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setSelectedWorkshop(null)}></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">{selectedWorkshop.name}</h3>
                  <button
                    onClick={() => setSelectedWorkshop(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Desktop Layout: Poster Left, Info Right */}
                <div className="hidden md:grid md:grid-cols-2 gap-6">
                  {/* Left: Poster Images */}
                  <div>
                    {selectedWorkshop.posterImages && selectedWorkshop.posterImages.length > 0 ? (
                      <div className="space-y-4">
                        <img
                          src={selectedWorkshop.posterImages[0]}
                          alt={selectedWorkshop.name}
                          className="w-full h-auto object-cover rounded-lg shadow-lg"
                        />
                        {selectedWorkshop.posterImages.length > 1 && (
                          <div className="grid grid-cols-2 gap-2">
                            {selectedWorkshop.posterImages.slice(1).map((image, idx) => (
                              <img
                                key={idx + 1}
                                src={image}
                                alt={`${selectedWorkshop.name} ${idx + 2}`}
                                className="w-full h-24 object-cover rounded-lg"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-64 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                        <div className="text-center">
                          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <p className="font-semibold text-lg">{selectedWorkshop.name}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: Workshop Info */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Workshop Details</h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="font-medium">Date:</span>
                          <span className="ml-2">{formatDate(selectedWorkshop.date)}</span>
                        </div>
                        {selectedWorkshop.duration && (
                          <div className="flex items-center">
                            <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-medium">Duration:</span>
                            <span className="ml-2">{selectedWorkshop.duration}</span>
                          </div>
                        )}
                        {selectedWorkshop.location && (
                          <div className="flex items-center">
                            <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="font-medium">Location:</span>
                            <span className="ml-2">{selectedWorkshop.location}</span>
                          </div>
                        )}
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          <span className="font-medium">Registration Fee:</span>
                          <span className="ml-2 text-indigo-600 font-semibold">₹{selectedWorkshop.registrationFees || 'TBA'}</span>
                        </div>
                        {selectedWorkshop.registrationLimit && (
                          <div className="flex items-center">
                            <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span className="font-medium">Seats:</span>
                            <span className="ml-2">
                              {registrationCounts[selectedWorkshop.name] || 0} / {selectedWorkshop.registrationLimit} participants
                            </span>
                            {registrationCounts[selectedWorkshop.name] >= selectedWorkshop.registrationLimit && (
                              <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                                FULL
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="mt-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Description</h4>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {selectedWorkshop.description}
                        </p>
                      </div>
                    </div>

                    <div>
                      {selectedWorkshop.advantages && selectedWorkshop.advantages.length > 0 && (
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-3">Advantages of Participation</h4>
                          <ul className="space-y-2">
                            {selectedWorkshop.advantages.map((advantage, idx) => (
                              <li key={idx} className="flex items-start text-sm">
                                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                {advantage}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mobile Layout: Poster Top, Info Bottom */}
                <div className="md:hidden space-y-6">
                  {/* Poster Images */}
                  {selectedWorkshop.posterImages && selectedWorkshop.posterImages.length > 0 ? (
                    <div className="space-y-4">
                      <img
                        src={selectedWorkshop.posterImages[0]}
                        alt={selectedWorkshop.name}
                        className="w-full h-auto object-cover rounded-lg shadow-lg"
                      />
                      {selectedWorkshop.posterImages.length > 1 && (
                        <div className="grid grid-cols-2 gap-2">
                          {selectedWorkshop.posterImages.slice(1).map((image, idx) => (
                            <img
                              key={idx + 1}
                              src={image}
                              alt={`${selectedWorkshop.name} ${idx + 2}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                      <div className="text-center">
                        <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <p className="font-semibold">{selectedWorkshop.name}</p>
                      </div>
                    </div>
                  )}

                  {/* Workshop Info */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Workshop Details</h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="font-medium">Date:</span>
                          <span className="ml-2">{formatDate(selectedWorkshop.date)}</span>
                        </div>
                        {selectedWorkshop.duration && (
                          <div className="flex items-center">
                            <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-medium">Duration:</span>
                            <span className="ml-2">{selectedWorkshop.duration}</span>
                          </div>
                        )}
                        {selectedWorkshop.location && (
                          <div className="flex items-center">
                            <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="font-medium">Location:</span>
                            <span className="ml-2">{selectedWorkshop.location}</span>
                          </div>
                        )}
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          <span className="font-medium">Registration Fee:</span>
                          <span className="ml-2 text-indigo-600 font-semibold">₹{selectedWorkshop.registrationFees || 'TBA'}</span>
                        </div>
                        {selectedWorkshop.registrationLimit && (
                          <div className="flex items-center">
                            <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span className="font-medium">Seats:</span>
                            <span className="ml-2">
                              {registrationCounts[selectedWorkshop.name] || 0} / {selectedWorkshop.registrationLimit} participants
                            </span>
                            {registrationCounts[selectedWorkshop.name] >= selectedWorkshop.registrationLimit && (
                              <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                                FULL
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="mt-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Description</h4>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {selectedWorkshop.description}
                        </p>
                      </div>
                    </div>

                    <div>
                      {selectedWorkshop.advantages && selectedWorkshop.advantages.length > 0 && (
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-3">Advantages of Participation</h4>
                          <ul className="space-y-2">
                            {selectedWorkshop.advantages.map((advantage, idx) => (
                              <li key={idx} className="flex items-start text-sm">
                                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                {advantage}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6">
                {selectedWorkshop.registrationLimit && (registrationCounts[selectedWorkshop.name] || 0) >= selectedWorkshop.registrationLimit ? (
                  <div className="space-y-4">
                    {/* Workshop Full Message */}
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center justify-center mb-2">
                        <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <span className="text-red-800 font-semibold">Workshop Full</span>
                      </div>
                      <p className="text-red-700 text-sm text-center">
                        This workshop has reached its maximum capacity of {selectedWorkshop.registrationLimit} participants.
                      </p>
                    </div>

                    {/* Dynamic Spot Entry Information */}
                    {adminSettings.spotEntryEnabled && (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-center mb-2">
                          <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-blue-800 font-semibold">Spot Entry Available</span>
                        </div>
                        <p className="text-blue-700 text-sm text-center leading-relaxed">
                          <strong>Good news!</strong> {adminSettings.spotEntryMessage}
                        </p>
                      </div>
                    )}

                    <div className="flex justify-center">
                      <button
                        onClick={() => setSelectedWorkshop(null)}
                        className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center space-x-3">
                    <button
                      onClick={() => window.location.href = '/'}
                      className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                    >
                      Register Now
                    </button>
                    <button
                      onClick={() => setSelectedWorkshop(null)}
                      className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
