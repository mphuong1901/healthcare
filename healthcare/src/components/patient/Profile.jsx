import React, { useState, useMemo } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Save,
  X,
  FileText,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Profile
 * ------------------------------------------------------------
 * A user profile & basic health record header section.
 * Allows viewing + inline edit of personal + emergency fields.
 *
 * Required context: useAuth() must provide { currentUser } with
 * at least an _id (optional), fullName, email.
 *
 * Props (optional):
 * - onSave(formData) => Promise|void  (called when user clicks Save)
 * - initialData (object)            (prefill overrides beyond currentUser)
 * - isSaving (bool)                 (external saving state to disable inputs)
 *
 * Tailwind color note: uses custom primary-x classes. Ensure they exist in theme.
 */
const Profile = ({ onSave, initialData = {}, isSaving = false }) => {
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(() => ({
    fullName: currentUser?.fullName || '',
    email: currentUser?.email || '',
    phone: '0123456789',
    address: 'Hà Nội, Việt Nam',
    dateOfBirth: '1990-01-01',
    gender: 'male',
    emergencyContact: '0987654321',
    medicalHistory: 'Không có tiền sử bệnh lý đặc biệt',
    ...initialData,
  }));

  // Update formData only when currentUser changes (not on every render)
  React.useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        fullName: currentUser.fullName || prev.fullName,
        email: currentUser.email || prev.email,
        ...initialData,
      }));
    }
  }, [currentUser?.fullName, currentUser?.email]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTextareaChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (onSave) {
        await onSave(formData);
      }
      
      setIsEditing(false);
      toast.success('Thông tin đã được cập nhật thành công!');
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Không thể cập nhật thông tin. Vui lòng thử lại.');
      toast.error('Không thể cập nhật thông tin. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset to original data (from currentUser or initialData)
    setFormData({
      fullName: currentUser?.fullName || '',
      email: currentUser?.email || '',
      phone: '0123456789',
      address: 'Hà Nội, Việt Nam',
      dateOfBirth: '1990-01-01',
      gender: 'male',
      emergencyContact: '0987654321',
      medicalHistory: 'Không có tiền sử bệnh lý đặc biệt',
      ...initialData,
    });
    setIsEditing(false);
  };

  const genderLabel = (g) => {
    switch (g) {
      case 'male':
        return 'Nam';
      case 'female':
        return 'Nữ';
      default:
        return 'Khác';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header ------------------------------------------------ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thông tin cá nhân</h1>
          <p className="text-gray-600">Quản lý thông tin tài khoản và hồ sơ sức khỏe</p>
        </div>
        {!isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center justify-center hover:bg-primary-700 transition-colors"
          >
            <Edit className="h-4 w-4 mr-2" />
            Chỉnh sửa
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="bg-green-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700 transition-colors"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Đang lưu...' : 'Lưu'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              className="bg-secondary-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center hover:bg-secondary-700 transition-colors"
            >
              <X className="h-4 w-4 mr-2" />
              Hủy
            </button>
          </div>
        )}
      </div>

      {/* Thêm khối hiển thị lỗi vào đây, ví dụ ngay sau phần header hoặc trước các phần thông tin khác */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Basic Info -------------------------------------------- */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Thông tin cơ bản</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="profile-fullName">
              <User className="h-4 w-4 inline mr-2" />Họ và tên
            </label>
            {isEditing ? (
              <input
                id="profile-fullName"
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            ) : (
              <p className="text-gray-900 break-words">{formData.fullName || '—'}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="profile-email">
              <Mail className="h-4 w-4 inline mr-2" />Email
            </label>
            {isEditing ? (
              <input
                id="profile-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            ) : (
              <p className="text-gray-900 break-words">{formData.email || '—'}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="profile-phone">
              <Phone className="h-4 w-4 inline mr-2" />Số điện thoại
            </label>
            {isEditing ? (
              <input
                id="profile-phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            ) : (
              <p className="text-gray-900 break-all">{formData.phone || '—'}</p>
            )}
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="profile-dob">
              <Calendar className="h-4 w-4 inline mr-2" />Ngày sinh
            </label>
            {isEditing ? (
              <input
                id="profile-dob"
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            ) : (
              <p className="text-gray-900">
                {formData.dateOfBirth
                  ? new Date(formData.dateOfBirth).toLocaleDateString('vi-VN')
                  : '—'}
              </p>
            )}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="profile-gender">
              Giới tính
            </label>
            {isEditing ? (
              <select
                id="profile-gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            ) : (
              <p className="text-gray-900">{genderLabel(formData.gender)}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="profile-address">
              <MapPin className="h-4 w-4 inline mr-2" />Địa chỉ
            </label>
            {isEditing ? (
              <input
                id="profile-address"
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            ) : (
              <p className="text-gray-900 break-words">{formData.address || '—'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Emergency Contact ------------------------------------ */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <ShieldAlert className="h-5 w-5 mr-2 text-red-600" />Liên hệ khẩn cấp
        </h2>
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="profile-emergencyContact">
            Số điện thoại người thân / liên hệ khẩn cấp
          </label>
          {isEditing ? (
            <input
              id="profile-emergencyContact"
              type="tel"
              name="emergencyContact"
              value={formData.emergencyContact}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          ) : (
            <p className="text-gray-900 break-all">{formData.emergencyContact || '—'}</p>
          )}
        </div>
      </div>

      {/* Medical History -------------------------------------- */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <FileText className="h-5 w-5 mr-2 text-primary-600" />Tiền sử bệnh lý
        </h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="profile-medicalHistory">
            Mô tả ngắn (dị ứng, bệnh mãn tính, thuốc đang dùng...)
          </label>
          {isEditing ? (
            <textarea
              id="profile-medicalHistory"
              name="medicalHistory"
              rows={4}
              value={formData.medicalHistory}
              onChange={handleTextareaChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-y"
            />
          ) : (
            <p className="text-gray-900 whitespace-pre-line">{formData.medicalHistory || '—'}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
