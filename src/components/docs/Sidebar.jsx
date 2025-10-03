import { useState } from 'react';
import { CheckCircleIcon, PlayCircleIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { moduleData } from '../../data/moduleData';

const modules = [
  {
    id: 'internet-basics',
    title: 'Internet Basics',
    icon: '🌐',
    sections: 5
  },
  {
    id: 'html',
    title: 'HTML',
    icon: '📄',
    sections: 4
  },
  {
    id: 'css',
    title: 'CSS',
    icon: '🎨',
    sections: 5
  },
  {
    id: 'javascript',
    title: 'JavaScript',
    icon: '⚡',
    sections: 6
  },
  {
    id: 'tailwindcss',
    title: 'TailwindCSS',
    icon: '💨',
    sections: 5
  },
  {
    id: 'react',
    title: 'React.js',
    sections: 7
  },
  {
    id: 'nodejs-express',
    title: 'Node & Express',
    icon: '🟢',
    sections: 5
  },
  {
    id: 'project',
    title: 'Project (Chatbot)',
    icon: '🤖',
    sections: 7
  }
];

const Sidebar = ({ activeModule, activeSection, onModuleChange, onSectionChange, progress, isOpen, onClose }) => {
  const [expandedModules, setExpandedModules] = useState({ [activeModule]: true });
  const getModuleProgress = (moduleId, sectionCount) => {
    const moduleProgress = progress[moduleId] || {};
    const completedSections = Object.values(moduleProgress).filter(Boolean).length;
    return Math.round((completedSections / sectionCount) * 100);
  };

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const handleSectionClick = (moduleId, sectionIndex) => {
    onModuleChange(moduleId);
    onSectionChange(sectionIndex);
    // Close mobile sidebar after navigation
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <aside className={`fixed left-0 top-16 h-full w-80 bg-gray-800 border-r border-gray-700 z-40 lg:relative lg:top-0 lg:z-0 overflow-y-auto transition-transform duration-300 ${
      isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    }`}>
      {/* Close button for mobile */}
      <button
        onClick={onClose}
        className="lg:hidden absolute top-4 right-4 p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="p-6 pt-16 lg:pt-6">
        <h2 className="text-lg font-semibold text-gray-200 mb-6">
          Course Modules
        </h2>

        <nav className="space-y-2">
          {modules.map((module) => {
            const progressPercent = getModuleProgress(module.id, module.sections);
            const isActive = activeModule === module.id;
            const isCompleted = progressPercent === 100;
            const isExpanded = expandedModules[module.id];
            const currentModuleData = moduleData[module.id];

            return (
              <div key={module.id} className="space-y-1">
                <button
                  onClick={() => toggleModule(module.id)}
                  className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-900 text-white shadow-lg'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{module.icon}</span>
                      <span className="font-medium">{module.title}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isCompleted ? (
                        <CheckCircleIcon className="w-5 h-5 text-green-400" />
                      ) : (
                        <PlayCircleIcon className="w-5 h-5 text-gray-400" />
                      )}
                      {isExpanded ? (
                        <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div
                      style={{ width: `${progressPercent}%` }}
                      className={`h-2 rounded-full transition-all duration-500 ${
                        isCompleted ? 'bg-green-400' : 'bg-blue-400'
                      }`}
                    />
                  </div>

                  <div className="flex justify-between items-center mt-2 text-xs">
                    <span className="text-gray-400">
                      {Object.values(progress[module.id] || {}).filter(Boolean).length} / {module.sections} sections
                    </span>
                    <span className={`font-medium ${isCompleted ? 'text-green-400' : 'text-blue-400'}`}>
                      {progressPercent}%
                    </span>
                  </div>
                </button>

                {/* Dropdown sections */}
                {isExpanded && currentModuleData && (
                  <div className="ml-4 space-y-1">
                    {currentModuleData.sections.map((section, index) => {
                      const isSectionActive = isActive && activeSection === index;
                      const isSectionCompleted = progress[module.id]?.[index];
                      
                      return (
                        <button
                          key={index}
                          onClick={() => handleSectionClick(module.id, index)}
                          className={`w-full text-left p-2 rounded text-sm transition-colors ${
                            isSectionActive
                              ? 'bg-pink-800 text-white'
                              : 'text-gray-300 hover:bg-gray-600 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${
                              isSectionCompleted ? 'bg-green-400' : 'bg-gray-500'
                            }`} />
                            <span className="truncate">{section.title}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Overall Progress */}
        <div className="mt-8 p-4 bg-gray-700 rounded-lg">
          <h3 className="text-sm font-medium text-gray-200 mb-3">Overall Progress</h3>
          <div className="space-y-2">
            {(() => {
              const totalSections = modules.reduce((acc, module) => acc + module.sections, 0);
              const completedSections = modules.reduce((acc, module) => {
                const moduleProgress = progress[module.id] || {};
                return acc + Object.values(moduleProgress).filter(Boolean).length;
              }, 0);
              const overallPercent = Math.round((completedSections / totalSections) * 100);

              return (
                <>
                  <div className="w-full bg-gray-600 rounded-full h-3">
                    <div
                      style={{ width: `${overallPercent}%` }}
                      className="h-3 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-1000"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{completedSections} / {totalSections} completed</span>
                    <span className="font-medium text-purple-400">{overallPercent}%</span>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
