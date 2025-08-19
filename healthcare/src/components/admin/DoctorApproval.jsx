// DoctorApproval.jsx
import React, { useState, useEffect } from 'react';
import { Check, X, Eye, FileText, User, Mail, Phone, MapPin } from 'lucide-react';
import { userAPI } from '../../services/api';
import toast from 'react-hot-toast';

const DoctorApproval = () => {
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0
  });

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch pending doctors
  useEffect(() => {
    const fetchPendingDoctors = async () => {
      try {
        setLoading(true);
        const response = await userAPI.getPendingDoctors(page, limit);
        setPendingDoctors(response.data.doctors || []);
        setTotalPages(response.data.totalPages || 1);
        setStats({
          pending: response.data.totalPending || 0,
          approved: response.data.approvedThisMonth || 0,
          rejected: response.data.rejectedThisMonth || 0
        });
        setError(null);
      } catch (err) {
        console.error('Error fetching pending doctors:', err);
        setError('Không thể tải danh sách bác sĩ chờ duyệt');
        toast.error('Không thể tải danh sách bác sĩ chờ duyệt');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingDoctors();
  }, [page, limit]);

  const handleApprove = async (doctorId) => {
    try {
      await userAPI.activateUser(doctorId);
      setPendingDoctors(prev => prev.filter(doc => doc._id !== doctorId));
      toast.success('Đã duyệt tài khoản bác sĩ thành công!');
      // Refresh stats
      const response = await userAPI.getPendingDoctors(page, limit);
      setStats({
        pending: response.data.totalPending || 0,
        approved: response.data.approvedThisMonth || 0,
        rejected: response.data.rejectedThisMonth || 0
      });
    } catch (error) {
      console.error('Error approving doctor:', error);
      toast.error('Không thể duyệt tài khoản bác sĩ. Vui lòng thử lại sau.');
    }
  };

  const handleReject = async (doctorId) => {
    try {
      await userAPI.deactivateUser(doctorId);
      setPendingDoctors(prev => prev.filter(doc => doc._id !== doctorId));
      toast.success('Đã từ chối tài khoản bác sĩ!');
      // Refresh stats
      const response = await userAPI.getPendingDoctors(page, limit);
      setStats({
        pending: response.data.totalPending || 0,
        approved: response.data.approvedThisMonth || 0,
        rejected: response.data.rejectedThisMonth || 0
      });
    } catch (error) {
      console.error('Error rejecting doctor:', error);
      toast.error('Không thể từ chối tài khoản bác sĩ. Vui lòng thử lại sau.');
    }
  };

  const openModal = (doctor, action) => {
    setSelectedDoctor(doctor);
    setActionType(action);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Duyệt tài khoản bác sĩ</h1>
        <p className="text-gray-600">Xem xét và phê duyệt đăng ký tài khoản bác sĩ mới</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-full">
              <FileText className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Chờ duyệt</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đã duyệt tháng này</p>
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="bg-red-100 p-3 rounded-full">
              <X className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Từ chối tháng này</p>
              <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Doctor List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Đang tải dữ liệu...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            {error}
          </div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Họ và Tên
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chuyên khoa
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày gửi
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingDoctors.map((doctor) => (
                  <tr key={doctor._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {/* Placeholder for avatar, or generate initials */}
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold">
                            {doctor.fullName.charAt(0)}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{doctor.fullName}</div>
                          <div className="text-sm text-gray-500">{doctor.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{doctor.specialization}</div>
                      <div className="text-sm text-gray-500">Kinh nghiệm: {doctor.experience || 'Không có thông tin'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(doctor.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openModal(doctor, 'view')}
                        className="text-gray-600 hover:text-gray-900 mr-3 p-1 rounded-full hover:bg-gray-100"
                        title="Xem chi tiết"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => openModal(doctor, 'approve')}
                        className="text-green-600 hover:text-green-900 mr-3 p-1 rounded-full hover:bg-green-50"
                        title="Duyệt"
                      >
                        <Check className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => openModal(doctor, 'reject')}
                        className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                        title="Từ chối"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {pendingDoctors.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                Không có bác sĩ nào chờ duyệt.
              </div>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-700">
                    Trang <span className="font-medium">{page}</span> / <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Trước
                  </button>
                  <button
                    onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={page === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedDoctor && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-auto transform animate-scaleIn">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">
                {actionType === 'view' ? 'Chi tiết bác sĩ' : actionType === 'approve' ? 'Duyệt tài khoản' : 'Từ chối tài khoản'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {actionType === 'view' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="col-span-2">
                    <label className="block text-gray-500">Họ và Tên</label>
                    <p className="font-medium text-gray-900 flex items-center"><User className="w-4 h-4 mr-2 text-primary-500" /> {selectedDoctor.fullName}</p>
                  </div>
                  <div>
                    <label className="block text-gray-500">Email</label>
                    <p className="font-medium text-gray-900 flex items-center"><Mail className="w-4 h-4 mr-2 text-primary-500" /> {selectedDoctor.email}</p>
                  </div>
                  {selectedDoctor.phone && (
                    <div>
                      <label className="block text-gray-500">Điện thoại</label>
                      <p className="font-medium text-gray-900 flex items-center"><Phone className="w-4 h-4 mr-2 text-primary-500" /> {selectedDoctor.phone}</p>
                    </div>
                  )}
                  {selectedDoctor.specialization && (
                    <div>
                      <label className="block text-gray-500">Chuyên khoa</label>
                      <p className="font-medium text-gray-900">{selectedDoctor.specialization}</p>
                    </div>
                  )}
                  {selectedDoctor.licenseNumber && (
                    <div>
                      <label className="block text-gray-500">Số giấy phép</label>
                      <p className="font-medium text-gray-900">{selectedDoctor.licenseNumber}</p>
                    </div>
                  )}
                  {selectedDoctor.experience && (
                    <div>
                      <label className="block text-gray-500">Kinh nghiệm</label>
                      <p className="font-medium text-gray-900">{selectedDoctor.experience}</p>
                    </div>
                  )}
                  {selectedDoctor.workplace && (
                    <div>
                      <label className="block text-gray-500">Nơi công tác</label>
                      <p className="font-medium text-gray-900">{selectedDoctor.workplace}</p>
                    </div>
                  )}
                  {selectedDoctor.address && (
                    <div className="col-span-2">
                      <label className="block text-gray-500">Địa chỉ</label>
                      <p className="font-medium text-gray-900 flex items-center"><MapPin className="w-4 h-4 mr-2 text-primary-500" /> {selectedDoctor.address}</p>
                    </div>
                  )}
                  {selectedDoctor.documents && selectedDoctor.documents.length > 0 && (
                    <div className="col-span-2">
                      <label className="block text-gray-500">Tài liệu đính kèm</label>
                      <ul className="list-disc list-inside text-gray-900">
                        {selectedDoctor.documents.map((doc, index) => (
                          <li key={index} className="flex items-center">
                            <FileText className="w-4 h-4 mr-2 text-gray-500" /> {doc}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-4">
                  <p className="text-lg text-gray-700">
                    {actionType === 'approve'
                      ? `Bạn có chắc chắn muốn duyệt tài khoản của ${selectedDoctor.fullName}?`
                      : `Bạn có chắc chắn muốn từ chối tài khoản của ${selectedDoctor.fullName}?`
                    }
                  </p>
                </div>
              )}
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  {actionType === 'view' ? 'Đóng' : 'Hủy'}
                </button>
                {actionType === 'approve' && (
                  <button
                    onClick={() => {
                      handleApprove(selectedDoctor._id);
                      setShowModal(false);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Duyệt
                  </button>
                )}
                {actionType === 'reject' && (
                  <button
                    onClick={() => {
                      handleReject(selectedDoctor._id);
                      setShowModal(false);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Từ chối
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorApproval;