import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  // Thông tin cơ bản
  fullName: { 
    type: String, 
    required: [true, 'Họ và tên là bắt buộc'],
    trim: true 
  },
  email: { 
    type: String, 
    required: [true, 'Email là bắt buộc'], 
    unique: true, 
    trim: true,
    lowercase: true
  },
  password: { 
    type: String, 
    required: [true, 'Mật khẩu là bắt buộc'],
    minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'doctor', 'patient'],
    default: 'patient'
  },
  
  // Thông tin cá nhân
  phoneNumber: { type: String, trim: true },
  dateOfBirth: { type: Date },
  gender: { 
    type: String, 
    enum: ['male', 'female', 'other'] 
  },
  address: { type: String, trim: true },
  profilePicture: { type: String },
  
  // Thông tin bác sĩ
  specialization: { 
    type: String,
    required: function() { return this.role === 'doctor'; }
  },
  licenseNumber: { 
    type: String,
    required: function() { return this.role === 'doctor'; }
  },
  experience: { type: Number }, // Năm kinh nghiệm
  workplace: { type: String },
  education: { type: String },
  certifications: [{ type: String }],
  
  // Thông tin bệnh nhân
  bloodType: { 
    type: String, 
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] 
  },
  allergies: [{ type: String }],
  chronicConditions: [{ type: String }],
  emergencyContact: {
    name: { type: String },
    relationship: { type: String },
    phoneNumber: { type: String }
  },
  
  // Trạng thái tài khoản
  isActive: { type: Boolean, default: true },
  isApproved: {
    type: Boolean,
    default: function() {
      return this.role === 'patient' || this.role === 'admin';
    }
  },
  lastLogin: { type: Date },
  
  // Reset password
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
}, {
  timestamps: true
});

// Middleware hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method so sánh password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual cho tên đầy đủ
userSchema.virtual('displayName').get(function() {
  return this.fullName;
});

// Index để tối ưu query
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isApproved: 1 });
userSchema.index({ specialization: 1 });

export default mongoose.model('User', userSchema);