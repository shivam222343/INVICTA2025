import { useState, useEffect, useRef } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from 'recharts';

// --- Internal Helper Functions ---

const businessColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

function getRandomColor(index) {
  // Use index to ensure stable and consistent colors for categories
  return businessColors[index % businessColors.length];
}

// --- Custom Tooltip Components ---

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    // The tooltip will dynamically show the 'name' label and the 'value'
    const name = label;
    const value = payload[0].value;
    const dataKey = payload[0].dataKey;
    const total = payload.reduce((sum, entry) => sum + entry.value, 0);

    return (
      <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-2xl transition-all duration-300">
        <p className="font-bold text-lg text-gray-800 border-b pb-1 mb-1">{`${name}`}</p>
        <p className="text-md text-gray-700">
          <span className="font-semibold text-indigo-600 mr-2">{dataKey}:</span>
          {value}
        </p>
        {dataKey !== 'registrations' && ( // Don't show percentage for timeline data
          <p className="text-sm text-gray-500">
            {`Percentage: ${((value / total) * 100).toFixed(1)}%`}
          </p>
        )}
      </div>
    );
  }
  return null;
};

const CustomPieTooltip = ({ active, payload, totalRegistrations }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const percentage = totalRegistrations > 0 ? ((data.value / totalRegistrations) * 100).toFixed(1) : 0;
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-2xl transition-all duration-300">
        <p className="font-bold text-lg text-gray-800">{data.name}</p>
        <p className="text-md text-gray-700">{`Count: ${data.value}`}</p>
        <p className="text-sm text-indigo-600 font-semibold">{`Share: ${percentage}%`}</p>
      </div>
    );
  }
  return null;
};

// --- Main Analytics Component ---

const Analytics = ({ registrations = [] }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = useState('all');
  const [isCapturing, setIsCapturing] = useState(false);
  const analyticsRef = useRef(null);

  // Animation trigger
  useEffect(() => {
    // A small delay makes the initial render feel smoother
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Screenshot functionality
  const captureScreenshot = async () => {
    if (!analyticsRef.current) return;
    
    setIsCapturing(true);
    
    try {
      // Dynamically import html2canvas
      const html2canvas = (await import('html2canvas')).default;
      
      // Get the analytics container
      const element = analyticsRef.current;
      
      // Store original styles
      const originalOverflow = document.body.style.overflow;
      const originalHeight = element.style.height;
      const originalTransform = element.style.transform;
      
      // Temporarily modify styles for better capture
      document.body.style.overflow = 'visible';
      element.style.height = 'auto';
      element.style.transform = 'scale(0.7)';
      element.style.transformOrigin = 'top left';
      
      // Wait a moment for styles to apply
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Capture the screenshot
      const canvas = await html2canvas(element, {
        useCORS: true,
        allowTaint: true,
        scale: 1.5, // Higher quality
        scrollX: 0,
        scrollY: 0,
        width: element.scrollWidth,
        height: element.scrollHeight,
        backgroundColor: '#f8fafc', // Light gray background
        onclone: (clonedDoc) => {
          // Ensure all elements are visible in the clone
          const clonedElement = clonedDoc.querySelector('[data-analytics-container]');
          if (clonedElement) {
            clonedElement.style.transform = 'scale(0.7)';
            clonedElement.style.transformOrigin = 'top left';
            clonedElement.style.height = 'auto';
          }
        }
      });
      
      // Restore original styles
      document.body.style.overflow = originalOverflow;
      element.style.height = originalHeight;
      element.style.transform = originalTransform;
      
      // Create download link
      const link = document.createElement('a');
      link.download = `INVICTA-Analytics-${selectedWorkshop === 'all' ? 'All-Workshops' : selectedWorkshop.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error capturing screenshot:', error);
      alert('Failed to capture screenshot. Please try again.');
    }
    
    setIsCapturing(false);
  };

  // Filter registrations based on selected workshop
  const filteredRegistrations = selectedWorkshop === 'all' 
    ? registrations 
    : registrations.filter(r => r.workshop === selectedWorkshop);

  // Get unique workshops for filter dropdown
  const uniqueWorkshops = [...new Set(registrations.map(r => r.workshop).filter(Boolean))];

  // Calculate analytics data
  const totalRegistrations = filteredRegistrations.length;
  const approvedCount = filteredRegistrations.filter(r => r.status === 'approved').length;
  const pendingCount = filteredRegistrations.filter(r => r.status === 'pending' || !r.status).length;
  const rejectedCount = filteredRegistrations.filter(r => r.status === 'rejected').length;

  // Data processing functions (Simplified and fixed array mapping)
  const processData = (key, limit = Infinity, shorten = false, useFiltered = true) => {
    const dataSource = useFiltered ? filteredRegistrations : registrations;
    const counts = dataSource.reduce((acc, reg) => {
      const value = reg[key];
      if (value) {
        acc[value] = (acc[value] || 0) + 1;
      }
      return acc;
    }, {});

    const sortedData = Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .map(([name, value], index) => {
        const fullName = name;
        const display = shorten && name.length > 20 ? name.substring(0, 17) + '...' : name;
        return {
          name: display,
          value,
          fill: getRandomColor(index),
          fullName, // Keep full name for tooltip
        };
      })
      .slice(0, limit);
    
    return sortedData;
  };

  const workshopData = processData('workshop', 10, true, false); // Use all registrations for workshop overview
  const collegeData = processData('college', 10, true);
  const yearData = processData('yearOfStudy').sort((a, b) => (a.name > b.name ? 1 : -1)); // Sort years numerically/alphabetically
  const streamData = processData('stream', 10, true);
  const languageData = processData('preferredLanguage', 10, false); // Language preference data

  // Status data for pie chart
  const statusData = [
    { name: 'Approved', value: approvedCount, fill: '#10B981' },
    { name: 'Pending', value: pendingCount, fill: '#F59E0B' },
    { name: 'Rejected', value: rejectedCount, fill: '#EF4444' }
  ];

  // Registration timeline (last 7 days) - FIXED LOGIC
  const timelineData = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of day

  // Create an array for the last 7 days, initialized to zero
  const dayMap = new Map();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateKey = date.toDateString();
    dayMap.set(dateKey, {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      registrations: 0,
    });
  }

  // Populate the counts
  filteredRegistrations.forEach(reg => {
    let regDate;
    if (reg.registrationDate?.toDate) {
      regDate = reg.registrationDate.toDate(); // Handles Firebase Timestamps
    } else if (reg.registrationDate instanceof Date) {
      regDate = reg.registrationDate; // Handles regular Date objects
    } else if (typeof reg.registrationDate === 'string') {
        regDate = new Date(reg.registrationDate); // Handles date strings
    }
    
    if (regDate) {
      regDate.setHours(0, 0, 0, 0);
      const dateKey = regDate.toDateString();
      if (dayMap.has(dateKey)) {
        dayMap.get(dateKey).registrations += 1;
      }
    }
  });

  // Convert map values to array for the chart
  timelineData.push(...Array.from(dayMap.values()));

  return (
    <div 
      ref={analyticsRef}
      data-analytics-container
      className="space-y-2 p-4 min-h-screen"
    >
      
      {/* Workshop Filter */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Analytics Dashboard</h2>
            <p className="text-gray-600">
              {selectedWorkshop === 'all' 
                ? `Showing data for all workshops (${totalRegistrations} registrations)`
                : `Showing data for ${selectedWorkshop} (${totalRegistrations} registrations)`
              }
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Filter by Workshop:</label>
              <select
                value={selectedWorkshop}
                onChange={(e) => setSelectedWorkshop(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white min-w-[200px]"
              >
                <option value="all">All Workshops</option>
                {uniqueWorkshops.map(workshop => (
                  <option key={workshop} value={workshop}>
                    {workshop}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Screenshot Button */}
            <div className="relative group">
              <button
                onClick={captureScreenshot}
                disabled={isCapturing}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                title="Capture full analytics dashboard screenshot"
              >
                {isCapturing ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Capturing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Screenshot</span>
                  </>
                )}
              </button>
              
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                Capture zoomed-out view of entire dashboard
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tailwind CSS keyframes for custom entry animations */}
      <style jsx global>{`
        @keyframes slide-in-up {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-in-up {
          animation: slide-in-up 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        @keyframes pulse-fade {
          0%, 100% { opacity: 0.9; }
          50% { opacity: 1; }
        }
        .animate-pulse-fade {
          animation: pulse-fade 2s infinite ease-in-out;
        }
      `}</style>
      
      

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Registrations', count: totalRegistrations, color: 'from-blue-500 to-indigo-600', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', delay: 0 },
          { title: 'Approved', count: approvedCount, color: 'from-green-500 to-emerald-600', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', delay: 100 },
          { title: 'Pending', count: pendingCount, color: 'from-yellow-500 to-amber-600', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', delay: 200 },
          { title: 'Rejected', count: rejectedCount, color: 'from-red-500 to-pink-600', icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z', delay: 300 },
        ].map((card, index) => (
          <div
            key={index}
            className={`bg-gradient-to-r ${card.color} rounded-xl p-6 text-white transform transition-all duration-700 ease-out hover:scale-[1.03] hover:shadow-2xl ${isVisible ? 'animate-slide-in-up' : 'opacity-0'}`}
            style={{ animationDelay: `${card.delay}ms` }}
          >
            <div className="flex items-center">
              <div className="p-3 bg-white bg-opacity-30 rounded-full">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d={card.icon} /></svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-light opacity-90">{card.title}</p>
                <p className="text-3xl font-extrabold animate-pulse-fade">{card.count}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- Charts Grid 1 (Bar & Pie) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
        
        {/* Workshop Distribution Bar Chart */}
        <div className={`bg-white rounded-xl shadow-lg p-6 transition-all duration-700 hover:shadow-2xl ${isVisible ? 'animate-slide-in-up' : 'opacity-0'}`} style={{ animationDelay: '400ms' }}>
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <div className="w-3 h-3 rounded-full mr-3 bg-indigo-500 shadow-md"></div>
            Top Workshop Participation
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={workshopData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                angle={-30}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                name="Registrations"
                fill="#8B5CF6" // Purple
                radius={[6, 6, 0, 0]}
                // Animation from bottom up
                animationEasing="ease-out"
                animationDuration={1500}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution Pie Chart */}
        <div className={`bg-white rounded-xl shadow-lg p-6 transition-all duration-700 hover:shadow-2xl ${isVisible ? 'animate-slide-in-up' : 'opacity-0'}`} style={{ animationDelay: '500ms' }}>
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <div className="w-3 h-3 rounded-full mr-3 bg-emerald-500 shadow-md"></div>
            Registration Status Split
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={60} // Doughnut style
                paddingAngle={5}
                // Enhanced Animation
                animationEasing="cubic-bezier(0.68, -0.55, 0.27, 1.55)"
                animationDuration={1200}
                isAnimationActive={isVisible}
                labelLine={false}
              >
                {statusData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.fill} 
                    stroke={entry.fill} // border color
                    strokeWidth={2}
                    className="hover:opacity-80 transition-opacity duration-300"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip totalRegistrations={totalRegistrations} />} />
              <Legend 
                verticalAlign="bottom" 
                align="center"
                height={36}
                formatter={(value, entry) => (
                  <span className="font-medium text-gray-700" style={{ color: entry.color }}>
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* --- Charts Grid 2 (Timeline & College) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">

        {/* Registration Timeline (Area Chart) */}
        <div className={`bg-white rounded-xl shadow-lg p-6 transition-all duration-700 hover:shadow-2xl ${isVisible ? 'animate-slide-in-up' : 'opacity-0'}`} style={{ animationDelay: '600ms' }}>
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <div className="w-3 h-3 rounded-full mr-3 bg-blue-500 shadow-md"></div>
            Registration Timeline (Last 7 Days)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={timelineData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="colorRegistrations" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6B7280' }} />
              <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="registrations" 
                stroke="#3B82F6" 
                fillOpacity={1} 
                fill="url(#colorRegistrations)"
                strokeWidth={3}
                // Animation from left to right (Area/Line chart stroke-dasharray trick)
                dot={{ stroke: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 4, fill: '#fff' }}
                animationEasing="ease-in-out"
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* College Distribution (Bar Chart - Horizontal) */}
        <div className={`bg-white rounded-xl shadow-lg p-6 transition-all duration-700 hover:shadow-2xl ${isVisible ? 'animate-slide-in-up' : 'opacity-0'}`} style={{ animationDelay: '700ms' }}>
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <div className="w-3 h-3 rounded-full mr-3 bg-teal-500 shadow-md"></div>
            Top College Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={collegeData} layout="horizontal" margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12, fill: '#6B7280' }} />
              <YAxis 
                dataKey="name" 
                type="category" 
                tick={{ fontSize: 12, fill: '#6B7280' }} 
                width={80} 
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-2xl">
                        <p className="font-bold text-lg text-gray-800">{data.fullName}</p>
                        <p className="text-md text-gray-700">{`Registrations: ${data.value}`}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="value" 
                name="Registrations"
                fill="#10B981" // Green
                radius={[0, 6, 6, 0]}
                // Animation from left to right
                animationEasing="ease-out"
                animationDuration={1500}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* --- Charts Grid 3 (Radial & Stream) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">

        {/* Year Distribution Radial Chart */}
        <div className={`bg-white rounded-xl shadow-lg p-6 transition-all duration-700 hover:shadow-2xl ${isVisible ? 'animate-slide-in-up' : 'opacity-0'}`} style={{ animationDelay: '800ms' }}>
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <div className="w-3 h-3 rounded-full mr-3 bg-purple-500 shadow-md"></div>
            Year of Study Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadialBarChart 
              cx="50%" 
              cy="50%" 
              innerRadius="10%" 
              outerRadius="100%" 
              data={yearData} 
              barSize={10}
            >
              <RadialBar 
                dataKey="value" 
                nameKey="name"
                cornerRadius={10} 
                fill="#8B5CF6"
                // Animation for radial bar
                animationEasing="ease-in-out"
                animationDuration={1200}
                isAnimationActive={isVisible}
              />
              <Tooltip content={<CustomPieTooltip totalRegistrations={totalRegistrations} />} />
              <Legend 
                iconSize={10}
                layout="vertical"
                verticalAlign="middle"
                align="right"
                formatter={(value, entry) => (
                  <span className="font-medium text-gray-700" style={{ color: entry.color }}>
                    {value}
                  </span>
                )}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>

        {/* Stream Distribution (Bar Chart - Vertical) */}
        <div className={`bg-white rounded-xl shadow-lg p-6 transition-all duration-700 hover:shadow-2xl ${isVisible ? 'animate-slide-in-up' : 'opacity-0'}`} style={{ animationDelay: '900ms' }}>
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <div className="w-3 h-3 rounded-full mr-3 bg-cyan-500 shadow-md"></div>
            Stream Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={streamData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                angle={-30}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                name="Registrations"
                fill="#06B6D4" // Cyan
                radius={[6, 6, 0, 0]}
                // Animation from bottom up
                animationEasing="ease-out"
                animationDuration={1500}
              >
                  {streamData.map((entry, index) => (
                    // Give each bar a slightly different color for more visual appeal
                    <Cell key={`cell-${index}`} fill={getRandomColor(index + 3)} />
                  ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Language Preference Analysis */}
      {languageData.length > 0 && (
        <div className="mt-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Language Distribution Pie Chart */}
            <div className={`bg-white rounded-xl shadow-lg p-6 transition-all duration-700 hover:shadow-2xl ${isVisible ? 'animate-slide-in-up' : 'opacity-0'}`} style={{ animationDelay: '1000ms' }}>
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <div className="w-3 h-3 rounded-full mr-3 bg-pink-500 shadow-md"></div>
                Language Preference Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={languageData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={40}
                    paddingAngle={3}
                    animationEasing="cubic-bezier(0.68, -0.55, 0.27, 1.55)"
                    animationDuration={1200}
                    isAnimationActive={isVisible}
                    labelLine={false}
                  >
                    {languageData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={getRandomColor(index + 6)} 
                        stroke={getRandomColor(index + 6)} 
                        strokeWidth={2}
                        className="hover:opacity-80 transition-opacity duration-300"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip totalRegistrations={totalRegistrations} />} />
                  <Legend 
                    verticalAlign="bottom" 
                    align="center"
                    height={36}
                    formatter={(value, entry) => (
                      <span className="font-medium text-gray-700" style={{ color: entry.color }}>
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Language Statistics Card */}
            <div className={`bg-white rounded-xl shadow-lg p-6 transition-all duration-700 hover:shadow-2xl ${isVisible ? 'animate-slide-in-up' : 'opacity-0'}`} style={{ animationDelay: '1100ms' }}>
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <div className="w-3 h-3 rounded-full mr-3 bg-rose-500 shadow-md"></div>
                Language Insights
              </h3>
              
              <div className="space-y-4">
                {languageData.slice(0, 5).map((lang, index) => {
                  const percentage = totalRegistrations > 0 ? ((lang.value / totalRegistrations) * 100).toFixed(1) : 0;
                  return (
                    <div key={lang.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center">
                        <div 
                          className="w-4 h-4 rounded-full mr-3"
                          style={{ backgroundColor: getRandomColor(index + 6) }}
                        ></div>
                        <div>
                          <p className="font-semibold text-gray-900">{lang.name}</p>
                          <p className="text-sm text-gray-600">{lang.value} participants</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-indigo-600">{percentage}%</p>
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-500 transition-all duration-1000 ease-out"
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: getRandomColor(index + 6)
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {languageData.length === 0 && (
                  <div className="text-center py-8">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                    <p className="text-gray-500">No language preference data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;