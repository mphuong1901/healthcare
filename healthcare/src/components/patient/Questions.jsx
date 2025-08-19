import React, { useState, useEffect } from 'react';
import { Plus, MessageSquare, Send, Clock, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { questionAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Questions = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general'
  });

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const categories = {
    general: 'Tổng quát',
    nutrition: 'Dinh dưỡng',
    other: 'Khác',
    medication: 'Thuốc men',
    symptoms: 'Triệu chứng',
    cardiology: 'Tim mạch',
    dermatology: 'Da liễu',
    endocrinology: 'Nội tiết',
    gastroenterology: 'Tiêu hóa',
    neurology: 'Thần kinh',
    orthopedics: 'Cơ xương khớp',
    pediatrics: 'Nhi khoa',
    psychiatry: 'Tâm thần',
    pulmonology: 'Hô hấp',
    urology: 'Tiết niệu',
    gynecology: 'Sản phụ khoa',
  };

  // Kiểm tra quyền truy cập
  useEffect(() => {
    if (currentUser && currentUser.role !== 'patient') {
      toast.error('Bạn không có quyền truy cập trang này');
      navigate('/');
      return;
    }
  }, [currentUser, navigate]);

  // Fetch questions từ API
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!currentUser || currentUser.role !== 'patient') {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const response = await questionAPI.getQuestions(currentPage, 10);
        
        if (response?.data) {
          const data = response.data;
          setQuestions(data.questions || data.data || data || []);
          setTotalPages(data.totalPages || 1);
        }
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError('Không thể tải danh sách câu hỏi. Vui lòng thử lại.');
        toast.error('Không thể tải danh sách câu hỏi');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [currentUser, currentPage]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser || currentUser.role !== 'patient') {
      toast.error('Bạn không có quyền thực hiện hành động này');
      return;
    }

    try {
      setSubmitting(true);
      const response = await questionAPI.createQuestion(formData);
      
      if (response?.data) {
        const newQuestion = response.data.question || response.data.data || response.data;
        setQuestions([newQuestion, ...questions]);
        toast.success('Đã gửi câu hỏi thành công!');
        
        // Reset form
        setFormData({
          title: '',
          content: '',
          category: 'general'
        });
        setShowAddForm(false);
      }
    } catch (err) {
      console.error('Error creating question:', err);
      const errorMessage = err.response?.data?.message || 'Không thể gửi câu hỏi. Vui lòng thử lại.';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefresh = () => {
    setError('');
    setCurrentPage(1);
    // Trigger re-fetch
    window.location.reload();
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        <span className="ml-2 text-gray-600">Đang tải câu hỏi...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <div className="text-center">
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // Access control
  if (!currentUser || currentUser.role !== 'patient') {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <AlertCircle className="h-12 w-12 text-yellow-500" />
        <div className="text-center">
          <p className="text-yellow-600 font-medium">Bạn không có quyền truy cập trang này</p>
          <button
            onClick={() => navigate('/')}
            className="mt-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Câu hỏi sức khỏe</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2 transition-colors"
          disabled={submitting}
        >
          <Plus className="h-4 w-4" />
          Đặt câu hỏi
        </button>
      </div>

      {/* Add Question Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-primary-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
            <h2 className="text-lg font-semibold mb-4">Đặt câu hỏi mới</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiêu đề
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Nhập tiêu đề câu hỏi"
                  required
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Danh mục
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  disabled={submitting}
                >
                  {Object.entries(categories).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nội dung câu hỏi
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Mô tả chi tiết câu hỏi của bạn..."
                  required
                  disabled={submitting}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={submitting}
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {submitting ? 'Đang gửi...' : 'Gửi câu hỏi'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                  disabled={submitting}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-4">
        {questions && questions.length > 0 ? (
          questions.map((question) => (
            <div key={question._id || question.id} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{question.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      question.status === 'answered' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {question.status === 'answered' ? 'Đã trả lời' : 'Chờ trả lời'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      {categories[question.category] || 'Tổng quát'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {question.createdAt ? new Date(question.createdAt).toLocaleDateString('vi-VN') : 'Không xác định'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {question.status === 'answered' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Clock className="h-5 w-5 text-yellow-500" />
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-md p-3 mb-4">
                <p className="text-gray-700">{question.content}</p>
              </div>

              {question.answer && (
                <div className="border-l-4 border-primary-500 pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="h-4 w-4 text-primary-600" />
                    <span className="text-sm font-medium text-primary-600">Trả lời từ bác sĩ:</span>
                  </div>
                  {typeof question.answer === 'string' ? (
                    <p className="text-gray-700">{question.answer}</p>
                  ) : (
                    <>
                      <p className="text-gray-700">**Khuyến nghị:** {question.answer.recommendations}</p>
                      {question.answer.followUpRequired && (
                        <p className="text-gray-700">**Cần theo dõi thêm:** {question.answer.followUpRequired ? 'Có' : 'Không'}</p>
                      )}
                    </>
                  )}
                </div>
              )}
              {question.answer && (
                <div className="mt-2 p-2 bg-gray-100 rounded-md">
                    <h4 className="font-semibold text-gray-800">Trả lời từ Bác sĩ:</h4>
                    {typeof question.answer === 'object' ? (
                        <>
                            {question.answer.recommendations && (
                                <p className="text-gray-700"><strong>Khuyến nghị:</strong> {question.answer.recommendations}</p>
                            )}
                            {question.answer.followUpRequired !== undefined && (
                                <p className="text-gray-700"><strong>Cần theo dõi thêm:</strong> {question.answer.followUpRequired ? 'Có' : 'Không'}</p>
                            )}
                        </>
                    ) : (
                        <p className="text-gray-700">{question.answer}</p>
                    )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">Chưa có câu hỏi nào</p>
            <p className="text-sm mt-1">Hãy đặt câu hỏi đầu tiên của bạn!</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Đặt câu hỏi ngay
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-6">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Trước
          </button>
          <span className="px-3 py-1 text-gray-600">
            Trang {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
};

export default Questions;