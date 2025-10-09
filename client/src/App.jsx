import * as React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/modules/AuthContext/AuthContext';
import PrivateRoute from '@/modules/AuthContext/PrivateRoute';
import { adminRoutes } from '@/modules/routes/AdminRoutes';
import { collegeStudentRoutes } from '@/modules/routes/CollegeStudentRoutes';
import { schoolStudentRoutes } from '@/modules/routes/SchoolStudentRoutes';
import Page from '@/modules/Dashboard/Dashboard';
import Login from './modules/Auth/Login';
import Register from './modules/Auth/Register';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PrivateRoute allowedRole="public"><Login /></PrivateRoute>} />
        <Route path="/login" element={<PrivateRoute allowedRole="public"><Login /></PrivateRoute>} />
        <Route path="/register" element={<PrivateRoute allowedRole="public"><Register /></PrivateRoute>} />
        <Route element={<Page />}>
          {adminRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
          {collegeStudentRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
          {schoolStudentRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;