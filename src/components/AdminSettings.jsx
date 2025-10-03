import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { uploadQRToCloudinary } from '../utils/cloudinary';
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

  useEffect(() => {
    loadSettings();
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
    </div>
  );
}
