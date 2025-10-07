import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { uploadQRToCloudinary, uploadToCloudinary } from '../utils/cloudinary';
import { useToast } from '../contexts/ToastContext';

export default function AdminSettings() {
  const { success: showSuccess, error: showError } = useToast();
  const [settings, setSettings] = useState({
    qrCodeUrl: '',
    upiId: 'shivamdombe1@okaxis',
    accountName: 'Google User',
    amount: 200,
    enableRecaptcha: false, // Disabled by default
    registrationActive: true, // New setting to control registration status
    paymentRequired: true, // New setting to control payment requirement
    languages: ['Hindi', 'Marathi', 'English'], // Available language options
    colleges: ['Kit\'s College of Engineering Kolhapur'],
    years: ['First Year', 'Second Year', 'Third Year', 'Fourth Year'],
    streams: ['Computer Science and Business System', 'Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil'],
    workshops: ['Build it Better', 'Camvision', 'Crystal Clear', 'Blendforge', 'Think Blink and Build'],
    whatsappGroups: {
      'Build it Better': '',
      'Camvision': '',
      'Crystal Clear': '',
      'Blendforge': '',
      'Think Blink and Build': ''
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [qrFile, setQrFile] = useState(null);
  const [newCollege, setNewCollege] = useState('');
  const [newStream, setNewStream] = useState('');
  const [newWorkshop, setNewWorkshop] = useState('');
  
  // About page workshops state
  const [aboutWorkshops, setAboutWorkshops] = useState([]);
  const [showWorkshopModal, setShowWorkshopModal] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState(null);
  const [workshopForm, setWorkshopForm] = useState({
    name: '',
    date: '',
    duration: '',
    location: '',
    description: '',
    advantages: [''],
    registrationFees: '',
    registrationLimit: '',
    posterImages: []
  });
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    loadSettings();
    loadAboutWorkshops();
  }, []);

  const loadSettings = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, 'adminSettings', 'formConfig'));
      if (settingsDoc.exists()) {
        setSettings({ ...settings, ...settingsDoc.data() });
      }
    } catch (error) {
    }
  };

  const loadAboutWorkshops = async () => {
    try {
      const workshopsDoc = await getDoc(doc(db, 'adminSettings', 'aboutWorkshops'));
      if (workshopsDoc.exists()) {
        setAboutWorkshops(workshopsDoc.data().workshops || []);
      }
    } catch (error) {
      console.error('Error loading about workshops:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleWhatsAppGroupChange = (workshop, url) => {
    setSettings(prev => ({
      ...prev,
      whatsappGroups: {
        ...prev.whatsappGroups,
        [workshop]: url
      }
    }));
  };

  const handleQrUpload = (e) => {
    setQrFile(e.target.files[0]);
  };

  const addToArray = (arrayName, newValue, setNewValue) => {
    if (newValue.trim() && !settings[arrayName].includes(newValue.trim())) {
      setSettings({
        ...settings,
        [arrayName]: [...settings[arrayName], newValue.trim()]
      });
      setNewValue('');
    }
  };

  const removeFromArray = (arrayName, index) => {
    const newArray = settings[arrayName].filter((_, i) => i !== index);
    setSettings({ ...settings, [arrayName]: newArray });
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      let updatedSettings = { ...settings };

      // Upload QR code if new file is selected
      if (qrFile) {
        const qrUrl = await uploadQRToCloudinary(qrFile);
        updatedSettings.qrCodeUrl = qrUrl;
      }

      await setDoc(doc(db, 'adminSettings', 'formConfig'), updatedSettings);
      setSettings(updatedSettings);
      setQrFile(null);
      showSuccess('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      showError('Failed to save settings. Please try again.');
    }
    setLoading(false);
  };

  // Workshop Management Functions
  const handleWorkshopFormChange = (e) => {
    const { name, value } = e.target;
    setWorkshopForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAdvantageChange = (index, value) => {
    const newAdvantages = [...workshopForm.advantages];
    newAdvantages[index] = value;
    setWorkshopForm(prev => ({
      ...prev,
      advantages: newAdvantages
    }));
  };

  const addAdvantage = () => {
    setWorkshopForm(prev => ({
      ...prev,
      advantages: [...prev.advantages, '']
    }));
  };

  const removeAdvantage = (index) => {
    const newAdvantages = workshopForm.advantages.filter((_, i) => i !== index);
    setWorkshopForm(prev => ({
      ...prev,
      advantages: newAdvantages
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingImages(true);
    try {
      const uploadPromises = files.map(file => uploadToCloudinary(file, 'workshop-posters'));
      const imageUrls = await Promise.all(uploadPromises);
      
      setWorkshopForm(prev => ({
        ...prev,
        posterImages: [...prev.posterImages, ...imageUrls]
      }));
      
      showSuccess(`${files.length} image(s) uploaded successfully!`);
    } catch (error) {
      console.error('Error uploading images:', error);
      showError('Failed to upload images. Please try again.');
    }
    setUploadingImages(false);
  };

  const removeImage = (index) => {
    setWorkshopForm(prev => ({
      ...prev,
      posterImages: prev.posterImages.filter((_, i) => i !== index)
    }));
  };

  const openWorkshopModal = (workshop = null) => {
    if (workshop) {
      setEditingWorkshop(workshop);
      setWorkshopForm(workshop);
    } else {
      setEditingWorkshop(null);
      setWorkshopForm({
        name: '',
        date: '',
        duration: '',
        location: '',
        description: '',
        advantages: [''],
        registrationFees: '',
        registrationLimit: '',
        posterImages: []
      });
    }
    setShowWorkshopModal(true);
  };

  const closeWorkshopModal = () => {
    setShowWorkshopModal(false);
    setEditingWorkshop(null);
    setWorkshopForm({
      name: '',
      date: '',
      duration: '',
      location: '',
      description: '',
      advantages: [''],
      registrationFees: '',
      registrationLimit: '',
      posterImages: []
    });
  };

  const saveWorkshop = async () => {
    if (!workshopForm.name.trim()) {
      showError('Workshop name is required');
      return;
    }

    try {
      setLoading(true);
      
      // Filter out empty advantages
      const cleanedAdvantages = workshopForm.advantages.filter(adv => adv.trim() !== '');
      const workshopData = {
        ...workshopForm,
        advantages: cleanedAdvantages
      };

      let updatedWorkshops;
      if (editingWorkshop) {
        // Update existing workshop
        const index = aboutWorkshops.findIndex(w => w === editingWorkshop);
        updatedWorkshops = [...aboutWorkshops];
        updatedWorkshops[index] = workshopData;
      } else {
        // Add new workshop
        updatedWorkshops = [...aboutWorkshops, workshopData];
      }

      // Save to Firebase
      await setDoc(doc(db, 'adminSettings', 'aboutWorkshops'), {
        workshops: updatedWorkshops
      });

      setAboutWorkshops(updatedWorkshops);
      closeWorkshopModal();
      showSuccess(`Workshop ${editingWorkshop ? 'updated' : 'added'} successfully!`);
    } catch (error) {
      console.error('Error saving workshop:', error);
      showError('Failed to save workshop. Please try again.');
    }
    setLoading(false);
  };

  const deleteWorkshop = async (workshopToDelete) => {
    if (!confirm('Are you sure you want to delete this workshop?')) return;

    try {
      setLoading(true);
      const updatedWorkshops = aboutWorkshops.filter(w => w !== workshopToDelete);
      
      await setDoc(doc(db, 'adminSettings', 'aboutWorkshops'), {
        workshops: updatedWorkshops
      });

      setAboutWorkshops(updatedWorkshops);
      showSuccess('Workshop deleted successfully!');
    } catch (error) {
      console.error('Error deleting workshop:', error);
      showError('Failed to delete workshop. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Registration Form Settings</h2>
      
      {/* Desktop: Two-column layout, Mobile: Single column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column */}
        <div className="space-y-8">
          {/* Payment Settings */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Settings</h3>
            <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              UPI ID
            </label>
            <input
              type="text"
              name="upiId"
              value={settings.upiId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Name
            </label>
            <input
              type="text"
              name="accountName"
              value={settings.accountName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Registration Fee (₹)
            </label>
            <input
              type="number"
              name="amount"
              value={settings.amount}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment QR Code
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleQrUpload}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {settings.qrCodeUrl && (
              <div className="mt-2">
                <img src={settings.qrCodeUrl} alt="Current QR Code" className="w-24 h-24 border rounded" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Enable reCAPTCHA Protection
              </label>
              <p className="text-sm text-gray-500 mt-1">
                Protect registration form from spam and bot submissions
              </p>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="enableRecaptcha"
                name="enableRecaptcha"
                checked={settings.enableRecaptcha}
                onChange={(e) => setSettings({ ...settings, enableRecaptcha: e.target.checked })}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="enableRecaptcha" className="ml-2 text-sm text-gray-700">
                {settings.enableRecaptcha ? 'Enabled' : 'Disabled'}
              </label>
            </div>
          </div>
          {settings.enableRecaptcha && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-blue-800 text-sm">
                <strong>Note:</strong> Make sure to add your reCAPTCHA site key to the environment variables:
                <code className="bg-blue-100 px-1 rounded ml-1">VITE_RECAPTCHA_SITE_KEY</code>
              </p>
            </div>
          )}
        </div>

        {/* Registration Status Control */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Registration Control</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <label htmlFor="registrationActive" className="text-sm font-medium text-gray-900">
                  Registration Status
                </label>
                <p className="text-sm text-gray-500">
                  Control whether new registrations are accepted
                </p>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="registrationActive"
                  name="registrationActive"
                  checked={settings.registrationActive}
                  onChange={(e) => setSettings({ ...settings, registrationActive: e.target.checked })}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="registrationActive" className={`ml-2 text-sm font-medium ${
                  settings.registrationActive ? 'text-green-700' : 'text-red-700'
                }`}>
                  {settings.registrationActive ? 'Active' : 'Closed'}
                </label>
              </div>
            </div>
            
            {!settings.registrationActive && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800 text-sm">
                  <strong>⚠️ Registration Closed:</strong> Users will see a "Registrations are closed" message on the registration page.
                </p>
              </div>
            )}
            
            {/* Payment Control */}
            <div className="flex items-center justify-between p-4 border rounded-lg mt-4">
              <div>
                <label htmlFor="paymentRequired" className="text-sm font-medium text-gray-900">
                  Payment Requirement
                </label>
                <p className="text-sm text-gray-500">
                  Control whether payment is required for registration
                </p>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="paymentRequired"
                  name="paymentRequired"
                  checked={settings.paymentRequired}
                  onChange={(e) => setSettings({ ...settings, paymentRequired: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="paymentRequired" className={`ml-2 text-sm font-medium ${
                  settings.paymentRequired ? 'text-blue-700' : 'text-green-700'
                }`}>
                  {settings.paymentRequired ? 'Required' : 'Free Registration'}
                </label>
              </div>
            </div>
            
            {!settings.paymentRequired && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-800 text-sm">
                  <strong>✅ Free Registration:</strong> Users will see "FREE REGISTRATION" instead of payment details.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>


        </div>
        
        {/* Right Column */}
        <div className="space-y-8">
          {/* Form Options */}
          <div className="space-y-8">
            {/* Colleges */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Colleges</h3>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newCollege}
                  onChange={(e) => setNewCollege(e.target.value)}
                  placeholder="Add new college"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => addToArray('colleges', newCollege, setNewCollege)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {settings.colleges.map((college, index) => (
                  <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                    {college}
                    <button
                      onClick={() => removeFromArray('colleges', index)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Streams */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Streams</h3>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newStream}
                  onChange={(e) => setNewStream(e.target.value)}
                  placeholder="Add new stream"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => addToArray('streams', newStream, setNewStream)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {settings.streams.map((stream, index) => (
                  <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                    {stream}
                    <button
                      onClick={() => removeFromArray('streams', index)}
                      className="ml-2 text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Workshops */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Workshops</h3>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newWorkshop}
                  onChange={(e) => setNewWorkshop(e.target.value)}
                  placeholder="Add new workshop"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => addToArray('workshops', newWorkshop, setNewWorkshop)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {settings.workshops.map((workshop, index) => (
                  <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                    {workshop}
                    <button
                      onClick={() => removeFromArray('workshops', index)}
                      className="ml-2 text-purple-600 hover:text-purple-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Language Preferences</h3>
              <p className="text-sm text-gray-600 mb-4">
                Available language options for participants to select their preferred/native language.
              </p>
              <div className="flex flex-wrap gap-2">
                {settings.languages.map((language, index) => (
                  <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
                    {language}
                    <button
                      onClick={() => {
                        const newLanguages = settings.languages.filter((_, i) => i !== index);
                        setSettings({ ...settings, languages: newLanguages });
                      }}
                      className="ml-2 text-yellow-600 hover:text-yellow-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2 mt-3">
                <input
                  type="text"
                  placeholder="Add new language"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim() && !settings.languages.includes(e.target.value.trim())) {
                      setSettings({
                        ...settings,
                        languages: [...settings.languages, e.target.value.trim()]
                      });
                      e.target.value = '';
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* WhatsApp Groups */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">WhatsApp Groups</h3>
              <p className="text-sm text-gray-600 mb-4">
                Set WhatsApp group links for each workshop. Registered users will see their respective group link.
              </p>
              <div className="space-y-4">
                {settings.workshops.map((workshop) => (
                  <div key={workshop}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {workshop}
                    </label>
                    <input
                      type="url"
                      value={settings.whatsappGroups?.[workshop] || ''}
                      onChange={(e) => handleWhatsAppGroupChange(workshop, e.target.value)}
                      placeholder="https://chat.whatsapp.com/..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* About Page Workshop Management */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">About Page Workshops</h3>
                <button
                  onClick={() => openWorkshopModal()}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm font-medium"
                >
                  Add Workshop
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Manage workshops displayed on the /about page with detailed information, images, and advantages.
              </p>
              
              {aboutWorkshops.length > 0 ? (
                <div className="space-y-4">
                  {aboutWorkshops.map((workshop, index) => (
                    <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{workshop.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {workshop.date && new Date(workshop.date).toLocaleDateString('en-IN')} 
                            {workshop.duration && ` • ${workshop.duration}`}
                            {workshop.location && ` • ${workshop.location}`}
                          </p>
                          <p className="text-sm text-gray-600">
                            {workshop.registrationFees && `₹${workshop.registrationFees}`}
                            {workshop.registrationLimit && ` • Max ${workshop.registrationLimit} participants`}
                          </p>
                          <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                            {workshop.description}
                          </p>
                          {workshop.posterImages && workshop.posterImages.length > 0 && (
                            <div className="flex gap-2 mt-2">
                              {workshop.posterImages.slice(0, 3).map((img, imgIdx) => (
                                <img
                                  key={imgIdx}
                                  src={img}
                                  alt={`${workshop.name} poster ${imgIdx + 1}`}
                                  className="w-12 h-12 object-cover rounded border"
                                />
                              ))}
                              {workshop.posterImages.length > 3 && (
                                <div className="w-12 h-12 bg-gray-200 rounded border flex items-center justify-center text-xs text-gray-500">
                                  +{workshop.posterImages.length - 3}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => openWorkshopModal(workshop)}
                            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteWorkshop(workshop)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <p className="text-gray-500 text-sm">No workshops added yet</p>
                  <button
                    onClick={() => openWorkshopModal()}
                    className="mt-2 text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                  >
                    Add your first workshop
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={saveSettings}
          disabled={loading}
          className="w-full py-3 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Workshop Modal */}
      {showWorkshopModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={closeWorkshopModal}></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingWorkshop ? 'Edit Workshop' : 'Add New Workshop'}
                  </h3>
                  <button
                    onClick={closeWorkshopModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Workshop Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={workshopForm.name}
                        onChange={handleWorkshopFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter workshop name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={workshopForm.date}
                        onChange={handleWorkshopFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duration
                      </label>
                      <input
                        type="text"
                        name="duration"
                        value={workshopForm.duration}
                        onChange={handleWorkshopFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g., 2 hours, 1 day, 3 days"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={workshopForm.location}
                        onChange={handleWorkshopFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter workshop location"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Registration Fees (₹)
                      </label>
                      <input
                        type="number"
                        name="registrationFees"
                        value={workshopForm.registrationFees}
                        onChange={handleWorkshopFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter amount"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Registration Limit
                      </label>
                      <input
                        type="number"
                        name="registrationLimit"
                        value={workshopForm.registrationLimit}
                        onChange={handleWorkshopFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Maximum participants (optional)"
                        min="1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Leave empty for unlimited registrations
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={workshopForm.description}
                        onChange={handleWorkshopFormChange}
                        rows="4"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Describe the workshop content and objectives"
                      />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    {/* Poster Images */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Poster Images
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                          disabled={uploadingImages}
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Upload multiple images for the workshop poster
                        </p>
                        
                        {uploadingImages && (
                          <div className="mt-2 flex items-center text-sm text-indigo-600">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                            Uploading images...
                          </div>
                        )}

                        {workshopForm.posterImages.length > 0 && (
                          <div className="mt-4 grid grid-cols-2 gap-2">
                            {workshopForm.posterImages.map((image, index) => (
                              <div key={index} className="relative">
                                <img
                                  src={image}
                                  alt={`Poster ${index + 1}`}
                                  className="w-full h-24 object-cover rounded border"
                                />
                                <button
                                  onClick={() => removeImage(index)}
                                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Advantages */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Advantages of Participation
                        </label>
                        <button
                          type="button"
                          onClick={addAdvantage}
                          className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                        >
                          + Add
                        </button>
                      </div>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {workshopForm.advantages.map((advantage, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={advantage}
                              onChange={(e) => handleAdvantageChange(index, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                              placeholder="Enter advantage"
                            />
                            {workshopForm.advantages.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeAdvantage(index)}
                                className="text-red-600 hover:text-red-800 px-2"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={saveWorkshop}
                  disabled={loading || uploadingImages}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : editingWorkshop ? 'Update Workshop' : 'Add Workshop'}
                </button>
                <button
                  onClick={closeWorkshopModal}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
