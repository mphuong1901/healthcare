import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Bệnh nhân là bắt buộc']
  },
  
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Bác sĩ là bắt buộc']
  },
  
  appointmentDate: {
    type: Date,
    required: [true, 'Ngày hẹn là bắt buộc']
  },
  
  timeSlot: {
    startTime: { type: String, required: true }, // "09:00"
    endTime: { type: String, required: true },   // "09:30"
    duration: { type: Number, default: 30 }      // minutes
  },
  
  type: {
    type: String,
    enum: ['consultation', 'followup', 'checkup', 'emergency', 'telemedicine'],
    default: 'consultation'
  },
  
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'],
    default: 'scheduled'
  },
  
  reason: {
    type: String,
    required: [true, 'Lý do khám là bắt buộc'],
    maxlength: [500, 'Lý do khám không được vượt quá 500 ký tự']
  },
  
  symptoms: [{ type: String }],
  
  // Thông tin liên hệ
  contactInfo: {
    phone: { type: String },
    email: { type: String },
    preferredContact: { type: String, enum: ['phone', 'email', 'sms'], default: 'phone' }
  },
  
  // Ghi chú
  patientNotes: { type: String, maxlength: 1000 },
  doctorNotes: { type: String, maxlength: 1000 },
  
  // Kết quả khám
  examination: {
    diagnosis: { type: String },
    treatment: { type: String },
    prescription: [{
      medication: { type: String },
      dosage: { type: String },
      frequency: { type: String },
      duration: { type: String }
    }],
    recommendations: [{ type: String }],
    nextAppointment: { type: Date }
  },
  
  // Thanh toán
  payment: {
    fee: { type: Number, default: 0 },
    currency: { type: String, default: 'VND' },
    status: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
    method: { type: String, enum: ['cash', 'card', 'transfer', 'insurance'] },
    paidAt: { type: Date }
  },
  
  // Nhắc nhở
  reminders: [{
    type: { type: String, enum: ['sms', 'email', 'push'] },
    sentAt: { type: Date },
    status: { type: String, enum: ['sent', 'delivered', 'failed'] }
  }],
  
  // Đánh giá
  rating: {
    score: { type: Number, min: 1, max: 5 },
    feedback: { type: String },
    ratedAt: { type: Date }
  },
  
  // Hủy lịch hẹn
  cancellation: {
    cancelledBy: { type: String, enum: ['patient', 'doctor', 'admin'] },
    reason: { type: String },
    cancelledAt: { type: Date },
    refundAmount: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Index để tối ưu query
appointmentSchema.index({ patient: 1, appointmentDate: -1 });
appointmentSchema.index({ doctor: 1, appointmentDate: -1 });
appointmentSchema.index({ appointmentDate: 1, status: 1 });
appointmentSchema.index({ status: 1 });

// Virtual cho thời gian còn lại đến lịch hẹn
appointmentSchema.virtual('timeUntilAppointment').get(function() {
  return this.appointmentDate - Date.now();
});

export default mongoose.model('Appointment', appointmentSchema);