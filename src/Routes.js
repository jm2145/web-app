import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignUp from "./pages/SignUp";
import LogIn from "./pages/LogIn";
import Category from "./pages/Category"
import ProfileDetails from "./pages/ProfileDetails";
import Dashboard from "./pages/Dashboard";
import Todolist from "./components/Todolist/Todolist";


export const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignUp/>} />
        <Route path = "/login" element = {<LogIn/>} />
        <Route path="/category" element={<Category/>} />
        <Route path = "/proDetails" element = {<ProfileDetails/>}/>
        <Route path = "/dashboard" element = {<Dashboard/>}/>
        <Route path = "/todolist" element = {<Todolist/>}/>

        
      
        
        
      </Routes>
    </Router>
  );
};


export default AppRoutes;