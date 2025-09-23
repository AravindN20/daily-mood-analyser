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

// --- Animated Pie Chart Component ---
const AnimatedPieChart = ({ data, colors }) => {
    const [isAnimated, setIsAnimated] = useState(false);
    const totalValue = useMemo(() => data.reduce((acc, item) => acc + item.value, 0), [data]);
    
    useEffect(() => {
        setIsAnimated(false); 
        const timer = setTimeout(() => setIsAnimated(true), 100);
        return () => clearTimeout(timer);
    }, [data]);

    if (totalValue === 0) return null;

    let cumulativeAngle = 0;
    const size = 300;
    const center = size / 2;
    const radius = size / 2 - 10;

    return (
        <div className="flex flex-col md:flex-row items-center justify-center gap-12 p-4">
            {/* Pie Chart */}
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <g transform={`rotate(-90 ${center} ${center})`}>
                    {data.map((item, index) => {
                        const angle = (item.value / totalValue) * 360;
                        const startAngleRad = (cumulativeAngle * Math.PI) / 180;
                        const endAngleRad = ((cumulativeAngle + angle) * Math.PI) / 180;
                        const x1 = center + radius * Math.cos(startAngleRad);
                        const y1 = center + radius * Math.sin(startAngleRad);
                        const x2 = center + radius * Math.cos(endAngleRad);
                        const y2 = center + radius * Math.sin(endAngleRad);
                        const largeArcFlag = angle > 180 ? 1 : 0;
                        const pathData = `M${center},${center} L${x1},${y1} A${radius},${radius} 0 ${largeArcFlag},1 ${x2},${y2} Z`;
                        cumulativeAngle += angle;
                        return (
                            <path 
                                key={item.name} 
                                d={pathData} 
                                fill={colors[index % colors.length]}
                                className="transition-transform duration-500 ease-out origin-center hover:scale-105"
                                style={{
                                    transform: isAnimated ? 'scale(1)' : 'scale(0)',
                                    transitionDelay: `${index * 80}ms`
                                }}
                            />
                        );
                    })}
                </g>
            </svg>

            {/* ✅ Redesigned Legend with Side-by-Side Date Boxes & Gradient Background */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full md:w-[600px] 
                            bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 
                            rounded-xl p-4 shadow-inner">
                {data.map((item, index) => (
                    <div 
                        key={item.name} 
                        className="bg-white shadow-md rounded-lg p-4 border border-slate-200 
                                   hover:shadow-lg transition-shadow flex flex-col justify-between"
                    >
                        {/* Header with color + value */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div 
                                    className="w-5 h-5 rounded-md flex-shrink-0" 
                                    style={{ backgroundColor: colors[index % colors.length] }}
                                ></div>
                                <span className="text-gray-700 font-medium">{item.name}</span>
                            </div>
                            <div className="text-right">
                                <span className="font-bold text-gray-900">{item.value}</span>
                                <span className="ml-1 text-sm text-gray-500">
                                    ({((item.value / totalValue) * 100).toFixed(1)}%)
                                </span>
                            </div>
                        </div>

                        {/* Dates as pill badges */}
                        <div className="bg-slate-50 rounded-md p-2 border border-slate-100 text-xs text-gray-600 min-h-[60px]">
                            {item.dates.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {item.dates.map((date, i) => (
                                        <span 
                                            key={i} 
                                            className="px-2 py-1 bg-gradient-to-r from-purple-200 to-pink-200 
                                                       text-purple-800 rounded-full font-medium shadow-sm"
                                        >
                                            {date}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <span className="italic text-gray-400">No dates recorded</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Main Page ---
const PieChartPage = () => {
    const navigate = useNavigate();
    const [chartData, setChartData] = useState([]);
    const [days, setDays] = useState(30);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAndProcessFeeds = async () => {
            const userId = localStorage.getItem("userId");
            if (!userId) {
                navigate("/login");
                return;
            }
            setIsLoading(true);
            setError(null);
            try {
                // ✅ Fetch feeds
                const response = await fetch(`${API_BASE_URL}/get-feed`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId, days }),
                });
                if (!response.ok) throw new Error("Failed to fetch feed data.");
                const data = await response.json();

                if (data.success) {
                    // ✅ Group by emoji and collect dates
                    const processedData = {};
                    data.feeds.forEach((feed) => {
                        if (!feed.emoji) return;

                        if (!processedData[feed.emoji]) {
                            processedData[feed.emoji] = {
                                name: feed.emoji,
                                value: 0,
                                dates: [],
                            };
                        }

                        processedData[feed.emoji].value += 1;

                        const date = new Date(feed.created_at);
                        const formattedDate = date.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                        });
                        processedData[feed.emoji].dates.push(formattedDate);
                    });

                    const finalChartData = Object.values(processedData).sort(
                        (a, b) => b.value - a.value
                    );
                    setChartData(finalChartData);
                } else {
                    setError("Could not retrieve feed data.");
                }
            } catch (err) {
                setError("Could not connect to the server. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchAndProcessFeeds();
    }, [days, navigate]);
    
    const COLORS = ['#38bdf8', '#34d399', '#fb7185', '#facc15', '#a78bfa', '#84cc16', '#22d3ee', '#f472b6'];
    const hasData = chartData.length > 0;

    const renderContent = () => {
        if (isLoading) return <div className="text-center p-10"><p className="animate-pulse">Loading analysis...</p></div>;
        if (error) return <div className="text-center p-10 text-red-500">{error}</div>;
        if (!hasData) return (
            <div className="text-center p-10">
                <h2 className="text-xl font-semibold text-gray-700">No Data Found</h2>
                <p className="text-gray-500 mt-2">No entries were found for the selected period.</p>
            </div>
        );
        return <AnimatedPieChart key={days} data={chartData} colors={COLORS} />;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-blue-600">Mood Swing Analysis</h1>
                    <div className="flex items-center gap-2">
                        <button onClick={() => navigate("/feed")} className="p-2 rounded-full text-slate-500 hover:bg-slate-200 hover:text-purple-600"><Home /></button>
                        <button onClick={() => navigate("/calendar")} className="p-2 rounded-full text-slate-500 hover:bg-slate-200 hover:text-purple-600"><CalendarIcon /></button>
                        <button onClick={() => navigate("/piechart")} className="p-2 rounded-full text-purple-600 bg-purple-100"><PieChartIcon /></button>
                        <button onClick={() => navigate("/analysis")} className="p-2 rounded-full text-slate-500 hover:bg-slate-200 hover:text-purple-600"><BarChart2 /></button>
                    </div>
                </header>

                <div className="bg-white/70 backdrop-blur-xl rounded-xl shadow-lg p-6">
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

export default PieChartPage;
