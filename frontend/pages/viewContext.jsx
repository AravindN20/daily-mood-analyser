import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import { API_BASE_URL } from '../src/config'; // ✅ dynamic base URL

const ViewContextPage = () => {
  const { id } = useParams();
  const [feed, setFeed] = useState(null);
  const [editable, setEditable] = useState(false);
  const [showEmojiOptions, setShowEmojiOptions] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/get-feed/${id}`);
        const data = await response.json();
        if (response.ok && data.success) {
          setFeed(data.feed);
        }
      } catch (err) {
        console.error("Error fetching feed:", err);
      }
    };
    fetchFeed();
  }, [id]);

  const handleSave = async () => {
    const updatedFeed = {
      id,
      title: feed.title,
      content: feed.content,
      emoji: feed.emoji,
    };
    try {
      const response = await fetch(`${API_BASE_URL}/update-feed/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFeed),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setEditable(false);
      }
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/delete-feed/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (response.ok && data.success) {
        navigate('/feed');
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  const formatDateTime = (dateStr) =>
    new Date(dateStr).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

  const getCardBackgroundColor = (emoji) => {
    switch (emoji) {
      case "🙂": return "bg-gradient-to-r from-green-200 to-yellow-100";
      case "😔": return "bg-gradient-to-r from-gray-300 to-slate-500";
      case "😄": return "bg-gradient-to-r from-yellow-200 to-yellow-400";
      case "😡": return "bg-gradient-to-r from-red-400 to-yellow-300";
      case "😭": return "bg-gradient-to-r from-cyan-200 to-blue-300";
      case "😱": return "bg-gradient-to-r from-pink-200 to-indigo-300";
      case "😕": return "bg-gradient-to-r from-blue-200 to-indigo-200";
      default: return "bg-white";
    }
  };

  const emojiOptions = ['🙂', '😔', '😄', '😡', '😭', '😱', '😕'];

  if (!feed) return <p className="text-white p-5">Loading feed...</p>;

  return (
    <div className={`${getCardBackgroundColor(feed.emoji)} min-h-screen p-5 font-sans`}>
      {/* Top Navigation */}
      {editable ? (
        <button
          onClick={() => setEditable(false)}
          className="mb-5 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          ⬅ Back
        </button>
      ) : (
        <div className="flex justify-between items-center mb-5 shadow-md p-3 rounded-lg bg-white/80">
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
          >
             Back
          </button>
          <div className="flex gap-3">
            <Pencil
              onClick={() => setEditable(true)}
              size={24}
              className="cursor-pointer text-yellow-500"
            />
            <Trash2
              onClick={handleDelete}
              size={24}
              className="cursor-pointer text-red-500"
            />
          </div>
        </div>
      )}

      {/* Emoji + Date */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
        <div className="flex items-center gap-3">
          {editable ? (
            <div className="relative">
              <span
                className="text-4xl cursor-pointer"
                onClick={() => setShowEmojiOptions(!showEmojiOptions)}
              >
                {feed.emoji}
              </span>
              {showEmojiOptions && (
                <div className="absolute top-12 left-0 flex gap-2 bg-white shadow-md rounded-lg p-2">
                  {emojiOptions.map((emoji) => (
                    <span
                      key={emoji}
                      onClick={() => {
                        setFeed({ ...feed, emoji });
                        setShowEmojiOptions(false);
                      }}
                      className="text-2xl cursor-pointer hover:scale-110 transition"
                    >
                      {emoji}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <span className="text-4xl">{feed.emoji}</span>
          )}
          <span className="text-lg">{formatDate(feed.created_at)}</span>
        </div>

        {!editable && (
          <p className="text-xs text-gray-600">
            Last edited: {formatDateTime(feed.updated_at || feed.created_at)}
          </p>
        )}
      </div>

      {/* Content */}
      {editable ? (
        <>
          <input
            type="text"
            value={feed.title}
            onChange={(e) => setFeed({ ...feed, title: e.target.value })}
            placeholder="Title"
            className="w-full text-xl mb-3 p-2 rounded-lg border"
          />
          <textarea
            value={feed.content}
            onChange={(e) => setFeed({ ...feed, content: e.target.value })}
            placeholder="Write more here..."
            rows={6}
            className="w-full text-base mb-3 p-2 rounded-lg border"
          />
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              Save
            </button>
            <button
              onClick={() => setEditable(false)}
              className="px-5 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition"
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <h2 className="text-2xl font-semibold my-3">{feed.title}</h2>
          <p className="mt-4 text-base">{feed.content}</p>
        </>
      )}
    </div>
  );
};

export default ViewContextPage;
