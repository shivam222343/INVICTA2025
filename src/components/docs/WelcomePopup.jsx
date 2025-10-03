import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const codeGreetings = [
  `console.log("Welcome to Build It Better, {name}!");`,
  `print(f"Hello {name}, ready to code?")`,
  `echo "Welcome {name}! Let's build something amazing!"`,
  `System.out.println("Hello {name}! Time to level up!");`,
  `document.write("Welcome {name}! Let's start coding!");`,
  `fmt.Printf("Hello %s! Ready to build it better?", "{name}")`,
  `puts "Welcome {name}! Let's create magic with code!"`,
  `alert("Hello {name}! Your coding journey begins now!");`
];

const WelcomePopup = ({ isOpen, onClose, onNameSubmit }) => {
  const [name, setName] = useState('');
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    if (isOpen) {
      const randomGreeting = codeGreetings[Math.floor(Math.random() * codeGreetings.length)];
      setGreeting(randomGreeting);
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onNameSubmit(name.trim());
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full border border-gray-700 animate-bounce-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Welcome to Build It Better!
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-300 mb-4">
              Ready to embark on your web development journey? Let's start by getting to know you!
            </p>
            
            {/* Code Greeting */}
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-600 mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-xs text-gray-400 ml-2">welcome.js</span>
              </div>
              <code className="text-green-400 text-sm font-mono">
                {greeting.replace('{name}', name || 'Developer')}
              </code>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                What should we call you?
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name..."
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                autoFocus
                required
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
              >
                Start Learning! 🚀
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-gray-700 text-gray-300 rounded-lg font-medium hover:bg-gray-600 transition-colors"
              >
                Skip
              </button>
            </div>
          </form>

          <p className="text-xs text-gray-500 mt-4 text-center">
            Your name will be saved locally for a personalized experience
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomePopup;
