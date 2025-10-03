import { useState } from 'react';
import { ClipboardIcon, CheckIcon, CommandLineIcon } from '@heroicons/react/24/outline';

const CommandBlock = ({ commands, title = "Terminal Commands", explanation }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      // Join multiple commands with newlines for copying
      const commandText = Array.isArray(commands) ? commands.join('\n') : commands;
      await navigator.clipboard.writeText(commandText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy commands: ', err);
    }
  };

  const renderCommands = () => {
    if (Array.isArray(commands)) {
      return commands.map((command, index) => (
        <div key={index} className="flex items-start space-x-3 mb-2 last:mb-0">
          <span className="text-green-400 font-mono text-sm mt-0.5">$</span>
          <code className="text-gray-100 font-mono text-sm flex-1">{command}</code>
        </div>
      ));
    } else {
      return (
        <div className="flex items-start space-x-3">
          <span className="text-green-400 font-mono text-sm mt-0.5">$</span>
          <code className="text-gray-100 font-mono text-sm flex-1">{commands}</code>
        </div>
      );
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden border border-green-500/30 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-green-500/30">
        <div className="flex items-center space-x-3">
          <CommandLineIcon className="w-5 h-5 text-green-400" />
          <span className="text-sm font-medium text-green-400">{title}</span>
          <span className="text-xs text-gray-500 uppercase tracking-wide bg-green-500/20 px-2 py-1 rounded">
            TERMINAL
          </span>
        </div>
        
        <button
          onClick={copyToClipboard}
          className="flex items-center space-x-2 px-3 py-1.5 text-xs bg-green-600 hover:bg-green-500 text-white rounded-md transition-colors"
        >
          {copied ? (
            <>
              <CheckIcon className="w-4 h-4" />
              <span>Copied!</span>
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
        <div className="px-4 py-3 bg-green-900/20 border-b border-green-500/30">
          <p className="text-sm text-green-200">{explanation}</p>
        </div>
      )}

      {/* Commands */}
      <div className="p-4 bg-gray-900">
        {renderCommands()}
      </div>
    </div>
  );
};

export default CommandBlock;
