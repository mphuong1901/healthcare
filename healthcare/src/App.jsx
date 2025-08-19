import React, { useEffect } from 'react';
import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';
import Login from './components/auth/Login.jsx';
import Register from './components/auth/Register.jsx';
import PatientDashboard from './components/patient/PatientDashboard';
import DoctorDashboard from './components/doctor/DoctorDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import { ArrowLeft, Home } from 'lucide-react';
import { setNavigateFunction } from './services/api.js';

// Unauthorized Page
const UnauthorizedPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100/20 p-4">
    <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-red-200/50 animate-scaleIn">
      <h1 className="text-3xl font-bold text-red-700 mb-4">Không có quyền truy cập</h1>
      <p className="text-gray-600 text-lg mb-6">Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên.</p>
      <Link to="/login" className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-300 shadow-md">
        <ArrowLeft className="h-5 w-5 mr-2" />
        Quay lại Đăng nhập
      </Link>
    </div>
  </div>
);

// Not Found Page
const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100/20 p-4">
    <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-200/50 animate-scaleIn">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">404 - Không tìm thấy trang</h1>
      <p className="text-gray-600 text-lg mb-6">Trang bạn đang tìm kiếm không tồn tại. Vui lòng kiểm tra lại địa chỉ.</p>
      <Link to="/login" className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all duration-300 shadow-md">
        <Home className="h-5 w-5 mr-2" />
        Về trang chủ
      </Link>
    </div>
  </div>
);

// Component để set navigate
function NavigatorSetter() {
  const navigate = useNavigate();

  useEffect(() => {
    setNavigateFunction(navigate);
  }, [navigate]);

  return null;
}

function App() {
  return (
    <AuthProvider>
      {/* Đặt NavigatorSetter trong BrowserRouter context (đã có ở main.jsx) */}
      <NavigatorSetter />

      <div className="App min-h-screen w-full overflow-hidden bg-gray-50">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Protected routes */}
          <Route 
            path="/patient/*" 
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/doctor/*" 
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* 404 page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
