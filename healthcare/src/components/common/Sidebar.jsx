import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  FileText,
  MessageSquare,
  Users,
  Settings,
  Heart,
  Activity,
  UserCheck,
  Shield,
  HelpCircle
} from 'lucide-react';


const Sidebar = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getMenuItems = () => {
    switch (currentUser?.role) {
      case 'patient':
        return [
          { icon: Home, label: 'Trang chủ', path: '/patient' },
          { icon: FileText, label: 'Nhật ký sức khỏe', path: '/patient/healthLog' },
          { icon: HelpCircle, label: 'Câu hỏi sức khỏe', path: '/patient/questions' },
          { icon: Activity, label: 'Lời khuyên từ bác sĩ', path: '/patient/advice' },
          { icon: Settings, label: 'Tài khoản cá nhân', path: '/patient/profile' },
        ];
      case 'doctor':
        return [
          { icon: Home, label: 'Trang chủ', path: '/doctor' },
          { icon: Users, label: 'Danh sách bệnh nhân', path: '/doctor/patients' },
          { icon: MessageSquare, label: 'Gửi lời khuyên', path: '/doctor/advice' },
          { icon: HelpCircle, label: 'Câu hỏi sức khỏe', path: '/doctor/questions' },
          { icon: FileText, label: 'Báo cáo', path: '/doctor/reports' },
          { icon: Settings, label: 'Cài đặt', path: '/doctor/settings' },

        ];
      case 'admin':
        return [
          { icon: Home, label: 'Trang chủ', path: '/admin' },
          { icon: UserCheck, label: 'Duyệt bác sĩ', path: '/admin/doctor-approval' },
          { icon: Users, label: 'Quản lý người dùng', path: '/admin/users' },
          { icon: Shield, label: 'Nhật ký hoạt động', path: '/admin/activity-log' },
          { icon: Settings, label: 'Cài đặt hệ thống', path: '/admin/settings' },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="bg-white/95 backdrop-blur-sm w-64 shadow-2xl h-screen flex flex-col border-r border-gray-200">
      <div className="p-6 border-b border-gray-200 flex-shrink-0 bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <div className="flex items-center relative z-10">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm mr-3">
            <Heart className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-wide">HealthLink</h1>
        </div>
        <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center my-2 px-4 py-3.5 rounded-xl text-left transition-all duration-300 text-sm font-medium group relative overflow-hidden ${
                isActive
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25 transform scale-105'
                  : 'text-gray-700 hover:bg-primary-50 hover:text-primary-700 hover:shadow-md hover:transform hover:scale-102'
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-white/20 rounded-xl"></div>
              )}
              <Icon className={`h-5 w-5 mr-3 flex-shrink-0 transition-all duration-300 relative z-10 ${
                isActive ? 'text-white' : 'text-gray-500 group-hover:text-primary-600 group-hover:scale-110'
              }`} />
              <span className="truncate relative z-10">{item.label}</span>
              {isActive && (
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white/50 rounded-l-full"></div>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
export default Sidebar;