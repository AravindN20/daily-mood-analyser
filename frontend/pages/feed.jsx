import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';

// --- Configuration ---
const API_BASE_URL = "https://daily-mood-analyser-backend.onrender.com";

// --- SVG Icons ---
const FiPlus = () => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1.5em" width="1.5em" xmlns="http://www.w3.org/2000/svg"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>);
const FiCalendar = () => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1.5em" width="1.5em" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>);
const FiBarChart2 = () => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1.5em" width="1.5em" xmlns="http://www.w3.org/2000/svg"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>);
const FiPieChart = () => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1.5em" width="1.5em" xmlns="http://www.w3.org/2000/svg"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>);
const FiLogOut = () => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>);
const FiMoreVertical = () => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1.5em" width="1.5em" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>);
const FiEdit2 = () => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>);
const FiTrash2 = () => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>);
const FiAlertTriangle = () => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="50px" width="50px" xmlns="http://www.w3.org/2000/svg"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>);
const FiBookOpen = () => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="4em" width="4em" xmlns="http://www.w3.org/2000/svg"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>);

// --- Style Injector for Animation (No config file needed) ---
const AnimatedBackgroundStyles = () => (
  <style>
    {`
      @keyframes subtle-gradient {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }
      .animate-subtle-gradient {
        background-size: 400% 400%;
        animation: subtle-gradient 30s ease infinite;
      }
    `}
  </style>
);

// --- Helper Functions & Data ---
const getEmojiTheme = (emoji) => {
    switch (emoji) {
      case "😄": return { bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-200" };
      case "🙂": return { bg: "bg-teal-100", text: "text-teal-800", border: "border-teal-200" };
      case "😔": return { bg: "bg-sky-100", text: "text-sky-800", border: "border-sky-200" };
      case "😡": return { bg: "bg-rose-100", text: "text-rose-800", border: "border-rose-200" };
      case "😭": return { bg: "bg-indigo-100", text: "text-indigo-800", border: "border-indigo-200" };
      case "😕": return { bg: "bg-violet-100", text: "text-violet-800", border: "border-violet-200" };
      case "😱": return { bg: "bg-lime-100", text: "text-lime-800", border: "border-lime-200" };
      default: return { bg: "bg-slate-100", text: "text-slate-800", border: "border-slate-200" };
    }
};

// --- Components ---

const Header = ({ userName, onLogout }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();

    return (
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg shadow-sm">
            <div className="container mx-auto px-6 py-3 flex justify-between items-center">
                <div className="relative">
                    <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-md font-bold text-white shadow-md">
                            {userName.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-800 text-md hidden sm:block">{userName}</span>
                    </button>
                    <AnimatePresence>
                        {showDropdown && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                className="absolute top-12 left-0 bg-white shadow-xl rounded-xl p-2 w-40 z-20 border border-slate-100">
                                <button onClick={onLogout} className="w-full flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 rounded-md transition-colors">
                                    <FiLogOut /> Logout
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                <div className="flex gap-3 sm:gap-5 items-center">
                    {[
                        { icon: <FiPieChart />, path: '/piechart' },
                        { icon: <FiBarChart2 />, path: '/analysis' },
                        { icon: <FiCalendar />, path: '/calendar' },
                    ].map(({ icon, path }) => (
                         <button key={path} onClick={() => navigate(path)} className="text-gray-600 hover:text-indigo-600 transition-transform transform hover:scale-110">
                            {icon}
                        </button>
                    ))}
                </div>
            </div>
        </header>
    );
};

const FeedCard = ({ feed, onNavigate, onEdit, onDelete }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const theme = getEmojiTheme(feed.emoji);

    const handleMoreClick = (e) => {
        e.stopPropagation();
        setShowDropdown(!showDropdown);
    };

    return (
        <motion.div 
            layout
            onClick={onNavigate}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
        >
            <div className={`p-5 flex justify-between items-start ${theme.bg} ${theme.border} border-b`}>
                <span className="text-5xl">{feed.emoji}</span>
                <div className="relative">
                    <button onClick={handleMoreClick} className="p-2 text-slate-500 hover:bg-black/10 rounded-full">
                        <FiMoreVertical />
                    </button>
                    <AnimatePresence>
                    {showDropdown && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="absolute top-10 right-0 bg-white shadow-xl rounded-xl p-2 w-32 z-20 border border-slate-100">
                            <button onClick={(e) => {e.stopPropagation(); onEdit();}} className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-md transition-colors text-sm"><FiEdit2 /> Edit</button>
                            <button onClick={(e) => {e.stopPropagation(); onDelete();}} className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-md transition-colors text-sm"><FiTrash2 /> Delete</button>
                        </motion.div>
                    )}
                    </AnimatePresence>
                </div>
            </div>
            <div className="p-5">
                <h2 className={`text-xl font-bold mb-1 ${theme.text}`}>{feed.title}</h2>
                <p className="text-sm text-gray-500 mb-3">{new Date(feed.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p className="text-gray-700 line-clamp-3">{feed.content}</p>
            </div>
        </motion.div>
    );
};

const EmptyState = ({ onAdd }) => (
    <div className="text-center py-20">
        <div className="inline-block text-indigo-300 mb-4"><FiBookOpen /></div>
        <h2 className="text-2xl font-bold text-slate-700 mb-2">Your Journal is Empty</h2>
        <p className="text-slate-500 mb-6 max-w-sm mx-auto">It looks like you haven't written any entries yet. Start by adding your first memory.</p>
        <button onClick={onAdd} className="bg-indigo-500 text-white font-semibold px-6 py-3 rounded-full shadow-lg hover:bg-indigo-600 transition-transform transform hover:scale-105 flex items-center gap-2 mx-auto">
            <FiPlus /> Add First Entry
        </button>
    </div>
);

const DeleteConfirmationModal = ({ onConfirm, onCancel }) => (
     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-sm w-full">
            <div className="text-rose-500 mx-auto mb-4 w-[50px]"><FiAlertTriangle /></div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Delete Entry?</h3>
            <p className="text-slate-600 mb-6">This action is permanent and cannot be undone.</p>
            <div className="flex justify-center gap-4">
                <button onClick={onCancel} className="w-full px-6 py-3 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition">Cancel</button>
                <button onClick={onConfirm} className="w-full px-6 py-3 bg-rose-500 text-white font-semibold rounded-lg shadow-lg hover:bg-rose-600 transition">Delete</button>
            </div>
        </motion.div>
    </motion.div>
);

const FeedPage = () => {
    const [feeds, setFeeds] = useState([]);
    const [userName, setUserName] = useState('');
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [feedToDelete, setFeedToDelete] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFeeds = async () => {
            const userId = localStorage.getItem('userId');
            const storedName = localStorage.getItem('username');
            setUserName(storedName || 'Guest');

            if (!userId) { navigate('/login'); return; }

            try {
                const response = await fetch(`${API_BASE_URL}/get-all-feeds`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId }),
                });
                const data = await response.json();
                if (data.success && Array.isArray(data.feeds)) {
                    const sortedFeeds = data.feeds.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                    setFeeds(sortedFeeds);
                }
            } catch (error) { console.error("Fetch error:", error); }
        };
        fetchFeeds();
    }, [navigate]);

    const handleDeleteRequest = (id) => {
        setFeedToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!feedToDelete) return;
        try {
            const response = await fetch(`${API_BASE_URL}/delete-feed/${feedToDelete}`, { method: 'DELETE' });
            const data = await response.json();
            if (data.success) {
                setFeeds(currentFeeds => currentFeeds.filter(feed => feed.id !== feedToDelete));
            }
        } catch (error) { console.error("Delete request error:", error); }
        finally {
            setDeleteModalOpen(false);
            setFeedToDelete(null);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <>
            <AnimatedBackgroundStyles />
            <div 
                className="min-h-screen bg-gradient-to-br from-sky-50 via-violet-50 to-fuchsia-50 animate-subtle-gradient" 
            >
                <Header userName={userName} onLogout={handleLogout} />

                <main className="container mx-auto p-6">
                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-8">
                        My Journal
                    </h1>

                    {feeds.length > 0 ? (
                        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <AnimatePresence>
                                {feeds.map((feed) => (
                                    <FeedCard
                                        key={feed.id}
                                        feed={feed}
                                        onNavigate={() => navigate(`/viewcontext/${feed.id}`)}
                                        onEdit={() => navigate(`/viewcontext/${feed.id}`)}
                                        onDelete={() => handleDeleteRequest(feed.id)}
                                    />
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    ) : (
                        <EmptyState onAdd={() => navigate('/Addcontext')} />
                    )}
                </main>

                <button onClick={() => navigate('/Addcontext')}
                    className="fixed bottom-6 right-6 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-xl hover:scale-110 transition-transform transform">
                    <FiPlus />
                </button>
                
                <AnimatePresence>
                    {isDeleteModalOpen && <DeleteConfirmationModal onConfirm={confirmDelete} onCancel={() => setDeleteModalOpen(false)} />}
                </AnimatePresence>
            </div>
        </>
    );
};

export default FeedPage;

