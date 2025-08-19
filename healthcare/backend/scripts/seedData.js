import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/userModel.js';
import dotenv from 'dotenv';

dotenv.config();

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Xóa dữ liệu cũ
    await User.deleteMany({});
    
    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = [
      {
        fullName: 'Admin System',
        email: 'admin@healthcare.com',
        password: hashedPassword,
        role: 'admin',
        phoneNumber: '0123456789',
        isActive: true
      },
      {
        fullName: 'BS. Nguyễn Văn A',
        email: 'doctor@healthcare.com',
        password: hashedPassword,
        role: 'doctor',
        phoneNumber: '0987654321',
        specialization: 'Nội khoa',
        licenseNumber: 'BS001234567',
        experience: 10,
        workplace: 'Bệnh viện Đa khoa Trung ương',
        education: 'Đại học Y Hà Nội',
        certifications: ['Bác sĩ chuyên khoa I', 'Chứng chỉ hành nghề'],
        isActive: true,
        isApproved: true
      },
      {
        fullName: 'Nguyễn Thị B',
        email: 'patient@healthcare.com',
        password: hashedPassword,
        role: 'patient',
        phoneNumber: '0123987654',
        dateOfBirth: new Date('1990-05-15'),
        gender: 'female',
        address: '123 Đường ABC, Quận 1, TP.HCM',
        bloodType: 'O+',
        allergies: ['Penicillin'],
        chronicConditions: [],
        emergencyContact: {
          name: 'Nguyễn Văn C',
          relationship: 'Chồng',
          phoneNumber: '0987123456'
        },
        isActive: true
      }
    ];
    
    await User.insertMany(users);
    console.log('Seed data thành công!');
    console.log('Tài khoản test:');
    console.log('- Admin: admin@healthcare.com / password123');
    console.log('- Doctor: doctor@healthcare.com / password123');
    console.log('- Patient: patient@healthcare.com / password123');
    process.exit();
  } catch (error) {
    console.error('Lỗi seed data:', error);
    process.exit(1);
  }
};

seedUsers();