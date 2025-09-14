import React, { useState, useEffect, useMemo } from "react";
import { MemoryRouter, Routes, Route, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../src/config";
// --- Inline SVG Icons ---
const Home = ({ size = 22 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
);
const CalendarIcon = ({ size = 22 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
);
const BarChart2 = ({ size = 22 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
);
const PieChartIcon = ({ size = 22 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
);




// --- ✨ MODIFIED: Custom Bar Chart now includes a Y-axis title ---
const CustomBarChart = ({ data }) => {
    const [animatedData, setAnimatedData] = useState([]);

    useEffect(() => {
        let startTime;
        const duration = 600; 
        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOutProgress = 1 - Math.pow(1 - progress, 3);
            const newData = data.map(item => ({ ...item, value: item.value * easeOutProgress }));
            setAnimatedData(newData);
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [data]);

    const maxCountForAxis = useMemo(() => {
        const maxVal = Math.max(...data.map(d => d.value));
        if (maxVal === 0) return 4;
        return Math.ceil(maxVal / 2) * 2;
    }, [data]);

    const yAxisTicks = useMemo(() => {
        const ticks = [];
        for (let i = 0; i <= maxCountForAxis; i += 2) {
            ticks.push(i);
        }
        return ticks;
    }, [maxCountForAxis]);
    
    const chartHeight = 250;
    const barWidth = 80;
    const gap = 50;
    const topPadding = 30;
    const bottomPadding = 30;

    const chartContentWidth = data.length * barWidth + (data.length > 1 ? (data.length - 1) * gap : 0);
    const svgWidth = chartContentWidth + 100;

    return (
        <svg width={svgWidth} height={chartHeight + topPadding + bottomPadding} className="font-sans mx-auto">
            {/* ✨ ADDED: Y-axis Title */}
            <text
                className="text-sm font-semibold text-gray-600"
                transform={`rotate(-90)`}
                x={-(chartHeight / 2) - topPadding}
                y="10"
                textAnchor="middle"
            >
                No. of Days
            </text>

            <line x1="40" y1={topPadding} x2="40" y2={chartHeight + topPadding} stroke="#d1d5db" strokeWidth="1" />

            {/* Y-Axis Ticks, Labels, and Grid Lines */}
            {yAxisTicks.map(tick => {
                const y = chartHeight - (tick / maxCountForAxis) * chartHeight + topPadding;
                return (
                    <g key={`tick-${tick}`} className="text-gray-400 text-xs">
                        <text x="35" y={y + 4} textAnchor="end">{tick}</text>
                        <line 
                            x1="40" 
                            y1={y} 
                            x2={svgWidth - 20}
                            y2={y} 
                            stroke="#e5e7eb"
                            strokeDasharray="2 2"
                        />
                    </g>
                )
            })}
            
            {/* Bars */}
            {animatedData.map((item, index) => {
                const barHeight = item.value > 0 ? (item.value / maxCountForAxis) * chartHeight : 0;
                const xOffset = (svgWidth - chartContentWidth) / 2;
                const x = xOffset + index * (barWidth + gap);
                const y = chartHeight - barHeight + topPadding;

                return (
                    <g key={item.name}>
                        <rect 
                            x={x} 
                            y={y}
                            width={barWidth} 
                            height={barHeight} 
                            fill={item.color}
                            rx="4"
                        />
                        <text x={x + barWidth / 2} y={y - 8} textAnchor="middle" fill="#374151" fontWeight="bold">
                            {Math.round(item.value)}
                        </text>
                        <text x={x + barWidth / 2} y={chartHeight + topPadding + 20} textAnchor="middle" fill="#6b7280">
                            {item.name}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
};


const AnalysisPage = () => {
    const navigate = useNavigate();
    const [moodCounts, setMoodCounts] = useState({ normal: 0, stressed: 0, depressed: 0 });
    const [days, setDays] = useState(30);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMoodCounts = async () => {
            const userId = localStorage.getItem("userId");
            if (!userId) { navigate("/login"); return; }

            try {
                setIsLoading(true);
                setError(null);
                const response = await fetch(`${API_BASE_URL}/get-mood-counts-by-days`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId, days }),
                });

                if (!response.ok) throw new Error("Failed to fetch analysis data.");
                
                const data = await response.json();
                if (data.success) {
                    setMoodCounts(data.counts);
                } else {
                    setError("Could not retrieve analysis data.");
                }
            } catch (err) {
                setError("Could not connect to the server. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchMoodCounts();
    }, [days, navigate]);

    const chartData = useMemo(() => [
        { name: 'Normal', value: moodCounts.normal, color: '#6ee7b7' },
        { name: 'Stressed', value: moodCounts.stressed, color: '#fcd34d' },
        { name: 'Depressed', value: moodCounts.depressed, color: '#7dd3fc' }
    ], [moodCounts]);

    const hasData = Object.values(moodCounts).some(count => count > 0);

    const renderContent = () => {
        if (isLoading) return <div className="text-center p-10"><p className="animate-pulse">Analyzing your mood data...</p></div>;
        if (error) return <div className="text-center p-10 text-red-500">{error}</div>;
        if (!hasData) return (
            <div className="text-center p-10">
                <h2 className="text-xl font-semibold text-gray-700">No Data Found</h2>
                <p className="text-gray-500 mt-2">No entries were found for this period. Add more entries to see your analysis!</p>
            </div>
        );
        return <CustomBarChart data={chartData} />;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <header className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Mood Trend Analysis</h1>
                    <div className="flex gap-4">
                        <button onClick={() => navigate("/feed")} className="text-gray-600 hover:text-purple-600"><Home size={22} /></button>
                        <button onClick={() => navigate("/calendar")} className="text-gray-600 hover:text-purple-600"><CalendarIcon size={22} /></button>
                        <button onClick={() => navigate("/piechart")} className="text-gray-600 hover:text-purple-600"><PieChartIcon size={22} /></button>
                        <button onClick={() => navigate("/analysis")} className="text-purple-600"><BarChart2 size={22} /></button>
                    </div>
                </header>

                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex justify-center items-center gap-4 mb-6 border-b pb-4">
                        <span className="font-semibold text-gray-700">Time Range:</span>
                        {[7, 30, 90].map(d => (
                            <button key={d} onClick={() => setDays(d)}
                                className={`px-4 py-2 rounded-full font-medium transition-colors ${days === d ? 'bg-purple-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                                Last {d} Days
                            </button>
                        ))}
                    </div>
                    <div className="flex justify-center overflow-x-auto" style={{ minHeight: '300px' }}>
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};


export default AnalysisPage;

