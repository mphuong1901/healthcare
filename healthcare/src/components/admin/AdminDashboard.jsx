import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../common/Layout';
import AdminHome from './AdminHome';
import DoctorApproval from './DoctorApproval';
import UserManagement from './UserManagement';
import ActivityLog from './ActivityLog';
import SystemSettings from './SystemSettings';

const AdminDashboard = () => {
  return (
    <Layout>
      <Routes>
        <Route index element={<AdminHome />} />
        <Route path="doctor-approval" element={<DoctorApproval />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="activity-log" element={<ActivityLog />} />
        <Route path="settings" element={<SystemSettings />} />
      </Routes>
    </Layout>
  );
};

export default AdminDashboard;