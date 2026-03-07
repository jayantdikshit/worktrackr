import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateProject from './pages/CreateProject';
import EditProject from './pages/EditProject';
import ProjectDetails from './pages/ProjectDetails';
import CreateTask from './pages/CreateTask'; 
import EditTask from './pages/EditTask';
import InviteMember from './pages/InviteMember';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  return user?.role === 'ADMIN' ? children : <Navigate to="/" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
        } />

        <Route path="/project/:id" element={
            <PrivateRoute>
              <ProjectDetails />
            </PrivateRoute>
        } />

        <Route path="/create-project" element={
            <AdminRoute>
              <CreateProject />
            </AdminRoute>
        } />

        <Route path="/edit-project/:id" element={
            <AdminRoute>
              <EditProject />
            </AdminRoute>
        } />

        <Route path="/create-task" element={
            <AdminRoute>
              <CreateTask />
            </AdminRoute>
        } />

        <Route path="/edit-task/:id" element={
            <AdminRoute>
              <EditTask /> 
            </AdminRoute>
        } />

        <Route path="/invite" element={
            <AdminRoute>
              <InviteMember />
            </AdminRoute>
        } />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;