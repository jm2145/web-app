import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignUp from "./pages/SignUp";
import LogIn from "./pages/LogIn";
import Category from "./pages/Category"
import ProfileDetails from "./pages/ProfileDetails";
import Dashboard from "./pages/Dashboard";
import GroupsPanel from "./pages/GroupsPanel.js";
import GroupPage from "./pages/GroupPage";
import Todolist from "./components/Todolist/Todolist";
import { FriendsChat } from "./components/FriendsChat/FriendsChat";
import { AuthContext } from "./context/AuthContext";
import { Navigate } from "react-router-dom";
import App from "./GroupVideo";




export const AppRoutes = () => {

  const { currentUser } = useContext(AuthContext);

  console.log(currentUser);

  const ProtectedRoute = ({ children }) => {
    if (!currentUser) {
      return <Navigate to="/login" />
    }

    return children;
  }
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/category" element={<ProtectedRoute><Category /></ProtectedRoute>} />
        <Route path="/proDetails" element={<ProtectedRoute><ProfileDetails /></ProtectedRoute>} />
        <Route path="/login" element={<LogIn />} />
        <Route path="/todolist" element={<ProtectedRoute><Todolist /></ProtectedRoute>} />
        <Route path="/friendschat" element={<ProtectedRoute><FriendsChat /></ProtectedRoute>} />
        <Route path="/groupsPanel" element={<ProtectedRoute><GroupsPanel /></ProtectedRoute>} />
        <Route path="/GroupPage/:groupName" element={<ProtectedRoute><GroupPage /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
};


export default AppRoutes;