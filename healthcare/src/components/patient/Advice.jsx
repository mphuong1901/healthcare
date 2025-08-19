import React, { useState, useEffect } from 'react';
import { MessageSquare, User, Calendar, Filter, Search, Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { adviceAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const Advice = () => {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [adviceList, setAdviceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAdvice, setTotalAdvice] = useState(0);
  const [markingAsRead, setMarkingAsRead] = useState(null);
  const itemsPerPage = 10;


useEffect(() => {
    console.log("👤 currentUser trong useEffect:", currentUser);
  if (!currentUser) return; 

  if (currentUser.role !== 'patient') {
    setError('Bạn không có quyền truy cập trang này.');
    setLoading(false);
    return;
  }

  fetchAdvice();
}, [currentUser, currentPage]);

const fetchAdvice = async () => {
  try {
    setLoading(true);
    setError(null);

    const response = await adviceAPI.getAdvices(currentPage, itemsPerPage);
    console.log("📦 Advice API raw:", response.data);

    if (response.data && response.data.success) {
      // ✅ Đảm bảo có mảng, tránh undefined
      const adviceArray = response.data.data || [];
      const pagination = response.data.pagination || {};

      const formattedAdvice = adviceArray.map(item => ({
        ...item,
        answer: item.answer || {
          content: null,
          answeredAt: null,
          recommendations: [],
          followUpRequired: false,
          followUpDate: null
        }
      }));

      setAdviceList(formattedAdvice);
      setTotalPages(pagination.totalPages || 1);
      setTotalAdvice(pagination.total || 0);
    } else {
      throw new Error('Không thể tải dữ liệu lời khuyên');
    }
  } catch (err) {
    console.error('Error fetching advice:', err);
    setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải lời khuyên');
    setAdviceList([]);
    setTotalAdvice(0);
  } finally {
    setLoading(false);
  }
};



  const categories = {
    all: 'Tất cả',
    nutrition: 'Dinh dưỡng',
    exercise: 'Tập luyện',
    medication: 'Thuốc men',
    lifestyle: 'Lối sống'
  };

  const filteredAdvice = adviceList.filter(advice => {
    const matchesSearch = advice.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         advice.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         advice.doctor?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || advice.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const markAsRead = async (id) => {
    try {
      setMarkingAsRead(id);
      
      await adviceAPI.markAdviceAsRead(id);
      
      // Cập nhật state local
      setAdviceList(prevList => 
        prevList.map(advice => 
          advice._id === id ? { ...advice, isRead: true } : advice
        )
      );
      
      toast.success('Đã đánh dấu lời khuyên là đã đọc');
    } catch (err) {
      console.error('Error marking advice as read:', err);
      toast.error('Có lỗi xảy ra khi đánh dấu đã đọc');
    } finally {
      setMarkingAsRead(null);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Kiểm tra quyền truy cập
  if (currentUser && currentUser.role !== 'patient') {

    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không có quyền truy cập</h3>
          <p className="text-gray-600">Bạn không có quyền truy cập trang này.</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải lời khuyên...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Có lỗi xảy ra</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchAdvice}
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Lời khuyên từ bác sĩ</h1>
        <div className="text-sm text-gray-600">
          {adviceList.filter(a => !a.isRead).length} lời khuyên chưa đọc
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm lời khuyên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              {Object.entries(categories).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Advice List */}
      <div className="space-y-4">
        {filteredAdvice.map((advice) => (
          <div 
            key={advice._id} 
            className={`bg-white rounded-lg shadow-sm p-6 cursor-pointer transition-all ${
              !advice.isRead ? 'border-l-4 border-primary-500 bg-primary-50' : 'hover:shadow-md'
            } ${markingAsRead === advice._id ? 'opacity-50' : ''}`}
            onClick={() => !markingAsRead && markAsRead(advice._id)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{advice.title}</h3>
                  {!advice.isRead && (
                    <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
                      Mới
                    </span>
                  )}
                  {markingAsRead === advice._id && (
                    <Loader2 className="h-4 w-4 animate-spin text-primary-600" />
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{advice.doctor || 'Bác sĩ'}</span>
                  </div>
                  {advice.specialization && (
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      {advice.specialization}
                    </span>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(advice.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              </div>
              <MessageSquare className="h-5 w-5 text-primary-600" />
            </div>

            <div className="bg-gray-50 rounded-md p-4 space-y-4">
  {/* Nội dung câu hỏi / lời khuyên */}
  <div>
    <h4 className="text-sm font-medium text-gray-600 mb-1">Câu hỏi của bạn</h4>
    <p className="text-gray-700 leading-relaxed">{advice.content}</p>
  </div>

            {/* Trả lời của bác sĩ */}
            {advice.answer?.content ? (
              <div className="border-t pt-3">
                <h4 className="text-sm font-medium text-primary-600 mb-2 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Trả lời từ bác sĩ
                </h4>
                <p className="text-gray-800">{advice.answer.content}</p>
            
                {/* Khuyến nghị */}
                {advice.answer.recommendations?.length > 0 && (
                  <ul className="list-disc list-inside mt-2 text-gray-700">
                    {advice.answer.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                )}
            
                {/* Yêu cầu tái khám */}
                {advice.answer.followUpRequired && (
                  <div className="mt-3 text-sm text-red-600 font-medium">
                    ⚠️ Cần tái khám vào ngày {new Date(advice.answer.followUpDate).toLocaleDateString('vi-VN')}
                  </div>
                )}
            
                {/* Ngày trả lời */}
                {advice.answer.answeredAt && (
                  <div className="mt-2 text-xs text-gray-500">
                    Trả lời lúc {new Date(advice.answer.answeredAt).toLocaleString('vi-VN')}
                  </div>
                )}
              </div>
            ) : (
              <div className="border-t pt-3 text-sm text-gray-500 italic">
                Bác sĩ chưa trả lời câu hỏi này
              </div>
            )}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Danh mục: {categories[advice.category] || 'Khác'}
              </span>
              {!advice.isRead && (
                <span className="text-xs text-primary-600 font-medium">
                  Nhấn để đánh dấu đã đọc
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredAdvice.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {adviceList.length === 0 ? 'Chưa có lời khuyên nào' : 'Không có lời khuyên nào'}
          </h3>
          <p className="text-gray-600">
            {adviceList.length === 0 
              ? 'Bạn chưa nhận được lời khuyên nào từ bác sĩ.' 
              : 'Chưa có lời khuyên nào phù hợp với tìm kiếm của bạn.'
            }
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-lg shadow-sm">
          <div className="flex items-center text-sm text-gray-700">
            <span>
              Hiển thị {((currentPage - 1) * itemsPerPage) + 1} đến {Math.min(currentPage * itemsPerPage, totalAdvice)} trong tổng số {totalAdvice} lời khuyên
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Trước
            </button>
            
            <div className="flex items-center space-x-1">
              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        currentPage === page
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (
                  page === currentPage - 2 ||
                  page === currentPage + 2
                ) {
                  return (
                    <span key={page} className="px-2 py-2 text-sm text-gray-500">
                      ...
                    </span>
                  );
                }
                return null;
              })}
            </div>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Advice;