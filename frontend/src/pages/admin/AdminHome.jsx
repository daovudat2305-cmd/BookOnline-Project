import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
} from "lucide-react";

const CATEGORY_LIST = [
  { id: 1, name: "Tiên hiệp" },
  { id: 2, name: "Kiếm hiệp" },
  { id: 3, name: "Hành động" },
  { id: 4, name: "Ngôn tình" },
  { id: 5, name: "Trinh thám" },
  { id: 6, name: "Kinh dị" },
  { id: 7, name: "Linh dị" },
  { id: 8, name: "Viễn tưởng" },
  { id: 9, name: "Học đường" },
  { id: 10, name: "Hài hước" },
  { id: 11, name: "Lịch sử" },
  { id: 12, name: "Thể thao" },
];

const AdminHome = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("jwtToken");

  const [keyword, setKeyword] = useState("");
  const [selectedCats, setSelectedCats] = useState([]);
  const [isPending, setIsPending] = useState(false);
  const [sortValue, setSortValue] = useState("createdAt, desc");

  const [books, setBooks] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBooks();
  }, [keyword, selectedCats, isPending, sortValue, currentPage]);

  const fetchBooks = async () => {
    setIsLoading(true);
    try {
      const safeKeyword = encodeURIComponent(keyword);
      const catsString = selectedCats.join(",");
      const status = isPending ? 0 : 1;

      const url = `http://localhost:8080/api/admin/books/filter?keyword=${safeKeyword}&categories=${catsString}&status=${status}&page=${currentPage}&size=18&sort=${sortValue}`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setBooks(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error("Lỗi lấy danh sách sách Admin:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (catId) => {
    setCurrentPage(0);
    setSelectedCats((prev) =>
      prev.includes(catId)
        ? prev.filter((id) => id !== catId)
        : [...prev, catId],
    );
  };

  const handleBookClick = (bookId) => {
    if (isPending) {
      navigate(`/admin/approve-book/${bookId}`);
    } else {
      navigate(`/admin/book-detail/${bookId}`);
    }
  };

  const generatePagination = () => {
    const maxVisible = 5;
    let start = Math.max(0, currentPage - Math.floor(maxVisible / 2));
    let end = start + maxVisible - 1;

    if (end >= totalPages) {
      end = totalPages - 1;
      start = Math.max(0, end - maxVisible + 1);
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Sách</h1>

        <div className="relative w-96">
          <input
            type="text"
            placeholder="Tìm kiếm sách..."
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setCurrentPage(0);
            }}
            className="w-full py-2 pl-10 pr-4 text-sm bg-white border shadow-sm outline-none rounded-xl focus:ring-2 focus:ring-blue-400"
          />
          <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
        </div>
      </div>

      <div className="p-6 space-y-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <h3 className="flex items-center gap-2 font-bold text-gray-700">
              <Filter size={18} /> Trạng thái:
            </h3>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={isPending}
                onChange={(e) => {
                  setIsPending(e.target.checked);
                  setCurrentPage(0);
                }}
                className="w-5 h-5 text-sm text-blue-600 rounded"
              />
              <span className="text-sm font-medium text-gray-800">
                Chỉ hiện sách Chờ duyệt đăng
              </span>
            </label>
          </div>

          <div className="flex items-center gap-4">
            <h3 className="text-sm font-bold text-gray-700">Sắp xếp:</h3>
            <select
              value={sortValue}
              onChange={(e) => {
                setSortValue(e.target.value);
                setCurrentPage(0);
              }}
              className="p-2 text-sm font-medium border rounded-lg outline-none bg-gray-50"
            >
              <option value="createdAt,desc">Ngày cập nhật giảm dần</option>
              <option value="viewCount,desc">Lượt xem giảm dần</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t">
          <h3 className="mb-3 font-bold text-gray-700">Thể loại:</h3>
          <div className="flex flex-wrap gap-3">
            {CATEGORY_LIST.map((cat) => (
              <label
                key={cat.id}
                className="flex items-center space-x-2 text-sm font-medium cursor-pointer hover:text-blue-600"
              >
                <input
                  type="checkbox"
                  checked={selectedCats.includes(cat.id)}
                  onChange={() => handleCategoryChange(cat.id)}
                  className="text-blue-600 rounded focus:ring-blue-500"
                />
                <span>{cat.name}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <p className="mt-10 font-bold text-center text-gray-500 animate-pulse">
          Đang tải dữ liệu...
        </p>
      ) : books.length === 0 ? (
        <p className="mt-10 font-bold text-center text-gray-500">
          Không tìm thấy cuốn sách nào phù hợp!
        </p>
      ) : (
        <div className="grid grid-cols-6 gap-6">
          {books.map((book) => (
            <div
              key={book.bookId}
              onClick={() => handleBookClick(book.bookId)}
              className="relative flex flex-col items-center cursor-pointer group"
            >
              <div className="relative w-full aspect-[2/3] overflow-hidden rounded-md shadow bg-gray-100">
                {isPending && (
                  <span className="absolute z-20 px-2 py-1 text-xs font-bold bg-yellow-400 rounded shadow bottom-2 right-2">
                    Chờ duyệt
                  </span>
                )}
                {book.type?.toUpperCase() === "VIP" && (
                  <span className="absolute z-20 px-2 py-1 text-xs font-bold text-white rounded shadow bg-gradient-to-r from-yellow-500 to-orange-500 top-2 left-2">
                    VIP
                  </span>
                )}
                <img
                  src={book.coverImage}
                  alt=""
                  className="object-cover w-full h-full transition duration-300 group-hover:scale-105"
                />
              </div>
              <span className="mt-3 text-xs font-bold text-center text-gray-800 transition group-hover:text-blue-600 line-clamp-2">
                {book.title}
              </span>
              <span className="mt-1 text-xs text-gray-500">
                Tác giả: {book.authorName || "Ẩn danh"}
              </span>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10 mb-8">
          <button
            disabled={currentPage === 0}
            onClick={() => setCurrentPage(0)}
            className="px-3 py-2 bg-white border rounded-lg disabled:bg-gray-100 disabled:text-gray-400 hover:bg-p-100"
          >
            <ChevronsLeft size={18} />
          </button>

          <button
            disabled={currentPage === 0}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="flex items-center gap-1 px-4 py-2 bg-white border rounded-lg disabled:bg-gray-100 disabled:text-gray-400 hover:bg-p-100"
          >
            <ChevronLeft size={16} /> Trước
          </button>

          {generatePagination().map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => setCurrentPage(pageNum)}
              className={`px-4 py-2 border rounded-lg transition ${
                pageNum === currentPage
                  ? "bg-p-500 text-white font-bold shadow-md"
                  : "bg-white text-n-800 hover:bg-p-100"
              }`}
            >
              {pageNum + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages - 1}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="flex items-center gap-1 px-4 py-2 bg-white border rounded-lg disabled:bg-gray-100 disabled:text-gray-400 hover:bg-p-100"
          >
            Sau <ChevronRight size={16} />
          </button>

          <button
            disabled={currentPage === totalPages - 1}
            onClick={() => setCurrentPage(totalPages - 1)}
            className="px-3 py-2 bg-white border rounded-lg disabled:bg-gray-100 disabled:text-gray-400 hover:bg-p-100"
          >
            <ChevronsRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminHome;
