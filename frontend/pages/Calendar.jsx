import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../src/config";

// --- Inline SVG Icons ---
const ChevronLeft = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
);
const ChevronRight = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
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
const PieChartIcon = ({ size = 22 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
);

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [entries, setEntries] = useState({});
  const [moodCounts, setMoodCounts] = useState({ normal: 0, depressed: 0, stressed: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const formatDate = (date) => {
    if (!date) return null;
    const year = date.getFullYear(),
          month = String(date.getMonth() + 1).padStart(2, '0'),
          day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) { navigate("/login"); return; }

    const fetchAllCalendarData = async () => {
      setIsLoading(true);
      try {
        const [emojiRes, countsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/feeds/calendar/${userId}`),
          fetch(`${API_BASE_URL}/get-mood-counts`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId,
              year: currentDate.getFullYear(),
              month: currentDate.getMonth() + 1
            }),
          })
        ]);

        const emojiData = await emojiRes.json();
        const countsData = await countsRes.json();

        if (emojiData.success && Array.isArray(emojiData.feeds)) {
          const formattedEntries = {};
          emojiData.feeds.forEach(feed => {
            if (feed.date) formattedEntries[feed.date.split("T")[0]] = feed;
          });
          setEntries(formattedEntries);
        }

        if (countsData.success) setMoodCounts(countsData.counts);

      } catch (err) {
        console.error("Error fetching calendar data:", err);
      } finally { setIsLoading(false); }
    };

    fetchAllCalendarData();
  }, [currentDate, navigate]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear(), month = date.getMonth();
    const firstDay = new Date(year, month, 1),
          daysInMonth = new Date(year, month + 1, 0).getDate(),
          startingDayOfWeek = firstDay.getDay();
    const daysArray = [];
    for (let i = 0; i < startingDayOfWeek; i++) daysArray.push(null);
    for (let d = 1; d <= daysInMonth; d++) daysArray.push(new Date(year, month, d));
    return daysArray;
  };

  const goToPreviousMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const goToNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const handleDateClick = (date) => {
    const dateStr = formatDate(date);
    const entry = entries[dateStr];
    if (entry) alert(`You recorded an entry on this day!`);
    else navigate(`/Addcontext?date=${dateStr}`);
  };

  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const days = useMemo(() => getDaysInMonth(currentDate), [currentDate]);

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <p className="text-slate-600 animate-pulse text-lg">Loading Calendar...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      <div className="max-w-5xl mx-auto w-full">
        {/* ✅ MODIFIED: Header is now separate from the calendar card */}
        <header className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-blue-600">Mood Calendar</h1>
          <nav className="flex gap-4">
            <button onClick={() => navigate("/feed")} className="text-gray-600 hover:text-purple-600 transition-colors"><Home size={22} /></button>
            <button onClick={() => navigate("/piechart")} className="text-gray-600 hover:text-purple-600 transition-colors"><PieChartIcon size={22} /></button>
            <button onClick={() => navigate("/analysis")} className="text-gray-600 hover:text-purple-600 transition-colors"><BarChart2 size={22} /></button>
            <button onClick={() => navigate("/calendar")} className="text-purple-600"><CalendarIcon size={22} /></button>
          </nav>
        </header>

        {/* ✅ MODIFIED: Main calendar card with reduced internal spacing */}
        <main className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <button onClick={goToPreviousMonth} className="p-2 text-slate-500 hover:bg-slate-200 rounded-full transition-colors"><ChevronLeft /></button>
            <h2 className="text-xl font-bold text-slate-800">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
            <button onClick={goToNextMonth} className="p-2 text-slate-500 hover:bg-slate-200 rounded-full transition-colors"><ChevronRight /></button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3 py-3 border-y border-slate-200/80">
            <div className="bg-white/50 p-3 rounded-xl shadow-sm border border-slate-200">
              <p className="text-sm font-semibold text-green-700">Normal Days</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{moodCounts.normal}</p>
            </div>
            <div className="bg-white/50 p-3 rounded-xl shadow-sm border border-slate-200">
              <p className="text-sm font-semibold text-yellow-700">Stressed Days</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{moodCounts.stressed}</p>
            </div>
            <div className="bg-white/50 p-3 rounded-xl shadow-sm border border-slate-200">
              <p className="text-sm font-semibold text-blue-700">Depressed Days</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{moodCounts.depressed}</p>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {dayNames.map(day => <div key={day} className="text-center text-xs font-semibold text-slate-500 pb-2">{day}</div>)}
            {days.map((date, i) => {
              if (!date) return <div key={i} className="rounded-lg"></div>;
              
              const dateStr = formatDate(date); 
              const entry = entries[dateStr];
              const isToday = formatDate(new Date()) === dateStr;

              return (
                <div key={i} onClick={() => handleDateClick(date)}
                  className={`relative p-2 rounded-lg cursor-pointer transition-all duration-200 flex flex-col items-center justify-center h-20 group border
                    ${isToday ? 'ring-2 ring-purple-500' : 'border-slate-200'}
                    ${entry ? 'bg-purple-50' : 'bg-white'}
                    hover:scale-105 hover:shadow-md hover:z-10`}>
                  <div className={`text-sm font-semibold transition-colors ${isToday ? 'text-purple-700' : 'text-slate-700'}`}>
                    {date.getDate()}
                  </div>
                  {entry && <div className="text-3xl mt-1 transition-transform group-hover:scale-110">{entry.emoji}</div>}
                </div>
              );
            })}
          </div>
        </main>
      </div>

      <div className="fixed bottom-6 right-6">
        <button onClick={() => navigate("/Addcontext")} className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-transform">
          <Plus size={24} />
        </button>
      </div>
    </div>
  );
};

export default CalendarPage;