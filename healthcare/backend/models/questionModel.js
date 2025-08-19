import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Bệnh nhân là bắt buộc']
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  title: {
    type: String,
    required: [true, 'Tiêu đề câu hỏi là bắt buộc'],
    trim: true,
    maxlength: [200, 'Tiêu đề không được vượt quá 200 ký tự']
  },
  
  content: {
    type: String,
    required: [true, 'Nội dung câu hỏi là bắt buộc'],
    maxlength: [2000, 'Nội dung không được vượt quá 2000 ký tự']
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
  
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  status: {
    type: String,
    enum: ['pending', 'answered', 'closed'],
    default: 'pending'
  },
  
  // Thông tin bổ sung
  symptoms: [{ type: String }],
  duration: { type: String }, // Thời gian có triệu chứng
  attachments: [{
    filename: { type: String },
    url: { type: String },
    fileType: { type: String }
  }],
  
  // Câu trả lời từ bác sĩ
  answer: {
    content: { type: String },
    answeredAt: { type: Date },
    recommendations: [{ type: String }],
    followUpRequired: { type: Boolean, default: false },
    followUpDate: { type: Date }
  },
  
  // Đánh giá
  rating: {
    score: { type: Number, min: 1, max: 5 },
    feedback: { type: String },
    ratedAt: { type: Date }
  },
  
  // Trạng thái đọc
  isReadByPatient: { type: Boolean, default: false },
  isReadByDoctor: { type: Boolean, default: false },
  
  // Tags để tìm kiếm
  tags: [{ type: String }]
}, {
  timestamps: true
});

// Index để tối ưu query
questionSchema.index({ patient: 1, createdAt: -1 });
questionSchema.index({ status: 1, priority: -1 });
questionSchema.index({ category: 1 });
// Update index to use doctor field directly
questionSchema.index({ doctor: 1 });
questionSchema.index({ tags: 1 });

// Virtual cho thời gian chờ trả lời
questionSchema.virtual('waitingTime').get(function() {
  if (this.status === 'answered' && this.answer?.answeredAt) {
    return this.answer.answeredAt - this.createdAt;
  }
  return Date.now() - this.createdAt;
});

export default mongoose.model('Question', questionSchema);