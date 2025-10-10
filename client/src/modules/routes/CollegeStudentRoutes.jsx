import PrivateRoute from '@/modules/AuthContext/PrivateRoute';
import Competition from '../CollegeStudents/Competition/Competition';

export const collegeStudentRoutes = [
  {
    path: '/college_student-dashboard',
    element: (
      <PrivateRoute allowedRole="college_student">
        <>Dashboard</>
      </PrivateRoute>
    ),
  },
  {
    path: '/college_student-dashboard/competition',
    element: (
      <PrivateRoute allowedRole="college_student">
        <Competition/>
      </PrivateRoute>
    ),
  },
];