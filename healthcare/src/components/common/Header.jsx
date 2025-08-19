import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Bell, User } from 'lucide-react';


const Header = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleDisplay = (role) => {
    switch (role) {
      case 'patient': return 'Bệnh nhân';
      case 'doctor': return 'Bác sĩ';
      case 'admin': return 'Quản trị viên';
      default: return '';
    }
  };

  return (
    <header className="bg-white/90 backdrop-blur-md shadow-lg border-b border-gray-200 px-6 py-4 flex-shrink-0 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary-50/50 via-transparent to-secondary-50/50"></div>
      <div className="flex items-center justify-between relative z-10">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold text-gray-800 truncate bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            Chào mừng, {currentUser?.name}!
          </h2>
          <p className="text-sm text-gray-600 truncate font-medium">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 mr-2">
              {getRoleDisplay(currentUser?.role)}
            </span>
            {new Date().toLocaleDateString('vi-VN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0">
          <button className="p-3 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-300 relative group transform hover:scale-110 shadow-sm hover:shadow-md">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-gradient-to-r from-red-400 to-red-500 rounded-full animate-pulse shadow-lg"></span>
          </button>

          <button className="p-3 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-300 relative group transform hover:scale-110 shadow-sm hover:shadow-md">
            <User className="h-5 w-5" />
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2.5 text-sm text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl transition-all duration-300 group shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
          >
            <LogOut className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
            <span className="hidden sm:inline">Đăng xuất</span>
          </button>
        </div>
      </div>
    </header>
  );
};
export default Header;