import PrivateRoute from '@/modules/AuthContext/PrivateRoute';
import Dashboard from '../Admin/Dashboard/Dashboard';
import Competitions from '../Admin/Competitions/Competitions';
import Prices from '../Admin/Prices/Prices';
import UserRegister from '../Admin/UserRegister/UserRegister';
import DrawingCandidates from '../Admin/Drawingcandidates/Drawingcandidates';
import Skid from '../Admin/Skid/Skid';
import Logo from '../Admin/Logo/Logo';
import Memes from '../Admin/Memes/Memes';
import Photgraphy from '../Admin/Photography/Photography';

export const adminRoutes = [
  {
    path: '/admin-dashboard',
    element: (
      <PrivateRoute allowedRole="admin">
        <Dashboard/>
      </PrivateRoute>
    ),
  },
  {
    path: '/admin-dashboard/competition',
    element: (
      <PrivateRoute allowedRole="admin">
        <Competitions/>
      </PrivateRoute>
    ),
  },
  {
    path: '/admin-dashboard/prices',
    element: (
      <PrivateRoute allowedRole="admin">
        <Prices/>
      </PrivateRoute>
    ),
  },
  {
    path: '/admin-dashboard/userregistration',
    element: (
      <PrivateRoute allowedRole="admin">
        <UserRegister/>
      </PrivateRoute>
    ),
  },
    {
    path: '/admin-dashboard/drawingcandidates',
    element: (
      <PrivateRoute allowedRole="admin">
        <DrawingCandidates/>
      </PrivateRoute>
    ),
  },
  
    {
    path: '/admin-dashboard/skidcandidates',
    element: (
      <PrivateRoute allowedRole="admin">
        <Skid/>
      </PrivateRoute>
    ),
  },
  
    {
    path: '/admin-dashboard/memescandidates',
    element: (
      <PrivateRoute allowedRole="admin">
        <Memes/>
      </PrivateRoute>
    ),
  },
    {
    path: '/admin-dashboard/logocandidates',
    element: (
      <PrivateRoute allowedRole="admin">
        <Logo/>
      </PrivateRoute>
    ),
  },
    {
    path: '/admin-dashboard/photographycandidates',
    element: (
      <PrivateRoute allowedRole="admin">
        <Photgraphy/>
      </PrivateRoute>
    ),
  },
  
];