import mongoose from 'mongoose';

const healthLogSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Bệnh nhân là bắt buộc']
  },
  
  // Chỉ số sức khỏe
  date: {
    type: Date,
    required: [true, 'Ngày ghi nhận là bắt buộc'],
    default: Date.now
  },
  
  // Các chỉ số sinh hiệu
  heartRate: {
    value: { type: Number, min: 30, max: 250 },
    unit: { type: String, default: 'bpm' },
    status: { type: String, enum: ['normal', 'low', 'high'], default: 'normal' }
  },
  
  bloodPressure: {
    systolic: { type: Number, min: 50, max: 300 },
    diastolic: { type: Number, min: 30, max: 200 },
    unit: { type: String, default: 'mmHg' },
    status: { type: String, enum: ['normal', 'low', 'high'], default: 'normal' }
  },
  
  weight: {
    value: { type: Number, min: 1, max: 500 },
    unit: { type: String, default: 'kg' }
  },
  
  height: {
    value: { type: Number, min: 30, max: 300 },
    unit: { type: String, default: 'cm' }
  },
  
  temperature: {
    value: { type: Number, min: 30, max: 50 },
    unit: { type: String, default: '°C' },
    status: { type: String, enum: ['normal', 'fever', 'hypothermia'], default: 'normal' }
  },
  
  bloodSugar: {
    value: { type: Number, min: 20, max: 600 },
    unit: { type: String, default: 'mg/dL' },
    measurementType: { type: String, enum: ['fasting', 'postprandial', 'random'], default: 'random' }
  },
  
  // Ghi chú và triệu chứng
  symptoms: [{ type: String }],
  notes: { type: String, maxlength: 1000 },
  mood: { 
    type: String, 
    enum: ['excellent', 'good', 'fair', 'poor', 'terrible'] 
  },
  
  // Thuốc đang sử dụng
  medications: [{
    name: { type: String, required: true },
    dosage: { type: String },
    frequency: { type: String },
    startDate: { type: Date },
    endDate: { type: Date }
  }],
  
  // Hoạt động thể chất
  exercise: {
    type: { type: String }, // walking, running, cycling, etc.
    duration: { type: Number }, // minutes
    intensity: { type: String, enum: ['low', 'moderate', 'high'] }
  },
  
  // Giấc ngủ
  sleep: {
    duration: { type: Number }, // hours
    quality: { type: String, enum: ['excellent', 'good', 'fair', 'poor'] }
  },
  
  // Trạng thái
  isReviewed: { type: Boolean, default: false },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewDate: { type: Date },
  doctorNotes: { type: String }
}, {
  timestamps: true
});

// Index để tối ưu query
healthLogSchema.index({ patient: 1, date: -1 });
healthLogSchema.index({ date: -1 });
healthLogSchema.index({ isReviewed: 1 });

// Virtual cho BMI
healthLogSchema.virtual('bmi').get(function() {
  if (this.weight?.value && this.height?.value) {
    const heightInM = this.height.value / 100;
    return (this.weight.value / (heightInM * heightInM)).toFixed(1);
  }
  return null;
});

export default mongoose.model('HealthLog', healthLogSchema);