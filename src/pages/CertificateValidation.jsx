import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

const CertificateValidation = () => {
  const { participantId } = useParams();
  const [loading, setLoading] = useState(true);
  const [participant, setParticipant] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const validateCertificate = async () => {
      if (!participantId) {
        setError('Invalid certificate ID');
        setLoading(false);
        return;
      }

      try {
        // Query registration by participant ID
        const q = query(
          collection(db, 'registrations'),
          where('participantId', '==', participantId)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          setError('Certificate not found or invalid');
        } else {
          const doc = querySnapshot.docs[0];
          const data = doc.data();
          
          if (!data.certificateURL) {
            setError('Certificate not issued for this participant');
          } else if (data.attendance !== 'present') {
            setError('Certificate not valid - participant was not marked present');
          } else {
            setParticipant({
              id: doc.id,
              ...data
            });
          }
        }
      } catch (error) {
        console.error('Error validating certificate:', error);
        setError('Error validating certificate');
      } finally {
        setLoading(false);
      }
    };

    validateCertificate();
  }, [participantId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Validating certificate...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                INVICTA 2025
              </h1>
              <p className="text-gray-600">Certificate Validation Portal</p>
            </div>
            <div className="flex space-x-4">
              <a
                href="/"
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-300"
              >
                Home
              </a>
              <a
                href="/certificates"
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-300"
              >
                Find Certificates
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error ? (
          /* Error State */
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 text-red-500">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Certificate Validation Failed
            </h2>
            <p className="text-xl text-red-600 mb-8">{error}</p>
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                What this means:
              </h3>
              <ul className="text-left text-gray-600 space-y-2 max-w-md mx-auto">
                <li>• The certificate ID may be incorrect or tampered with</li>
                <li>• The certificate may not have been issued yet</li>
                <li>• The participant may not have attended the workshop</li>
              </ul>
              <div className="mt-8">
                <a
                  href="/certificates"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
                >
                  <span>Search for Certificates</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        ) : (
          /* Valid Certificate */
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 text-green-500">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-green-600 mb-4">
              ✓ Certificate Verified
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              This certificate is authentic and valid.
            </p>

            {/* Certificate Details */}
            <div className="bg-white rounded-xl shadow-xl p-8 mb-8">
              <div className="border-l-4 border-green-500 pl-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Certificate Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Participant Name
                      </label>
                      <p className="text-lg font-semibold text-gray-900">
                        {participant.name || participant.fullName}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Workshop
                      </label>
                      <p className="text-lg font-semibold text-gray-900">
                        {participant.workshop}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        College/Institution
                      </label>
                      <p className="text-lg text-gray-700">
                        {participant.college}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Certificate ID
                      </label>
                      <p className="text-lg font-mono text-gray-900 bg-gray-100 px-3 py-2 rounded">
                        {participant.participantId}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Year of Study
                      </label>
                      <p className="text-lg text-gray-700">
                        {participant.yearOfStudy}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Attendance Status
                      </label>
                      <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                        Present ✓
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Info */}
            <div className="bg-blue-50 rounded-xl p-6 mb-8">
              <h4 className="text-lg font-semibold text-blue-900 mb-3">
                Verification Information
              </h4>
              <div className="text-sm text-blue-800 space-y-2">
                <p>• This certificate was issued by INVICTA - The Workshop Series organizing committee</p>
                <p>• Organized by Team Mavericks at Kolhapur Institute of Technology's College of Engineering, Kolhapur</p>
                <p>• Workshop conducted on 12th and 13th October 2025</p>
                <p>• The participant successfully attended the workshop</p>
                <p>• Certificate authenticity verified through secure database</p>
                <p>• Verification performed on: {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.open(participant.certificateURL, '_blank')}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>View Certificate</span>
              </button>
              
              <a
                href="/certificates"
                className="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Find More Certificates</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificateValidation;
