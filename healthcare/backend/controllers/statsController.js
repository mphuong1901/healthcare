import User from "../models/userModel.js";
import Appointment from "../models/appointmentModel.js";
import Question from "../models/questionModel.js"; 
import Advice from "../models/adviceModel.js";
import HealthLog from "../models/healthLogModel.js";

// Admin stats
export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDoctors = await User.countDocuments({ role: "doctor" });
    const totalPatients = await User.countDocuments({ role: "patient" });
    const pendingApprovals = await User.countDocuments({ role: "doctor", isApproved: false });
    const activeUsers = await User.countDocuments({ isActive: true });

    res.json({
      totalUsers,
      totalDoctors,
      totalPatients,
      pendingApprovals,
      systemHealth: 100,
      activeUsers,
      completionRate: 85,
    });
  } catch (error) {
    console.error("Error in getAdminStats:", error);
    res.status(500).json({ message: "Không thể lấy dữ liệu thống kê admin" });
  }
};

// Dashboard stats (chung)
export const getDashboardStats = async (req, res) => {
  res.json({ message: "Dashboard stats endpoint" });
};

// Doctor stats
export const getDoctorStats = async (req, res) => {
  try {
    const doctorId = req.user._id; // lấy từ token

    const totalAppointments = await Appointment.countDocuments({ doctor: doctorId });
    const completedAppointments = await Appointment.countDocuments({ doctor: doctorId, status: "completed" });
    const uniquePatients = await Appointment.distinct("patient", { doctor: doctorId });
    const totalPatients = uniquePatients.length;

    // Calculate newQuestions (questions not yet answered by this doctor)
    const newQuestions = await Question.countDocuments({
      doctor: doctorId,
      status: "pending", // Assuming 'pending' status for new questions
    });

    // Calculate pendingReports (questions that have been answered but report is pending)
    const pendingReports = await Question.countDocuments({
      doctor: doctorId,
      status: "answered", // Assuming 'answered' status means report is pending
      reportGenerated: false, // Assuming a field to track if report is generated
    });

  // Tính lịch hẹn hôm nay
  const startOfToday = new Date();
  startOfToday.setHours(0,0,0,0);
  const endOfToday = new Date();
  endOfToday.setHours(23,59,59,999);

  const todayAppointments = await Appointment.countDocuments({
    doctor: doctorId,
    appointmentDate: { $gte: startOfToday, $lte: endOfToday }
  });
res.json({
      doctorId,
      totalAppointments,
      completedAppointments,
      totalPatients,
      newQuestions,
      pendingReports,
      todayAppointments,
    });
  } catch (error) {
    console.error("Error in getDoctorStats:", error);
    res.status(500).json({ message: "Không thể lấy dữ liệu thống kê bác sĩ" });
  }
};
export const getPatientStats = async (req, res) => {
  try {
    const patientId = req.user._id;

    const latestLog = await HealthLog.findOne({ patient: patientId })
      .sort({ createdAt: -1 })
      .lean();

    const totalQuestions = await Question.countDocuments({ patient: patientId });
    const totalAppointments = await Appointment.countDocuments({ patient: patientId });
    const totalAdvices = await Advice.countDocuments({ patient: patientId });

    res.json({
      heartRate: latestLog?.heartRate || 0,
      bloodPressure: latestLog?.bloodPressure || "N/A",
      weight: latestLog?.weight || 0,
      lastCheckup: latestLog?.createdAt || null,
      stats: {
        totalQuestions,
        totalAppointments,
        totalAdvices,
      }
    });
  } catch (error) {
    console.error("Error in getPatientStats:", error);
    res.status(500).json({ message: "Không thể lấy dữ liệu thống kê bệnh nhân" });
  }
};

// Reports stats
export const getReports = async (req, res) => {
  try {
    // Ví dụ: lấy dữ liệu báo cáo từ User và Appointment
    const totalAppointments = await Appointment.countDocuments();
    const upcomingAppointments = await Appointment.countDocuments({ status: "pending" });
    const completedAppointments = await Appointment.countDocuments({ status: "completed" });

    const totalDoctors = await User.countDocuments({ role: "doctor" });
    const totalPatients = await User.countDocuments({ role: "patient" });

    
  // Thêm completionRate
 const completionRate = totalAppointments > 0 ? Math.round((completedAppointments / totalAppointments) * 100) : 0;

  // Chuẩn hóa dữ liệu 'reports' để UI có thể hiển thị danh sách
  const reports = [
    { key: 'totalAppointments', label: 'Tổng lịch hẹn', value: totalAppointments },
    { key: 'upcomingAppointments', label: 'Sắp tới', value: upcomingAppointments },
    { key: 'completedAppointments', label: 'Hoàn thành', value: completedAppointments },
    { key: 'totalDoctors', label: 'Tổng bác sĩ', value: totalDoctors },
    { key: 'totalPatients', label: 'Tổng bệnh nhân', value: totalPatients },
  ];
res.json({
      totalAppointments,
      upcomingAppointments,
      completedAppointments,
      totalDoctors,
      totalPatients,
    });
  } catch (error) {
    console.error("Error in getReports:", error);
    res.status(500).json({ message: "Không thể lấy dữ liệu báo cáo" });
  }
};
