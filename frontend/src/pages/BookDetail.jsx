import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import {
  ChevronLeft,
  User,
  CalendarDays,
  List,
  Eye,
  Heart,
  BookOpen,
  MoreVertical,
  Trash2,
  X,
} from "lucide-react";

import logoImg from "../assets/logo.png";

const BookDetail = () => {
  // 1. LẤY ID TỪ URL
  const { id: bookId } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("jwtToken");
  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");
  const isLogin = !!token;

  // 2. CÁC STATE QUẢN LÝ DỮ LIỆU
  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // State Yêu thích
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [isFavProcessing, setIsFavProcessing] = useState(false);

  // State Bình luận
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");
  const [cmtPage, setCmtPage] = useState(0);
  const [cmtTotalPages, setCmtTotalPages] = useState(0);
  const [cmtTotalElements, setCmtTotalElements] = useState(0);
  const [openDropdownId, setOpenDropdownId] = useState(null); // Quản lý nút Xóa bình luận

  // State Đọc sách (Modal)
  const [isReadOpen, setIsReadOpen] = useState(false);
  const [manualPage, setManualPage] = useState(1);

  // Dùng useRef để giữ bộ đếm giờ (không làm render lại giao diện)
  const viewTimerRef = useRef(null);
  const sessionStartRef = useRef(null);

  // 3. TẢI DỮ LIỆU KHI VÀO TRANG
  useEffect(() => {
    fetchBookDetail();
    fetchFavorites();
    checkFavoriteStatus();
    fetchComments(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [bookId]);

  // =============== CÁC HÀM GỌI API DỮ LIỆU ===============
  const fetchBookDetail = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`http://localhost:8080/api/books/${bookId}`);
      setBook(res.data);
    } catch (error) {
      toast.error("Không thể tải thông tin sách!");
      navigate(-1); // Trở về trang trước
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/favorites/${bookId}/count`,
      );
      setFavoriteCount(res.data.favorites);
    } catch (error) {
      console.error(error);
    }
  };

  const checkFavoriteStatus = async () => {
    if (!isLogin) return;
    try {
      const res = await axios.get(
        `http://localhost:8080/api/favorites/${bookId}?username=${username}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setIsFavorite(res.data.status);
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleFavorite = async () => {
    if (!isLogin) return toast.warning("Vui lòng đăng nhập!");
    if (isFavProcessing) return;

    setIsFavProcessing(true);
    try {
      const res = await axios.post(
        `http://localhost:8080/api/favorites/${bookId}?username=${username}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.data.status === "add") {
        setIsFavorite(true);
        setFavoriteCount((prev) => prev + 1);
      } else {
        setIsFavorite(false);
        setFavoriteCount((prev) => prev - 1);
      }
    } catch (error) {
      toast.error("Lỗi khi yêu thích sách!");
    } finally {
      setIsFavProcessing(false);
    }
  };

  // =============== BÌNH LUẬN ===============
  const fetchComments = async (page) => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/comments/${bookId}?page=${page}&size=15`,
      );
      setComments(res.data.content);
      setCmtPage(res.data.number);
      setCmtTotalPages(res.data.totalPages);
      setCmtTotalElements(res.data.totalElements);
    } catch (error) {
      console.error("Lỗi bình luận", error);
    }
  };

  const handleSendComment = async () => {
    if (!isLogin) return toast.warning("Vui lòng đăng nhập!");
    if (!commentInput.trim())
      return toast.warning("Bình luận không được trống!");

    try {
      await axios.post(
        `http://localhost:8080/api/comments/${bookId}`,
        commentInput,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "text/plain",
          },
        },
      );
      setCommentInput("");
      fetchComments(0); // Tải lại trang 1
      toast.success("Đã gửi bình luận!");
    } catch (error) {
      toast.error(error.response?.data?.error || "Lỗi gửi bình luận");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const res = await axios.delete(
        `http://localhost:8080/api/comments/${commentId}?username=${username}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success(res.data.success || "Đã xóa bình luận");
      fetchComments(cmtPage);
    } catch (error) {
      toast.error("Lỗi khi xóa bình luận");
    }
  };

  // =============== ĐỌC SÁCH & LỊCH SỬ ===============
  const handleOpenRead = () => {
    if (!isLogin) return toast.warning("Vui lòng đăng nhập để đọc sách!");
    // Lấy isVip từ localStorage hoặc API tuỳ logic của bạn, ở đây giả sử role
    if (
      book.type === "VIP" &&
      role !== "VIP" &&
      role !== "AUTHOR" &&
      role !== "ADMIN"
    ) {
      return toast.warning("Vui lòng đăng ký VIP để đọc sách!");
    }
    if (!book.fileUrl) return toast.warning("File sách hiện chưa khả dụng!");

    setIsReadOpen(true);
    sessionStartRef.current = Date.now();
    saveReadingHistory(null, false); // Lưu vào lịch sử là "vừa mở sách"

    // Hẹn giờ 10s cộng lượt đọc
    viewTimerRef.current = setTimeout(() => {
      increaseViewCount();
    }, 10000);
  };

  const handleCloseRead = () => {
    setIsReadOpen(false);

    // Hủy lệnh cộng view nếu đóng sớm
    if (viewTimerRef.current) {
      clearTimeout(viewTimerRef.current);
      viewTimerRef.current = null;
    }

    // Tính toán và gửi thời gian đọc
    if (sessionStartRef.current) {
      const elapsedSeconds = Math.floor(
        (Date.now() - sessionStartRef.current) / 1000,
      );
      if (elapsedSeconds > 0) saveReadingTime(elapsedSeconds);
      sessionStartRef.current = null;
    }
  };

  const saveReadingHistory = async (page = null, isManual = false) => {
    let url = `http://localhost:8080/api/user/history/update?bookId=${bookId}`;
    if (page !== null) url += `&currentPage=${page}`;

    try {
      await axios.post(
        url,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (isManual) toast.success(`Đã lưu tiến độ ở trang ${page}`);
    } catch (error) {
      console.error("Lỗi lưu lịch sử", error);
    }
  };

  const saveReadingTime = async (seconds) => {
    try {
      await axios.post(
        `http://localhost:8080/api/user/history/${bookId}/add-time?seconds=${seconds}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
    } catch (error) {
      console.error("Lỗi lưu thời gian", error);
    }
  };

  const increaseViewCount = async () => {
    try {
      await axios.post(
        `http://localhost:8080/api/user/history/${bookId}/increment-view`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      // Cập nhật giao diện (cộng thêm 1)
      setBook((prev) => ({ ...prev, viewCount: (prev.viewCount || 0) + 1 }));
    } catch (error) {
      console.error("Lỗi tăng view", error);
    }
  };

  const handleManualSave = () => {
    let pageVal = parseInt(manualPage);
    if (isNaN(pageVal) || pageVal < 1)
      return toast.error("Trang không hợp lệ!");

    const maxPage = book.totalPages || 1;
    if (pageVal > maxPage) {
      toast.warning(`Sách chỉ có ${maxPage} trang. Đã lưu ở trang cuối!`);
      pageVal = maxPage;
      setManualPage(maxPage);
    }
    saveReadingHistory(pageVal, true);
  };

  // Giao diện Loading
  if (isLoading || !book) {
    return (
      <div className="p-10 text-center animate-pulse font-bold text-gray-500">
        Đang tải thông tin sách...
      </div>
    );
  }

  return (
    <div className="w-full relative">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-4 text-sm text-n-600 hover:cursor-pointer hover:text-n-800 transition"
      >
        <ChevronLeft size={16} /> Trở lại
      </button>

      {/* THÔNG TIN SÁCH */}
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-56 overflow-hidden rounded-lg shadow-lg h-80 shrink-0 relative">
          {book.type?.toUpperCase() === "VIP" && (
            <span className="absolute px-2 py-1 text-xs font-bold text-white bg-gradient-to-r from-yellow-500 to-orange-500 rounded shadow z-10 top-2 left-2">
              VIP
            </span>
          )}
          <img
            src={book.coverImage || defaultBookImg}
            alt={book.title}
            className="object-cover w-full h-full"
          />
        </div>

        <div className="flex-1 space-y-4">
          <h1 className="text-3xl font-bold text-n-800">{book.title}</h1>

          <div className="space-y-2">
            <p className="text-n-800 flex items-center gap-2">
              <User size={18} className="text-p-500" /> Tác giả:{" "}
              <span className="font-semibold">
                {book.authorName || "Ẩn danh"}
              </span>
            </p>
            <p className="text-n-800 flex items-center gap-2">
              <CalendarDays size={18} className="text-p-500" /> Ngày đăng:{" "}
              <span className="font-semibold">
                {new Date(book.createdAt).toLocaleDateString("vi-VN")}
              </span>
            </p>
            <p className="text-n-800 flex items-center gap-2">
              <List size={18} className="text-p-500" /> Thể loại:{" "}
              <span className="font-semibold">
                {book.categories?.map((c) => c.categoryName).join(", ") ||
                  "Đang cập nhật"}
              </span>
            </p>
            <p className="text-n-800 flex items-center gap-2">
              <Eye size={18} className="text-p-500" /> Lượt đọc:{" "}
              <span className="font-semibold">{book.viewCount || 0}</span>
            </p>
            <p className="text-n-800 flex items-center gap-2">
              <Heart size={18} className="text-rose-500" /> Lượt yêu thích:{" "}
              <span className="font-semibold">{favoriteCount}</span>
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold border-b pb-2">Mô tả</h2>
            <p className="leading-relaxed text-gray-700 whitespace-pre-line">
              {book.description || "Cuốn sách này chưa có mô tả."}
            </p>
          </div>

          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={handleOpenRead}
              className="px-6 py-3 text-white font-bold rounded-xl bg-p-400 hover:cursor-pointer hover:bg-p-600 transition shadow-md flex items-center gap-2 hover:-translate-y-1"
            >
              <BookOpen size={20} /> Đọc ngay
            </button>

            {/* Nút Yêu thích thay đổi màu dựa vào isFavorite */}
            <button
              onClick={handleToggleFavorite}
              disabled={isFavProcessing}
              className={`p-3 rounded-full border transition hover:cursor-pointer hover:bg-gray-50 ${isFavorite ? "text-rose-500 border-rose-200 bg-rose-50" : "text-gray-400 border-gray-200"}`}
            >
              <Heart
                size={24}
                fill={isFavorite ? "currentColor" : "none"}
                className={isFavProcessing ? "animate-pulse" : ""}
              />
            </button>
          </div>
        </div>
      </div>

      {/* BÌNH LUẬN */}
      <div className="p-6 mt-12 bg-white rounded-xl shadow-sm border border-gray-100">
        <h2 className="mb-6 text-xl font-semibold border-b pb-4">
          Bình luận ({cmtTotalElements})
        </h2>

        <div className="flex gap-4 mb-8">
          <img
            src={localStorage.getItem("avatar") || logoImg}
            className="w-10 h-10 rounded-full border"
            alt="Avatar"
          />
          <div className="flex-1">
            <textarea
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-p-300"
              rows="3"
              placeholder="Viết cảm nghĩ của bạn..."
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setCommentInput("")}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 font-medium text-gray-600 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleSendComment}
                className="px-6 py-2 bg-p-500 text-white rounded-lg font-bold hover:bg-p-600 shadow transition"
              >
                Gửi bình luận
              </button>
            </div>
          </div>
        </div>

        {/* Danh sách bình luận */}
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.commentId}
              className="flex gap-4 p-4 rounded-lg bg-gray-50 border border-gray-100"
            >
              <img
                src={comment.avatar || "/assets/logo.svg"}
                alt=""
                className="w-10 h-10 rounded-full border bg-white"
              />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-n-800 mr-2">
                      {comment.username}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleString("vi-VN")}
                    </span>
                  </div>

                  {/* Nút tùy chọn cho chính chủ */}
                  {comment.username === username && (
                    <div className="relative">
                      <button
                        onClick={() =>
                          setOpenDropdownId(
                            openDropdownId === comment.commentId
                              ? null
                              : comment.commentId,
                          )
                        }
                      >
                        <MoreVertical
                          size={16}
                          className="text-gray-400 hover:text-gray-700"
                        />
                      </button>

                      {openDropdownId === comment.commentId && (
                        <div className="absolute right-0 w-32 mt-1 rounded-md shadow-lg bg-white border z-10">
                          <button
                            onClick={() =>
                              handleDeleteComment(comment.commentId)
                            }
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash2 size={14} /> Xóa
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <p className="mt-2 text-n-800 whitespace-pre-line">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Phân trang bình luận */}
        {cmtTotalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              disabled={cmtPage === 0}
              onClick={() => fetchComments(cmtPage - 1)}
              className="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Trước
            </button>
            <span className="font-semibold text-n-800 text-sm">
              Trang {cmtPage + 1} / {cmtTotalPages}
            </span>
            <button
              disabled={cmtPage === cmtTotalPages - 1}
              onClick={() => fetchComments(cmtPage + 1)}
              className="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        )}
      </div>

      {/* ================= MODAL ĐỌC SÁCH (PDF VIEWER) ================= */}
      {isReadOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div className="relative flex flex-col w-11/12 md:w-4/5 bg-white rounded-lg h-[95vh] shadow-2xl overflow-hidden">
            {/* Thanh Header của Modal */}
            <div className="flex items-center justify-between p-3 md:p-4 text-white bg-p-700 shadow-md">
              <h2 className="text-lg font-bold truncate max-w-[40%] flex items-center gap-2">
                <BookOpen size={20} />{" "}
                <span className="hidden md:inline">{book.title}</span>
              </h2>

              <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
                <label className="hidden md:block text-xs font-bold uppercase tracking-widest text-white/90">
                  Trang hiện tại:
                </label>
                <input
                  type="number"
                  value={manualPage}
                  onChange={(e) => setManualPage(e.target.value)}
                  min="1"
                  className="w-14 h-8 px-1 rounded-md text-black text-center font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400 border-none"
                />
                <button
                  onClick={handleManualSave}
                  className="bg-yellow-400 hover:bg-yellow-500 text-p-800 px-3 md:px-4 h-8 rounded-md text-xs font-black uppercase transition-all active:scale-95 shadow"
                >
                  Lưu
                </button>
              </div>

              <button
                onClick={handleCloseRead}
                className="p-1 hover:bg-white/20 rounded-full transition text-white"
              >
                <X size={28} />
              </button>
            </div>

            {/* Khung Iframe hiển thị PDF */}
            <div className="flex-1 w-full bg-gray-200">
              <iframe
                src={`https://docs.google.com/gview?url=${encodeURIComponent(book.fileUrl.replace("http://", "https://"))}&embedded=true`}
                className="w-full h-full border-none"
                title="PDF Viewer"
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookDetail;
