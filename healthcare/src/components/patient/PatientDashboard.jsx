import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../common/Layout';
import PatientHome from './PatientHome';
import HealthLog from './HealthLog';
import Questions from './Questions';
import Advice from './Advice';
import Profile from './Profile';

const PatientDashboard = () => {
  return (
    <Layout>
      <Routes>
        <Route index element={<PatientHome />} />
        <Route path="health-log" element={<HealthLog />} />
        <Route path="questions" element={<Questions />} />
        <Route path="advice" element={<Advice />} />
        <Route path="profile" element={<Profile />} />
      </Routes>
    </Layout>
  );
};

export default PatientDashboard;