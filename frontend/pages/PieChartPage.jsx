import React, { useState, useEffect, useMemo } from "react";
// ✨ Removed router wrapper as it should be handled in the main App.js
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




// --- ✨ MODIFIED: Custom Chart component rewritten to use CSS for a drawing animation ---
const CustomDonutChart = ({ data, colors }) => {
    const totalValue = useMemo(() => data.reduce((acc, item) => acc + item.value, 0), [data]);
    if (totalValue === 0) return null;

    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    let cumulativeOffset = 0;

    return (
        <div className="flex flex-col md:flex-row items-center justify-center gap-12 p-4">
            <svg width="300" height="300" viewBox="0 0 200 200" className="transform -rotate-90">
                {/* Background circle to show the track */}
                <circle r={radius} cx="100" cy="100" fill="transparent" stroke="#f3f4f6" strokeWidth="35" />

                {data.map((item, index) => {
                    const percentage = item.value / totalValue;
                    const strokeDashoffset = circumference * (1 - percentage);
                    const rotation = (cumulativeOffset / totalValue) * 360;
                    cumulativeOffset += item.value;

                    return (
                        <circle
                            key={index}
                            r={radius}
                            cx="100"
                            cy="100"
                            fill="transparent"
                            stroke={colors[index % colors.length]}
                            strokeWidth="35"
                            strokeDasharray={circumference}
                            // The animation is now handled by the CSS keyframe below
                            strokeDashoffset={circumference} 
                            transform={`rotate(${rotation} 100 100)`}
                            style={{ 
                                animation: `draw-segment 1s ease-out forwards`,
                                '--final-offset': strokeDashoffset 
                            }}
                        />
                    );
                })}
            </svg>
            <div className="flex flex-col gap-3 self-center md:self-start max-h-[300px] overflow-y-auto pr-4">
                {data.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 text-sm">
                        <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: colors[index % colors.length] }}></div>
                        <span className="text-gray-700">{item.name}</span>
                        <span className="font-bold text-gray-800">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


const PieChartPage = () => {
    const navigate = useNavigate();
    const [chartData, setChartData] = useState([]);
    const [days, setDays] = useState(30);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEmojiCounts = async () => {
            const userId = localStorage.getItem("userId");
            if (!userId) {
                navigate("/login");
                return;
            }
            try {
                setIsLoading(true);
                setError(null);
                const response = await fetch(`${API_BASE_URL}/get-emoji-counts`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId, days }),
                });
                if (!response.ok) throw new Error("Failed to fetch emoji data.");
                const data = await response.json();
                if (data.success) {
                    const formattedData = data.emojiCounts.map(item => ({ name: item.emoji, value: item.count }));
                    setChartData(formattedData);
                } else {
                    setError("Could not retrieve emoji data.");
                }
            } catch (err) {
                setError("Could not connect to the server. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchEmojiCounts();
    }, [days, navigate]);
    
    // ✨ DELETED: The JS-based animation useEffect is no longer needed.

    const COLORS = ['#7dd3fc', '#6ee7b7', '#fda4af', '#fcd34d', '#c4b5fd', '#bef264', '#67e8f9', '#f9a8d4'];
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
        return <CustomDonutChart data={chartData} colors={COLORS} />;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* ✨ ADDED: Keyframes for the new CSS drawing animation */}
            <style>{`
                @keyframes draw-segment {
                    from { stroke-dashoffset: ${2 * Math.PI * 80}; }
                    to { stroke-dashoffset: var(--final-offset); }
                }
            `}</style>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <header className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Emoji Analysis</h1>
                    <div className="flex gap-4">
                        <button onClick={() => navigate("/feed")} className="text-gray-600 hover:text-purple-600"><Home size={22} /></button>
                        <button onClick={() => navigate("/calendar")} className="text-gray-600 hover:text-purple-600"><CalendarIcon size={22} /></button>
                        <button onClick={() => navigate("/piechart")} className="text-purple-600"><PieChartIcon size={22} /></button>
                        <button onClick={() => navigate("/analysis")} className="text-gray-600 hover:text-purple-600"><BarChart2 size={22} /></button>
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
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default PieChartPage;

