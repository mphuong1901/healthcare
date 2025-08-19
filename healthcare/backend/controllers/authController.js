import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Tạo JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Đăng ký
export const register = async (req, res) => {
  try {
    const { fullName, email, password, role, specialization, licenseNumber } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Loại bỏ đoạn mã hash mật khẩu ở đây
    // const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      fullName,
      email,
      password, // Truyền mật khẩu thô để middleware của Mongoose hash
      role: role || 'patient'
    };

    // Thêm thông tin cho bác sĩ
    if (role === 'doctor') {
      userData.specialization = specialization;
      userData.licenseNumber = licenseNumber;
      userData.isApproved = false; // Cần phê duyệt
    }

    const user = await User.create(userData);

    res.status(201).json({
      token: generateToken(user),
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: err.message || 'Server error'
    });
  }
};

// Đăng nhập
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("=== Login attempt ===", email);

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 🚨 Chặn bác sĩ chưa duyệt
    if (user.role === "doctor" && !user.isApproved) {
      return res.status(403).json({ 
        message: "Tài khoản bác sĩ chưa được admin duyệt. Vui lòng chờ." 
      });
    }

    user.lastLogin = new Date();
    await user.save();

    res.json({
      token: generateToken(user),
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};




// Đăng xuất (client sẽ xóa token)
export const logout = async (req, res) => {
  res.json({ message: 'Logged out successfully' });
};

// Lấy thông tin user hiện tại
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Cập nhật hồ sơ
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    user.fullName = req.body.fullName || user.fullName;
    user.email = req.body.email || user.email;

    await user.save();

    res.json({
      id: user._id,
      fullName: user.fullName,
      email: user.email,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Đổi mật khẩu
export const changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { oldPassword, newPassword } = req.body;

    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Old password incorrect' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Reset mật khẩu (phiên bản đơn giản - chỉ đặt lại trực tiếp)
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: 'User not found' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
