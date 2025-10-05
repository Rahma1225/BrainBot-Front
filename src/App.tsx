import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import UserManagement from "./components/UserManagement";
import Chatbot from "./components/Chatbot";
import Landing from "./components/Landing";
import FileUpload from "./components/File Upload Page";
import ChatbotEvaluation from "./components/Chatbot Evaluation Page";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<UserManagement />} />
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/upload" element={<FileUpload />} />
        <Route path="/evaluations" element={<ChatbotEvaluation />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
