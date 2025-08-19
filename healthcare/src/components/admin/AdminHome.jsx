import React, { useState, useEffect } from 'react';
import { Users, UserCheck, Activity, Shield, TrendingUp, AlertTriangle, Plus, Sparkles, MessageSquare, Settings, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { statsAPI, userAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const AdminHome = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDoctors: 0,
    totalPatients: 0,
    pendingApprovals: 0,
    systemHealth: 0,
    activeUsers: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch admin stats - CHUẨN HÓA: Thêm error handling
        const statsResponse = await statsAPI.getAdminStats();
        if (statsResponse?.data) {
          setStats(statsResponse.data || {
            totalUsers: 0,
            totalDoctors: 0,
            totalPatients: 0,
            pendingApprovals: 0,
            systemHealth: 0,
            activeUsers: 0
          });
        }
        
        // Fetch recent user registrations - CHUẨN HÓA: Xử lý response nhất quán
        const usersResponse = await userAPI.getAllUsers(null, null, 1, 5);
        if (usersResponse?.data) {
          const recentUsers = usersResponse.data.users || usersResponse.data.data || [];
          
          // Convert recent users to activities format
          const activities = recentUsers.map(user => ({
            id: user._id,
            type: user.role === 'doctor' ? 'doctor_registration' : 'user_registration',
            message: `${user.role === 'doctor' ? 'Bác sĩ' : 'Bệnh nhân'} mới đăng ký: ${user.fullName}`,
            time: new Date(user.createdAt).toLocaleDateString('vi-VN')
          }));
          
          setRecentActivities(activities);
        }
        
        setError('');
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.');
        toast.error('Không thể tải dữ liệu dashboard');
        
        // Fallback data
        setRecentActivities([
          {
            id: 'fallback-1',
            type: 'system_update',
            message: 'Hệ thống đã được cập nhật thành công',
            time: new Date().toLocaleDateString('vi-VN')
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Hàm để lấy lời chào dựa trên thời gian trong ngày
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'doctor_registration':
        return <UserCheck className="h-4 w-4 text-green-600" />;
      case 'user_registration':
        return <Users className="h-4 w-4 text-blue-600" />;
      case 'system_update':
        return <Settings className="h-4 w-4 text-purple-600" />;
      case 'security_alert':
        return <Shield className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        <span className="ml-2 text-gray-600">Đang tải dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-white via-purple-50/30 to-blue-50/20 rounded-2xl shadow-lg border border-gray-200/50 p-6 sm:p-8 relative overflow-hidden animate-scaleIn">
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            {getGreeting()}, <span className="text-purple-600 font-bold">Admin User</span>!
          </h1>
          <p className="text-gray-600 text-lg">
            Tổng quan hệ thống và các hoạt động quan trọng hôm nay.
          </p>
          <div className="mt-4 flex items-center text-sm text-gray-700">
            <UserCheck className="h-4 w-4 mr-2 text-purple-500" />
            <span>Bạn có <span className="font-semibold text-purple-700">{stats.pendingApprovals} yêu cầu duyệt bác sĩ mới</span> đang chờ.</span>
          </div>
        </div>
        <Sparkles className="absolute top-4 right-4 h-16 w-16 text-purple-200 opacity-60 transform rotate-12" />
        <Shield className="absolute bottom-4 left-4 h-16 w-16 text-blue-200 opacity-60 transform -rotate-12" />
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-5 border border-blue-200/50 shadow-md flex items-center space-x-4 animate-fadeIn group hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-700">Tổng số người dùng</p>
            <p className="text-2xl font-bold text-blue-900">{stats.totalUsers.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-5 border border-green-200/50 shadow-md flex items-center space-x-4 animate-fadeIn group hover:shadow-xl hover:scale-[1.02] transition-all duration-300" style={{ animationDelay: '0.1s' }}>
          <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
            <UserCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-green-700">Tổng số bác sĩ</p>
            <p className="text-2xl font-bold text-green-900">{stats.totalDoctors}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-2xl p-5 border border-red-200/50 shadow-md flex items-center space-x-4 animate-fadeIn group hover:shadow-xl hover:scale-[1.02] transition-all duration-300" style={{ animationDelay: '0.2s' }}>
          <div className="bg-gradient-to-br from-red-500 to-red-600 p-3 rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
            <AlertTriangle className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-red-700">Yêu cầu chờ duyệt</p>
            <p className="text-2xl font-bold text-red-900">{stats.pendingApprovals}</p>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6 animate-slideIn" style={{ animationDelay: '0.1s' }}>
        <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center">
          <Activity className="h-6 w-6 text-secondary-600 mr-3" />
          Hoạt động gần đây
        </h3>
        <div className="space-y-4">
          {recentActivities.length > 0 ? (
            recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200 group">
                <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p>Chưa có hoạt động gần đây.</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-5">Hành động nhanh</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/admin/users')}
            className="p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors duration-200 text-left group"
          >
            <Users className="h-6 w-6 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-blue-900">Quản lý người dùng</p>
          </button>
          
          <button
            onClick={() => navigate('/admin/doctor-approval')}
            className="p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors duration-200 text-left group"
          >
            <UserCheck className="h-6 w-6 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-green-900">Duyệt bác sĩ</p>
          </button>
          
          <button
            onClick={() => navigate('/admin/settings')}
            className="p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors duration-200 text-left group"
          >
            <Settings className="h-6 w-6 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-purple-900">Cài đặt hệ thống</p>
          </button>
          
          <button
            onClick={() => navigate('/admin/activity-log')}
            className="p-4 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors duration-200 text-left group"
          >
            <TrendingUp className="h-6 w-6 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-orange-900">Nhật kí hoạt động</p>

          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;