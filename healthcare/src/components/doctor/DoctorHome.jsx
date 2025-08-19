import React, { useState, useEffect } from "react";
import {
  Users,
  MessageSquare,
  FileText,
  Calendar,
  TrendingUp,
  Plus,
  UserCheck,
  Loader2,
  ClipboardList,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  statsAPI,
  userAPI,
  questionAPI,
  appointmentAPI,
} from "../../services/api";
import { toast } from "react-hot-toast";
import DoctorQuestions from "./DoctorQuestions";


const DoctorHome = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalPatients: 0,
    newQuestions: 0,
    pendingReports: 0,
    todayAppointments: 0,
  });
  const [recentPatients, setRecentPatients] = useState([]);
  const [recentQuestions, setRecentQuestions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

    useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, patientsRes, questionsRes, appointmentsRes] =
          await Promise.allSettled([
            statsAPI.getDoctorStats(),
            userAPI.getPatients("", 1, 5),
            questionAPI.getDoctorQuestions("pending", "", 1, 5),
            appointmentAPI.getAppointments("today", 1, 5),
          ]);
        
        // Stats
        if (statsRes.status === "fulfilled" && statsRes.value?.data) {
          const raw = statsRes.value.data.data || statsRes.value.data; 
          setStats({
            totalPatients: raw.totalPatients || 0,
            newQuestions: raw.newQuestions || 0,
            pendingReports: raw.pendingReports || 0,
            todayAppointments: raw.todayAppointments || 0,
          });
        }
      
        // Patients
        if (patientsRes.status === "fulfilled" && patientsRes.value?.data) {
          setRecentPatients(
            patientsRes.value.data.patients ||
              patientsRes.value.data.data?.patients ||
              []
          );
        }
      
        // Questions
        if (questionsRes.status === "fulfilled" && questionsRes.value?.data) {
          setRecentQuestions(
            questionsRes.value.data.questions ||
              questionsRes.value.data.data?.questions ||
              []
          );
        }
      
        // Appointments
        if (
          appointmentsRes.status === "fulfilled" &&
          appointmentsRes.value?.data
        ) {
          setAppointments(
            appointmentsRes.value.data.appointments ||
              appointmentsRes.value.data.data?.appointments ||
              []
          );
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.");
        toast.error("Không thể tải dữ liệu dashboard");
      } finally {
        setLoading(false);
      }
    };
  
    fetchDashboardData();
  }, []);
  

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
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
      {/* Welcome */}
      <div className="bg-gradient-to-br from-white via-primary-50/30 to-secondary-50/20 rounded-2xl shadow-lg border p-6 sm:p-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          {getGreeting()},{" "}
          <span className="text-primary-600 font-bold">
            {currentUser?.fullName || "Bác sĩ"}
          </span>
          !
        </h1>
        <p className="text-gray-600 text-lg">
          Đây là tổng quan về hoạt động của bạn hôm nay.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          color="blue"
          label="Tổng bệnh nhân"
          value={stats.totalPatients}
        />
        <StatCard
          icon={MessageSquare}
          color="purple"
          label="Câu hỏi mới"
          value={stats.newQuestions}
        />
        <StatCard
          icon={FileText}
          color="green"
          label="Báo cáo chờ"
          value={stats.pendingReports}
        />
        <StatCard
          icon={Calendar}
          color="orange"
          label="Lịch hẹn hôm nay"
          value={stats.todayAppointments}
        />
      </div>

      {/* Recent Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentPatients data={recentPatients} navigate={navigate} />
        <RecentQuestions data={recentQuestions} navigate={navigate} />
      </div>

      {/* Appointments */}
      <div className="bg-white rounded-2xl shadow-md border p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">Lịch hẹn hôm nay</h3>
          <button
            onClick={() => navigate("/doctor/appointments")}
            className="text-primary-600 hover:text-primary-800 text-sm font-medium flex items-center"
          >
            Xem tất cả <Plus className="h-4 w-4 ml-1" />
          </button>
        </div>
        {appointments.length > 0 ? (
          <div className="space-y-3">
            {appointments.map((appt) => (
              <div
                key={appt._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {appt.patientId?.fullName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(appt.date).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {appt.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p>Chưa có lịch hẹn nào hôm nay.</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-md border p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Hành động nhanh
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickAction
            onClick={() => navigate("/doctor/patients")}
            icon={Users}
            color="blue"
            label="Quản lý bệnh nhân"
          />
          <QuickAction
            onClick={() => navigate("/doctor/advice")}
            icon={MessageSquare}
            color="green"
            label="Gửi lời khuyên"
          />
          <QuickAction
            onClick={() => navigate("/doctor/questions",)}
            icon={FileText}
            color="purple"
            label="Trả lời câu hỏi"
          />
          <QuickAction
            onClick={() => navigate("/doctor/reports")}
            icon={TrendingUp}
            color="orange"
            label="Xem báo cáo"
          />
        </div>
      </div>
    </div>
  );
};

// Components nhỏ để code gọn hơn
const StatCard = ({ icon: Icon, color, label, value }) => (
  <div
    className={`bg-gradient-to-br from-${color}-50 to-${color}-100/50 rounded-2xl p-5 border shadow-md flex items-center space-x-4`}
  >
    <div className={`bg-${color}-500 p-3 rounded-xl shadow-lg`}>
      <Icon className="h-6 w-6 text-white" />
    </div>
    <div>
      <p className={`text-sm font-semibold text-${color}-700`}>{label}</p>
      <p className={`text-2xl font-bold text-${color}-900`}>{value}</p>
    </div>
  </div>
);

const RecentPatients = ({ data, navigate }) => (
  <div className="bg-white rounded-2xl shadow-md border">
    <div className="p-5 border-b flex justify-between items-center">
      <h2 className="text-lg font-bold text-gray-800">Bệnh nhân gần đây</h2>
      <button
        onClick={() => navigate("/doctor/patients")}
        className="text-primary-600 hover:text-primary-800 text-sm flex items-center"
      >
        Xem tất cả <Plus className="h-4 w-4 ml-1" />
      </button>
    </div>
    <div className="p-5">
      {data.length > 0 ? (
        <div className="space-y-3">
          {data.map((p) => (
            <div
              key={p._id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {p.fullName}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(p.createdAt).toLocaleDateString("vi-VN")}
                </p>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  p.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {p.isActive ? "Hoạt động" : "Không hoạt động"}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          Không có bệnh nhân mới.
        </div>
      )}
    </div>
  </div>
);

const RecentQuestions = ({ data, navigate }) => (
  <div className="bg-white rounded-2xl shadow-md border">
    <div className="p-5 border-b flex justify-between items-center">
      <h2 className="text-lg font-bold text-gray-800">Câu hỏi mới</h2>
      <button
        onClick={() => navigate("/doctor/questions")}
        className="text-primary-600 hover:text-primary-800 text-sm flex items-center"
      >
        Xem tất cả <Plus className="h-4 w-4 ml-1" />
      </button>
    </div>
    <div className="p-5">
      {data.length > 0 ? (
        <div className="space-y-3">
          {data.map((q) => (
            <div key={q._id} className="p-3 bg-gray-50 rounded-xl">
              <p className="text-sm font-medium text-gray-900">
                {q.patientId?.fullName || "Bệnh nhân"}
              </p>
              <p className="text-xs text-gray-600 line-clamp-2">{q.title}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          Không có câu hỏi mới.
        </div>
      )}
    </div>
  </div>
);

const QuickAction = ({ onClick, icon: Icon, color, label }) => (
  <button
    onClick={onClick}
    className={`p-4 bg-${color}-50 hover:bg-${color}-100 rounded-xl transition text-left`}
  >
    <Icon className={`h-6 w-6 text-${color}-600 mb-2`} />
    <p className={`text-sm font-medium text-${color}-900`}>{label}</p>
  </button>
);

export default DoctorHome;
