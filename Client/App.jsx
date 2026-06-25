import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';

// Member Pages
import MemberDashboard from './pages/member/MemberDashboard';
import Profile from './pages/member/Profile';
import Membership from './pages/member/Membership';
import Workout from './pages/member/Workout';
import Attendance from './pages/member/Attendance';
import Payment from './pages/member/Payment';
import PaymentHistory from './pages/member/PaymentHistory';

// Trainer Pages
import TrainerDashboard from './pages/trainer/TrainerDashboard';
import AssignedMembers from './pages/trainer/AssignedMembers';
import WorkoutUpload from './pages/trainer/WorkoutUpload';
import Progress from './pages/trainer/Progress';
import Schedule from './pages/trainer/Schedule';
import TrainerAttendance from './pages/trainer/Attendance';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageMembers from './pages/admin/ManageMembers';
import ManageTrainers from './pages/admin/ManageTrainers';
import MembershipPlans from './pages/admin/MembershipPlans';
import PaymentRecords from './pages/admin/PaymentRecords';
import TrainerPayments from './pages/admin/TrainerPayments';
import AttendanceTracking from './pages/admin/AttendanceTracking';
import Reports from './pages/admin/Reports';

const App = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />

      {/* Member Routes */}
      <Route path="/member/dashboard" element={<ProtectedRoute allowedRoles={['member']}><Layout><MemberDashboard /></Layout></ProtectedRoute>} />
      <Route path="/member/profile" element={<ProtectedRoute allowedRoles={['member']}><Layout><Profile /></Layout></ProtectedRoute>} />
      <Route path="/member/membership" element={<ProtectedRoute allowedRoles={['member']}><Layout><Membership /></Layout></ProtectedRoute>} />
      <Route path="/member/workout" element={<ProtectedRoute allowedRoles={['member']}><Layout><Workout /></Layout></ProtectedRoute>} />
      <Route path="/member/attendance" element={<ProtectedRoute allowedRoles={['member']}><Layout><Attendance /></Layout></ProtectedRoute>} />
      <Route path="/member/payment" element={<ProtectedRoute allowedRoles={['member']}><Layout><Payment /></Layout></ProtectedRoute>} />
      <Route path="/member/payments" element={<ProtectedRoute allowedRoles={['member']}><Layout><PaymentHistory /></Layout></ProtectedRoute>} />

      {/* Trainer Routes */}
      <Route path="/trainer/dashboard" element={<ProtectedRoute allowedRoles={['trainer']}><Layout><TrainerDashboard /></Layout></ProtectedRoute>} />
      <Route path="/trainer/members" element={<ProtectedRoute allowedRoles={['trainer']}><Layout><AssignedMembers /></Layout></ProtectedRoute>} />
      <Route path="/trainer/workout-upload" element={<ProtectedRoute allowedRoles={['trainer']}><Layout><WorkoutUpload /></Layout></ProtectedRoute>} />
      <Route path="/trainer/progress" element={<ProtectedRoute allowedRoles={['trainer']}><Layout><Progress /></Layout></ProtectedRoute>} />
      <Route path="/trainer/schedule" element={<ProtectedRoute allowedRoles={['trainer']}><Layout><Schedule /></Layout></ProtectedRoute>} />
      <Route path="/trainer/attendance" element={<ProtectedRoute allowedRoles={['trainer']}><Layout><TrainerAttendance /></Layout></ProtectedRoute>} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><Layout><AdminDashboard /></Layout></ProtectedRoute>} />
      <Route path="/admin/members" element={<ProtectedRoute allowedRoles={['admin']}><Layout><ManageMembers /></Layout></ProtectedRoute>} />
      <Route path="/admin/trainers" element={<ProtectedRoute allowedRoles={['admin']}><Layout><ManageTrainers /></Layout></ProtectedRoute>} />
      <Route path="/admin/plans" element={<ProtectedRoute allowedRoles={['admin']}><Layout><MembershipPlans /></Layout></ProtectedRoute>} />
      <Route path="/admin/payments" element={<ProtectedRoute allowedRoles={['admin']}><Layout><PaymentRecords /></Layout></ProtectedRoute>} />
      <Route path="/admin/trainer-payments" element={<ProtectedRoute allowedRoles={['admin']}><Layout><TrainerPayments /></Layout></ProtectedRoute>} />
      <Route path="/admin/attendance" element={<ProtectedRoute allowedRoles={['admin']}><Layout><AttendanceTracking /></Layout></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><Layout><Reports /></Layout></ProtectedRoute>} />

      {/* Default */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
