import { useState, useEffect } from 'react';
import Sidebar from '../components/docs/Sidebar';
import ModuleContent from '../components/docs/ModuleContent';
import WelcomePopup from '../components/docs/WelcomePopup';
import { moduleData } from '../data/moduleData';
import logo from "../../public/Logo.png"

const BuildItBetter = () => {
  const [activeModule, setActiveModule] = useState('internet-basics');
  const [activeSection, setActiveSection] = useState(0);
  const [progress, setProgress] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [userName, setUserName] = useState('');

  // Load progress and user data from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('buildItBetter-progress');
    const savedUserName = localStorage.getItem('buildItBetter-userName');
    
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress));
    }
    
    if (savedUserName) {
      setUserName(savedUserName);
    } else {
      // Show welcome popup if no user name is saved
      setShowWelcome(true);
    }
  }, []);

  // Save progress to localStorage
  const updateProgress = (moduleId, sectionIndex, completed = true) => {
    const newProgress = {
      ...progress,
      [moduleId]: {
        ...progress[moduleId],
        [sectionIndex]: completed
      }
    };
    setProgress(newProgress);
    localStorage.setItem('buildItBetter-progress', JSON.stringify(newProgress));
  };

  const handleModuleChange = (moduleId) => {
    setActiveModule(moduleId);
    setActiveSection(0);
  };

  const handleNameSubmit = (name) => {
    setUserName(name);
    localStorage.setItem('buildItBetter-userName', name);
  };

  const currentModule = moduleData[activeModule];
  const currentSection = currentModule?.sections[activeSection];

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center space-x-2">
            <img className="h-8 sm:h-10" src={logo} alt="INVICTA Logo" />
            {/* Show full title on desktop, abbreviated on mobile */}
            <h1 className="text-lg sm:text-2xl font-bold text-orange-400">
              <span className="hidden sm:inline">Build It Better</span>
              <span className="sm:hidden">Build It Better</span>
            </h1>
          </div>
        </div>
        
        {/* User info - Icons on mobile, text on desktop */}
        <div className="flex items-center space-x-2">
          {userName ? (
            <>
              {/* Desktop version */}
              <span className="hidden sm:inline text-sm text-gray-400">
                Welcome back, <span className="text-blue-400 font-medium">{userName}</span>! 👋
              </span>
              {/* Mobile version - User icon */}
              <div className="sm:hidden flex items-center space-x-1 bg-gray-700 px-2 py-1 rounded-lg">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-xs text-blue-400 font-medium">{userName.split(' ')[0]}</span>
              </div>
            </>
          ) : (
            <>
              {/* Desktop version */}
              <span className="hidden sm:inline text-sm text-gray-400">Web Development Workshop Documentation</span>
              {/* Mobile version - Documentation icon */}
              <div className="sm:hidden p-2 bg-gray-700 rounded-lg">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </>
          )}
        </div>
      </header>

      <div className="flex pt-16 h-screen">
        <Sidebar
          activeModule={activeModule}
          activeSection={activeSection}
          onModuleChange={handleModuleChange}
          onSectionChange={setActiveSection}
          progress={progress}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content */}
        <main className={`flex-1 overflow-y-auto transition-all duration-300 mt-10`}>
          <div className="p-6 max-w-5xl mx-auto">
            {currentModule && currentSection ? (
              <ModuleContent
                module={currentModule}
                section={currentSection}
                sectionIndex={activeSection}
                onSectionChange={setActiveSection}
                onProgressUpdate={updateProgress}
                progress={progress[activeModule] || {}}
              />
            ) : (
              <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-gray-400 mb-4">
                  Select a module to get started
                </h2>
                <p className="text-gray-500">
                  Choose a topic from the sidebar to begin learning
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Welcome Popup */}
      <WelcomePopup
        isOpen={showWelcome}
        onClose={() => setShowWelcome(false)}
        onNameSubmit={handleNameSubmit}
      />
    </div>
  );
};

export default BuildItBetter;
