import React, { useState, useEffect } from 'react';
import { Heart, Activity, MessageSquare, FileText, TrendingUp, Calendar, Plus, Sparkles, User, HelpCircle, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { healthLogAPI, adviceAPI, statsAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const PatientHome = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [healthStats, setHealthStats] = useState({
    heartRate: 0,
    bloodPressure: 'N/A',
    weight: 0,
    lastCheckup: null
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [recentAdvice, setRecentAdvice] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
const [questions, setQuestions] = useState([]);
const [advices, setAdvices] = useState([]);
const [appointments, setAppointments] = useState([]);



  // Kiểm tra quyền truy cập
  useEffect(() => {
    if (currentUser && currentUser.role !== 'patient') {
      toast.error('Bạn không có quyền truy cập trang này');
      navigate('/');
      return;
    }
  }, [currentUser, navigate]);

// Thay thế toàn bộ useEffect cũ bằng đoạn này
useEffect(() => {
  const fetchDashboardData = async () => {
    if (!currentUser || currentUser.role !== "patient") {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      let statsData = {};
      try {
        const statsResponse = await statsAPI.getPatientStats();
        const data = statsResponse?.data?.data || statsResponse?.data || {};
        statsData = {
          totalQuestions: data.totalQuestions || 0,
          totalAppointments: data.totalAppointments || 0,
          totalAdvice: data.totalAdvice || 0,
        };
      } catch (err) {
        console.warn("Stats API error:", err);
      }
      setHealthStats(statsData);

      // 2. Questions
      let questionActivities = [];
      try {
        const qRes = await api.getQuestionsByPatientId(currentUser._id);
        const questions = qRes?.data || [];
        questionActivities = questions.map((q) => ({
          id: q._id,
          type: "question",
          message: `Bạn đã đặt câu hỏi: ${q.title || q.content?.substring(0, 30)}`,
          time: q.createdAt
            ? new Date(q.createdAt).toLocaleDateString("vi-VN")
            : "Không xác định",
          details: q,
        }));
      } catch (err) {
        console.warn("Questions API error:", err);
      }

      // 3. Advice
      let adviceActivities = [];
      let advices = [];
      try {
        const adviceRes = await api.getPatientAdvice(1, 5);
        advices =
          adviceRes?.data?.data || adviceRes?.data?.advice || adviceRes?.data || [];
        adviceActivities = advices.map((a) => ({
          id: a._id,
          type: "advice",
          message: `Nhận lời khuyên: ${a.title || a.content?.substring(0, 30)}`,
          time: a.createdAt
            ? new Date(a.createdAt).toLocaleDateString("vi-VN")
            : "Không xác định",
          details: a,
        }));
      } catch (err) {
        console.warn("Advice API error:", err);
      }

      // 4. Appointments
      let appointmentActivities = [];
      try {
        const appRes = await api.getAppointmentsByPatientId(currentUser._id);
        const appointments = appRes?.data || [];
        appointmentActivities = appointments.map((app) => ({
          id: app._id,
          type: "appointment",
          message: `Lịch hẹn: ${app.reason || "Không rõ lý do"}`,
          time: app.date
            ? new Date(app.date).toLocaleDateString("vi-VN")
            : "Không xác định",
          details: app,
        }));
      } catch (err) {
        console.warn("Appointments API error:", err);
      }

      // 5. Gộp tất cả
      const allActivities = [
        ...questionActivities,
        ...adviceActivities,
        ...appointmentActivities,
      ]
        .filter((a) => a.id)
        .sort((a, b) => {
          const dateA = a.details?.createdAt
            ? new Date(a.details.createdAt)
            : new Date(0);
          const dateB = b.details?.createdAt
            ? new Date(b.details.createdAt)
            : new Date(0);
          return dateB - dateA;
        })
        .slice(0, 5);

      setRecentActivities(allActivities);
      setRecentAdvice(advices);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Không thể tải dữ liệu dashboard. Vui lòng thử lại.");
      toast.error("Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  fetchDashboardData();
}, [currentUser]);

    const handleDeleteQuestion = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xoá câu hỏi này?")) return;
    try {
      await api.delete(`/questions/${id}`);
      setQuestions((prev) => prev.filter((q) => q._id !== id));
    } catch (error) {
      console.error("❌ Lỗi xoá câu hỏi:", error);
    }
  };


  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  const handleNavigation = (path) => {
    if (!currentUser) {
      toast.error('Vui lòng đăng nhập để tiếp tục');
      navigate('/login');
      return;
    }
    
    if (currentUser.role !== 'patient') {
      toast.error('Bạn không có quyền truy cập chức năng này');
      return;
    }
    
    navigate(path);
  };

  const handleRefresh = () => {
    setError('');
    setLoading(true);
    // Trigger re-fetch by updating a dependency
    window.location.reload();
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        <span className="ml-2 text-gray-600">Đang tải dashboard...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <div className="text-center">
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // Access control
  if (!currentUser || currentUser.role !== 'patient') {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <AlertCircle className="h-12 w-12 text-yellow-500" />
        <div className="text-center">
          <p className="text-yellow-600 font-medium">Bạn không có quyền truy cập trang này</p>
          <button
            onClick={() => navigate('/')}
            className="mt-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-white via-primary-50/30 to-secondary-50/20 rounded-2xl shadow-lg border border-primary-100/50 p-6 sm:p-8 relative overflow-hidden animate-scaleIn">
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            {getGreeting()}, <span className="text-primary-600 font-bold">{currentUser?.fullName || 'Bệnh nhân'}</span>!
          </h1>
          <p className="text-gray-600 text-lg">
            Hãy cùng xem tổng quan về sức khỏe của bạn hôm nay.
          </p>
          <div className="mt-4 flex items-center text-sm text-gray-700">
            <MessageSquare className="h-4 w-4 mr-2 text-primary-500" />
            <span>Bạn có <span className="font-semibold text-primary-700">{recentAdvice?.length || 0} lời khuyên mới</span> từ bác sĩ.</span>
          </div>
        </div>
        <Sparkles className="absolute top-4 right-4 h-16 w-16 text-primary-200 opacity-60 transform rotate-12" />
        <Heart className="absolute bottom-4 left-4 h-16 w-16 text-red-200 opacity-60 transform -rotate-12" />
      </div>

      {/* Health Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-2xl p-5 border border-red-200/50 shadow-md flex items-center space-x-4 animate-fadeIn group hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
          <div className="bg-gradient-to-br from-red-500 to-red-600 p-3 rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
            <Heart className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-red-700">Nhịp tim</p>
            <p className="text-2xl font-bold text-red-900">
              {healthStats?.heartRate && healthStats.heartRate > 0 ? healthStats.heartRate : 'N/A'} 
              {healthStats?.heartRate && healthStats.heartRate > 0 && <span className="text-base font-medium"> bpm</span>}
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-5 border border-green-200/50 shadow-md flex items-center space-x-4 animate-fadeIn group hover:shadow-xl hover:scale-[1.02] transition-all duration-300" style={{ animationDelay: '0.1s' }}>
          <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-green-700">Huyết áp</p>
            <p className="text-2xl font-bold text-green-900">
              {healthStats?.bloodPressure || 'N/A'}
              {healthStats?.bloodPressure && healthStats.bloodPressure !== 'N/A' && <span className="text-base font-medium"> mmHg</span>}
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-5 border border-purple-200/50 shadow-md flex items-center space-x-4 animate-fadeIn group hover:shadow-xl hover:scale-[1.02] transition-all duration-300" style={{ animationDelay: '0.2s' }}>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-purple-700">Cân nặng</p>
            <p className="text-2xl font-bold text-purple-900">
              {healthStats?.weight && healthStats.weight > 0 ? healthStats.weight : 'N/A'}
              {healthStats?.weight && healthStats.weight > 0 && <span className="text-base font-medium"> kg</span>}
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl p-5 border border-orange-200/50 shadow-md flex items-center space-x-4 animate-fadeIn group hover:shadow-xl hover:scale-[1.02] transition-all duration-300" style={{ animationDelay: '0.3s' }}>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-orange-700">Khám gần nhất</p>
            <p className="text-lg font-bold text-orange-900">
              {healthStats?.lastCheckup ? new Date(healthStats.lastCheckup).toLocaleDateString('vi-VN') : 'Chưa có'}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6 animate-slideIn">
          <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center">
            <Plus className="h-6 w-6 text-primary-600 mr-3" />
            Thao tác nhanh
          </h3>
          <div className="space-y-3">
            <button
              onClick={() => handleNavigation('/patient/health-log')}
              className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all duration-300 shadow-sm hover:shadow-lg group"
            >
              <div className="flex items-center space-x-3">
                <Heart className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform" />
                <span className="text-base font-medium text-blue-800 group-hover:text-blue-900 transition-colors">Ghi nhật ký sức khỏe</span>
              </div>
              <span className="text-blue-600 group-hover:translate-x-2 transition-transform text-xl">&rarr;</span>
            </button>
            <button
              onClick={() => handleNavigation('/patient/questions')}
              className="w-full flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-all duration-300 shadow-sm hover:shadow-lg group"
            >
              <div className="flex items-center space-x-3">
                <HelpCircle className="h-5 w-5 text-purple-600 group-hover:scale-110 transition-transform" />
                <span className="text-base font-medium text-purple-800 group-hover:text-purple-900 transition-colors">Gửi câu hỏi cho bác sĩ</span>
              </div>
              <span className="text-purple-600 group-hover:translate-x-2 transition-transform text-xl">&rarr;</span>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6 animate-slideIn" style={{ animationDelay: '0.1s' }}>
          <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center">
            <Activity className="h-6 w-6 text-secondary-600 mr-3" />
            Hoạt động gần đây
          </h3>
          <div className="space-y-4">
            {recentActivities && recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div key={activity.id} className="relative p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200 overflow-hidden group hover:shadow-md cursor-pointer">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${
                      activity.type === 'healthLog' ? 'bg-blue-100' :
                      activity.type === 'advice' ? 'bg-green-100' :
                      'bg-purple-100'
                    }`}>
                      {activity.type === 'health-log' ? (
                        <Heart className="h-4 w-4 text-blue-600" />
                      ) : activity.type === 'advice' ? (
                        <MessageSquare className="h-4 w-4 text-green-600" />
                      ) : (
                        <HelpCircle className="h-4 w-4 text-purple-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 group-hover:text-gray-700 transition-colors">
                        {activity.message || 'Hoạt động không xác định'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time || 'Không xác định'}</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-primary-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Chưa có hoạt động gần đây</p>
                <p className="text-sm mt-1">Hãy bắt đầu ghi nhật ký sức khỏe của bạn!</p>
                <button
                  onClick={() => handleNavigation('/patient/health-log')}
                  className="mt-3 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Ghi nhật ký ngay
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientHome;
