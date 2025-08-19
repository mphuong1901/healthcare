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
      console.log(res.data)
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
      await questionAPI.answerQuestion(questionId, { answer: { content: answerContent } });
      alert("Trả lời thành công");
      setAnswerInputs((prev) => ({ ...prev, [questionId]: "" }));
      fetchQuestions();
    } catch (error) {
      console.error("Error answering question:", error);
      alert("Trả lời thất bại");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Danh sách câu hỏi bệnh nhân</h1>

      <div style={{ marginBottom: "10px" }}>
        <input
          type="text"
          placeholder="Tìm kiếm..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          style={{ marginRight: "10px" }}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ trả lời</option>
          <option value="answered">Đã trả lời</option>
          <option value="closed">Đã đóng</option>
        </select>
      </div>

      {loading ? (
        <p>Đang tải...</p>
      ) : questions.length === 0 ? (
        <p>Chưa có câu hỏi nào.</p>
      ) : (
        questions.map((q) => (
          <div key={q._id} style={{ border: "1px solid #ccc", marginBottom: "10px", padding: "10px" }}>
            <h3>{q.title}</h3>
            <p>{q.content}</p>
            <p>Bệnh nhân: {q.patient.fullName} ({q.patient.email})</p>
            <p>Trạng thái: {q.status}</p>

            {q.status !== "answered" && (
              <div>
                <textarea
                  rows={3}
                  style={{ width: "100%" }}
                  placeholder="Nhập câu trả lời..."
                  value={answerInputs[q._id] || ""}
                  onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                />
                <button onClick={() => submitAnswer(q._id)} style={{ marginTop: "5px" }}>
                  Trả lời
                </button>
              </div>
            )}

            {q.status === "answered" && (
              <div style={{ marginTop: "10px", padding: "10px", backgroundColor: "#f1f1f1" }}>
                <strong>Câu trả lời:</strong>
                <p>{q.answer?.content || "Chưa có nội dung"}</p>
              </div>
            )}
          </div>
        ))
      )}

      <div style={{ marginTop: "20px" }}>
        <button disabled={page === 1} onClick={() => setPage((prev) => prev - 1)}>Trước</button>
        <span style={{ margin: "0 10px" }}>{page} / {totalPages}</span>
        <button disabled={page === totalPages} onClick={() => setPage((prev) => prev + 1)}>Sau</button>
      </div>
    </div>
  );
}
