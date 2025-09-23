import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// --- Configuration ---
const API_BASE_URL = "https://daily-mood-analyser-backend.onrender.com";

// --- SVG Icons ---
const FiArrowLeft = () => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1.5em" width="1.5em" xmlns="http://www.w3.org/2000/svg"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>);
const FiEdit2 = () => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1.5em" width="1.5em" xmlns="http://www.w3.org/2000/svg"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>);
const FiTrash2 = () => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1.5em" width="1.5em" xmlns="http://www.w3.org/2000/svg"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>);
const FiCheck = () => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1.5em" width="1.5em" xmlns="http://www.w3.org/2000/svg"><polyline points="20 6 9 17 4 12"></polyline></svg>);
const FiLoader = () => (<svg className="animate-spin" stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1.5em" width="1.5em" xmlns="http://www.w3.org/2000/svg"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>);
const FiAlertTriangle = () => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="50px" width="50px" xmlns="http://www.w3.org/2000/svg"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>);

// --- Helper Data ---
const moods = [
  { emoji: "😄", bg: "bg-gradient-to-br from-amber-200 to-yellow-300" },
  { emoji: "🙂", bg: "bg-gradient-to-br from-teal-200 to-green-200" },
  { emoji: "😔", bg: "bg-gradient-to-br from-sky-200 to-slate-300" },
  { emoji: "😡", bg: "bg-gradient-to-br from-rose-300 to-red-300" },
  { emoji: "😭", bg: "bg-gradient-to-br from-indigo-300 to-blue-300" },
  { emoji: "😕", bg: "bg-gradient-to-br from-violet-300 to-purple-300" },
  { emoji: "😱", bg: "bg-gradient-to-br from-lime-200 to-emerald-300" },
];

// --- Components ---

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

const ViewContextPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [feed, setFeed] = useState(null);
  const [originalFeed, setOriginalFeed] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/get-feed/${id}`);
        const data = await response.json();
        if (response.ok && data.success) {
          setFeed(data.feed);
          setOriginalFeed(data.feed);
        }
      } catch (err) { console.error("Error fetching feed:", err); }
    };
    fetchFeed();
  }, [id]);

  const selectedMood = useMemo(() => {
    if (!feed) return moods[1]; // Default mood
    return moods.find((m) => m.emoji === feed.emoji) || moods[1];
  }, [feed]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/update-feed/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feed),
      });
      if (response.ok) {
        setOriginalFeed(feed);
        setIsEditing(false);
      }
    } catch (err) { console.error("Update error:", err); } 
    finally { setIsSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await fetch(`${API_BASE_URL}/delete-feed/${id}`, { method: 'DELETE' });
      navigate('/feed');
    } catch (err) { console.error("Delete error:", err); }
  };

  const handleCancelEdit = () => {
    setFeed(originalFeed);
    setIsEditing(false);
  };
  
  if (!feed) {
    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center">
            <FiLoader />
            <p className="ml-2 text-slate-600">Loading entry...</p>
        </div>
    );
  }

  const formattedDate = new Date(feed.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <>
      <div className={`min-h-screen w-full p-4 sm:p-6 lg:p-8 transition-colors duration-700 ${selectedMood.bg}`}>
        {/* --- Header --- */}
        <header className="max-w-4xl mx-auto mb-8 flex justify-between items-center">
            <button onClick={() => isEditing ? handleCancelEdit() : navigate(-1)} className="flex items-center gap-2 text-slate-700 bg-white/50 backdrop-blur-lg hover:bg-white/80 font-semibold px-4 py-2 rounded-full shadow-md transition-colors">
                <FiArrowLeft /> Back
            </button>
            <div className="flex gap-2">
                {isEditing ? (
                    <button onClick={handleSave} disabled={isSaving} className="w-28 flex items-center justify-center gap-2 bg-indigo-500 text-white font-semibold px-4 py-2 rounded-full shadow-lg hover:bg-indigo-600 transition disabled:opacity-50">
                       {isSaving ? <FiLoader /> : <><FiCheck /> Save</>}
                    </button>
                ) : (
                    <div className="flex gap-2 p-1 bg-white/50 backdrop-blur-lg rounded-full shadow-md">
                        <button onClick={() => setIsEditing(true)} className="p-2 text-slate-600 hover:bg-indigo-100 hover:text-indigo-600 rounded-full transition-colors"><FiEdit2 /></button>
                        <button onClick={() => setDeleteModalOpen(true)} className="p-2 text-slate-600 hover:bg-rose-100 hover:text-rose-600 rounded-full transition-colors"><FiTrash2 /></button>
                    </div>
                )}
            </div>
        </header>

        {/* --- Content Panel --- */}
        <motion.div 
            key={id} // Add key to re-trigger animation on new entry
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-4xl mx-auto bg-white/60 text-slate-800 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20"
        >
            <div className="p-6 md:p-10">
                {isEditing ? (
                    /* --- EDITING VIEW --- */
                    <>
                        <div className="flex justify-center gap-3 sm:gap-4 mb-8">
                            {moods.map((mood) => (
                                <motion.button key={mood.emoji} onClick={() => setFeed({ ...feed, emoji: mood.emoji })} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.95 }}
                                className={`text-4xl sm:text-5xl p-2 rounded-full transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 ${feed.emoji === mood.emoji ? "opacity-100" : "opacity-50 hover:opacity-75"}`}>
                                {feed.emoji === mood.emoji ? (
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}>{mood.emoji}</motion.div>
                                ) : ( mood.emoji )}
                                </motion.button>
                            ))}
                        </div>
                        <div className="space-y-4">
                            <input type="text" value={feed.title} onChange={(e) => setFeed({ ...feed, title: e.target.value })}
                                className="w-full text-3xl font-bold bg-transparent text-slate-900 placeholder:text-slate-500 border-b-2 border-slate-300 focus:border-indigo-400 p-2 focus:outline-none transition" />
                            <textarea value={feed.content} onChange={(e) => setFeed({ ...feed, content: e.target.value })} rows={12}
                                className="w-full text-lg bg-white/50 text-slate-800 placeholder:text-slate-500 border border-transparent rounded-lg p-3 resize-y focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
                        </div>
                    </>
                ) : (
                    /* --- READING VIEW --- */
                    <>
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="text-4xl font-bold tracking-tight text-slate-900">{feed.title}</h1>
                                <p className="text-slate-600 mt-2">{formattedDate}</p>
                            </div>
                            <span className="text-5xl">{feed.emoji}</span>
                        </div>
                        <div className="prose prose-lg max-w-none text-slate-800 leading-relaxed whitespace-pre-wrap pt-6 border-t border-slate-200/80">
                            {feed.content}
                        </div>
                    </>
                )}
            </div>
        </motion.div>
      </div>
      <AnimatePresence>
        {isDeleteModalOpen && <DeleteConfirmationModal onConfirm={handleDelete} onCancel={() => setDeleteModalOpen(false)} />}
      </AnimatePresence>
    </>
  );
};

export default ViewContextPage;

