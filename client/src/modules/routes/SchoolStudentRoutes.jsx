import PrivateRoute from '@/modules/AuthContext/PrivateRoute';

export const schoolStudentRoutes = [
  {
    path: '/school_student-dashboard',
    element: (
      <PrivateRoute allowedRole="school_student">
        <>Dashboard</>
      </PrivateRoute>
    ),
  },
];