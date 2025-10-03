import { CheckCircleIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { PlayCircleIcon } from '@heroicons/react/24/outline';
import SimpleCodeBlock from './SimpleCodeBlock';
import CommandBlock from './CommandBlock';
import PracticeTask from './PracticeTask';

const ModuleContent = ({ 
  module, 
  section, 
  sectionIndex, 
  onSectionChange, 
  onProgressUpdate, 
  progress 
}) => {
  const isCompleted = progress[sectionIndex] || false;
  const canGoNext = sectionIndex < module.sections.length - 1;
  const canGoPrev = sectionIndex > 0;

  const handleMarkComplete = () => {
    onProgressUpdate(module.id, sectionIndex, !isCompleted);
  };

  const handleNext = () => {
    if (canGoNext) {
      onSectionChange(sectionIndex + 1);
    }
  };

  const handlePrev = () => {
    if (canGoPrev) {
      onSectionChange(sectionIndex - 1);
    }
  };

  return (
    <div
      key={`${module.id}-${sectionIndex}`}
      className="max-w-4xl mx-auto animate-fade-in"
    >
      {/* Section Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {section.title}
            </h1>
            <p className="text-gray-400">
              {module.title} • Section {sectionIndex + 1} of {module.sections.length}
            </p>
          </div>
          
          <button
            onClick={handleMarkComplete}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              isCompleted
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
          >
            {isCompleted ? (
              <>
                <CheckCircleIcon className="w-5 h-5" />
                <span className="hidden md:block w-28">Completed</span>
              </>
            ) : (
              <>
                <PlayCircleIcon className="w-5 h-5" />
                <span className="hidden md:block w-28 " >Mark Complete</span>
              </>
            )}
          </button>
        </div>

        {/* Progress bar for current section */}
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            style={{ width: isCompleted ? '100%' : '0%' }}
            className="h-2 rounded-full bg-green-400 transition-all duration-500"
          />
        </div>
      </div>

      {/* Section Content */}
      <div className="space-y-8">
        {/* Introduction */}
        {section.introduction && (
          <div className="prose prose-invert max-w-none animate-fade-in">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-blue-400 mb-4">Overview</h2>
              <p className="text-gray-300 leading-relaxed">{section.introduction}</p>
            </div>
          </div>
        )}

        {/* Subsections */}
        {section.subsections?.map((subsection, index) => (
          <div
            key={index}
            className="space-y-4 animate-fade-in"
          >
            <h3 className="text-xl font-semibold text-white border-l-4 border-blue-500 pl-4">
              {subsection.title}
            </h3>
            
            {subsection.content && (
              <div className="text-gray-300 leading-relaxed">
                {subsection.content}
              </div>
            )}

            {subsection.points && (
              <ul className="space-y-2 text-gray-300">
                {subsection.points.map((point, pointIndex) => (
                  <li key={pointIndex} className="flex items-start space-x-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            )}

            {subsection.codeExample && (
              <SimpleCodeBlock
                code={subsection.codeExample.code}
                language={subsection.codeExample.language}
                title={subsection.codeExample.title}
                explanation={subsection.codeExample.explanation}
              />
            )}

            {subsection.commandExample && (
              <CommandBlock
                commands={subsection.commandExample.commands}
                title={subsection.commandExample.title}
                explanation={subsection.commandExample.explanation}
              />
            )}
          </div>
        ))}

        {/* Code Examples */}
        {section.codeExamples?.map((example, index) => (
          <div key={index} className="animate-fade-in">
            <SimpleCodeBlock
              code={example.code}
              language={example.language}
              title={example.title}
              explanation={example.explanation}
            />
          </div>
        ))}

        {/* Practice Tasks */}
        {section.practiceTasks && (
          <div className="animate-fade-in">
            <PracticeTask tasks={section.practiceTasks} />
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-700">
        <button
          onClick={handlePrev}
          disabled={!canGoPrev}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
            canGoPrev
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }`}
        >
          <ChevronLeftIcon className="w-5 h-5" />
          <span className="hidden md:block">Previous</span>
        </button>

        <div className="text-center">
          <div className="text-sm text-gray-400 mb-1">
            Section {sectionIndex + 1} of {module.sections.length}
          </div>
          <div className="flex space-x-1">
            {Array.from({ length: module.sections.length }).map((_, i) => (
              <button
                key={i}
                onClick={() => onSectionChange(i)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  i === sectionIndex
                    ? 'bg-blue-500'
                    : progress[i]
                    ? 'bg-green-500'
                    : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>

        <button
          onClick={handleNext}
          disabled={!canGoNext}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
            canGoNext
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }`}
        >
          <span className="hidden md:block">Next</span>
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ModuleContent;
