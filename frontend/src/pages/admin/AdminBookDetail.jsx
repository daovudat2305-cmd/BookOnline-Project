import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import {
  BookOpen,
  Trash2,
  X,
  ChevronLeft,
  Eye,
  Heart,
  MessageCircle,
} from "lucide-react";

const API_URL = "http://localhost:8080/api";

const AdminBookDetail = () => {
  const { id: bookId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("jwtToken");

  const [book, setBook] = useState(null);
  const [stats, setStats] = useState({ likes: 0, comments: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const [showReadModal, setShowReadModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchBookData();
  }, [bookId]);

  const fetchBookData = async () => {
    setIsLoading(true);
    try {
      const bookRes = await axios.get(`${API_URL}/admin/books/approved`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const foundBook = bookRes.data.find((b) => b.bookId === bookId);

      if (!foundBook) {
        toast.error("Không tìm thấy dữ liệu sách!");
        navigate("/admin/home");
        return;
      }
      setBook(foundBook);

      const [likesRes, commentsRes] = await Promise.all([
        axios
          .get(`${API_URL}/favorites/${bookId}/count`)
          .catch(() => ({ data: { favorites: 0 } })),
        axios
          .get(`${API_URL}/comments/${bookId}?page=0&size=1`)
          .catch(() => ({ data: { totalElements: 0 } })),
      ]);

      setStats({
        likes: likesRes.data.favorites || 0,
        comments: commentsRes.data.totalElements || 0,
      });
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteReason.trim()) {
      toast.warning("Bạn bắt buộc phải nhập lý do xóa sách!");
      return;
    }

    if (
      !window.confirm(
        "Hành động này sẽ gỡ sách khỏi trang chủ và gửi lý do cho tác giả. Xác nhận?",
      )
    )
      return;

    setIsProcessing(true);
    try {
      await axios.put(
        `${API_URL}/admin/books/${bookId}/delete`,
        { reason: deleteReason },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("Đã gỡ sách và gửi lý do thành công!");
      navigate("/admin/home");
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi xóa sách!");
      setIsProcessing(false);
    }
  };

  if (isLoading || !book)
    return (
      <div className="mt-10 font-bold text-center text-gray-500 animate-pulse">
        Đang tải dữ liệu...
      </div>
    );

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-800"
      >
        <ChevronLeft size={16} /> Quay lại
      </button>

      <div className="p-8 bg-white border border-gray-100 shadow-sm rounded-2xl">
        <div className="flex flex-col gap-10 md:flex-row">
          <div className="w-48 shrink-0">
            <img
              src={book.coverImage}
              alt="Bìa sách"
              className="object-cover w-full shadow-md aspect-[2/3] rounded-xl border border-gray-200"
            />
          </div>

          <div className="flex flex-col flex-1">
            <h1 className="mb-4 text-2xl font-bold text-gray-800">
              {book.title}
            </h1>

            <div className="grid grid-cols-2 mb-8 text-gray-700 gap-y-3 gap-x-8">
              <p>
                <span className="font-semibold">Tác giả:</span>{" "}
                {book.authorName}
              </p>
              <p>
                <span className="font-semibold">Ngày đăng:</span>{" "}
                {new Date(book.createdAt).toLocaleDateString("vi-VN")}
              </p>
              <p>
                <span className="font-semibold">Số trang:</span>{" "}
                {book.totalPages || 0}
              </p>
              <p>
                <span className="font-semibold">Loại sách:</span>{" "}
                <span
                  className={
                    book.type === "VIP"
                      ? "text-yellow-600 font-bold"
                      : "text-green-600 font-bold"
                  }
                >
                  {book.type}
                </span>
              </p>
              <p className="col-span-2">
                <span className="font-semibold">Thể loại:</span>{" "}
                {book.categories?.map((c) => c.categoryName).join(", ") ||
                  "Chưa phân loại"}
              </p>
            </div>

            {/* Khu vực thống kê */}
            <div className="flex gap-6 p-4 mb-8 text-sm border border-gray-100 bg-gray-50 rounded-xl w-fit">
              <div className="flex items-center gap-2 text-gray-600">
                <Eye size={18} />{" "}
                <span className="font-bold">{book.viewCount || 0}</span> lượt
                đọc
              </div>
              <div className="flex items-center gap-2 text-rose-500">
                <Heart size={18} />{" "}
                <span className="font-bold text-rose-600">{stats.likes}</span>{" "}
                lượt thích
              </div>
              <div className="flex items-center gap-2 text-blue-500">
                <MessageCircle size={18} />{" "}
                <span className="font-bold text-blue-600">
                  {stats.comments}
                </span>{" "}
                bình luận
              </div>
            </div>

            <div className="flex gap-4 mt-auto">
              <button
                onClick={() => setShowReadModal(true)}
                className="flex text-sm items-center gap-2 px-3 py-2.5 font-bold text-gray-700 transition bg-gray-100 rounded-lg hover:bg-gray-200 shadow-sm"
              >
                <BookOpen size={18} /> Đọc sách
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                disabled={isProcessing}
                className="flex text-sm items-center gap-2 px-3 py-2.5 font-bold text-white transition bg-red-500 rounded-lg shadow-sm hover:bg-red-600 disabled:opacity-50"
              >
                <Trash2 size={18} /> Xóa sách
              </button>
            </div>
          </div>
        </div>

        <div className="pt-6 mt-10 border-t">
          <h3 className="mb-4 text-xl font-bold text-gray-800">
            Giới thiệu nội dung
          </h3>
          <p className="leading-relaxed text-gray-600 whitespace-pre-line">
            {book.description || "Cuốn sách này chưa có lời giới thiệu."}
          </p>
        </div>
      </div>

      {showReadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="flex flex-col w-11/12 overflow-hidden bg-white shadow-2xl max-w-7xl h-[95vh] rounded-2xl animate-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 bg-gray-900 border-b">
              <h3 className="text-lg font-bold text-white">
                Đọc sách: {book.title}
              </h3>
              <button
                onClick={() => setShowReadModal(false)}
                className="text-gray-400 transition hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 w-full bg-gray-200">
              <iframe
                src={`https://docs.google.com/gview?url=${encodeURIComponent(book.fileUrl?.replace("http://", "https://"))}&embedded=true`}
                className="w-full h-full border-none"
              ></iframe>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 duration-200 bg-white shadow-2xl rounded-2xl animate-in fade-in zoom-in">
            <h3 className="mb-4 text-xl font-bold text-gray-800">
              Lý do xóa sách
            </h3>
            <textarea
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              className="w-full p-4 text-gray-700 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-400 outline-none min-h-[120px] resize-none"
              placeholder="Nhập lý do xóa cuốn sách này..."
            />
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-5 py-2 text-sm font-semibold text-gray-600 transition bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                disabled={isProcessing}
                className="px-5 py-2 text-sm font-bold text-white transition bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50"
              >
                Gửi & Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookDetail;
