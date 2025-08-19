import mongoose from 'mongoose';

const adviceSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Bác sĩ là bắt buộc']
  },
  
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Bệnh nhân là bắt buộc']
  },
  
  title: {
    type: String,
    required: [true, 'Tiêu đề lời khuyên là bắt buộc'],
    trim: true,
    maxlength: [200, 'Tiêu đề không được vượt quá 200 ký tự']
  },
  
  content: {
    type: String,
    required: [true, 'Nội dung lời khuyên là bắt buộc'],
    maxlength: [3000, 'Nội dung không được vượt quá 3000 ký tự']
  },
  
  type: {
    type: String,
    enum: [
      'medication', 'lifestyle', 'diet', 'exercise', 
      'followup', 'prevention', 'emergency', 'general'
    ],
    default: 'general'
  },
  
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  category: {
    type: String,
    enum: [
      'general', 'cardiology', 'dermatology', 'endocrinology',
      'gastroenterology', 'neurology', 'orthopedics', 'pediatrics',
      'psychiatry', 'pulmonology', 'urology', 'gynecology', 'other'
    ],
    default: 'general'
  },
  
  // Thông tin chi tiết
  recommendations: [{
    title: { type: String, required: true },
    description: { type: String },
    frequency: { type: String }, // daily, weekly, monthly
    duration: { type: String }, // 1 week, 1 month, etc.
    important: { type: Boolean, default: false }
  }],
  
  // Thuốc được kê đơn
  medications: [{
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { type: String, required: true },
    duration: { type: String },
    instructions: { type: String },
    sideEffects: [{ type: String }],
    contraindications: [{ type: String }]
  }],
  
  // Lịch tái khám
  followUp: {
    required: { type: Boolean, default: false },
    suggestedDate: { type: Date },
    reason: { type: String },
    specialistReferral: {
      required: { type: Boolean, default: false },
      specialization: { type: String },
      reason: { type: String }
    }
  },
  
  // Cảnh báo và lưu ý
  warnings: [{
    type: { type: String, enum: ['allergy', 'interaction', 'contraindication', 'side_effect'] },
    message: { type: String, required: true },
    severity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }
  }],
  
  // File đính kèm
  attachments: [{
    filename: { type: String },
    url: { type: String },
    fileType: { type: String },
    description: { type: String }
  }],
  
  // Trạng thái
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  isActive: { type: Boolean, default: true },
  
  // Phản hồi từ bệnh nhân
  patientFeedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String },
    helpful: { type: Boolean },
    followedAdvice: { type: Boolean },
    feedbackDate: { type: Date }
  },
  
  // Tags
  tags: [{ type: String }],
  
  // Liên kết với health log hoặc question
  relatedHealthLog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HealthLog'
  },
  relatedQuestion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }
}, {
  timestamps: true
});

// Index để tối ưu query
adviceSchema.index({ patient: 1, createdAt: -1 });
adviceSchema.index({ doctor: 1, createdAt: -1 });
adviceSchema.index({ type: 1, priority: -1 });
adviceSchema.index({ category: 1 });
adviceSchema.index({ isRead: 1 });
adviceSchema.index({ tags: 1 });

export default mongoose.model('Advice', adviceSchema);