import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Filter, TrendingUp, Users, Activity, Clock, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { statsAPI, userAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedType, setSelectedType] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await statsAPI.getReports({ period: selectedPeriod, type: selectedType });
      setStats(data);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Không thể tải báo cáo. Vui lòng thử lại sau.');
      toast.error('Không thể tải báo cáo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [selectedPeriod, selectedType]);

  // Hàm helper đổi màu badge
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Đang điều trị':
        return 'bg-yellow-100 text-yellow-800';
      case 'Hoàn thành':
        return 'bg-green-100 text-green-800';
      case 'Hủy':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500">
        <AlertCircle className="w-12 h-12 mb-2" />
        <p>{error}</p>
        <button
          onClick={fetchReports}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Thử lại
        </button>
      </div>
    );
  }

  // ✅ Return UI chính
  return (
    <div className="space-y-8">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 flex items-center space-x-4">
          <Users className="w-12 h-12 text-blue-500" />
          <div>
            <p className="text-gray-500">Tổng số bệnh nhân</p>
            <p className="text-2xl font-bold">{stats?.patients || 0}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 flex items-center space-x-4">
          <Activity className="w-12 h-12 text-green-500" />
          <div>
            <p className="text-gray-500">Ca khám trong tháng</p>
            <p className="text-2xl font-bold">{stats?.appointments || 0}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 flex items-center space-x-4">
          <Clock className="w-12 h-12 text-yellow-500" />
          <div>
            <p className="text-gray-500">Thời gian trung bình</p>
            <p className="text-2xl font-bold">{stats?.avgTime || '0'} phút</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 flex items-center space-x-4">
          <TrendingUp className="w-12 h-12 text-purple-500" />
          <div>
            <p className="text-gray-500">Tỷ lệ hoàn thành</p>
            <p className="text-2xl font-bold">{stats?.completionRate || 0}%</p>
          </div>
        </div>
      </div>

      {/* Consultation Statistics Chart */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Thống kê tư vấn</h3>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="week">Tuần</option>
            <option value="month">Tháng</option>
            <option value="year">Năm</option>
          </select>
        </div>
        <div className="p-6">
          {/* Ở đây bạn sẽ vẽ biểu đồ, hiện tại mình placeholder */}
          <div className="h-64 flex items-center justify-center text-gray-400">
            (Biểu đồ thống kê tư vấn)
          </div>
        </div>
      </div>

      {/* Patient Reports Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Báo cáo bệnh nhân</h3>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="all">Tất cả</option>
            <option value="completed">Hoàn thành</option>
            <option value="in-progress">Đang tiến hành</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-4">Tên bệnh nhân</th>
                <th className="p-4">Ngày khám</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4">Bác sĩ phụ trách</th>
              </tr>
            </thead>
            <tbody>
              {stats?.reports?.length > 0 ? (
                stats.reports.map((report, index) => (
                  <tr key={report._id || index} className="border-b">
                    <td className="p-4">{report.patientName}</td>
                    <td className="p-4">{report.date}</td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${getStatusBadgeColor(
                          report.status
                        )}`}
                      >
                        {report.status}
                      </span>
                    </td>
                    <td className="p-4">{report.doctorName}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-4 text-center text-gray-500">
                    Không có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
