import PrivateRoute from '@/modules/AuthContext/PrivateRoute';
import Competition from '../SchoolStudent/Competition/Competition';
import Dashboard from '../SchoolStudent/Competition/dashboard/Dashboard';

export const schoolStudentRoutes = [
  {
    path: '/school_student-dashboard',
    element: (
      <PrivateRoute allowedRole="school_student">
        <Dashboard/>
      </PrivateRoute>
    ),
  },
  {
    path: '/school_student-dashboard/competition',
    element: (
      <PrivateRoute allowedRole="school_student">
        <Competition />
      </PrivateRoute>
    ),
  },
];