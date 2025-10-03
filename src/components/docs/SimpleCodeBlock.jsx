import { useState } from 'react';
import { ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';

const SimpleCodeBlock = ({ code, language = 'html', title, explanation }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code: ', err);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-750 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          {title && (
            <span className="text-sm font-medium text-gray-300">{title}</span>
          )}
          <span className="text-xs text-gray-500 uppercase tracking-wide">
            {language}
          </span>
        </div>
        
        <button
          onClick={copyToClipboard}
          className="flex items-center space-x-2 px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md transition-colors"
        >
          {copied ? (
            <>
              <CheckIcon className="w-4 h-4 text-green-400" />
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <ClipboardIcon className="w-4 h-4" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Explanation */}
      {explanation && (
        <div className="px-4 py-3 bg-blue-900/20 border-b border-gray-700">
          <p className="text-sm text-blue-200">{explanation}</p>
        </div>
      )}

      {/* Code */}
      <div className="relative">
        <pre className="p-4 overflow-x-auto text-sm leading-relaxed bg-gray-900 text-gray-100">
          <code>{code.trim()}</code>
        </pre>
      </div>
    </div>
  );
};

export default SimpleCodeBlock;
