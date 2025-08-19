import Appointment from '../models/appointmentModel.js';

// Danh sách status hợp lệ
const VALID_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];

//  Tạo lịch hẹn
export const createAppointment = async (req, res) => {
  try {
    const { doctor, appointmentDate, timeSlot, reason, symptoms, patientNotes } = req.body;

    if (!timeSlot || !timeSlot.startTime || !timeSlot.endTime) {
      return res.status(400).json({ message: 'Thiếu thông tin khung giờ' });
    }
    if (timeSlot.startTime >= timeSlot.endTime) {
      return res.status(400).json({ message: 'Giờ bắt đầu phải nhỏ hơn giờ kết thúc' });
    }

    const appointment = new Appointment({
      patient: req.user._id,
      doctor,
      appointmentDate,
      timeSlot,
      reason,
      symptoms,
      patientNotes,
      status: 'pending'
    });

    await appointment.save();

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'fullName email')
      .populate('doctor', 'fullName email');

    res.status(201).json({
      success: true,
      message: 'Tạo lịch hẹn thành công',
      data: populatedAppointment
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Lấy tất cả lịch hẹn (admin)
export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patient', 'fullName email')
      .populate('doctor', 'fullName email');
    res.json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Lấy lịch hẹn theo ID
export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'fullName email')
      .populate('doctor', 'fullName email');

    if (!appointment) {
      return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });
    }

    // Chỉ patient, doctor liên quan, hoặc admin mới được xem
    if (
      appointment.patient._id.toString() !== req.user._id.toString() &&
      appointment.doctor._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Không có quyền truy cập lịch hẹn này' });
    }

    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Cập nhật lịch hẹn
export const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });
    }

    const isPatient = appointment.patient.toString() === req.user._id.toString();
    const isDoctor = appointment.doctor.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin && !isPatient && !isDoctor) {
      return res.status(403).json({ message: 'Không có quyền cập nhật lịch hẹn này' });
    }

    // Phân quyền theo role
    let allowedUpdates = [];
    if (isAdmin) {
      allowedUpdates = ['appointmentDate', 'timeSlot', 'reason', 'symptoms', 'patientNotes', 'doctorNotes', 'type'];
    } else if (isPatient) {
      allowedUpdates = ['appointmentDate', 'timeSlot', 'reason', 'symptoms', 'patientNotes'];
    } else if (isDoctor) {
      allowedUpdates = ['doctorNotes', 'examination'];
    }

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    if (updates.timeSlot && updates.timeSlot.startTime >= updates.timeSlot.endTime) {
      return res.status(400).json({ message: 'Giờ bắt đầu phải nhỏ hơn giờ kết thúc' });
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    )
      .populate('patient', 'fullName email')
      .populate('doctor', 'fullName email');

    res.json({
      success: true,
      message: 'Cập nhật lịch hẹn thành công',
      data: updatedAppointment
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Hủy lịch hẹn
export const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });
    }

    const isPatient = appointment.patient.toString() === req.user._id.toString();
    const isDoctor = appointment.doctor.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin && !isPatient && !isDoctor) {
      return res.status(403).json({ message: 'Không có quyền hủy lịch hẹn này' });
    }

    appointment.status = 'cancelled';
    appointment.cancelledBy = isAdmin ? 'admin' : isPatient ? 'patient' : 'doctor';
    await appointment.save();

    res.json({ success: true, message: 'Hủy lịch hẹn thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Cập nhật trạng thái (chỉ cho phép status hợp lệ)
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });
    }

    const isPatient = appointment.patient.toString() === req.user._id.toString();
    const isDoctor = appointment.doctor.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    // ✅ Quyền thay đổi trạng thái
    if (isPatient) {
      if (status !== 'cancelled') {
        return res.status(403).json({ message: 'Bệnh nhân chỉ được hủy lịch hẹn' });
      }
    } else if (isDoctor) {
      if (!['confirmed', 'completed', 'cancelled'].includes(status)) {
        return res.status(403).json({ message: 'Bác sĩ không được đặt trạng thái này' });
      }
    } else if (!isAdmin) {
      return res.status(403).json({ message: 'Bạn không có quyền cập nhật trạng thái' });
    }

    appointment.status = status;
    await appointment.save();

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'fullName email')
      .populate('doctor', 'fullName email');

    res.json({
      success: true,
      message: 'Cập nhật trạng thái thành công',
      data: populatedAppointment
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Lấy lịch hẹn theo user (phân quyền)
export const getAppointmentsByUser = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      query.doctor = req.user._id;
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'fullName email')
      .populate('doctor', 'fullName email');

    res.json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Lấy lịch làm việc của bác sĩ theo ngày (có phân trang)
export const getDoctorSchedule = async (req, res) => {
  try {
    const { date, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const query = { doctor: req.user._id };
    if (date) {
      query.appointmentDate = date;
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'fullName email')
      .skip(skip)
      .limit(Number(limit));

    res.json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Thống kê
export const getAppointmentStats = async (req, res) => {
  try {
    const stats = await Appointment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
