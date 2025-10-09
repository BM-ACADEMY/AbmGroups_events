import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './AuthContext';

const PrivateRoute = ({ allowedRole, children }) => {
  const { user, loading } = useContext(AuthContext);
  console.log('PrivateRoute - User:', user, 'Loading:', loading, 'AllowedRole:', allowedRole);

  if (loading) {
    console.log('PrivateRoute - Rendering loading state');
    return <div>Loading...</div>;
  }

  const isAuthenticated = !!user;
  const userRole = user?.role?.name;
  console.log('PrivateRoute - isAuthenticated:', isAuthenticated, 'userRole:', userRole);

  const validRoles = ['admin', 'college_student', 'school_student'];

  if (isAuthenticated && (allowedRole === 'login' || allowedRole === 'public')) {
    console.log('PrivateRoute - Redirecting to:', `/${userRole}-dashboard`);
    return <Navigate to={`/${userRole}-dashboard`} replace />;
  }

  if (!isAuthenticated && (allowedRole === 'login' || allowedRole === 'public')) {
    console.log('PrivateRoute - Rendering children for public/login route');
    return children;
  }

  if (isAuthenticated && !validRoles.includes(allowedRole)) {
    console.log('PrivateRoute - Invalid allowedRole, redirecting to:', `/${userRole}-dashboard`);
    return <Navigate to={`/${userRole}-dashboard`} replace />;
  }

  if (isAuthenticated && allowedRole !== userRole) {
    console.log('PrivateRoute - Redirecting to:', `/${userRole}-dashboard`);
    return <Navigate to={`/${userRole}-dashboard`} replace />;
  }

  if (isAuthenticated && allowedRole === userRole) {
    console.log('PrivateRoute - Rendering children for protected route');
    return children;
  }

  console.log('PrivateRoute - Redirecting to:', `/login`);
  return <Navigate to={`/login`} replace />;
};

export default PrivateRoute;