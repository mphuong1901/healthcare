import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../common/Layout';
import DoctorHome from './DoctorHome';
import PatientList from './PatientList';
import SendAdvice from './SendAdvice';
import Reports from './Reports';
import Settings from './Settings';
import DoctorQuestions from './DoctorQuestions';

const DoctorDashboard = () => {
  return (
    <Layout>
      <Routes>
        <Route index element={<DoctorHome />} />
        <Route path="patients" element={<PatientList />} />
        <Route path="advice" element={<SendAdvice />} />
        <Route path="questions" element={<DoctorQuestions />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Routes>
    </Layout>
  );
};

export default DoctorDashboard;