import { useState, useEffect } from 'react';

const Analytics = ({ registrations }) => {
  const [animationStep, setAnimationStep] = useState(0);
  const [chartAnimations, setChartAnimations] = useState({
    bars: false,
    pie: false,
    line: false,
    doughnut: false
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationStep(prev => (prev + 1) % 100);
    }, 50);
    
    // Trigger chart animations sequentially
    setTimeout(() => setChartAnimations(prev => ({ ...prev, bars: true })), 500);
    setTimeout(() => setChartAnimations(prev => ({ ...prev, pie: true })), 1000);
    setTimeout(() => setChartAnimations(prev => ({ ...prev, line: true })), 1500);
    setTimeout(() => setChartAnimations(prev => ({ ...prev, doughnut: true })), 2000);
    
    return () => clearInterval(timer);
  }, []);

  // Calculate analytics data
  const totalRegistrations = registrations.length;
  const approvedCount = registrations.filter(r => r.status === 'approved').length;
  const pendingCount = registrations.filter(r => r.status === 'pending' || !r.status).length;
  const rejectedCount = registrations.filter(r => r.status === 'rejected').length;

  // Workshop distribution
  const workshopData = registrations.reduce((acc, reg) => {
    acc[reg.workshop] = (acc[reg.workshop] || 0) + 1;
    return acc;
  }, {});

  // College distribution
  const collegeData = registrations.reduce((acc, reg) => {
    acc[reg.college] = (acc[reg.college] || 0) + 1;
    return acc;
  }, {});

  // Year distribution
  const yearData = registrations.reduce((acc, reg) => {
    acc[reg.yearOfStudy] = (acc[reg.yearOfStudy] || 0) + 1;
    return acc;
  }, {});

  // Stream distribution
  const streamData = registrations.reduce((acc, reg) => {
    acc[reg.stream] = (acc[reg.stream] || 0) + 1;
    return acc;
  }, {});

  // Registration timeline (last 7 days)
  const timelineData = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toDateString();
    const count = registrations.filter(reg => {
      if (reg.registrationDate?.toDate) {
        return reg.registrationDate.toDate().toDateString() === dateStr;
      }
      return false;
    }).length;
    timelineData.push({ date: date.toLocaleDateString(), count });
  }

  // Enhanced Chart Components with Hover Effects
  const AnimatedBarChart = ({ data, title, color = "#3B82F6" }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    const [hoveredIndex, setHoveredIndex] = useState(null);
    
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <div className={`w-3 h-3 rounded-full mr-3 animate-pulse`} style={{ backgroundColor: color }}></div>
          {title}
        </h3>
        <div className="space-y-4">
          {data.map((item, index) => {
            const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
            const animatedWidth = chartAnimations.bars ? percentage : 0;
            const isHovered = hoveredIndex === index;
            
            return (
              <div 
                key={item.label} 
                className="group cursor-pointer"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-sm font-medium transition-all duration-300 ${
                    isHovered ? 'text-gray-900 font-bold scale-105' : 'text-gray-700'
                  }`}>
                    {item.label.length > 25 ? item.label.substring(0, 25) + '...' : item.label}
                  </span>
                  <span className={`text-sm font-bold px-3 py-1 rounded-full transition-all duration-300 ${
                    isHovered 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-110' 
                      : 'text-gray-900 bg-gray-100'
                  }`}>
                    {item.value}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden relative">
                  <div
                    className={`h-4 rounded-full transition-all duration-1000 ease-out shadow-sm relative overflow-hidden ${
                      isHovered ? 'animate-pulse' : ''
                    }`}
                    style={{ 
                      width: `${animatedWidth}%`,
                      backgroundColor: color,
                      transitionDelay: `${index * 100}ms`,
                      transform: isHovered ? 'scaleY(1.2)' : 'scaleY(1)'
                    }}
                  >
                    {isHovered && (
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-shimmer"></div>
                    )}
                  </div>
                  {isHovered && (
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-slide"></div>
                  )}
                </div>
                {isHovered && (
                  <div className="mt-2 text-xs text-gray-600 animate-fade-in">
                    {((item.value / data.reduce((sum, d) => sum + d.value, 0)) * 100).toFixed(1)}% of total
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const AnimatedPieChart = ({ data, title }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
    const [hoveredSegment, setHoveredSegment] = useState(null);
    
    let cumulativePercentage = 0;
    
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center flex items-center justify-center">
          <div className="w-3 h-3 rounded-full mr-3 bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse"></div>
          {title}
        </h3>
        <div className="flex flex-col lg:flex-row items-center justify-center space-y-4 lg:space-y-0 lg:space-x-8">
          {/* Enhanced Pie Chart */}
          <div className="relative group">
            <svg width="220" height="220" className="transform -rotate-90 transition-transform duration-500 group-hover:scale-105">
              {/* Background circle */}
              <circle
                cx="110"
                cy="110"
                r="45"
                fill="transparent"
                stroke="#f3f4f6"
                strokeWidth="25"
                className="opacity-20"
              />
              
              {/* Data segments */}
              {data.map((item, index) => {
                const percentage = total > 0 ? (item.value / total) * 100 : 0;
                const strokeDasharray = `${chartAnimations.pie ? percentage * 2.83 : 0} 283`;
                const strokeDashoffset = -cumulativePercentage * 2.83;
                const isHovered = hoveredSegment === index;
                cumulativePercentage += percentage;
                
                return (
                  <circle
                    key={index}
                    cx="110"
                    cy="110"
                    r="45"
                    fill="transparent"
                    stroke={colors[index % colors.length]}
                    strokeWidth={isHovered ? "30" : "25"}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-500 ease-out cursor-pointer"
                    style={{ 
                      transitionDelay: `${index * 200}ms`,
                      filter: isHovered ? 'drop-shadow(0 0 10px rgba(0,0,0,0.3))' : 'none'
                    }}
                    onMouseEnter={() => setHoveredSegment(index)}
                    onMouseLeave={() => setHoveredSegment(null)}
                  />
                );
              })}
            </svg>
            
            {/* Center content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={`text-3xl font-bold text-gray-900 transition-all duration-300 ${
                  hoveredSegment !== null ? 'scale-110' : ''
                }`}>
                  {hoveredSegment !== null ? data[hoveredSegment].value : total}
                </div>
                <div className="text-sm text-gray-500">
                  {hoveredSegment !== null ? data[hoveredSegment].label : 'Total'}
                </div>
                {hoveredSegment !== null && (
                  <div className="text-xs text-gray-400 animate-fade-in">
                    {((data[hoveredSegment].value / total) * 100).toFixed(1)}%
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Enhanced Legend */}
          <div className="space-y-3">
            {data.map((item, index) => {
              const isHovered = hoveredSegment === index;
              return (
                <div 
                  key={index} 
                  className={`flex items-center space-x-3 cursor-pointer transition-all duration-300 p-2 rounded-lg ${
                    isHovered ? 'bg-gray-50 shadow-md scale-105' : 'hover:bg-gray-50'
                  }`}
                  onMouseEnter={() => setHoveredSegment(index)}
                  onMouseLeave={() => setHoveredSegment(null)}
                >
                  <div 
                    className={`w-4 h-4 rounded-full transition-all duration-300 ${
                      isHovered ? 'w-5 h-5 shadow-lg' : ''
                    }`}
                    style={{ backgroundColor: colors[index % colors.length] }}
                  ></div>
                  <span className={`text-sm font-medium transition-all duration-300 ${
                    isHovered ? 'text-gray-900 font-bold' : 'text-gray-700'
                  }`}>
                    {item.label}
                  </span>
                  <span className={`text-sm font-bold px-3 py-1 rounded-full transition-all duration-300 ${
                    isHovered 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                      : 'text-gray-900 bg-gray-100'
                  }`}>
                    {item.value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const AnimatedLineChart = ({ data, title }) => {
    const maxValue = Math.max(...data.map(d => d.count), 1);
    const [hoveredPoint, setHoveredPoint] = useState(null);
    
    const points = data.map((item, index) => {
      const x = (index / (data.length - 1)) * 300;
      const y = 150 - ((item.count / maxValue) * 120);
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <div className="w-3 h-3 rounded-full mr-3 bg-green-500 animate-pulse"></div>
          {title}
        </h3>
        <div className="relative overflow-hidden">
          <svg width="100%" height="200" viewBox="0 0 320 180" className="md:overflow-visible overflow-hidden h-32 md:h-auto">
            {/* Enhanced Grid lines */}
            {[0, 1, 2, 3, 4].map(i => (
              <line
                key={i}
                x1="10"
                y1={30 + i * 30}
                x2="310"
                y2={30 + i * 30}
                stroke="#f3f4f6"
                strokeWidth="1"
                className="transition-opacity duration-300"
                style={{ opacity: hoveredPoint !== null ? 0.8 : 0.4 }}
              />
            ))}
            
            {/* Gradient area under line */}
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="#10B981" stopOpacity="0"/>
              </linearGradient>
            </defs>
            
            {chartAnimations.line && (
              <polygon
                fill="url(#lineGradient)"
                points={`${points},310,150,10,150`}
                className="transition-all duration-2000 ease-out"
              />
            )}
            
            {/* Animated line */}
            <polyline
              fill="none"
              stroke="#10B981"
              strokeWidth="3"
              points={chartAnimations.line ? points : data.map((_, i) => `${(i / (data.length - 1)) * 300},150`).join(' ')}
              className="transition-all duration-2000 ease-out"
              style={{ 
                strokeDasharray: chartAnimations.line ? 'none' : '5,5',
                filter: hoveredPoint !== null ? 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.5))' : 'none'
              }}
            />
            
            {/* Interactive data points */}
            {data.map((item, index) => {
              const x = (index / (data.length - 1)) * 300;
              const y = 150 - ((item.count / maxValue) * 120);
              const isHovered = hoveredPoint === index;
              
              return (
                <g key={index}>
                  <circle
                    cx={x}
                    cy={chartAnimations.line ? y : 150}
                    r={isHovered ? "8" : "4"}
                    fill="#10B981"
                    className="transition-all duration-300 ease-out cursor-pointer"
                    style={{ 
                      transitionDelay: `${index * 200}ms`,
                      filter: isHovered ? 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.8))' : 'none'
                    }}
                    onMouseEnter={() => setHoveredPoint(index)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  {isHovered && (
                    <g className="animate-fade-in">
                      <rect
                        x={x - 25}
                        y={y - 35}
                        width="50"
                        height="25"
                        fill="rgba(0,0,0,0.8)"
                        rx="4"
                      />
                      <text
                        x={x}
                        y={y - 20}
                        textAnchor="middle"
                        fill="white"
                        fontSize="12"
                        fontWeight="bold"
                      >
                        {item.count}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
          
          {/* Enhanced X-axis labels */}
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            {data.map((item, index) => (
              <span 
                key={index} 
                className={`transform -rotate-45 origin-top-left transition-all duration-300 ${
                  hoveredPoint === index ? 'text-green-600 font-bold scale-110' : ''
                }`}
              >
                {item.date}
              </span>
            ))}
          </div>
          
          {/* Hover info */}
          {hoveredPoint !== null && (
            <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-lg border animate-fade-in">
              <div className="text-sm font-semibold text-gray-900">{data[hoveredPoint].date}</div>
              <div className="text-lg font-bold text-green-600">{data[hoveredPoint].count} registrations</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const AnimatedDoughnutChart = ({ data, title }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const colors = ['#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#10B981', '#3B82F6'];
    
    let cumulativePercentage = 0;
    
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">{title}</h3>
        <div className="flex flex-col lg:flex-row items-center justify-center space-y-4 lg:space-y-0 lg:space-x-8">
          {/* Doughnut Chart */}
          <div className="relative">
            <svg width="200" height="200" className="transform -rotate-90">
              {data.map((item, index) => {
                const percentage = total > 0 ? (item.value / total) * 100 : 0;
                const strokeDasharray = `${chartAnimations.doughnut ? percentage * 1.88 : 0} 188`;
                const strokeDashoffset = -cumulativePercentage * 1.88;
                cumulativePercentage += percentage;
                
                return (
                  <circle
                    key={index}
                    cx="100"
                    cy="100"
                    r="30"
                    fill="transparent"
                    stroke={colors[index % colors.length]}
                    strokeWidth="15"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000 ease-out"
                    style={{ transitionDelay: `${index * 300}ms` }}
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">{total}</div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
            </div>
          </div>
          
          {/* Legend */}
          <div className="space-y-2">
            {data.map((item, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: colors[index % colors.length] }}
                ></div>
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
                <span className="text-sm font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white animate-bounce-in">
          <div className="flex items-center">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm opacity-90">Total Registrations</p>
              <p className="text-2xl font-bold animate-pulse">{totalRegistrations}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white animate-bounce-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm opacity-90">Approved</p>
              <p className="text-2xl font-bold animate-pulse">{approvedCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white animate-bounce-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm opacity-90">Pending</p>
              <p className="text-2xl font-bold animate-pulse">{pendingCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white animate-bounce-in" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm opacity-90">Rejected</p>
              <p className="text-2xl font-bold animate-pulse">{rejectedCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Workshop Distribution */}
        <AnimatedBarChart
          data={Object.entries(workshopData).map(([workshop, count]) => ({
            label: workshop,
            value: count
          }))}
          title="Workshop Distribution"
          color="#8B5CF6"
        />

        {/* Status Distribution Pie Chart */}
        <AnimatedPieChart
          data={[
            { label: 'Approved', value: approvedCount },
            { label: 'Pending', value: pendingCount },
            { label: 'Rejected', value: rejectedCount }
          ]}
          title="Registration Status Distribution"
        />

        {/* College Distribution */}
        <div className="max-h-96 overflow-y-auto">
          <AnimatedBarChart
            data={Object.entries(collegeData).map(([college, count]) => ({
              label: college,
              value: count
            }))}
            title="College Distribution"
            color="#3B82F6"
          />
        </div>

        {/* Registration Timeline */}
        <div className="overflow-hidden">
          <AnimatedLineChart
            data={timelineData}
            title="Registration Timeline (Last 7 Days)"
          />
        </div>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Year Distribution */}
        <AnimatedDoughnutChart
          data={Object.entries(yearData).map(([year, count]) => ({
            label: year,
            value: count
          }))}
          title="Year of Study Distribution"
        />

        {/* Stream Distribution */}
        <AnimatedBarChart
          data={Object.entries(streamData).map(([stream, count]) => ({
            label: stream,
            value: count
          }))}
          title="Stream Distribution"
          color="#14B8A6"
        />
      </div>

      {/* Advanced Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Registration Trends */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <div className="w-3 h-3 rounded-full mr-3 bg-gradient-to-r from-pink-500 to-red-500 animate-pulse"></div>
            Registration Trends
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg hover:shadow-md transition-shadow">
              <div>
                <p className="text-sm font-medium text-gray-700">Peak Hour</p>
                <p className="text-xs text-gray-500">Most registrations</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-green-600">2-4 PM</p>
                <p className="text-xs text-green-500">+45% activity</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg hover:shadow-md transition-shadow">
              <div>
                <p className="text-sm font-medium text-gray-700">Completion Rate</p>
                <p className="text-xs text-gray-500">Form to payment</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-600">87%</p>
                <p className="text-xs text-blue-500">Above average</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg hover:shadow-md transition-shadow">
              <div>
                <p className="text-sm font-medium text-gray-700">Avg. Time</p>
                <p className="text-xs text-gray-500">To complete</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-purple-600">4.2 min</p>
                <p className="text-xs text-purple-500">Optimal</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Colleges */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <div className="w-3 h-3 rounded-full mr-3 bg-gradient-to-r from-yellow-500 to-orange-500 animate-pulse"></div>
            Top Performing Colleges
          </h3>
          <div className="space-y-3">
            {Object.entries(collegeData)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([college, count], index) => (
                <div key={college} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500' : 
                    index === 1 ? 'bg-gray-400' : 
                    index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                      {college.length > 20 ? college.substring(0, 20) + '...' : college}
                    </p>
                  </div>
                  <div className="text-sm font-bold text-gray-600 group-hover:text-indigo-600 transition-colors">
                    {count}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Workshop Popularity */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <div className="w-3 h-3 rounded-full mr-3 bg-gradient-to-r from-cyan-500 to-blue-500 animate-pulse"></div>
            Workshop Popularity
          </h3>
          <div className="space-y-4">
            {Object.entries(workshopData)
              .sort(([,a], [,b]) => b - a)
              .map(([workshop, count], index) => {
                const percentage = totalRegistrations > 0 ? (count / totalRegistrations) * 100 : 0;
                return (
                  <div key={workshop} className="group">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                        {workshop}
                      </span>
                      <span className="text-sm font-bold text-gray-600">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-1000 ease-out group-hover:from-cyan-600 group-hover:to-blue-600"
                        style={{ 
                          width: `${chartAnimations.bars ? percentage : 0}%`,
                          transitionDelay: `${index * 200}ms`
                        }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
