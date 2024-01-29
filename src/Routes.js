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
import { SettingSelect } from "./pages/SettingSelect.js";
import ProfileSettings from "./pages/ProfileSettings.js";
import { LoadingScreen } from "./components/LoadingScreens/LoadingScreen.jsx";
import { LoginLoading } from "./components/LoadingScreens/LoginLoading.jsx";
import Home from "./pages/Home.js";
import Forgotpass from "./components/ForgotPass.jsx";
import Calender from "./pages/Calender.js";




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
        <Route path="/settingselect" element={<ProtectedRoute><SettingSelect /></ProtectedRoute>} />
        <Route path="/profilesetting" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
        <Route path="/loading" element={<LoginLoading/>}/>
        <Route path="/home" element={<Home/>}/>
        <Route path="/forgot" element={<Forgotpass/>}/>
        <Route path="/Calender" element={<Calender/>}/>
        
      </Routes>
    </Router>
  );
};


export default AppRoutes;