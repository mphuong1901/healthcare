// ActivityLog.jsx
import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, User, Activity, AlertCircle, HardDrive, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ActivityLog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dateRange, setDateRange] = useState('today');
  
  // Add loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activities, setActivities] = useState([]);

  // Fetch activities
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // TODO: Replace with actual API call when backend is ready
        // const response = await activityAPI.getActivities(filterType, dateRange, searchTerm);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data for now
        const mockActivities = [
          {
            id: 1,
            type: 'login',
            user: 'Dr. Nguyễn Văn A',
            action: 'Đăng nhập hệ thống',
            timestamp: '2024-01-15 08:30:00',
            ip: '192.168.1.100',
            status: 'success'
          },
          {
            id: 2,
            type: 'patient_access',
            user: 'Dr. Trần Thị B',
            action: 'Truy cập hồ sơ bệnh nhân #12345',
            timestamp: '2024-01-15 09:15:00',
            ip: '192.168.1.101',
            status: 'success'
          },
          {
            id: 3,
            type: 'data_export',
            user: 'Admin User',
            action: 'Xuất báo cáo thống kê',
            timestamp: '2024-01-15 10:00:00',
            ip: '192.168.1.102',
            status: 'success'
          },
          {
            id: 4,
            type: 'failed_login',
            user: 'Unknown',
            action: 'Đăng nhập thất bại',
            timestamp: '2024-01-15 11:30:00',
            ip: '192.168.1.200',
            status: 'failed'
          },
          {
            id: 5,
            type: 'user_creation',
            user: 'Admin User',
            action: 'Tạo tài khoản bác sĩ mới',
            timestamp: '2024-01-15 14:20:00',
            ip: '192.168.1.102',
            status: 'success'
          },
          {
            id: 6,
            type: 'system_error',
            user: 'System',
            action: 'Lỗi cơ sở dữ liệu',
            timestamp: '2024-01-15 15:00:00',
            ip: 'N/A',
            status: 'failed'
          }
        ];
        
        setActivities(mockActivities);
      } catch (err) {
        console.error('Error fetching activities:', err);
        setError('Không thể tải nhật ký hoạt động. Vui lòng thử lại sau.');
        toast.error('Không thể tải nhật ký hoạt động');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [filterType, dateRange, searchTerm]);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'login': return <User className="w-4 h-4 text-green-600" />;
      case 'patient_access': return <Activity className="w-4 h-4 text-blue-600" />;
      case 'data_export': return <HardDrive className="w-4 h-4 text-purple-600" />; // New icon for data export
      case 'failed_login': return <AlertCircle className="w-4 h-4 text-red-600" />; // New icon for failed login
      case 'user_creation': return <User className="w-4 h-4 text-green-600" />;
      case 'system_error': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full';
      case 'failed': return 'bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full';
      default: return 'bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full';
    }
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          activity.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          activity.ip.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || activity.type === filterType;

    // Simple date range filter (can be expanded)
    const activityDate = new Date(activity.timestamp).toDateString();
    const today = new Date().toDateString();
    const matchesDate = dateRange === 'today' ? activityDate === today : true; // For 'today' only

    return matchesSearch && matchesType && matchesDate;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Nhật ký hoạt động</h1>
        <p className="text-gray-600">Theo dõi các hoạt động hệ thống gần đây</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm hoạt động..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-primary focus:border-transparent"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">Tất cả loại</option>
            <option value="login">Đăng nhập</option>
            <option value="patient_access">Truy cập bệnh nhân</option>
            <option value="data_export">Xuất dữ liệu</option>
            <option value="failed_login">Đăng nhập thất bại</option>
            <option value="user_creation">Tạo người dùng</option>
            <option value="system_error">Lỗi hệ thống</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>

        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-primary focus:border-transparent"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="today">Hôm nay</option>
            <option value="all">Tất cả</option>
            {/* Add more date range options if needed */}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>
      </div>

      {/* Activity Log List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-200">
          {filteredActivities.map((activity) => (
            <div key={activity.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                      <span className={getStatusBadge(activity.status)}>
                        {activity.status === 'success' ? 'Thành công' : 'Thất bại'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{activity.action}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>{activity.timestamp}</span>
                      <span>IP: {activity.ip}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredActivities.length === 0 && (
          <div className="p-8 text-center">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Không tìm thấy hoạt động nào</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLog;