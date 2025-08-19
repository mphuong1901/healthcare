import React, { useState, useEffect, useMemo } from 'react';
import { Search, Eye, MessageSquare, Phone, Mail, User, Loader2 } from 'lucide-react';
import { userAPI, doctorAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const PatientList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [viewPatient, setViewPatient] = useState(null);
  const [adviceMessage, setAdviceMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const limit = 10;

  // Fetch patients (chỉ call API khi đổi page, KHÔNG phụ thuộc searchTerm nữa)
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const response = await userAPI.getPatients({ page: currentPage, limit });
        setPatients(response.data?.data || response.data?.patients || []);
        setTotalPages(response.data?.pagination?.pages || 1);
        setError('');
      } catch (err) {
        console.error('Error fetching patients:', err);
        setError('Không thể tải danh sách bệnh nhân. Vui lòng thử lại sau.');
        toast.error('Không thể tải danh sách bệnh nhân');
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [currentPage]);

  // Filter + search patients ở client
  const filteredPatients = useMemo(() => {
    return patients
      .filter((patient) => {
        // filter theo trạng thái
        if (filterStatus === 'active') return patient.isActive;
        if (filterStatus === 'inactive') return !patient.isActive;
        return true;
      })
      .filter((patient) => {
        if (!searchTerm.trim()) return true;
        const keyword = searchTerm.toLowerCase();
        return (
          (patient.fullName && patient.fullName.toLowerCase().includes(keyword)) ||
          (patient.email && patient.email.toLowerCase().includes(keyword)) ||
          (patient.phoneNumber && patient.phoneNumber.includes(keyword))
        );
      });
  }, [patients, filterStatus, searchTerm]);

  // Sort
  const sortedPatients = useMemo(() => {
    return [...filteredPatients].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.fullName.localeCompare(b.fullName);
        case 'age':
          return (a.age || 0) - (b.age || 0);
        case 'createdAt':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });
  }, [filteredPatients, sortBy]);

  const handleViewPatient = (patient) => {
    toast(`Xem chi tiết bệnh nhân: ${patient.fullName}`, { icon: "ℹ️" });
    setViewPatient(patient);
  };

  const handleSendMessage = (patient) => {
    setSelectedPatient(patient);
    setAdviceMessage('');
  };

  const handleSubmitAdvice = async () => {
    if (!adviceMessage.trim()) {
      toast.error("Vui lòng nhập nội dung lời khuyên");
      return;
    }
    try {
      setIsSending(true);
      await doctorAPI.sendAdvice(selectedPatient._id, { message: adviceMessage });
      toast.success("Đã gửi lời khuyên thành công");
      setSelectedPatient(null);
    } catch (err) {
      console.error("Error sending advice:", err);
      toast.error("Không thể gửi lời khuyên");
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        <span className="ml-2 text-gray-600">Đang tải danh sách bệnh nhân...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Danh sách bệnh nhân</h1>

      {/* Search and Filter Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Không hoạt động</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="name">Sắp xếp theo tên</option>
              <option value="age">Sắp xếp theo tuổi</option>
              <option value="createdAt">Sắp xếp theo ngày tạo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Patients List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {sortedPatients.length === 0 ? (
          <div className="p-8 text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Không tìm thấy bệnh nhân nào.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bệnh nhân</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thông tin liên hệ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedPatients.map((patient) => (
                  <tr key={patient._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{patient.fullName}</div>
                          <div className="text-sm text-gray-500">
                            {patient.age ? `${patient.age} tuổi` : 'Chưa có thông tin tuổi'} • {patient.gender || 'Chưa xác định'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center mb-1">
                          <Mail className="h-4 w-4 text-gray-400 mr-2" />
                          {patient.email}
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 text-gray-400 mr-2" />
                          {patient.phoneNumber || 'Chưa có SĐT'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={patient.isActive ? "px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800" : "px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"}>
                        {patient.isActive ? 'Hoạt động' : 'Không hoạt động'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(patient.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewPatient(patient)}
                          className="text-primary-600 hover:text-primary-900 p-1 rounded"
                          title="Xem chi tiết"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleSendMessage(patient)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Gửi lời khuyên"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Trang {currentPage} / {totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Trước
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {/* Modal gửi lời khuyên */}
      {selectedPatient && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              Gửi lời khuyên cho {selectedPatient.fullName}
            </h2>
            <textarea
              value={adviceMessage}
              onChange={(e) => setAdviceMessage(e.target.value)}
              rows={4}
              placeholder="Nhập nội dung lời khuyên..."
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setSelectedPatient(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmitAdvice}
                disabled={isSending}
                className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
              >
                {isSending ? "Đang gửi..." : "Gửi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xem chi tiết bệnh nhân */}
      {viewPatient && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-4">Thông tin chi tiết bệnh nhân</h2>
            <div className="space-y-3 text-sm text-gray-700">
              <p><strong>Họ tên:</strong> {viewPatient.fullName}</p>
              <p><strong>Email:</strong> {viewPatient.email}</p>
              <p><strong>Số điện thoại:</strong> {viewPatient.phoneNumber || "Chưa có"}</p>
              <p><strong>Tuổi:</strong> {viewPatient.age || "Chưa có"}</p>
              <p><strong>Giới tính:</strong> {viewPatient.gender || "Chưa xác định"}</p>
              <p><strong>Trạng thái:</strong> {viewPatient.isActive ? "Hoạt động" : "Không hoạt động"}</p>
              <p><strong>Ngày tạo:</strong> {new Date(viewPatient.createdAt).toLocaleDateString("vi-VN")}</p>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setViewPatient(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientList;
