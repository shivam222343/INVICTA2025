import { useState, useEffect } from 'react';
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

  // Animation trigger
  useEffect(() => {
    // A small delay makes the initial render feel smoother
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Calculate analytics data
  const totalRegistrations = registrations.length;
  const approvedCount = registrations.filter(r => r.status === 'approved').length;
  const pendingCount = registrations.filter(r => r.status === 'pending' || !r.status).length;
  const rejectedCount = registrations.filter(r => r.status === 'rejected').length;

  // Data processing functions (Simplified and fixed array mapping)
  const processData = (key, limit = Infinity, shorten = false) => {
    const counts = registrations.reduce((acc, reg) => {
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

  const workshopData = processData('workshop', 10, true);
  const collegeData = processData('college', 10, true);
  const yearData = processData('yearOfStudy').sort((a, b) => (a.name > b.name ? 1 : -1)); // Sort years numerically/alphabetically
  const streamData = processData('stream', 10, true);

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
  registrations.forEach(reg => {
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
    <div className="space-y-2 p-4 min-h-screen">
      
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
    </div>
  );
};

export default Analytics;