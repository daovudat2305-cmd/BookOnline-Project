import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Clock, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";

const History = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("jwtToken");

  const [historyList, setHistoryList] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (token) {
      fetchHistory();
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const fetchHistory = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const res = await axios.get(
        `http://localhost:8080/api/user/history/list?page=${currentPage}&size=10`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setHistoryList(res.data.content);
      setTotalPages(Math.min(res.data.totalPages, 2));
    } catch (error) {
      console.error("Lỗi tải lịch sử:", error);
      if (error.response?.status === 401) {
        setErrorMsg("Phiên đăng nhập hết hạn! Vui lòng đăng nhập lại.");
      } else {
        setErrorMsg("Không thể tải lịch sử đọc lúc này.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatReadingTime = (totalSeconds) => {
    if (!totalSeconds || totalSeconds <= 0) return "0 giây";
    let hours = Math.floor(totalSeconds / 3600);
    let minutes = Math.floor((totalSeconds % 3600) / 60);
    let seconds = totalSeconds % 60;

    let parts = [];
    if (hours > 0) parts.push(`${hours} giờ`);
    if (minutes > 0) parts.push(`${minutes} phút`);
    if (seconds > 0) parts.push(`${seconds} giây`);

    return parts.join(" ");
  };

  if (!token) {
    return (
      <div className="w-full text-center mt-20">
        <BookOpen size={64} className="mx-auto text-gray-300 mb-4" />
        <p className="text-xl font-bold text-gray-500 mb-6">
          Vui lòng đăng nhập để xem lịch sử đọc!
        </p>
        <button
          onClick={() => navigate("/login")}
          className="px-8 py-3 bg-p-500 text-white font-bold rounded-xl shadow-lg hover:cursor-pointer hover:bg-p-600 transition hover:-translate-y-1"
        >
          Đăng nhập ngay
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="mb-6 text-2xl font-semibold flex items-center gap-2 text-n-800">
        <Clock className="text-p-500" /> LỊCH SỬ ĐỌC
      </h2>

      {errorMsg ? (
        <p className="text-center text-red-500 font-bold mt-10">{errorMsg}</p>
      ) : isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex gap-4 p-4 bg-white rounded-xl shadow animate-pulse h-44"
            ></div>
          ))}
        </div>
      ) : historyList.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">
          Bạn chưa đọc cuốn sách nào gần đây.
        </p>
      ) : (
        <div className="space-y-4">
          {historyList.map((item) => {
            const book = item.book;
            const formattedDate = new Date(item.lastTimeRead).toLocaleString(
              "vi-VN",
              {
                hour: "2-digit",
                minute: "2-digit",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              },
            );

            const categoryNames =
              book.categories && book.categories.length > 0
                ? book.categories.map((c) => c.categoryName).join(", ")
                : "Chưa cập nhật";

            let currentPg = item.currentPage || 1;
            let totalPgs = book.totalPages || 1;
            let percent = Math.min(
              Math.round((currentPg / totalPgs) * 100),
              100,
            );

            return (
              <div
                key={item.id}
                className="flex bg-white p-4 rounded-xl shadow-sm border border-transparent hover:border-p-200 hover:shadow-md transition mb-4 gap-6"
              >
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-24 min-w-[96px] h-36 object-cover rounded-md"
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-n-800">
                      {book.title}
                    </h3>
                    <div className="text-sm text-n-600 flex flex-wrap gap-x-6 gap-y-1 mt-2">
                      <span>
                        👤 Tác giả:{" "}
                        <span className="font-medium">
                          {book.authorName || "Ẩn danh"}
                        </span>
                      </span>
                      <span>
                        🏷️ Thể loại:{" "}
                        <span className="font-medium">{categoryNames}</span>
                      </span>
                      <span>
                        👁️ Lượt đọc:{" "}
                        <span className="font-medium">
                          {book.viewCount || 0}
                        </span>
                      </span>
                    </div>

                    <div className="text-sm text-n-500 mt-3 flex flex-wrap items-center gap-3">
                      <span>
                        Đã đọc:{" "}
                        <span className="text-n-700 font-semibold">
                          {formattedDate}
                        </span>
                        {item.currentPage && (
                          <span className="text-p-600 font-bold ml-1">
                            (Trang {item.currentPage} | {percent}%)
                          </span>
                        )}
                      </span>

                      <span className="text-green-700 font-medium bg-green-50 px-2 py-0.5 rounded border border-green-200 flex items-center gap-1">
                        <Clock size={14} /> Thời gian:{" "}
                        {formatReadingTime(item.totalReadingTimeSeconds)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <button
                      onClick={() => navigate(`/book-detail/${book.bookId}`)}
                      className="px-6 py-2 bg-p-500 hover:bg-p-600 text-white text-sm font-bold rounded-lg transition shadow hover:-translate-y-0.5"
                    >
                      Tiếp tục đọc
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Phân trang lịch sử */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8 mb-4">
          <button
            disabled={currentPage === 0}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="px-4 py-2 border rounded-lg bg-white disabled:bg-gray-100 disabled:text-gray-400 hover:bg-p-100 flex items-center gap-1"
          >
            <ChevronLeft size={16} /> Trước
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
              className={`px-4 py-2 border rounded-lg transition ${
                i === currentPage
                  ? "bg-p-500 text-white font-bold shadow-md"
                  : "bg-white text-n-800 hover:bg-p-100"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages - 1}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="px-4 py-2 border rounded-lg bg-white disabled:bg-gray-100 disabled:text-gray-400 hover:bg-p-100 flex items-center gap-1"
          >
            Sau <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default History;
