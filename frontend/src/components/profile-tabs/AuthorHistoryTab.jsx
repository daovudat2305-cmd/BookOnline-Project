import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { SwatchBook, Info } from "lucide-react";

const API_URL = "http://localhost:8080/api";

const AuthorHistoryTab = () => {
  const token = localStorage.getItem("jwtToken");
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchMyBooks();
  }, []);

  const fetchMyBooks = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/author/books/my-history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sorted = res.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
      setBooks(sorted);
    } catch (error) {
      toast.error("Không thể tải lịch sử đăng sách.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBooks = books.filter((book) => {
    let matchDate = true;
    if (filterDate) {
      let d = new Date(book.createdAt);
      let bookDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      matchDate = bookDateStr === filterDate;
    }

    let matchStatus = true;
    if (filterStatus !== "all") {
      matchStatus = book.status.toString() === filterStatus;
    }

    return matchDate && matchStatus;
  });

  const renderStatus = (book) => {
    if (book.status === 0)
      return (
        <span className="text-yellow-600 font-bold bg-yellow-50 px-2 py-1 rounded text-xs">
          Đang chờ duyệt
        </span>
      );
    if (book.status === 1)
      return (
        <span className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded text-xs">
          Đã duyệt
        </span>
      );
    if (book.status === 2)
      return (
        <span
          onClick={() =>
            alert(`Lý do từ chối: ${book.message || "Không có lý do"}`)
          }
          className="text-orange-600 font-bold bg-orange-50 px-2 py-1 rounded text-xs cursor-pointer flex items-center w-fit gap-1 hover:bg-orange-100"
        >
          Bị từ chối <Info size={14} />
        </span>
      );
    if (book.status === 3)
      return (
        <span
          onClick={() =>
            alert(`Lý do xóa: ${book.message || "Không có lý do"}`)
          }
          className="text-red-600 font-bold bg-red-50 px-2 py-1 rounded text-xs cursor-pointer flex items-center w-fit gap-1 hover:bg-red-100"
        >
          Đã xóa <Info size={14} />
        </span>
      );
  };

  return (
    <div className="p-8 bg-white border border-gray-100 shadow-sm rounded-2xl">
      <h2 className="flex items-center gap-2 mb-6 text-2xl font-bold text-p-700">
        <SwatchBook /> Lịch sử đăng sách
      </h2>

      <div className="overflow-hidden border border-gray-200 rounded-xl">
        <table className="w-full text-left bg-white border-collapse">
          <thead className="bg-gray-50 text-n-700">
            <tr>
              <th className="text-sm p-4 font-semibold border-b w-32">
                Mã sách
              </th>
              <th className="text-sm p-4 font-semibold border-b">Tiêu đề</th>
              <th className="text-sm p-4 font-semibold border-b">
                <div className="flex flex-col gap-1">
                  <span>Ngày đăng</span>
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="p-1 text-xs font-normal text-gray-600 bg-white border border-gray-300 rounded outline-none cursor-pointer focus:border-p-500 w-fit"
                  />
                </div>
              </th>
              <th className="text-sm p-4 font-semibold border-b">
                <div className="flex flex-col gap-1">
                  <span>Trạng thái</span>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="p-1 text-xs font-normal text-gray-600 bg-white border border-gray-300 rounded outline-none cursor-pointer focus:border-p-500 w-fit"
                  >
                    <option value="all">Tất cả</option>
                    <option value="0">Đang chờ duyệt</option>
                    <option value="1">Đã duyệt</option>
                    <option value="2">Bị từ chối</option>
                    <option value="3">Đã xóa</option>
                  </select>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-n-800">
            {isLoading ? (
              <tr>
                <td
                  colSpan="4"
                  className="p-8 text-center text-gray-500 animate-pulse"
                >
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : filteredBooks.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-8 text-center text-gray-500">
                  Không tìm thấy sách phù hợp.
                </td>
              </tr>
            ) : (
              filteredBooks.map((book) => (
                <tr key={book.bookId} className="transition hover:bg-gray-50">
                  <td className="p-4 font-mono text-xs text-gray-500">
                    #{book.bookId.substring(0, 8)}...
                  </td>
                  <td className="p-4 text-xs font-semibold text-n-800">
                    {book.title}
                  </td>
                  <td className="p-4 text-xs">
                    {new Date(
                      book.createdAt || book.createdDate,
                    ).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="p-4 text-xs">{renderStatus(book)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuthorHistoryTab;
