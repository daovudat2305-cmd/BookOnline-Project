import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Book,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

// Danh sách thể loại (đưa ra ngoài component để code gọn hơn)
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

const Category = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchKeyword = searchParams.get("search") || "";

  // 1. CÁC STATE QUẢN LÝ BỘ LỌC
  const [selectedCats, setSelectedCats] = useState([]); // Mảng chứa ID thể loại
  const [selectedType, setSelectedType] = useState("ALL"); // ALL, FREE, VIP
  const [sortOrder, setSortOrder] = useState("latest"); // latest, oldest

  // 2. CÁC STATE QUẢN LÝ DỮ LIỆU SÁCH
  const [books, setBooks] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // 3. Lắng nghe mọi sự thay đổi của bộ lọc để gọi API
  useEffect(() => {
    fetchFilteredBooks();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedCats, selectedType, sortOrder, currentPage, searchKeyword]);

  // HÀM GỌI API
  const fetchFilteredBooks = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("jwtToken");
      const safeKeyword = encodeURIComponent(searchKeyword);
      // Biến mảng [1, 2] thành chuỗi "1,2" để gửi cho API
      const catString = selectedCats.join(",");

      const apiUrl = `http://localhost:8080/api/books/filter?keyword=${safeKeyword}&categories=${catString}&type=${selectedType}&sort=${sortOrder}&page=${currentPage}&size=16`;

      const res = await axios.get(apiUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setBooks(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error("Lỗi load sách:", error);
      setBooks([]);
    } finally {
      setIsLoading(false);
    }
  };

  // BÀI HỌC QUAN TRỌNG: Xử lý Checkbox Thể loại
  const handleCategoryChange = (catId) => {
    setCurrentPage(0); // Đổi bộ lọc thì phải về trang đầu tiên

    setSelectedCats((prevCats) => {
      // Nếu ID đã có trong mảng -> Xóa nó đi (Bỏ tick)
      if (prevCats.includes(catId)) {
        return prevCats.filter((id) => id !== catId);
      }
      // Nếu chưa có -> Thêm nó vào mảng (Đánh tick)
      else {
        return [...prevCats, catId];
      }
    });
  };

  // Hàm chuyển trang
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Hàm tính toán nút phân trang (Giữ lại logic cửa sổ trượt của bạn)
  const generatePagination = () => {
    const maxVisible = 7;
    let start = Math.max(0, currentPage - 3);
    let end = Math.min(totalPages - 1, currentPage + 3);

    if (start === 0) {
      end = Math.min(totalPages - 1, maxVisible - 1);
    } else if (end === totalPages - 1) {
      start = Math.max(0, totalPages - maxVisible);
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="w-full">
      {/* KHU VỰC BỘ LỌC */}
      <div className="p-6 mb-6 shadow-md bg-p-200 rounded-2xl w-full max-w-4xl">
        <table className="text-left border-separate border-spacing-x-6 border-spacing-y-4 w-full">
          <tbody>
            <tr>
              <th className="align-top pt-1 w-32 font-bold text-n-800">
                Thể loại
              </th>
              <td>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {CATEGORY_LIST.map((cat) => (
                    <label
                      key={cat.id}
                      className="flex items-center space-x-2 text-sm cursor-pointer hover:text-p-700"
                    >
                      <input
                        type="checkbox"
                        className="rounded cursor-pointer"
                        // Giao diện checkbox phụ thuộc vào việc ID của nó có nằm trong mảng State không
                        checked={selectedCats.includes(cat.id)}
                        onChange={() => handleCategoryChange(cat.id)}
                      />
                      <span>{cat.name}</span>
                    </label>
                  ))}
                </div>
              </td>
            </tr>

            <tr>
              <th className="font-bold text-n-800">Loại truyện</th>
              <td className="flex gap-3">
                {/* Hàm helper để tạo nút Loại truyện nhanh gọn */}
                {[
                  { value: "ALL", label: "Tất cả" },
                  { value: "FREE", label: "Miễn phí" },
                  { value: "VIP", label: "VIP" },
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => {
                      setSelectedType(type.value);
                      setCurrentPage(0);
                    }}
                    className={`px-6 py-1 border border-p-300 rounded-full transition-all duration-200 ${
                      selectedType === type.value
                        ? "bg-p-400 font-bold shadow-inner text-n-800"
                        : "bg-white hover:bg-p-100 text-gray-700"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </td>
            </tr>

            <tr>
              <th className="font-bold text-n-800">Sắp xếp</th>
              <td>
                <select
                  className="p-1 border rounded-lg w-fit bg-p-50 outline-none cursor-pointer"
                  value={sortOrder}
                  onChange={(e) => {
                    setSortOrder(e.target.value);
                    setCurrentPage(0);
                  }}
                >
                  <option value="latest">Ngày đăng giảm dần</option>
                  <option value="oldest">Ngày đăng tăng dần</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* KHU VỰC DANH SÁCH SÁCH */}
      <h2 className="mb-4 text-2xl font-semibold text-n-800 flex items-center">
        <Book className="mr-2" />
        Danh sách truyện
        {searchKeyword && (
          <span className="text-sm font-normal ml-2 text-gray-500">
            (Kết quả cho: "{searchKeyword}")
          </span>
        )}
      </h2>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-5">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="h-72 bg-white/50 animate-pulse rounded-lg shadow"
            ></div>
          ))}
        </div>
      ) : books.length === 0 ? (
        <p className="text-center w-full mt-10 text-gray-500">
          Không tìm thấy cuốn sách nào phù hợp với bộ lọc.
        </p>
      ) : (
        <div className="grid grid-cols-4 gap-6">
          {books.map((book) => (
            <div
              key={book.bookId}
              className="cursor-pointer bg-white p-3 rounded-lg shadow hover:shadow-lg transition group relative"
              onClick={() => navigate(`/book-detail/${book.bookId}`)}
            >
              <div className="overflow-hidden rounded-md mb-3 relative">
                {book.type?.toUpperCase() === "VIP" && (
                  <span className="absolute px-2 py-1 text-[10px] font-bold text-white bg-gradient-to-r from-yellow-500 to-orange-500 rounded shadow z-10 top-2 left-2">
                    VIP
                  </span>
                )}
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-full h-56 object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute bottom-0 left-0 w-full p-2 text-xs font-medium text-white bg-gradient-to-t from-black/70 to-transparent flex items-center gap-1">
                  <Eye size={14} /> {book.viewCount || 0}
                </div>
              </div>
              <h3 className="font-bold text-n-800 text-sm line-clamp-2 mb-1">
                {book.title}
              </h3>
              <p className="text-xs text-gray-500">
                {book.authorName || "Ẩn danh"}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* PHÂN TRANG */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10 mb-8 text-sm">
          <button
            disabled={currentPage === 0}
            onClick={() => handlePageChange(0)}
            className="px-3 py-1.5 border rounded-lg bg-white disabled:bg-gray-100 disabled:text-gray-400 hover:bg-p-100"
          >
            Trang đầu
          </button>

          <button
            disabled={currentPage === 0}
            onClick={() => handlePageChange(currentPage - 1)}
            className="px-3 py-1.5 border rounded-lg bg-white disabled:bg-gray-100 disabled:text-gray-400 hover:bg-p-100 flex items-center gap-1"
          >
            <ChevronLeft size={16} /> Trước
          </button>

          {/* Dấu ... đầu */}
          {generatePagination()[0] > 0 && (
            <span className="px-2 text-gray-500">...</span>
          )}

          {generatePagination().map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              className={`px-3 py-1.5 border rounded-lg transition ${
                pageNum === currentPage
                  ? "bg-p-500 text-white font-bold shadow-md"
                  : "bg-white text-n-800 hover:bg-p-100"
              }`}
            >
              {pageNum + 1}
            </button>
          ))}

          {/* Dấu ... cuối */}
          {generatePagination()[generatePagination().length - 1] <
            totalPages - 1 && <span className="px-2 text-gray-500">...</span>}

          <button
            disabled={currentPage === totalPages - 1}
            onClick={() => handlePageChange(currentPage + 1)}
            className="px-3 py-1.5 border rounded-lg bg-white disabled:bg-gray-100 disabled:text-gray-400 hover:bg-p-100 flex items-center gap-1"
          >
            Sau <ChevronRight size={16} />
          </button>

          <button
            disabled={currentPage === totalPages - 1}
            onClick={() => handlePageChange(totalPages - 1)}
            className="px-3 py-1.5 border rounded-lg bg-white disabled:bg-gray-100 disabled:text-gray-400 hover:bg-p-100"
          >
            Trang cuối
          </button>
        </div>
      )}
    </div>
  );
};

export default Category;
