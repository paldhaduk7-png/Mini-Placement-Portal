import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { RoleRoute } from '@/components/auth/RoleRoute';
import { AppLayout } from '@/components/layout/AppLayout';

// Auth Pages
import { Login } from '@/pages/auth/Login';
import { Register } from '@/pages/auth/Register';

// Student Pages
import { StudentDashboard } from '@/pages/student/StudentDashboard';
import { StudentProfile } from '@/pages/student/StudentProfile';
import { Drives as StudentDrives } from '@/pages/student/Drives';
import { DriveDetails as StudentDriveDetails } from '@/pages/student/DriveDetails';
import { Applications as StudentApplications } from '@/pages/student/Applications';

// TPO Pages
import { TPODashboard } from '@/pages/tpo/TPODashboard';
import { Students as TPOStudents } from '@/pages/tpo/Students';
import { StudentDetails as TPOStudentDetails } from '@/pages/tpo/StudentDetails';
import { Companies as TPOCompanies } from '@/pages/tpo/Companies';
import { CreateCompany as TPOCreateCompany } from '@/pages/tpo/CreateCompany';
import { EditCompany as TPOEditCompany } from '@/pages/tpo/EditCompany';
import { Drives as TPODrives } from '@/pages/tpo/Drives';
import { CreateDrive as TPOCreateDrive } from '@/pages/tpo/CreateDrive';
import { EditDrive as TPOEditDrive } from '@/pages/tpo/EditDrive';
import { DriveDetails as TPODriveDetails } from '@/pages/tpo/DriveDetails';
import { Applications as TPOApplications } from '@/pages/tpo/Applications';

// Error Pages
import { NotFound } from '@/pages/errors/NotFound';
import { Unauthorized } from '@/pages/errors/Unauthorized';

import { useAppSelector } from '@/hooks/useAppSelector';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

// Helper Root Redirect
const RootRedirect: React.FC = () => {
  const { user, isAuthenticated, isInitialized, isLoading } = useAppSelector((state) => state.auth);

  if (!isInitialized || isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <LoadingSpinner size="lg" text="Loading Mini Placement Portal..." />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'TPO') {
    return <Navigate to="/tpo/dashboard" replace />;
  }

  return <Navigate to="/student/dashboard" replace />;
};

export const router = createBrowserRouter([
  // Public Routes
  {
    path: '/',
    element: <RootRedirect />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/unauthorized',
    element: <Unauthorized />,
  },

  // Student Routes (Protected by JWT + STUDENT role)
  {
    path: '/student',
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRoles={['STUDENT']}>
          <AppLayout />
        </RoleRoute>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/student/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <StudentDashboard />,
      },
      {
        path: 'profile',
        element: <StudentProfile />,
      },
      {
        path: 'drives',
        element: <StudentDrives />,
      },
      {
        path: 'drives/:id',
        element: <StudentDriveDetails />,
      },
      {
        path: 'applications',
        element: <StudentApplications />,
      },
    ],
  },

  // TPO Routes (Protected by JWT + TPO role)
  {
    path: '/tpo',
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRoles={['TPO']}>
          <AppLayout />
        </RoleRoute>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/tpo/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <TPODashboard />,
      },
      {
        path: 'students',
        element: <TPOStudents />,
      },
      {
        path: 'students/:id',
        element: <TPOStudentDetails />,
      },
      {
        path: 'companies',
        element: <TPOCompanies />,
      },
      {
        path: 'companies/create',
        element: <TPOCreateCompany />,
      },
      {
        path: 'companies/:id/edit',
        element: <TPOEditCompany />,
      },
      {
        path: 'drives',
        element: <TPODrives />,
      },
      {
        path: 'drives/create',
        element: <TPOCreateDrive />,
      },
      {
        path: 'drives/:id/edit',
        element: <TPOEditDrive />,
      },
      {
        path: 'drives/:id',
        element: <TPODriveDetails />,
      },
      {
        path: 'applications',
        element: <TPOApplications />,
      },
    ],
  },

  // Catch-all 404
  {
    path: '*',
    element: <NotFound />,
  },
]);

export default router;
