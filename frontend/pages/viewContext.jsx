import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Pencil, Trash2, ImagePlus } from 'lucide-react';
import { API_BASE_URL } from '../src/config'; // ✅ dynamic base URL

const ViewContextPage = () => {
  const { id } = useParams();
  const [feed, setFeed] = useState(null);
  const [editable, setEditable] = useState(false);
  const [image, setImage] = useState(null);
  const [showEmojiOptions, setShowEmojiOptions] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/get-feed/${id}`);
        const data = await response.json();
        if (response.ok && data.success) {
          setFeed(data.feed);
          setImage(data.feed.image_url);
        }
      } catch (err) {
        console.error("Error fetching feed:", err);
      }
    };
    fetchFeed();
  }, [id]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    const updatedFeed = {
      id,
      title: feed.title,
      content: feed.content,
      emoji: feed.emoji,
      image_url: image,
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
      case "🙂": return "linear-gradient(to right, #a1ffce, #faffd1)";
      case "😔": return "linear-gradient(to right, #d7d2cc, rgb(99, 125, 145))";
      case "😄": return "linear-gradient(to right, rgb(225, 194, 115), rgb(237, 198, 92))";
      case "😡": return "linear-gradient(to right, #ff4e50, rgb(242, 201, 87))";
      case "😭": return "linear-gradient(to right, rgb(139, 227, 234), rgb(128, 166, 219))";
      case "😱": return "linear-gradient(to right, #fbc2eb, #a6c1ee)";
      case "😕": return "linear-gradient(to right, #c2e9fb, #a1c4fd)";
      default: return "#ffffff";
    }
  };

  const emojiOptions = ['🙂', '😔', '😄', '😡', '😭', '😱', '😕'];

  if (!feed) return <p style={{ color: 'white', padding: '20px' }}>Loading feed...</p>;

  const bodyBg = getCardBackgroundColor(feed.emoji);

  return (
    <div style={{
      background: bodyBg,
      minHeight: '100vh',
      padding: '20px',
      color: '#333',
      fontFamily: 'Arial',
    }}>
      {editable ? (
        <button
          onClick={() => setEditable(false)}
          style={{
            marginBottom: '20px',
            backgroundColor: '#4da6ff',
            color: 'white',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          ⬅ Back
        </button>
      ) : (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          padding: '10px',
          borderRadius: '10px',
          backgroundColor: '#ffffff90',
        }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              backgroundColor: '#4da6ff',
              color: 'white',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            ⬅ Back
          </button>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Pencil onClick={() => setEditable(true)} size={24} style={{ cursor: 'pointer', color: '#ffa500' }} />
            <Trash2 onClick={handleDelete} size={24} style={{ cursor: 'pointer', color: '#ff4d4d' }} />
          </div>
        </div>
      )}

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        marginBottom: '10px',
        gap: '10px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {editable ? (
            <div style={{ position: 'relative' }}>
              <span
                style={{
                  fontSize: '40px',
                  cursor: 'pointer',
                }}
                onClick={() => setShowEmojiOptions(!showEmojiOptions)}
              >
                {feed.emoji}
              </span>
              {showEmojiOptions && (
                <div
                  style={{
                    position: 'absolute',
                    top: '45px',
                    left: '0',
                    display: 'flex',
                    flexDirection: 'row',
                    background: bodyBg,
                    borderRadius: '8px',
                    padding: '6px 10px',
                    zIndex: 1000,
                    gap: '10px',
                  }}
                >
                  {emojiOptions.map((emoji) => (
                    <span
                      key={emoji}
                      onClick={() => {
                        setFeed({ ...feed, emoji });
                        setShowEmojiOptions(false);
                      }}
                      style={{
                        fontSize: '32px',
                        cursor: 'pointer',
                      }}
                    >
                      {emoji}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <span style={{ fontSize: '40px' }}>{feed.emoji}</span>
          )}
          <span style={{ fontSize: '18px' }}>{formatDate(feed.created_at)}</span>
          {editable && (
            <>
              <label htmlFor="imageUpload" style={{ cursor: 'pointer' }}>
                <ImagePlus size={24} />
              </label>
              <input
                id="imageUpload"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageUpload}
              />
            </>
          )}
        </div>

        {!editable && (
          <p style={{ fontSize: '13px', color: '#444' }}>
            Last edited: {formatDateTime(feed.updated_at || feed.created_at)}
          </p>
        )}
      </div>

      {editable ? (
        <>
          <input
            type="text"
            value={feed.title}
            onChange={(e) => setFeed({ ...feed, title: e.target.value })}
            placeholder="Title"
            style={{
              width: '100%',
              fontSize: '20px',
              marginBottom: '10px',
              padding: '6px',
              borderRadius: '8px',
              border: 'none',
            }}
          />
          <textarea
            value={feed.content}
            onChange={(e) => setFeed({ ...feed, content: e.target.value })}
            placeholder="Write more here..."
            rows={6}
            style={{
              width: '100%',
              fontSize: '16px',
              marginBottom: '10px',
              padding: '6px',
              borderRadius: '8px',
              border: 'none',
            }}
          />
          {image && (
            <img
              src={image}
              alt="Uploaded"
              style={{
                width: '100%',
                maxHeight: '200px',
                borderRadius: '8px',
                marginTop: '10px',
              }}
            />
          )}
          <div style={{ marginTop: '16px' }}>
            <button
              onClick={handleSave}
              style={{
                marginRight: '10px',
                padding: '10px 20px',
                backgroundColor: 'green',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
              }}
            >
              Save
            </button>
            <button
              onClick={() => setEditable(false)}
              style={{
                padding: '10px 20px',
                backgroundColor: 'gray',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <h2 style={{ margin: '10px 0' }}>{feed.title}</h2>
          {feed.image_url && (
            <img
              src={feed.image_url}
              alt="context"
              style={{
                width: '100%',
                maxHeight: '200px',
                borderRadius: '8px',
                marginBottom: '10px',
              }}
            />
          )}
          <p style={{ marginTop: '16px' }}>{feed.content}</p>
        </>
      )}
    </div>
  );
};

export default ViewContextPage;
