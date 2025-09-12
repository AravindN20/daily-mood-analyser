import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import UserLogin from "../pages/Login";
import RegisterUser from "../pages/Registration";
import CalendarPage from "../pages/Calendar";
import FeedPage from "../pages/feed";
import AddContextPage from "../pages/Addcontext";
import ViewContextPage from "../pages/viewContext";
import PieChartPage from "../pages/PieChartPage";
import AnalysisPage from "../pages/AnalysisPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Default route → redirect to /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        <Route path="/login" element={<UserLogin />} />
        <Route path="/registration" element={<RegisterUser />} />
        <Route path="/feed" element={<FeedPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/viewcontext/:id" element={<ViewContextPage />} />
        <Route path="/Addcontext" element={<AddContextPage />} />
        <Route path="/piechart" element={<PieChartPage />} />
        <Route path="/analysis" element={<AnalysisPage />} />
      </Routes>
    </Router>
  );
}

export default App;
