import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../src/config";

// --- Inline SVG Icons ---
const Home = ({ size = 22 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
);
const CalendarIcon = ({ size = 22 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
);
const PieChartIcon = ({ size = 22 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
);
const BarChart2 = ({ size = 22 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
);

// --- Custom SVG Bar Chart Component ---
const CustomBarChart = ({ data }) => {
    // ... (This component's code remains the same)
    const [animatedData, setAnimatedData] = useState([]);

    useEffect(() => {
        setAnimatedData(data.map(item => ({ ...item, value: 0 })));
        const timer = setTimeout(() => {
            setAnimatedData(data);
        }, 100);
        return () => clearTimeout(timer);
    }, [data]);

    const maxCountForAxis = useMemo(() => {
        const maxVal = Math.max(...data.map(d => d.value));
        if (maxVal === 0) return 4;
        return Math.ceil(maxVal / 4) * 4;
    }, [data]);

    const yAxisTicks = useMemo(() => {
        if (maxCountForAxis === 0) return [0,1,2,3,4];
        const ticks = [];
        const step = maxCountForAxis / 4;
        for (let i = 0; i <= maxCountForAxis; i += step) { ticks.push(i); }
        return ticks;
    }, [maxCountForAxis]);
    
    const chartHeight = 250, barWidth = 80, gap = 50, topPadding = 30, bottomPadding = 30;
    const chartContentWidth = data.length * barWidth + (data.length - 1) * gap;
    const svgWidth = chartContentWidth + 100;

    return (
        <svg width={svgWidth} height={chartHeight + topPadding + bottomPadding} className="font-sans mx-auto">
            <text className="text-sm font-semibold text-slate-600" transform={`rotate(-90)`} x={-(chartHeight / 2) - topPadding} y="15" textAnchor="middle">No. of Days</text>
            <line x1="50" y1={topPadding} x2="50" y2={chartHeight + topPadding} stroke="#d1d5db" strokeWidth="2" />

            {yAxisTicks.map(tick => {
                const y = chartHeight - (tick / maxCountForAxis) * chartHeight + topPadding;
                return (
                    <g key={`tick-${tick}`} className="text-slate-500 text-xs">
                        <text x="45" y={y + 4} textAnchor="end">{tick}</text>
                        <line x1="50" y1={y} x2={svgWidth - 20} y2={y} stroke="#e5e7eb" strokeDasharray="3 3"/>
                    </g>
                )
            })}
            
            {data.map((item, index) => {
                const animatedItem = animatedData[index] || { value: 0 };
                const barHeight = animatedItem.value > 0 ? (animatedItem.value / maxCountForAxis) * chartHeight : 0;
                const xOffset = 60;
                const x = xOffset + index * (barWidth + gap);
                const y = chartHeight - barHeight + topPadding;

                return (
                    <g key={item.name}>
                        <rect x={x} y={y} width={barWidth} height={barHeight} fill={item.color} rx="4" className="transition-all duration-700 ease-out"/>
                        <text x={x + barWidth / 2} y={y - 8} textAnchor="middle" className="font-bold text-slate-700">{Math.round(animatedItem.value)}</text>
                        <text x={x + barWidth / 2} y={chartHeight + topPadding + 20} textAnchor="middle" className="font-semibold text-slate-600">{item.name}</text>
                    </g>
                );
            })}
        </svg>
    );
};
const MoodCard = ({ mood, count, dates, color }) => (
  <div className="rounded-lg p-3 flex flex-col bg-white shadow-md border border-slate-200 w-full">
    <div className="flex justify-between items-center mb-1">
      <h3 className="text-md font-bold" style={{ color }}>{mood}</h3>
      <span className="text-xl font-bold" style={{ color }}>{count}</span>
    </div>
    <p className="text-xs text-slate-500 mb-1">Days Recorded:</p>
    <div className="bg-slate-50 rounded-lg p-1 min-h-[50px] flex flex-wrap gap-1 content-start flex-grow">
      {dates.length > 0 ? (
        dates.map((date, i) => (
          <span key={i} className="px-2 py-0.5 text-xs font-semibold rounded-full" style={{ backgroundColor: `${color}20`, color }}>{date}</span>
        ))
      ) : <span className="text-xs text-slate-400 italic mt-1">No entries.</span>}
    </div>
  </div>
);

// --- Analysis Page ---
const AnalysisPage = () => {
  const navigate = useNavigate();
  const [moodData, setMoodData] = useState(null);
  const [days, setDays] = useState(30);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAndProcessFeeds = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) { navigate("/login"); return; }

      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/get-feed`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, days }),
        });
        if (!response.ok) throw new Error("Failed to fetch analysis data.");

        const data = await response.json();
        if (data.success) {
          const processedData = {
            normal: { name: 'Normal', value: 0, dates: [], color: '#34d399' },
            stressed: { name: 'Stressed', value: 0, dates: [], color: '#f59e0b' },
            depressed: { name: 'Depressed', value: 0, dates: [], color: '#38bdf8' }
          };
          data.feeds.forEach(feed => {
            if (processedData[feed.prediction]) {
              processedData[feed.prediction].value += 1;
              const date = new Date(feed.created_at);
              const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              processedData[feed.prediction].dates.push(formattedDate);
            }
          });
          setMoodData(processedData);
        } else { setError("Could not retrieve analysis data."); }
      } catch { setError("Could not connect to the server. Please try again."); }
      finally { setIsLoading(false); }
    };
    fetchAndProcessFeeds();
  }, [days, navigate]);

  const chartDataForBars = useMemo(() => {
    if (!moodData) return [];
    return [moodData.normal, moodData.stressed, moodData.depressed];
  }, [moodData]);

  const hasData = moodData && Object.values(moodData).some(mood => mood.value > 0);

  const renderContent = () => {
    if (isLoading) return <div className="text-center p-10"><p className="animate-pulse">Analyzing your mood data...</p></div>;
    if (error) return <div className="text-center p-10 text-red-500">{error}</div>;
    if (!hasData) return (
      <div className="text-center p-10">
        <h2 className="text-xl font-semibold text-gray-700">No Data Found</h2>
        <p className="text-gray-500 mt-2">Add more entries to see your analysis!</p>
      </div>
    );
    return (
      <div className="flex flex-col gap-4">
        {/* Cards in equal width grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
          <MoodCard mood="Normal" count={moodData.normal.value} dates={moodData.normal.dates} color={moodData.normal.color} />
          <MoodCard mood="Stressed" count={moodData.stressed.value} dates={moodData.stressed.dates} color={moodData.stressed.color} />
          <MoodCard mood="Depressed" count={moodData.depressed.value} dates={moodData.depressed.dates} color={moodData.depressed.color} />
        </div>

        {/* Bar chart slightly above */}
        <div className="flex justify-center overflow-x-auto -mt-4">
          <CustomBarChart data={chartDataForBars} />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600">Mood Trend Analysis</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/feed")} className="p-2 rounded-full text-slate-500 hover:bg-slate-200 hover:text-purple-600"><Home/></button>
            <button onClick={() => navigate("/calendar")} className="p-2 rounded-full text-slate-500 hover:bg-slate-200 hover:text-purple-600"><CalendarIcon/></button>
            <button onClick={() => navigate("/piechart")} className="p-2 rounded-full text-slate-500 hover:bg-slate-200 hover:text-purple-600"><PieChartIcon/></button>
            <button onClick={() => navigate("/analysis")} className="p-2 rounded-full text-purple-600 bg-purple-100"><BarChart2/></button>
          </div>
        </header>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-center items-center gap-4 mb-6 border-b border-slate-200 pb-6">
            <span className="font-semibold text-slate-700">Time Range:</span>
            {[7, 30, 90].map(d => (
              <button key={d} onClick={() => setDays(d)}
                className={`px-4 py-2 rounded-full font-semibold transition-all ${days === d ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                Last {d} Days
              </button>
            ))}
          </div>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AnalysisPage;