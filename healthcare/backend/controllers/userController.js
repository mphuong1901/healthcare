import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';

// @desc    Lấy danh sách tất cả users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    
    if (role) {
      query.role = role;
    }
    
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Lấy thông tin user theo ID
// @route   GET /api/users/:id
// @access  Private
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Kiểm tra quyền truy cập
    if (req.user.role !== 'admin' && req.user._id.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'Không có quyền truy cập thông tin này' });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cập nhật thông tin user
// @route   PUT /api/users/:id
// @access  Private
export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Kiểm tra quyền cập nhật
    if (req.user.role !== 'admin' && req.user._id.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'Không có quyền cập nhật thông tin này' });
    }

    const allowedUpdates = ['fullName', 'phone', 'address', 'dateOfBirth', 'gender'];
    
    // Thêm các trường đặc biệt cho từng role
    if (user.role === 'doctor') {
      allowedUpdates.push('doctorInfo');
    } else if (user.role === 'patient') {
      allowedUpdates.push('patientInfo');
    }

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Cập nhật thông tin thành công',
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Xóa user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {

  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: 'Xóa người dùng thành công'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Lấy danh sách bác sĩ
// @route   GET /api/users/doctors
// @access  Public
export const getDoctors = async (req, res) => {

  try {
    const { specialty, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = { role: 'doctor', isActive: true };
    
    if (specialty) {
      query['doctorInfo.specialty'] = specialty;
    }

    const doctors = await User.find(query)
      .select('-password')
      .sort({ 'doctorInfo.rating': -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: doctors,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Lấy danh sách bệnh nhân
// @route   GET /api/users/patients
// @access  Private/Admin
export const getPatients = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const patients = await User.find({ role: 'patient' })
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments({ role: 'patient' });

    res.json({
      success: true,
      data: patients,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getPendingDoctors = async (req, res) => {
  try {
    const pendingDoctors = await User.find({ role: "doctor", isApproved: false });
    res.json(pendingDoctors);
  } catch (error) {
    console.error("Error fetching pending doctors:", error.message);
    console.error(error.stack); // In chi tiết
    res.status(500).json({ message: "Không thể lấy danh sách bác sĩ chờ duyệt" });
  }
};
// Duyệt bác sĩ
export const approveDoctor = async (req, res) => {
  try {
    const doctorId = req.params.id;

    const doctor = await User.findById(doctorId);

    if (!doctor || doctor.role !== "doctor") {
      return res.status(404).json({ message: "Không tìm thấy bác sĩ" });
    }

    doctor.isApproved = true;
    await doctor.save();

    res.json({ message: "Bác sĩ đã được duyệt thành công", doctor });
  } catch (error) {
    console.error("Error approving doctor:", error);
    res.status(500).json({ message: "Không thể duyệt bác sĩ" });
  }
};
