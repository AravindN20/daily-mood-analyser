import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaPlus } from 'react-icons/fa';
import { API_BASE_URL } from '../src/config'; // ✅ dynamic base URL
// ✅ Set API base URL depending on environment


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

      if (storedName) {
        setUserName(storedName);
      } else {
        setUserName('Guest');
      }

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
          alert("No feeds found or unexpected data format.");
        }
      } catch (error) {
        console.error("Fetch error:", error);
        alert("Server error. Try again later.");
      }
    };

    fetchFeeds();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const getCardBackgroundColor = (emoji) => {
    switch (emoji) {
      case "🙂": return "linear-gradient(to right, #a1ffce, #faffd1)";
      case "😔": return "linear-gradient(to right, rgb(122, 110, 122), rgb(93, 108, 74))";
      case "😄": return "linear-gradient(to right,rgb(225, 194, 115),rgb(237, 198, 92))";
      case "😡": return "linear-gradient(to right, #ff4e50,rgb(242, 201, 87))";
      case "😭": return "linear-gradient(to right,rgb(139, 227, 234),rgb(128, 166, 219))";
      case "😱": return "linear-gradient(to right, #fbc2eb, #a6c1ee)";
      case "😕": return "linear-gradient(to right, #c2e9fb, #a1c4fd)";
      default: return "#ffffff";
    }
  };

  const styles = {
    page: {
      minHeight: '100vh',
      padding: '24px',
      paddingBottom: '80px',
      background: 'white',
      fontFamily: '"Inter", system-ui, sans-serif',
      color: 'black',
      position: 'relative',
    },
    headerBar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
      position: 'relative',
    },
    profile: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      cursor: 'pointer',
    },
    profileIcon: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: '#4da6ff',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '18px',
      fontWeight: 'bold',
      color: 'black',
    },
    profileName: {
      fontSize: '16px',
      fontWeight: 600,
    },
    dropdown: {
      position: 'absolute',
      top: '50px',
      left: '0',
      backgroundColor: '#fff',
      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
      padding: '10px',
      borderRadius: '8px',
      zIndex: 1000,
    },
    dropdownItem: {
      padding: '8px 12px',
      cursor: 'pointer',
      fontSize: '14px',
    },
    calendarIcon: {
      cursor: 'pointer',
    },
    header: {
      fontSize: '28px',
      fontWeight: 700,
      marginBottom: '16px',
    },
    feedList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
    card: (emoji) => ({
      background: getCardBackgroundColor(emoji),
      color: '#000000',
      borderRadius: '16px',
      padding: '16px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'pointer',
    }),
    cardHover: {
      transform: 'translateY(-4px)',
      boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
    },
    cardTitle: {
      fontSize: '20px',
      fontWeight: 600,
      marginBottom: '4px',
    },
    cardDate: {
      fontSize: '14px',
      color: '#555555',
      marginBottom: '8px',
    },
    empty: {
      opacity: 0.7,
    },
    plusButton: {
      position: 'fixed',
      bottom: '24px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'linear-gradient(to right, rgb(19, 108, 186), rgb(19, 50, 92))',
      color: '#fff',
      border: 'none',
      borderRadius: '50%',
      width: '60px',
      height: '60px',
      fontSize: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
      zIndex: 1000,
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.headerBar}>
        <div style={styles.profile} onClick={toggleDropdown}>
          <div style={styles.profileIcon}>{userName.charAt(0).toUpperCase()}</div>
          <div style={styles.profileName}>{userName}</div>
          {showDropdown && (
            <div style={styles.dropdown}>
              <div style={styles.dropdownItem} onClick={handleLogout}>Logout</div>
            </div>
          )}
        </div>
        <div style={styles.calendarIcon} onClick={() => navigate('/calendar')}>
          <FaCalendarAlt size={20} color="black" />
        </div>
      </div>

      <h1 style={styles.header}>Your Feeds</h1>

      {feeds.length > 0 ? (
        <div style={styles.feedList}>
          {feeds.map((feed) => (
            <div
              key={feed.id}
              style={{
                ...styles.card(feed.emoji),
                ...(hoveredId === feed.id ? styles.cardHover : {}),
              }}
              onMouseEnter={() => setHoveredId(feed.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => navigate(`/viewcontext/${feed.id}`)}
            >
              <h2 style={styles.cardTitle}>{feed.title}</h2>
              <p style={styles.cardDate}>
                {new Date(feed.created_at).toLocaleDateString()}
              </p>
              <p>{feed.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <p style={styles.empty}>No feeds available.</p>
      )}

      <button style={styles.plusButton} onClick={() => navigate('/Addcontext')}>
        <FaPlus />
      </button>
    </div>
  );
};

export default FeedPage;
