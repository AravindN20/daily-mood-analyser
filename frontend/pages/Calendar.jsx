import React, { useState, useEffect, useMemo } from "react";
import { MemoryRouter, Routes, Route, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../src/config";

// --- Inline SVG Icons ---
const ChevronLeft = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
);
const ChevronRight = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
);
const Plus = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);
const CalendarIcon = ({ size = 22 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
);
const Home = ({ size = 22 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
);
const BarChart2 = ({ size = 22 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
);
const Sparkles = ({ size = 20 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3L9.5 8.5L4 11L9.5 13.5L12 19L14.5 13.5L20 11L14.5 8.5L12 3z"/><path d="M5 21L6 17"/><path d="M19 21L18 17"/></svg>
);


// --- Calendar Page Component ---
const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [entries, setEntries] = useState({});
  const [moodCounts, setMoodCounts] = useState({ normal: 0, depressed: 0, stressed: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // State for Gemini API feature
  const [advice, setAdvice] = useState('');
  const [isAdviceLoading, setIsAdviceLoading] = useState(false);
  const [adviceError, setAdviceError] = useState(null);
  const [showAdviceModal, setShowAdviceModal] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      navigate("/login");
      return;
    }

    const fetchAllCalendarData = async () => {
      setIsLoading(true);
      try {
        // Fetch Emojis for Calendar Display (compatible with MySQL backend)
        const emojiRes = await fetch(`${API_BASE_URL}/api/feeds/calendar/${userId}`);
        const emojiData = await emojiRes.json();
        const formattedEntries = {};
        if (emojiData.success && Array.isArray(emojiData.feeds)) {
          emojiData.feeds.forEach(feed => {
            if (feed.date) {
              const dateStr = feed.date.split("T")[0];
              formattedEntries[dateStr] = feed;
            }
          });
        }
        setEntries(formattedEntries);
        
        // Fetch Mood Counts for the Summary (compatible with MySQL backend)
        const countsRes = await fetch(`${API_BASE_URL}/get-mood-counts`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId,
                year: currentDate.getFullYear(),
                month: currentDate.getMonth() + 1 // JS month is 0-11, SQL is 1-12
            }),
        });
        const countsData = await countsRes.json();
        if (countsData.success) {
            setMoodCounts(countsData.counts);
        }

      } catch (err) {
        console.error("Error fetching calendar data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllCalendarData();
  }, [currentDate, navigate]);

  const handleGetAdvice = async () => {
    // This function remains the same, using moodCounts state to generate a prompt.
    setIsAdviceLoading(true);
    setAdviceError(null);
    setAdvice('');
    setShowAdviceModal(true);

    const prompt = `Based on my mood summary for this month (${currentDate.toLocaleString('default', { month: 'long' })}), act as a kind mental health advisor. My summary: Normal days: ${moodCounts.normal}, Stressed days: ${moodCounts.stressed}, Depressed days: ${moodCounts.depressed}. Provide gentle, actionable advice in a few short paragraphs. Use a warm, encouraging tone.`;

    const apiKey = "";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        if (!response.ok) throw new Error(`API error! status: ${response.status}`);
        const result = await response.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) setAdvice(text);
        else throw new Error("Empty response from AI.");
    } catch (err) {
        setAdviceError("Sorry, could not get advice right now. Please try again later.");
    } finally {
        setIsAdviceLoading(false);
    }
  };

  const formatDate = (date) => date.toISOString().split("T")[0];
  const getDaysInMonth = (date) => {
    const year = date.getFullYear(), month = date.getMonth();
    const firstDay = new Date(year, month, 1), daysInMonth = new Date(year, month + 1, 0).getDate();
    const startingDayOfWeek = firstDay.getDay();
    const daysArray = [];
    for (let i = 0; i < startingDayOfWeek; i++) daysArray.push(null);
    for (let d = 1; d <= daysInMonth; d++) daysArray.push(new Date(year, month, d));
    return daysArray;
  };

  const goToPreviousMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const goToNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const handleDateClick = (date) => {
    // To make this fully functional, the /api/feeds/calendar/:userId endpoint should also return the feed ID.
    // For now, it just indicates an entry exists.
    const dateStr = formatDate(date);
    const entry = entries[dateStr];
    if (entry) alert(`You recorded an entry on this day!`);
    else navigate(`/Addcontext?date=${dateStr}`);
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const days = useMemo(() => getDaysInMonth(currentDate), [currentDate]);
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-gray-600 animate-pulse text-lg">Loading Calendar...</p></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Mood Calendar</h1>
          <div className="flex gap-4">
            <button onClick={() => navigate("/feed")} className="text-gray-600 hover:text-purple-600 transition-colors"><Home size={22} /></button>
            <button onClick={() => navigate("/calendar")} className="text-purple-600"><CalendarIcon size={22} /></button>
            <button onClick={() => navigate("/analysis")} className="text-gray-600 hover:text-purple-600 transition-colors"><BarChart2 size={22} /></button>
          </div>
        </header>

        {/* ✨ NEW: Side-by-side layout for calendar and summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Calendar Section (Left Side) */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <button onClick={goToPreviousMonth} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"><ChevronLeft size={20} /></button>
              <h2 className="text-2xl font-bold text-gray-800">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
              <button onClick={goToNextMonth} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"><ChevronRight size={20} /></button>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {dayNames.map((day) => (<div key={day} className="p-3 text-center text-sm font-semibold text-gray-500">{day}</div>))}
              {days.map((date, i) => {
                if (!date) return <div key={i}></div>;
                const dateStr = formatDate(date);
                const entry = entries[dateStr];
                const isToday = formatDate(new Date()) === dateStr;
                return (
                  <div key={i} onClick={() => handleDateClick(date)}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 flex flex-col items-center justify-center h-24 ${isToday ? "border-purple-500 bg-purple-50" : "border-gray-200 bg-white"} hover:shadow-lg hover:border-purple-400`}>
                    <div className="text-sm font-medium text-gray-800 mb-1">{date.getDate()}</div>
                    {entry && <div className="text-2xl mt-1">{entry.emoji}</div>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Monthly Insights Section (Right Side) */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-lg p-6 space-y-6">
            <h3 className="text-xl font-semibold text-gray-800">Monthly Insights</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 border border-green-200">
                <p className="text-sm text-gray-600">Normal Days</p>
                <p className="text-2xl font-bold text-green-600">{moodCounts.normal}</p>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                <p className="text-sm text-gray-600">Stressed Days</p>
                <p className="text-2xl font-bold text-yellow-600">{moodCounts.stressed}</p>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-sm text-gray-600">Depressed Days</p>
                <p className="text-2xl font-bold text-blue-600">{moodCounts.depressed}</p>
              </div>
            </div>
    
          </div>

        </div>

        {/* Floating Add Button */}
        <div className="fixed bottom-8 right-8">
          <button onClick={() => navigate("/Addcontext")} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-transform">
            <Plus size={24} />
          </button>
        </div>
      </div>

    </div>
  );
};


export default CalendarPage;

