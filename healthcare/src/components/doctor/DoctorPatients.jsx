import React, { useEffect, useState } from "react";
import { patientAPI } from "../../services/api";
import { toast } from "react-hot-toast";

const DoctorPatients = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Lấy danh sách bệnh nhân
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await patientAPI.getAll();
        setPatients(res.data.data || []);
      } catch (error) {
        toast.error("Không lấy được danh sách bệnh nhân");
      }
    };
    fetchPatients();
  }, []);

  // Xem thông tin bệnh nhân
  const handleView = (patient) => {
    setSelectedPatient(patient);
  };

  // Gửi lời khuyên / tin nhắn
  const handleSendAdvice = async (id) => {
    const advice = prompt("Nhập tin nhắn/lời khuyên cho bệnh nhân:");
    if (!advice) return;
    try {
      await patientAPI.sendAdvice(id, { advice });
      toast.success("Đã gửi lời khuyên");
    } catch (err) {
      toast.error("Không gửi được lời khuyên");
    }
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow">
      <h2 className="text-lg font-semibold mb-4">Danh sách bệnh nhân</h2>

      {patients.length === 0 ? (
        <p>Chưa có bệnh nhân nào.</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Tên</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p._id}>
                <td className="p-2 border">{p.name}</td>
                <td className="p-2 border">{p.email}</td>
                <td className="p-2 border flex gap-2">
                  <button
                    onClick={() => handleView(p)}
                    className="px-2 py-1 bg-green-500 text-white rounded"
                  >
                    Xem thông tin
                  </button>
                  <button
                    onClick={() => handleSendAdvice(p._id)}
                    className="px-2 py-1 bg-blue-500 text-white rounded"
                  >
                    Gửi tin nhắn
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal xem chi tiết bệnh nhân */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-96 shadow-lg">
            <h3 className="text-lg font-bold mb-2">Thông tin bệnh nhân</h3>
            <p><strong>Tên:</strong> {selectedPatient.name}</p>
            <p><strong>Email:</strong> {selectedPatient.email}</p>
            <p><strong>Tuổi:</strong> {selectedPatient.age || "Chưa cập nhật"}</p>
            <p><strong>Giới tính:</strong> {selectedPatient.gender || "Chưa cập nhật"}</p>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setSelectedPatient(null)}
                className="px-3 py-1 bg-gray-400 text-white rounded"
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

export default DoctorPatients;
