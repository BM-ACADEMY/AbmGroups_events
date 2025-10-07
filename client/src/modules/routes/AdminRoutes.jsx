import PrivateRoute from '@/modules/AuthContext/PrivateRoute';

export const adminRoutes = [
  {
    path: '/admin-dashboard',
    element: (
      <PrivateRoute allowedRole="admin">
        <>Dashboard</>
      </PrivateRoute>
    ),
  },
  
];