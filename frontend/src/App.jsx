import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import UserLogin from "../pages/Login";
import RegisterUser from "../pages/Registration";
import CalendarPage from "../pages/Calendar";
import FeedPage from "../pages/feed";
import AddContextPage from "../pages/Addcontext";
import ViewContextPage from "../pages/viewContext";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<UserLogin />} />
        <Route path="/registration" element={<RegisterUser />} />
        <Route path="/feed" element={<FeedPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/viewcontext/:id" element={<ViewContextPage />} />
        <Route path="/Addcontext" element={<AddContextPage />} />
      </Routes>
    </Router>
  );
}

export default App;
