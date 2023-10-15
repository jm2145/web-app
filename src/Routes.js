import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignUp from "./pages/SignUp";
import LogIn from "./pages/LogIn";

export const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignUp/>} />
        <Route path="/logIn" element={<LogIn/>} />
        
      </Routes>
    </Router>
  );
};



export default AppRoutes;