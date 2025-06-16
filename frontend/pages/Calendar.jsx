import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from '../src/config'; // ✅ dynamic base URL
// ✅ Set API base URL depending on environment


const Calendar = () => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [emojiMap, setEmojiMap] = useState({});
  const navigate = useNavigate();

  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const formatKey = (y, m, d) => `${y}-${m + 1}-${d}`;

  useEffect(() => {
    const fetchEmojis = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/userfeeds`);
        const map = {};
        res.data.forEach(({ emoji, created_at }) => {
          const d = new Date(created_at);
          const key = formatKey(d.getFullYear(), d.getMonth(), d.getDate());
          map[key] = emoji;
        });
        setEmojiMap(map);
      } catch (err) {
        console.error("Failed to fetch userfeeds", err);
      }
    };
    fetchEmojis();
  }, []);

  const generateCalendar = () => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const totalDays = getDaysInMonth(currentYear, currentMonth);
    const weeks = [];
    let dayCounter = 1 - firstDay;

    for (let w = 0; w < 6; w++) {
      const days = [];
      for (let dow = 0; dow < 7; dow++) {
        const valid = dayCounter > 0 && dayCounter <= totalDays;
        const dt = new Date(currentYear, currentMonth, dayCounter);
        const key = formatKey(currentYear, currentMonth, dayCounter);
        const isToday = valid && dt.toDateString() === today.toDateString();
        const emoji = emojiMap[key];

        days.push(
          <td
            key={dow}
            style={{
              width: "80px",
              height: "80px",
              background: isToday
                ? "linear-gradient(135deg, rgb(40, 187, 86), rgb(32, 231, 128))"
                : valid
                ? "rgba(255, 255, 255, 0.2)"
                : "transparent",
              color: "black",
              borderRadius: "12px",
              fontWeight: isToday ? "bold" : "normal",
              textAlign: "center",
              verticalAlign: "top",
              backdropFilter: "blur(6px)",
              cursor: "default",
              transition: "0.3s ease-in-out",
              paddingTop: "10px",
            }}
          >
            {valid && (
              <>
                <div style={{ fontSize: "16px" }}>{dayCounter}</div>
                <div style={{ fontSize: "20px", marginTop: "5px" }}>{emoji}</div>
              </>
            )}
          </td>
        );
        dayCounter++;
      }
      weeks.push(<tr key={w}>{days}</tr>);
    }
    return weeks;
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const years = Array.from({ length: 21 }, (_, i) => today.getFullYear() - 10 + i);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(to right, rgb(139, 182, 238), rgb(88, 80, 152))",
      padding: "30px",
      fontFamily: "'Segoe UI', sans-serif"
    }}>
      <button
        onClick={() => navigate("/feed")}
        style={{
          padding: "8px 16px",
          backgroundColor: "pink",
          color: "#000",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          marginBottom: "20px",
          fontWeight: "bold",
          transition: "0.3s ease-in-out",
        }}
        onMouseOver={e => e.target.style.backgroundColor = "#ffa94d"}
        onMouseOut={e => e.target.style.backgroundColor = "#ffc078"}
      >
        ← Back to Feed
      </button>

      <div style={{
        background: "rgba(255, 255, 255, 0.1)",
        borderRadius: "20px",
        boxShadow: "0 8px 32px 0 rgba(27, 227, 44, 0.2)",
        maxWidth: "850px",
        margin: "auto",
        padding: "30px",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(168, 105, 45, 0.2)"
      }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
          <select
            value={currentMonth}
            onChange={e => setCurrentMonth(+e.target.value)}
            style={{
              padding: "8px 12px",
              marginRight: "10px",
              borderRadius: "8px",
              border: "1px solid #060709"
            }}
          >
            {monthNames.map((m, i) => <option key={m} value={i}>{m}</option>)}
          </select>
          <select
            value={currentYear}
            onChange={e => setCurrentYear(+e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid #080809"
            }}
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "10px" }}>
          <thead>
            <tr>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                <th key={d} style={{
                  textAlign: "center",
                  fontSize: "15px",
                  color: "black",
                  paddingBottom: "10px"
                }}>{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>{generateCalendar()}</tbody>
        </table>
      </div>
    </div>
  );
};

export default Calendar;
