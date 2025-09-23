import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// --- Configuration ---
// Resolved the missing config file error by defining the URL directly.
const API_BASE_URL = "https://daily-mood-analyser-backend.onrender.com";

// --- SVG Icons ---
// Resolved the 'react-icons' error by replacing them with inline SVGs.
const FiMenu = () => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1.5em" width="1.5em" xmlns="http://www.w3.org/2000/svg"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>);
const FiX = () => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1.5em" width="1.5em" xmlns="http://www.w3.org/2000/svg"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);
const FiList = () => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>);
const FiCalendar = () => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>);
const FiBarChart2 = () => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>);
const FiPieChart = () => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>);
const FiLogOut = () => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>);
const FiArrowLeft = () => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1.5em" width="1.5em" xmlns="http://www.w3.org/2000/svg"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>);
const FiCheckCircle = () => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="50px" width="50px" xmlns="http://www.w3.org/2000/svg"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>);


const moods = [
  { emoji: "😄", bg: "bg-gradient-to-br from-amber-200 to-yellow-300" },
  { emoji: "🙂", bg: "bg-gradient-to-br from-teal-200 to-green-200" },
  { emoji: "😔", bg: "bg-gradient-to-br from-sky-200 to-slate-300" },
  { emoji: "😡", bg: "bg-gradient-to-br from-rose-300 to-red-300" },
  { emoji: "😭", bg: "bg-gradient-to-br from-indigo-300 to-blue-300" },
  { emoji: "😕", bg: "bg-gradient-to-br from-violet-300 to-purple-300" },
  { emoji: "😱", bg: "bg-gradient-to-br from-lime-200 to-emerald-300" },
];

// Reusable button component for top corners
const CornerButton = ({ onClick, children, position = 'top-6 right-6' }) => (
  <motion.button
    onClick={onClick}
    className={`absolute ${position} z-50 w-12 h-12 bg-white/50 backdrop-blur-lg rounded-full flex items-center justify-center text-slate-700 shadow-md`}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
  >
    {children}
  </motion.button>
);


// ✅ New Success Modal Component
const SaveSuccessModal = ({ onNavigate }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-sm w-full"
      >
        <div className="text-green-500 mx-auto mb-4 w-[50px]"><FiCheckCircle /></div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2">Entry Saved!</h3>
        <p className="text-slate-600 mb-6">Your mood and thoughts have been recorded.</p>
        <button
          onClick={onNavigate}
          className="w-full px-6 py-3 bg-indigo-500 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-600 transition"
        >
          View My Feed
        </button>
      </motion.div>
    </motion.div>
  );
};


const CornerNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear(); // Clear all user data
    navigate('/login'); // Redirect to login
  };

  const navItems = [
    { icon: <FiList />, label: "My Feed", path: "/feed" },
    { icon: <FiCalendar />, label: "Calendar", path: "/calendar" },
    { icon: <FiBarChart2 />, label: "Analysis", path: "/analysis" },
    { icon: <FiPieChart />, label: "Charts", path: "/piechart" },
  ];

  return (
    <div className="absolute top-6 right-6 z-40">
      <CornerButton onClick={() => setIsOpen(!isOpen)}>
         <AnimatePresence mode="wait">
           <motion.div key={isOpen ? "x" : "menu"} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
             {isOpen ? <FiX /> : <FiMenu />}
           </motion.div>
         </AnimatePresence>
      </CornerButton>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10, x: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10, x: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute top-16 right-0 w-56 bg-white/60 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-4"
          >
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.label}>
                  <Link to={item.path} onClick={() => setIsOpen(false)} className="flex items-center gap-4 p-2 text-slate-700 font-medium hover:bg-white/50 rounded-lg transition-colors">
                    {item.icon}<span>{item.label}</span>
                  </Link>
                </li>
              ))}
              {/* 🚪 Logout Button */}
              <li>
                <button onClick={handleLogout} className="flex items-center w-full gap-4 p-2 text-rose-500 font-medium hover:bg-white/50 rounded-lg transition-colors">
                  <FiLogOut /><span>Logout</span>
                </button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


const AddContextPage = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [emoji, setEmoji] = useState("🙂");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false); // State for modal
  const navigate = useNavigate();

  const selectedMood = useMemo(() => moods.find((m) => m.emoji === emoji) || moods[1], [emoji]);
  const formattedDate = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });

  const handleSave = async () => {
    const user_id = localStorage.getItem("userId");
    if (!user_id || isLoading || (!title && !content)) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/save-feed`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id, title, content, emoji }),
      });
      if (response.ok) {
        setShowSuccessModal(true); // Show modal on success
      }
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className={`min-h-screen w-full flex items-center justify-center p-4 transition-colors duration-700 ${selectedMood.bg}`}>
      {/* ↩️ Back to Feed Button */}
      <CornerButton onClick={() => navigate('/feed')} position="top-6 left-6">
          <FiArrowLeft />
      </CornerButton>

      <CornerNav />

      <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5, ease: "easeOut" }} className="w-full max-w-2xl bg-white/60 text-slate-800 backdrop-blur-2xl rounded-2xl p-6 md:p-8 shadow-2xl border border-white/20">
        <div className="text-center mb-8">
          <p className="text-slate-600 font-light">{formattedDate}</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">How are you feeling?</h1>
        </div>
        
        <div className="flex justify-center gap-3 sm:gap-4 mb-8">
          {moods.map((mood) => (
            <motion.button key={mood.emoji} onClick={() => setEmoji(mood.emoji)} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.95 }} className={`text-3xl sm:text-4xl p-2 rounded-full transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 ${emoji === mood.emoji ? "opacity-100" : "opacity-50 hover:opacity-75"}`}>
              {emoji === mood.emoji ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}>{mood.emoji}</motion.div>
              ) : (
                mood.emoji
              )}
            </motion.button>
          ))}
        </div>
        
        <div className="space-y-4">
          <input type="text" placeholder="Give your day a title..." value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-white/50 text-slate-900 placeholder:text-slate-500 border border-transparent rounded-lg p-3 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
          <div>
            <textarea placeholder="Describe your thoughts and feelings..." value={content} onChange={(e) => setContent(e.target.value)} rows={6} maxLength={500} className="w-full bg-white/50 text-slate-900 placeholder:text-slate-500 border border-transparent rounded-lg p-3 resize-y focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
            <p className="text-right text-xs text-slate-500 mt-1">{content.length}/500</p>
          </div>
        </div>
        
        <div className="flex justify-end items-center gap-4 mt-8">
          {/* Button is now disabled if modal is open */}
          <button onClick={handleSave} disabled={isLoading || showSuccessModal} className="flex items-center justify-center w-36 px-6 py-2 bg-indigo-500 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-600 transition disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? (<svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>) : ("Save Entry")}
          </button>
        </div>
      </motion.div>

      {/* Conditionally render the success modal */}
      <AnimatePresence>
        {showSuccessModal && <SaveSuccessModal onNavigate={() => navigate('/feed')} />}
      </AnimatePresence>
    </div>
  );
};

export default AddContextPage;

