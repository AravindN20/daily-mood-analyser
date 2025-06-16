import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdAddPhotoAlternate } from 'react-icons/md';
import { API_BASE_URL } from '../src/config'; // ✅ dynamic base URL
const AddContextPage = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [emoji, setEmoji] = useState('🙂');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();


  const formattedDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    const user_id = localStorage.getItem('userId');
    if (!user_id || (!title && !content && !image)) return;

    const payload = {
      user_id,
      title,
      content,
      image_url: image,
      emoji,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/save-feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        navigate('/feed');
      }
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const getCardBackgroundColor = (emoji) => {
    switch (emoji) {
      case "🙂": return "linear-gradient(to right,rgb(196, 228, 212),rgb(221, 226, 180))";
      case "😔": return "linear-gradient(to right, #d7d2cc, rgb(75, 96, 112))";
      case "😄": return "linear-gradient(to right, rgb(240, 206, 119), rgb(236, 244, 118))";
      case "😡": return "linear-gradient(to right,rgb(240, 111, 113), rgb(227, 166, 96))";
      case "😭": return "linear-gradient(to right, rgb(64, 89, 91), rgb(128, 166, 219))";
      case "😱": return "linear-gradient(to right,rgb(120, 225, 79),rgb(197, 222, 88))";
      case "😕": return "linear-gradient(to right,rgb(153, 213, 237),rgb(75, 134, 141))";
      default: return "#1a2b4c";
    }
  };

  const pageStyle = {
    background: getCardBackgroundColor(emoji),
    minHeight: '100vh',
    color: 'white',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    position: 'relative',
    transition: 'background 0.5s ease'
  };

  return (
    <div style={pageStyle}>
      <div style={topNavStyle}>
        <button onClick={() => navigate('/feed')} style={navBtnStyle}>Feed</button>
        <button onClick={() => navigate('/calendar')} style={navBtnStyle}>Calendar</button>
      </div>

      <div style={dateRowStyle}>
        <select
          onChange={(e) => setEmoji(e.target.value)}
          value={emoji}
          style={emojiSelectStyle}
        >
          <option>🙂</option>
          <option>😔</option>
          <option>😄</option>
          <option>😡</option>
          <option>😭</option>
          <option>😕</option>
          <option>😱</option>
        </select>

        <h2 style={{ margin: 0 }}>{formattedDate}</h2>

        <div
          title="Upload image"
          style={{ cursor: 'pointer', fontSize: '28px', color: 'white' }}
          onClick={() => fileInputRef.current.click()}
        >
          <MdAddPhotoAlternate />
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={inputStyle}
      />

      <textarea
        placeholder="Write more here..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={10}
        style={textareaStyle}
      />

      {image && (
        <div style={{ marginTop: '10px' }}>
          <img src={image} alt="Preview" style={imgPreviewStyle} />
        </div>
      )}

      <button onClick={handleSave} style={saveBtnStyle}>Save</button>
    </div>
  );
};

// 🔧 Styles
const topNavStyle = {
  position: 'absolute',
  top: '20px',
  right: '20px',
  display: 'flex',
  alignItems: 'center',
  gap: '12px'
};

const navBtnStyle = {
  padding: '6px 12px',
  fontSize: '14px',
  backgroundColor: '#4da6ff',
  border: 'none',
  borderRadius: '6px',
  color: '#fff',
  cursor: 'pointer'
};

const dateRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  marginBottom: '20px',
  marginTop: '20px',
};

const emojiSelectStyle = {
  fontSize: '28px',
  padding: '6px',
  borderRadius: '6px',
  backgroundColor: 'rgba(0,0,0,0.3)',
  color: 'white',
  border: 'none',
  outline: 'none',
  appearance: 'none',
  cursor: 'pointer'
};

const inputStyle = {
  width: '100%',
  padding: '6px',
  marginBottom: '10px',
  fontSize: '18px',
  borderRadius: '8px',
  border: 'none',
  backgroundColor: 'white',
  color: 'black'
};

const textareaStyle = {
  width: '100%',
  padding: '6px',
  fontSize: '16px',
  borderRadius: '8px',
  border: 'none',
  resize: 'vertical',
  backgroundColor: 'white',
  color: 'black'
};

const imgPreviewStyle = {
  width: '100%',
  maxHeight: '200px',
  objectFit: 'cover',
  borderRadius: '8px'
};

const saveBtnStyle = {
  marginTop: '20px',
  padding: '10px 20px',
  fontSize: '16px',
  backgroundColor: '#4da6ff',
  border: 'none',
  borderRadius: '8px',
  color: '#fff',
  cursor: 'pointer'
};

export default AddContextPage;
