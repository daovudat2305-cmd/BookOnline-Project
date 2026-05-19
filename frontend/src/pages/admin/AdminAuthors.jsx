import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  Search,
  User,
  Mail,
  CreditCard,
  Book,
  X,
  ChevronLeft,
} from "lucide-react";

const API_URL = "http://localhost:8080/api/admin/authors";

const AdminAuthors = () => {
  const token = localStorage.getItem("jwtToken");
  const [authors, setAuthors] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [bookByAuthor, setBookByAuthor] = useState([]);
  const [isLoadingBook, setIsLoadingBook] = useState(true);
  const [showBookModal, setShowBookModal] = useState(false);

  useEffect(() => {
    if (keyword.trim()) {
      searchAuthors();
    } else {
      fetchAuthors();
    }
  }, [page, keyword]);

  useEffect(() => {
    fetchBookByAuthor();
  }, [selectedAuthor]);

  const fetchAuthors = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}?page=${page}&size=12`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAuthors(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      toast.error("Lỗi tải danh sách tác giả!");
    } finally {
      setIsLoading(false);
    }
  };

  const searchAuthors = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${API_URL}/${keyword.trim()}?page=${page}&size=12`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setAuthors(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      setAuthors([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBookByAuthor = async () => {
    setIsLoadingBook(true);
    try {
      const res = await axios.get(
        `${API_URL}/${selectedAuthor.username}/books`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setBookByAuthor(res.data);
    } catch (error) {
    } finally {
      setIsLoadingBook(false);
    }
  };

  if (selectedAuthor) {
    // GIAO DIỆN CHI TIẾT TÁC GIẢ
    return (
      <div className="space-y-6 duration-300 animate-in fade-in slide-in-from-right-4">
        <button
          onClick={() => setSelectedAuthor(null)}
          className="flex items-center gap-2 font-medium text-gray-500 transition hover:text-gray-800"
        >
          <ChevronLeft size={20} /> Quay lại danh sách
        </button>

        <div className="p-8 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="flex flex-col gap-10 md:flex-row">
            <img
              src={selectedAuthor.avatar}
              className="object-cover w-32 h-32 border-4 rounded-full shadow-sm border-blue-50"
              alt=""
            />

            <div className="flex-1 space-y-4">
              <h2 className="text-3xl font-bold text-gray-800">
                {selectedAuthor.fullName || "Chưa cập nhật"}
              </h2>
              <div className="grid grid-cols-1 gap-4 text-gray-600 md:grid-cols-2">
                <p className="flex items-center gap-2">
                  <User size={18} className="text-blue-500" /> Username:{" "}
                  <b>{selectedAuthor.username}</b>
                </p>
                <p className="flex items-center gap-2">
                  <Mail size={18} className="text-blue-500" /> Email:{" "}
                  <b>{selectedAuthor.email}</b>
                </p>
                <p className="flex items-center gap-2">
                  <CreditCard size={18} className="text-blue-500" /> STK:{" "}
                  <b>{selectedAuthor.bankAccount || "Chưa có"}</b>
                </p>
                <button
                  onClick={() => setShowBookModal(true)}
                  className="flex items-center gap-2 font-bold text-blue-600 hover:underline"
                >
                  <Book size={18} /> Xem danh sách sách đã đăng
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Danh sách sách */}
        {showBookModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in duration-200">
              <div className="flex items-center justify-between p-6 border-b bg-gray-50">
                <h3 className="text-xl font-bold">
                  Tác phẩm của {selectedAuthor.username}
                </h3>
                <button
                  onClick={() => setShowBookModal(false)}
                  className="text-gray-400 transition hover:text-red-500"
                >
                  <X size={24} />
                </button>
              </div>
              {isLoadingBook ? (
                <p>Đang tải danh sách...</p>
              ) : (
                <div className="p-6 space-y-4 overflow-y-auto">
                  {bookByAuthor.length > 0 ? (
                    bookByAuthor.map((book) => (
                      <div
                        key={book.bookId}
                        className="flex items-center gap-4 p-4 transition border rounded-xl hover:bg-gray-50"
                      >
                        <img
                          src={book.coverImage}
                          className="object-cover w-16 h-24 rounded shadow-sm"
                          alt=""
                        />
                        <div>
                          <h4 className="font-bold text-gray-800">
                            {book.title}
                          </h4>
                          <p className="text-sm text-gray-500">
                            Loại:{" "}
                            <span className="font-bold text-blue-600">
                              {book.type}
                            </span>{" "}
                            | Lượt xem: {book.viewCount}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="py-10 text-center text-gray-500">
                      Tác giả này chưa đăng cuốn sách nào.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <h1 className="text-3xl font-bold text-gray-800">Quản lý Tác giả</h1>
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Tìm theo tên/username..."
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(0);
            }}
            className="w-full py-2 pl-10 pr-4 bg-white border shadow-sm outline-none rounded-xl focus:ring-2 focus:ring-blue-400"
          />
          <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
        </div>
      </div>

      <div className="overflow-hidden bg-white border shadow-sm rounded-2xl">
        <table className="w-full text-left border-collapse">
          <thead className="text-white bg-gray-900">
            <tr>
              <th className="p-4 font-semibold">Tên tác giả</th>
              <th className="p-4 font-semibold">Username</th>
              <th className="p-4 font-semibold">Email</th>
              <th className="p-4 font-semibold text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan="4" className="p-10 text-center animate-pulse">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : authors.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-10 text-center text-gray-500">
                  Không tìm thấy tác giả nào.
                </td>
              </tr>
            ) : (
              authors.map((author) => (
                <tr
                  key={author.username}
                  className="transition hover:bg-blue-50/50"
                >
                  <td className="p-4 font-medium">
                    {author.fullName || "N/A"}
                  </td>
                  <td className="p-4 font-mono text-sm">{author.username}</td>
                  <td className="p-4 text-gray-600">{author.email}</td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => setSelectedAuthor(author)}
                      className="px-4 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-600 hover:text-white transition"
                    >
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Phân trang */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50"
          >
            Trước
          </button>
          <span className="px-4 py-2 font-bold">
            Trang {page + 1} / {totalPages}
          </span>
          <button
            disabled={page === totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminAuthors;
