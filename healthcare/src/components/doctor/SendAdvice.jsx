import React, { useState, useEffect } from 'react';
import { Send, User, Search, MessageSquare, Clock, CheckCircle } from 'lucide-react';
import { userAPI, adviceAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const SendAdvice = () => {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [adviceText, setAdviceText] = useState('');
  const [adviceType, setAdviceType] = useState('general');
  const [priority, setPriority] = useState('normal');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSending, setIsSending] = useState(false);
  const {currentUser} = useAuth();
  const [patients, setPatients] = useState([]);
  const [recentAdvice, setRecentAdvice] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Lấy danh sách bệnh nhân
        const patientsResponse = await userAPI.getPatients();
        setPatients(patientsResponse.data.patients || []);
        
        // Lấy danh sách lời khuyên gần đây
        const adviceResponse = await adviceAPI.getDoctorAdvice(1, 5);
        setRecentAdvice(adviceResponse.data.advice || []);
        
        setError('');
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
        toast.error('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Tìm kiếm bệnh nhân
  useEffect(() => {
    const searchPatients = async () => {
      
      
      try {
        const response = await userAPI.getPatients();
        setPatients(response.data?.data || response.data?.patients || []);
      } catch (err) {
        console.error('Error searching patients:', err);
      }
    };
    
    const debounce = setTimeout(() => {
      searchPatients();
    }, 500);
    
    return () => clearTimeout(debounce);
  }, [searchTerm]);
  
  const filteredPatients = patients.filter(p =>
  p.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );


 const handleSendAdvice = async () => {
  if (!selectedPatient || !adviceText.trim()) {
    toast.error('Vui lòng chọn bệnh nhân và nhập nội dung lời khuyên');
    return;
  }

  setIsSending(true);

  try {
    console.log("Selected patient:", selectedPatient);
    console.log("Current doctor:", currentUser);

    const adviceData = {      
      patient: selectedPatient._id,           
      title: `Lời khuyên từ bác sĩ ${currentUser.fullName}`, 
      content: adviceText,                     
      type: adviceType || 'general',                            
    };

    console.log("Payload advice:", adviceData);
    await adviceAPI.createAdvice(adviceData);

    toast.success(`Đã gửi lời khuyên cho ${selectedPatient.fullName || selectedPatient.name}`);

    const adviceResponse = await adviceAPI.getDoctorAdvice(1, 5);
    setRecentAdvice(adviceResponse.data.advice || []);

    setAdviceText('');
    setSelectedPatient(null);
  } catch (error) {
    console.error('Error sending advice:', error);
    toast.error('Không thể gửi lời khuyên. Vui lòng thử lại sau.');
  } finally {
    setIsSending(false);
  }
};




  const getAdviceTypeLabel = (type) => {
    switch (type) {
      case 'medication': return 'Thuốc';
      case 'lifestyle': return 'Lối sống';
      case 'diet': return 'Chế độ ăn';
      case 'exercise': return 'Vận động';
      case 'checkup': return 'Tái khám';
      default: return 'Chung';
    }
  };

  const getPriorityBadge = (priority) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    switch (priority) {
      case 'high':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'medium':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-green-100 text-green-800`;
    }
  };

  const getStatusIcon = (status) => {
    if (status === 'read') {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
    return <Clock className="w-4 h-4 text-yellow-600" />;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Gửi lời khuyên</h1>
        <p className="text-gray-600">Gửi lời khuyên và hướng dẫn cho bệnh nhân</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Selection */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Chọn bệnh nhân</h2>
            </div>
            
            <div className="p-4">
              
              {/* Patient dropdown */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Chọn bệnh nhân</label>
                <select
                  className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={selectedPatient?._id || ""}
                  onChange={(e) => {
                    const p = patients.find(pt => pt._id === e.target.value);
                    setSelectedPatient(p || null);
                  }}
                >
                  <option value="">-- Chọn bệnh nhân --</option>
                  {patients.map(p => (
                    <option key={p._id} value={p._id}>
                      {p.fullName} – {p.email}
                    </option>
                  ))}
                </select>
              </div>
    {/* Patient List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredPatients.map((patient) => (
                  <div
                    key={patient._id}
                    onClick={() => setSelectedPatient(patient)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedPatient?._id === patient._id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{patient.fullName}</p>
                        <p className="text-sm text-gray-600">{patient.medicalHistory || 'Không có thông tin bệnh'}</p>
                        {patient.lastAdviceDate && (
                          <p className="text-xs text-gray-500">Lần cuối: {new Date(patient.lastAdviceDate).toLocaleDateString('vi-VN')}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Advice Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Soạn lời khuyên</h2>
              {selectedPatient && (
                <p className="text-sm text-gray-600 mt-1">
                  Gửi cho: <span className="font-medium">{selectedPatient.fullName}</span>
                </p>
              )}
            </div>
            
            <div className="p-4 space-y-4">
              {/* Advice Type and Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại lời khuyên
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={adviceType}
                    onChange={(e) => setAdviceType(e.target.value)}
                  >
                    <option value="general">Chung</option>
                    <option value="medication">Thuốc</option>
                    <option value="lifestyle">Lối sống</option>
                    <option value="diet">Chế độ ăn</option>
                    <option value="exercise">Vận động</option>
                    <option value="checkup">Tái khám</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mức độ ưu tiên
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="normal">Bình thường</option>
                    <option value="medium">Trung bình</option>
                    <option value="high">Cao</option>
                  </select>
                </div>
              </div>
              
              {/* Advice Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nội dung lời khuyên
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows={6}
                  placeholder="Nhập nội dung lời khuyên cho bệnh nhân..."
                  value={adviceText}
                  onChange={(e) => setAdviceText(e.target.value)}
                />
              </div>
              
              {/* Send Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleSendAdvice}
                  disabled={!selectedPatient || !adviceText.trim() || isSending}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSending ? 'Đang gửi...' : 'Gửi lời khuyên'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Advice */}
      <div className="mt-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Lời khuyên gần đây</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Đang tải dữ liệu...</div>
            ) : error ? (
              <div className="p-4 text-center text-red-500">{error}</div>
            ) : recentAdvice.length === 0 ? (
              <div className="p-4 text-center text-gray-500">Chưa có lời khuyên nào</div>
            ) : (
              recentAdvice.map((advice) => (
                <div key={advice._id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        <MessageSquare className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-gray-900">{advice.patientName || 'Bệnh nhân'}</p>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {getAdviceTypeLabel(advice.type)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{advice.content}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(advice.createdAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(advice.status)}
                      <span className="text-xs text-gray-500">
                        {advice.status === 'read' ? 'Đã đọc' : 'Đã gửi'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendAdvice;

