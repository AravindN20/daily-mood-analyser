import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
// ✨ FIX: Replaced 'react-icons/fa' with 'lucide-react' which is already in use.
import { Calendar, Plus, PieChart, Pencil, Trash2 } from 'lucide-react';

// ✨ FIX: Defined API_BASE_URL directly to resolve the import error.
const API_BASE_URL = 'http://localhost:3000';

const FeedPage = () => {
  const [feeds, setFeeds] = useState([]);
  const [hoveredId, setHoveredId] = useState(null);
  const [userName, setUserName] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeeds = async () => {
      const userId = localStorage.getItem('userId');
      const storedName = localStorage.getItem('username');

      setUserName(storedName || 'Guest');

      if (!userId) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/get-feed`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });

        const data = await response.json();
        if (data.success && Array.isArray(data.feeds)) {
          setFeeds(data.feeds);
        } else {
          setFeeds([]);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchFeeds();
  }, [navigate]);
  
  const handleDelete = async (idToDelete) => {
    if (!window.confirm("Are you sure you want to permanently delete this entry?")) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/delete-feed/${idToDelete}`, {
            method: 'DELETE',
        });
        const data = await response.json();
        if (data.success) {
            setFeeds(currentFeeds => currentFeeds.filter(feed => feed.id !== idToDelete));
        } else {
            console.error("Failed to delete feed:", data.message);
        }
    } catch (error) {
        console.error("Delete request error:", error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const getCardBackgroundColor = (emoji) => {
    switch (emoji) {
      case "🙂": return "from-green-200 to-green-100";
      case "😔": return "from-gray-300 to-gray-400";
      case "😄": return "from-yellow-200 to-yellow-300";
      case "😡": return "from-red-400 to-yellow-200";
      case "😭": return "from-cyan-200 to-blue-300";
      case "😱": return "from-pink-200 to-indigo-200";
      case "😕": return "from-blue-200 to-indigo-300";
      default: return "from-gray-100 to-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 p-6">
      {/* Header Bar */}
      <div className="flex justify-between items-center mb-8 relative">
        <div onClick={toggleDropdown} className="flex items-center gap-3 cursor-pointer relative">
          <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-lg font-bold text-white shadow-lg">
            {userName.charAt(0).toUpperCase()}
          </div>
          <span className="font-semibold text-gray-800 text-lg">{userName}</span>
          {showDropdown && (
            <div className="absolute top-14 left-0 bg-white shadow-lg rounded-xl p-2 w-32 z-20">
              <div onClick={handleLogout} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded cursor-pointer">
                Logout
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-5 items-center">
          {/* ✨ FIX: Replaced Fa icons with lucide-react icons */}
          <PieChart 
            size={22} 
            className="text-gray-700 hover:text-indigo-600 cursor-pointer transition-transform transform hover:scale-110" 
            onClick={() => alert("Analysis coming soon...")} 
          />
          <Calendar 
            size={22} 
            className="text-gray-700 hover:text-indigo-600 cursor-pointer transition-transform transform hover:scale-110" 
            onClick={() => navigate('/calendar')} 
          />
        </div>
      </div>

      {/* Page Title */}
      <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600 mb-6">
        Your Feeds
      </h1>

      {/* Feed List */}
      {feeds.length > 0 ? (
        <div className="flex flex-col gap-6">
          {feeds.map((feed) => (
            <div
              key={feed.id}
              onMouseEnter={() => setHoveredId(feed.id)}
              onMouseLeave={() => setHoveredId(null)}
               onClick={() => navigate(`/viewcontext/${feed.id}`)}
              className={`relative p-6 rounded-2xl shadow-lg bg-gradient-to-r ${getCardBackgroundColor(feed.emoji)} transition-all transform hover:scale-105 hover:shadow-2xl cursor-pointer`}
            >
                {hoveredId === feed.id && (
                    <div className="absolute top-4 right-4 flex items-center gap-3 bg-white/50 p-2 rounded-full">
                        <Pencil
                            size={18}
                            className="text-gray-700 hover:text-blue-600 transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/viewcontext/${feed.id}`);
                            }}
                        />
                        <Trash2
                            size={18}
                            className="text-gray-700 hover:text-red-600 transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(feed.id);
                            }}
                        />
                    </div>
                )}
              <h2 className="text-xl font-bold mb-2 text-gray-900">{feed.title}</h2>
              <p className="text-sm text-gray-600 mb-3">{new Date(feed.created_at).toLocaleDateString()}</p>
              <p className="text-gray-800 line-clamp-2">{feed.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center mt-10 italic">No feeds available.</p>
      )}

      {/* Floating Add Button */}
      <button
        onClick={() => navigate('/Addcontext')}
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
      >
        {/* ✨ FIX: Replaced Fa icon with lucide-react icon */}
        <Plus size={22} />
      </button>
    </div>
  );
};

export default FeedPage;

