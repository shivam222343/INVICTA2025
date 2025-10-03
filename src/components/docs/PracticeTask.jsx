import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, LightBulbIcon } from '@heroicons/react/24/outline';

const PracticeTask = ({ tasks }) => {
  const [expandedTask, setExpandedTask] = useState(null);

  const toggleTask = (index) => {
    setExpandedTask(expandedTask === index ? null : index);
  };

  return (
    <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg p-6 border border-purple-500/30">
      <div className="flex items-center space-x-3 mb-6">
        <LightBulbIcon className="w-6 h-6 text-yellow-400" />
        <h3 className="text-xl font-semibold text-white">Practice Tasks</h3>
      </div>

      <div className="space-y-4">
        {tasks.map((task, index) => (
          <div
            key={index}
            className="bg-gray-800/50 rounded-lg border border-gray-700 animate-fade-in"
          >
            <button
              onClick={() => toggleTask(index)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-700/30 transition-colors rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <span className="flex items-center justify-center w-8 h-8 bg-purple-600 text-white text-sm font-bold rounded-full">
                  {index + 1}
                </span>
                <span className="font-medium text-white">{task.title}</span>
              </div>
              {expandedTask === index ? (
                <ChevronUpIcon className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDownIcon className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {expandedTask === index && (
              <div className="overflow-hidden transition-all duration-300">
                  <div className="px-4 pb-4">
                    <div className="pl-11">
                      <p className="text-gray-300 mb-4">{task.description}</p>
                      
                      {task.steps && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-blue-400">Steps:</h4>
                          <ol className="space-y-1 text-sm text-gray-300">
                            {task.steps.map((step, stepIndex) => (
                              <li key={stepIndex} className="flex items-start space-x-2">
                                <span className="text-blue-400 font-medium mt-0.5">
                                  {stepIndex + 1}.
                                </span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {task.hint && (
                        <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                          <div className="flex items-start space-x-2">
                            <LightBulbIcon className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="text-yellow-400 font-medium text-sm">Hint: </span>
                              <span className="text-yellow-200 text-sm">{task.hint}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {task.solution && (
                        <details className="mt-4">
                          <summary className="cursor-pointer text-green-400 hover:text-green-300 text-sm font-medium">
                            Show Solution
                          </summary>
                          <div className="mt-2 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                            <pre className="text-sm text-green-200 whitespace-pre-wrap">
                              {task.solution}
                            </pre>
                          </div>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PracticeTask;
