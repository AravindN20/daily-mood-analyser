import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../src/config"; // ✅ dynamic base URL

const AddContextPage = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [emoji, setEmoji] = useState("🙂");
  const navigate = useNavigate();

  const formattedDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const handleSave = async () => {
    const user_id = localStorage.getItem("userId");
    if (!user_id || (!title && !content)) return;

    const payload = { user_id, title, content, emoji };

    try {
      const response = await fetch(`${API_BASE_URL}/save-feed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        navigate("/feed");
      }
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  // 🎨 Mood-based background color
  const getBgClass = (emoji) => {
    switch (emoji) {
      case "🙂":
        return "bg-gradient-to-r from-emerald-200 to-lime-200";
      case "😔":
        return "bg-gradient-to-r from-gray-300 to-slate-600";
      case "😄":
        return "bg-gradient-to-r from-yellow-300 to-yellow-200";
      case "😡":
        return "bg-gradient-to-r from-red-400 to-orange-300";
      case "😭":
        return "bg-gradient-to-r from-cyan-800 to-indigo-400";
      case "😱":
        return "bg-gradient-to-r from-green-400 to-lime-300";
      case "😕":
        return "bg-gradient-to-r from-sky-300 to-cyan-700";
      default:
        return "bg-slate-800";
    }
  };

  return (
    <div
      className={`${getBgClass(
        emoji
      )} min-h-screen text-white p-6 transition-colors duration-500`}
    >
      {/* 🔝 Navigation */}
      <div className="absolute top-4 right-6 flex gap-3">
        <button
          onClick={() => navigate("/feed")}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm font-medium"
        >
          My Feed
        </button>
        <button
          onClick={() => navigate("/calendar")}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm font-medium"
        >
          Mood Calendar
        </button>
      </div>

      {/* 😃 Emoji + Date in one row */}
      <div className="flex items-center gap-4 mt-12 mb-6">
        <select
          value={emoji}
          onChange={(e) => setEmoji(e.target.value)}
          className="text-3xl bg-transparent cursor-pointer focus:outline-none"
        >
          <option>🙂</option>
          <option>😔</option>
          <option>😄</option>
          <option>😡</option>
          <option>😭</option>
          <option>😕</option>
          <option>😱</option>
        </select>
        <h2 className="text-xl font-semibold">{formattedDate}</h2>
      </div>

      {/* 📝 Title */}
      <input
        type="text"
        placeholder="Add a short title for your day"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-3 mb-4 rounded-lg text-black text-lg focus:ring-2 focus:ring-blue-400 outline-none"
      />

      {/* 📝 Content */}
      <textarea
        placeholder="How are you feeling today? Write your thoughts here..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={8}
        className="w-full p-3 rounded-lg text-black text-base resize-y focus:ring-2 focus:ring-blue-400 outline-none"
      />

      {/* 💾 Save */}
      <button
        onClick={handleSave}
        className="mt-6 px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl text-white font-semibold text-lg shadow-lg"
      >
        Save Entry
      </button>
    </div>
  );
};

export default AddContextPage;
