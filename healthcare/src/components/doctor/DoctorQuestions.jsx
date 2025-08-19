import { useState, useEffect } from "react";
import { questionAPI } from "../../services/api";

export default function DoctorQuestions() {
  const [questions, setQuestions] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [answerInputs, setAnswerInputs] = useState({});

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await questionAPI.getDoctorQuestions(
        statusFilter,
        searchKeyword,
        page,
        limit
      );
      setQuestions(res.data.data);
      setTotalPages(res.data.pagination.pages);
    } catch (error) {
      console.error("Error fetching doctor questions:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQuestions();
  }, [page, statusFilter, searchKeyword]);

  const handleAnswerChange = (questionId, value) => {
    setAnswerInputs((prev) => ({ ...prev, [questionId]: value }));
  };

  const submitAnswer = async (questionId) => {
    const answerContent = answerInputs[questionId];
    if (!answerContent) return alert("Vui lòng nhập câu trả lời");

    try {
      await questionAPI.answerQuestion(questionId, {
        answer: { content: answerContent },
      });
      alert("Trả lời thành công");
      setAnswerInputs((prev) => ({ ...prev, [questionId]: "" }));
      fetchQuestions();
    } catch (error) {
      console.error("Error answering question:", error);
      alert("Trả lời thất bại");
    }
  };

  const deleteQuestion = async (questionId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa câu hỏi này?")) return;
    try {
      await questionAPI.deleteQuestion(questionId);
      alert("Xóa thành công");
      fetchQuestions();
    } catch (error) {
      console.error("Error deleting question:", error);
      alert("Xóa thất bại");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Danh sách câu hỏi bệnh nhân</h1>

      {/* Bộ lọc */}
      <div className="flex items-center gap-3 mb-6">
        <input
          type="text"
          placeholder="Tìm kiếm..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          className="border rounded-lg px-3 py-2 flex-1 focus:ring focus:ring-blue-300"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 focus:ring focus:ring-blue-300"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ trả lời</option>
          <option value="answered">Đã trả lời</option>
          <option value="closed">Đã đóng</option>
        </select>
      </div>

      {loading ? (
        <p className="text-gray-500">Đang tải...</p>
      ) : questions.length === 0 ? (
        <p className="text-gray-500">Chưa có câu hỏi nào.</p>
      ) : (
        questions.map((q) => (
          <div
            key={q._id}
            className="border rounded-lg p-4 mb-4 shadow-sm bg-white"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{q.title}</h3>
                <p className="text-gray-700">{q.content}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Bệnh nhân: {q.patient.fullName} ({q.patient.email})
                </p>
                <p className="text-sm text-gray-500">
                  Trạng thái:{" "}
                  <span
                    className={`font-medium ${
                      q.status === "pending"
                        ? "text-yellow-600"
                        : q.status === "answered"
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    {q.status}
                  </span>
                </p>
              </div>
              <button
                onClick={() => deleteQuestion(q._id)}
                className="text-xs text-red-500 hover:text-red-600 focus:outline-none "
              >
                ❌ Xóa
              </button>
            </div>

            {/* Form trả lời */}
            {q.status !== "answered" && (
              <div className="mt-3">
                <textarea
                  rows={3}
                  className="w-full border rounded-lg p-2 focus:ring focus:ring-blue-300"
                  placeholder="Nhập câu trả lời..."
                  value={answerInputs[q._id] || ""}
                  onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                />
                <button
                  onClick={() => submitAnswer(q._id)}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Trả lời
                </button>
              </div>
            )}

            {/* Hiện câu trả lời */}
            {q.status === "answered" && (
              <div className="mt-3 p-3 bg-gray-100 rounded-lg">
                <strong className="block mb-1">Câu trả lời:</strong>
                <p className="text-gray-700">{q.answer?.content}</p>
              </div>
            )}
          </div>
        ))
      )}

      {/* Phân trang */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <button
          disabled={page === 1}
          onClick={() => setPage((prev) => prev - 1)}
          className="px-3 py-1 border rounded-lg disabled:opacity-50"
        >
          Trước
        </button>
        <span>
          {page} / {totalPages}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage((prev) => prev + 1)}
          className="px-3 py-1 border rounded-lg disabled:opacity-50"
        >
          Sau
        </button>
      </div>
    </div>
  );
}
