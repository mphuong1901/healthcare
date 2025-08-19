import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, Eye, EyeOff, User, Mail, Lock, UserCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { authAPI } from '../../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
    specialization: '',
    licenseNumber: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.fullName.trim()) return setError('Vui lòng nhập họ và tên');
    if (!formData.email.trim()) return setError('Vui lòng nhập email');
    if (!formData.password.trim()) return setError('Vui lòng nhập mật khẩu');
    if (!formData.confirmPassword.trim()) return setError('Vui lòng xác nhận mật khẩu');
    if (formData.password !== formData.confirmPassword) return setError('Mật khẩu xác nhận không khớp');
    if (formData.password.length < 6) return setError('Mật khẩu phải có ít nhất 6 ký tự');
    if (formData.role === 'doctor' && !formData.specialization.trim()) return setError('Vui lòng nhập chuyên khoa');
    if (formData.role === 'doctor' && !formData.licenseNumber.trim()) return setError('Vui lòng nhập số chứng chỉ hành nghề');

    // Chuẩn bị payload
    const payload = {
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      role: formData.role
    };
    if (formData.role === 'doctor') {
      payload.specialization = formData.specialization;
      payload.licenseNumber = formData.licenseNumber;
    }

    try {
      setLoading(true);
      const user = await register(payload); // gọi API backend qua AuthContext
      if (user) {
        toast.success(
          formData.role === 'doctor'
            ? 'Đăng ký thành công! Tài khoản của bạn đang chờ phê duyệt.'
            : 'Đăng ký thành công!'
        );
        navigate('/login');
      }
    } catch (err) {
      console.error('Register error:', err.response?.data || err.message);
      const msg = err.response?.data?.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full flex gap-8">
        {/* Left side - Register Form */}
        <div className="flex-1 max-w-md">
          <div className="bg-white rounded-xl shadow-lg p-8 border border-primary-100">
            <div className="text-center mb-8">
              <div className="flex justify-center">
                <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-3 rounded-full">
                  <Heart className="h-8 w-8 text-white" />
                </div>
              </div>
              <h2 className="mt-6 text-3xl font-bold text-gray-900">Đăng ký tài khoản</h2>
              <p className="mt-2 text-sm text-gray-600">
                Hoặc{' '}
                <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
                  đăng nhập nếu đã có tài khoản
                </Link>
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">{error}</div>}

              <div className="space-y-4">
                <InputField label="Họ và tên" name="fullName" type="text" value={formData.fullName} onChange={handleChange} icon={User} placeholder="Nhập họ và tên" />
                <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} icon={Mail} placeholder="Nhập email" />

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserCheck className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="patient">Bệnh nhân</option>
                      <option value="doctor">Bác sĩ</option>
                    </select>
                  </div>
                </div>

                {formData.role === 'doctor' && (
                  <>
                    <InputField label="Chuyên khoa" name="specialization" type="text" value={formData.specialization} onChange={handleChange} placeholder="Ví dụ: Tim mạch, Nội khoa..." />
                    <InputField label="Số chứng chỉ hành nghề" name="licenseNumber" type="text" value={formData.licenseNumber} onChange={handleChange} placeholder="Nhập số chứng chỉ" />
                  </>
                )}

                <PasswordField label="Mật khẩu" name="password" value={formData.password} onChange={handleChange} show={showPassword} setShow={setShowPassword} />
                <PasswordField label="Xác nhận mật khẩu" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} show={showConfirmPassword} setShow={setShowConfirmPassword} />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
              >
                {loading ? 'Đang đăng ký...' : 'Đăng ký'}
              </button>
            </form>
          </div>
        </div>

        {/* Right side - Demo Accounts */}
        <div className="flex-1 max-w-md">
          <div className="bg-white rounded-xl shadow-lg p-8 border border-primary-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Tài khoản demo</h3>
            <div className="space-y-4">
              <DemoAccount colorFrom="medical-blue-50" colorTo="primary-50" borderColor="medical-blue-100" title="Tài khoản Bệnh nhân" email="patient@healthcare.com" password="password123" role="Bệnh nhân" textColor="medical-blue-700" />
              <DemoAccount colorFrom="medical-green-50" colorTo="secondary-50" borderColor="medical-green-100" title="Tài khoản Bác sĩ" email="doctor@healthcare.com" password="password123" role="Bác sĩ" textColor="medical-green-700" />
              <DemoAccount colorFrom="medical-purple-50" colorTo="accent-50" borderColor="medical-purple-100" title="Tài khoản Admin" email="admin@healthcare.com" password="password123" role="Admin" textColor="medical-purple-700" />
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-medical-orange-50 to-primary-50 rounded-lg border border-medical-orange-100">
              <p className="text-sm text-medical-orange-700">
                <span className="font-medium">Lưu ý:</span> Đây là các tài khoản demo để trải nghiệm hệ thống. 
                Bạn có thể đăng ký tài khoản mới hoặc sử dụng tài khoản demo để đăng nhập.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable InputField
const InputField = ({ label, name, type, value, onChange, icon: Icon, placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <div className="relative">
      {Icon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Icon className="h-5 w-5 text-gray-400" /></div>}
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
      />
    </div>
  </div>
);

// Reusable PasswordField
const PasswordField = ({ label, name, value, onChange, show, setShow }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-gray-400" /></div>
      <input
        name={name}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder="Nhập mật khẩu"
        className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
      />
      <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShow(!show)}>
        {show ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
      </button>
    </div>
  </div>
);

// Demo Account component
const DemoAccount = ({ colorFrom, colorTo, borderColor, title, email, password, role, textColor }) => (
  <div className={`bg-gradient-to-r from-${colorFrom} to-${colorTo} p-4 rounded-lg border border-${borderColor}`}>
    <h4 className={`font-medium ${textColor} mb-2`}>{title}</h4>
    <div className={`text-sm ${textColor} space-y-1`}>
      <p><span className="font-medium">Email:</span> {email}</p>
      <p><span className="font-medium">Mật khẩu:</span> {password}</p>
      <p><span className="font-medium">Vai trò:</span> {role}</p>
    </div>
  </div>
);

export default Register;
