import React, { useState } from 'react';
import { User, Bell, Shield, Calendar, Clock, Save, Eye, EyeOff } from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Profile settings
  const [profileData, setProfileData] = useState({
    fullName: 'BS. Nguyễn Văn Minh',
    email: 'dr.minh@hospital.com',
    phone: '0123456789',
    specialization: 'Tim mạch',
    license: 'BS123456',
    experience: '10 năm',
    bio: 'Bác sĩ chuyên khoa tim mạch với 10 năm kinh nghiệm'
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
    patientUpdates: true,
    systemAlerts: true,
    marketingEmails: false
  });

  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorAuth: false,
    sessionTimeout: '30'
  });

  // Schedule settings
  const [scheduleSettings, setScheduleSettings] = useState({
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    startTime: '08:00',
    endTime: '17:00',
    breakTime: '12:00-13:00',
    appointmentDuration: '30' // in minutes
  });

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (e) => {
    const { name, checked, value, type } = e.target;
    setNotificationSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSecurityChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSecuritySettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleScheduleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setScheduleSettings(prev => {
        const newWorkingDays = checked
          ? [...prev.workingDays, value]
          : prev.workingDays.filter(day => day !== value);
        return { ...prev, workingDays: newWorkingDays };
      });
    } else {
      setScheduleSettings(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    alert('Cài đặt đã được lưu thành công!');
  };

  const tabs = [
    { id: 'profile', label: 'Hồ sơ', icon: User },
    { id: 'notifications', label: 'Thông báo', icon: Bell },
    { id: 'security', label: 'Bảo mật', icon: Shield },
    { id: 'schedule', label: 'Lịch làm việc', icon: Calendar },
  ];

  const renderProfileTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
        <input
          type="text"
          id="fullName"
          name="fullName"
          value={profileData.fullName}
          onChange={handleProfileChange}
          className="form-input block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={profileData.email}
          onChange={handleProfileChange}
          className="form-input block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          disabled
        />
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={profileData.phone}
          onChange={handleProfileChange}
          className="form-input block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-1">Chuyên khoa</label>
        <input
          type="text"
          id="specialization"
          name="specialization"
          value={profileData.specialization}
          onChange={handleProfileChange}
          className="form-input block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="license" className="block text-sm font-medium text-gray-700 mb-1">Số giấy phép</label>
        <input
          type="text"
          id="license"
          name="license"
          value={profileData.license}
          onChange={handleProfileChange}
          className="form-input block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">Kinh nghiệm</label>
        <input
          type="text"
          id="experience"
          name="experience"
          value={profileData.experience}
          onChange={handleProfileChange}
          className="form-input block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
        />
      </div>
      <div className="md:col-span-2">
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">Tiểu sử</label>
        <textarea
          id="bio"
          name="bio"
          rows="3"
          value={profileData.bio}
          onChange={handleProfileChange}
          className="form-textarea block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
        ></textarea>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between py-2 border-b border-gray-200">
        <label htmlFor="emailNotifications" className="text-sm font-medium text-gray-700">Thông báo Email</label>
        <input
          type="checkbox"
          id="emailNotifications"
          name="emailNotifications"
          checked={notificationSettings.emailNotifications}
          onChange={handleNotificationChange}
          className="form-checkbox h-5 w-5 text-primary-600 rounded focus:ring-primary-500"
        />
      </div>
      <div className="flex items-center justify-between py-2 border-b border-gray-200">
        <label htmlFor="smsNotifications" className="text-sm font-medium text-gray-700">Thông báo SMS</label>
        <input
          type="checkbox"
          id="smsNotifications"
          name="smsNotifications"
          checked={notificationSettings.smsNotifications}
          onChange={handleNotificationChange}
          className="form-checkbox h-5 w-5 text-primary-600 rounded focus:ring-primary-500"
        />
      </div>
      <div className="flex items-center justify-between py-2 border-b border-gray-200">
        <label htmlFor="appointmentReminders" className="text-sm font-medium text-gray-700">Nhắc nhở lịch hẹn</label>
        <input
          type="checkbox"
          id="appointmentReminders"
          name="appointmentReminders"
          checked={notificationSettings.appointmentReminders}
          onChange={handleNotificationChange}
          className="form-checkbox h-5 w-5 text-primary-600 rounded focus:ring-primary-500"
        />
      </div>
      <div className="flex items-center justify-between py-2 border-b border-gray-200">
        <label htmlFor="patientUpdates" className="text-sm font-medium text-gray-700">Cập nhật bệnh nhân</label>
        <input
          type="checkbox"
          id="patientUpdates"
          name="patientUpdates"
          checked={notificationSettings.patientUpdates}
          onChange={handleNotificationChange}
          className="form-checkbox h-5 w-5 text-primary-600 rounded focus:ring-primary-500"
        />
      </div>
      <div className="flex items-center justify-between py-2 border-b border-gray-200">
        <label htmlFor="systemAlerts" className="text-sm font-medium text-gray-700">Cảnh báo hệ thống</label>
        <input
          type="checkbox"
          id="systemAlerts"
          name="systemAlerts"
          checked={notificationSettings.systemAlerts}
          onChange={handleNotificationChange}
          className="form-checkbox h-5 w-5 text-primary-600 rounded focus:ring-primary-500"
        />
      </div>
      <div className="flex items-center justify-between py-2">
        <label htmlFor="marketingEmails" className="text-sm font-medium text-gray-700">Email tiếp thị</label>
        <input
          type="checkbox"
          id="marketingEmails"
          name="marketingEmails"
          checked={notificationSettings.marketingEmails}
          onChange={handleNotificationChange}
          className="form-checkbox h-5 w-5 text-primary-600 rounded focus:ring-primary-500"
        />
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div>
        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            id="currentPassword"
            name="currentPassword"
            value={securitySettings.currentPassword}
            onChange={handleSecurityChange}
            className="form-input block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 pr-10 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>
      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
        <input
          type={showPassword ? 'text' : 'password'}
          id="newPassword"
          name="newPassword"
          value={securitySettings.newPassword}
          onChange={handleSecurityChange}
          className="form-input block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
        <input
          type={showPassword ? 'text' : 'password'}
          id="confirmPassword"
          name="confirmPassword"
          value={securitySettings.confirmPassword}
          onChange={handleSecurityChange}
          className="form-input block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
        />
      </div>
      <div className="flex items-center justify-between py-2 border-b border-gray-200">
        <label htmlFor="twoFactorAuth" className="text-sm font-medium text-gray-700">Xác thực hai yếu tố</label>
        <input
          type="checkbox"
          id="twoFactorAuth"
          name="twoFactorAuth"
          checked={securitySettings.twoFactorAuth}
          onChange={handleSecurityChange}
          className="form-checkbox h-5 w-5 text-primary-600 rounded focus:ring-primary-500"
        />
      </div>
      <div>
        <label htmlFor="sessionTimeout" className="block text-sm font-medium text-gray-700 mb-1">Thời gian chờ phiên (phút)</label>
        <select
          id="sessionTimeout"
          name="sessionTimeout"
          value={securitySettings.sessionTimeout}
          onChange={handleSecurityChange}
          className="form-select block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
        >
          <option value="15">15 phút</option>
          <option value="30">30 phút</option>
          <option value="60">1 giờ</option>
          <option value="120">2 giờ</option>
        </select>
      </div>
    </div>
  );

  const renderScheduleTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Ngày làm việc</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
            <label key={day} className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="workingDays"
                value={day}
                checked={scheduleSettings.workingDays.includes(day)}
                onChange={handleScheduleChange}
                className="form-checkbox h-4 w-4 text-primary-600 rounded"
              />
              <span className="text-sm text-gray-800 capitalize">
                {day === 'monday' && 'Thứ Hai'}
                {day === 'tuesday' && 'Thứ Ba'}
                {day === 'wednesday' && 'Thứ Tư'}
                {day === 'thursday' && 'Thứ Năm'}
                {day === 'friday' && 'Thứ Sáu'}
                {day === 'saturday' && 'Thứ Bảy'}
                {day === 'sunday' && 'Chủ Nhật'}
              </span>
            </label>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">Thời gian bắt đầu</label>
          <input
            type="time"
            id="startTime"
            name="startTime"
            value={scheduleSettings.startTime}
            onChange={handleScheduleChange}
            className="form-input block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">Thời gian kết thúc</label>
          <input
            type="time"
            id="endTime"
            name="endTime"
            value={scheduleSettings.endTime}
            onChange={handleScheduleChange}
            className="form-input block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>
      </div>
      <div>
        <label htmlFor="breakTime" className="block text-sm font-medium text-gray-700 mb-1">Thời gian nghỉ trưa</label>
        <input
          type="text"
          id="breakTime"
          name="breakTime"
          value={scheduleSettings.breakTime}
          onChange={handleScheduleChange}
          placeholder="Ví dụ: 12:00-13:00"
          className="form-input block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="appointmentDuration" className="block text-sm font-medium text-gray-700 mb-1">Thời lượng mỗi cuộc hẹn (phút)</label>
        <select
          id="appointmentDuration"
          name="appointmentDuration"
          value={scheduleSettings.appointmentDuration}
          onChange={handleScheduleChange}
          className="form-select block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
        >
          <option value="15">15 phút</option>
          <option value="30">30 phút</option>
          <option value="45">45 phút</option>
          <option value="60">60 phút</option>
        </select>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab();
      case 'notifications':
        return renderNotificationsTab();
      case 'security':
        return renderSecurityTab();
      case 'schedule':
        return renderScheduleTab();
      default:
        return renderProfileTab();
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Cài đặt</h1>
        <p className="text-gray-600">Quản lý thông tin cá nhân và cài đặt hệ thống của bạn.</p>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>

        {/* Save Button */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center font-medium shadow-md hover:shadow-lg"
          >
            {isSaving ? (
              <Save className="w-5 h-5 inline mr-2 animate-pulse" />
            ) : (
              <Save className="w-5 h-5 inline mr-2" />
            )}
            {isSaving ? 'Đang lưu...' : 'Lưu cài đặt'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;