import React, { useState, useEffect } from 'react';
import { Plus, Heart, Activity, Scale, Thermometer, Calendar, Save, Sparkles, X, Loader2 } from 'lucide-react';
import { healthLogAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const HealthLog = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    heartRate: '',
    bloodPressure: '',
    weight: '',
    temperature: '',
    notes: ''
  });

  const [healthLogs, setHealthLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Lấy danh sách bản ghi sức khỏe từ API
  useEffect(() => {
    const fetchHealthLogs = async () => {
      try {
        setLoading(true);
        const response = await healthLogAPI.getLogs(currentPage, 10);
        setHealthLogs(response.data.data);
        setTotalPages(response.data.totalPages);
        setError(null);
      } catch (err) {
        console.error('Lỗi khi lấy dữ liệu nhật ký sức khỏe:', err);
        setError('Không thể tải dữ liệu nhật ký sức khỏe. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchHealthLogs();
  }, [currentPage]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Định dạng lại dữ liệu để phù hợp với schema của HealthLog
      const formattedData = {
        date: formData.date,
        notes: formData.notes,
      };
      
      if (formData.heartRate) {
        formattedData.heartRate = { value: parseFloat(formData.heartRate), unit: 'bpm' };
      }
      if (formData.bloodPressure) {
        const [systolic, diastolic] = formData.bloodPressure.split('/').map(Number);
        if (!isNaN(systolic) && !isNaN(diastolic)) {
          formattedData.bloodPressure = { systolic, diastolic, unit: 'mmHg' };
        }
      }
      if (formData.weight) {
        formattedData.weight = { value: parseFloat(formData.weight), unit: 'kg' };
      }
      if (formData.temperature) {
        formattedData.temperature = { value: parseFloat(formData.temperature), unit: '°C' };
      }
      
      const response = await healthLogAPI.createLog(formattedData);
      
      // Cập nhật danh sách bản ghi với bản ghi mới
      setHealthLogs([response.data.data, ...healthLogs]);
      
      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        heartRate: '',
        bloodPressure: '',
        weight: '',
        temperature: '',
        notes: ''
      });
      
      setShowAddForm(false);
      toast.success('Đã thêm bản ghi sức khỏe mới!');
    } catch (err) {
      console.error('Lỗi khi thêm bản ghi sức khỏe:', err);
      toast.error(err.response?.data?.message || 'Không thể thêm bản ghi sức khỏe. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bản ghi này không?')) {
      try {
        console.log('Attempting to delete health log with ID:', id); 
        await healthLogAPI.deleteLog(id); 
        setHealthLogs(healthLogs.filter(log => log._id !== id));
        toast.success('Đã xóa bản ghi sức khỏe!');
      } catch (err) {
        console.error('Lỗi khi xóa bản ghi sức khỏe:', err);
        toast.error(err.response?.data?.message || 'Không thể xóa bản ghi sức khỏe. Vui lòng thử lại.');
      }
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Nhật ký sức khỏe</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-5 py-2 bg-primary-500 text-white rounded-lg shadow-md hover:bg-primary-600 transition-all duration-200 flex items-center font-medium"
        >
          <Plus className="w-5 h-5 mr-2" />
          Thêm chỉ số
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-xl shadow-md border border-primary-100/50 p-6 mb-8 relative animate-scaleIn">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Thêm chỉ số sức khỏe mới</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Ngày</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="form-input block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="heartRate" className="block text-sm font-medium text-gray-700 mb-1">Nhịp tim (bpm)</label>
              <input
                type="number"
                id="heartRate"
                name="heartRate"
                value={formData.heartRate}
                onChange={handleChange}
                placeholder="Ví dụ: 70"
                className="form-input block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="bloodPressure" className="block text-sm font-medium text-gray-700 mb-1">Huyết áp (systolic/diastolic)</label>
              <input
                type="text"
                id="bloodPressure"
                name="bloodPressure"
                value={formData.bloodPressure}
                onChange={handleChange}
                placeholder="Ví dụ: 120/80"
                className="form-input block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">Cân nặng (kg)</label>
              <input
                type="number"
                id="weight"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                step="0.1"
                placeholder="Ví dụ: 65.5"
                className="form-input block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 mb-1">Nhiệt độ (°C)</label>
              <input
                type="number"
                id="temperature"
                name="temperature"
                value={formData.temperature}
                onChange={handleChange}
                step="0.1"
                placeholder="Ví dụ: 36.8"
                className="form-input block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
              <textarea
                id="notes"
                name="notes"
                rows="3"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Thêm ghi chú về tình trạng sức khỏe của bạn..."
                className="form-textarea block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              ></textarea>
            </div>
            <div className="md:col-span-2 flex justify-end space-x-3 mt-4">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-5 py-2 bg-gray-300 text-gray-700 rounded-lg shadow-md hover:bg-gray-400 transition-all duration-200 flex items-center font-medium"
              >
                <X className="w-5 h-5 mr-2" />
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition-all duration-200 flex items-center font-medium"
              >
                <Save className="w-5 h-5 mr-2" />
                Lưu chỉ số
              </button>
            </div>
          </form>
          <button
            onClick={() => setShowAddForm(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            title="Đóng"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          <span className="ml-2 text-gray-600">Đang tải dữ liệu...</span>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Health Logs Display */}
      {!loading && !error && (
        <div className="space-y-6">
          {healthLogs.length > 0 ? (
            healthLogs.map((log) => (
              <div key={log._id} className="bg-white rounded-xl shadow-md border border-gray-200 p-6 relative group transform hover:scale-[1.01] transition-all duration-200 ease-out overflow-hidden">
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => handleDelete(log._id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors duration-200"
                    title="Xóa nhật ký"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                  <Calendar className="w-6 h-6 text-primary-500 mr-2" />
                  Ngày: {new Date(log.date).toLocaleDateString('vi-VN')}
                </h3>
                <span className="text-sm text-gray-500">{new Date(log.date).toLocaleDateString('vi-VN', { weekday: 'short' })}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {log.heartRate && (
                  <div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-2xl p-4 border border-red-200/50 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-red-500 to-red-600 p-2 rounded-xl shadow-md">
                        <Heart className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-red-700">Nhịp tim</p>
                        <p className="text-lg font-bold text-red-900">{log.heartRate.value}<span className="text-sm font-medium"> {log.heartRate.unit}</span></p>
                      </div>
                    </div>
                  </div>
                )}

                {log.bloodPressure && (
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-4 border border-blue-200/50 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-xl shadow-md">
                        <Activity className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-blue-700">Huyết áp</p>
                        <p className="text-lg font-bold text-blue-900">{log.bloodPressure.systolic}/{log.bloodPressure.diastolic}<span className="text-sm font-medium"> {log.bloodPressure.unit}</span></p>
                      </div>
                    </div>
                  </div>
                )}

                {log.weight && (
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-4 border border-purple-200/50 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2 rounded-xl shadow-md">
                        <Scale className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-purple-700">Cân nặng</p>
                        <p className="text-lg font-bold text-purple-900">{log.weight.value}<span className="text-sm font-medium"> {log.weight.unit}</span></p>
                      </div>
                    </div>
                  </div>
                )}

                {log.temperature && (
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl p-4 border border-orange-200/50 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2 rounded-xl shadow-md">
                        <Thermometer className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-orange-700">Nhiệt độ</p>
                        <p className="text-lg font-bold text-orange-900">{log.temperature.value}<span className="text-sm font-medium">{log.temperature.unit}</span></p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {log.notes && (
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200/50">
                  <p className="text-sm font-bold text-gray-700 mb-2">Ghi chú:</p>
                  <p className="text-gray-800 leading-relaxed">{log.notes}</p>
                </div>
              )}
            </div>
          ))
          ) : (
            <div className="p-12 text-center bg-white rounded-xl shadow-md border border-gray-200">
              <Sparkles className="w-16 h-16 text-primary-300 mx-auto mb-4 animate-bounce" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">Chưa có chỉ số sức khỏe nào được ghi nhận</h3>
              <p className="text-gray-600">Hãy bắt đầu bằng cách thêm chỉ số đầu tiên của bạn!</p>
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Trước
                </button>
                
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`px-3 py-1 rounded-md ${currentPage === index + 1 ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    {index + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Sau
                </button>
              </nav>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HealthLog;