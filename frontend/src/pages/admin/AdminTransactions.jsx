import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  DollarSign,
  Users,
  Bell,
  Search,
  Filter,
  CheckCircle,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const API_URL = "http://localhost:8080/api/admin";

const AdminTransactions = () => {
  const token = localStorage.getItem("jwtToken");

  const [stats, setStats] = useState({
    totalRevenue: 0,
    vipCount: 0,
    pendingRequests: 0,
  });

  const [viewType, setViewType] = useState("pay");
  const [dataList, setDataList] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // State bộ lọc cho Frontend
  const [filters, setFilters] = useState({ date: "", status: "all" });

  useEffect(() => {
    fetchStats();
  }, []);

  // API chỉ gọi khi đổi Tab hoặc đổi Trang
  useEffect(() => {
    fetchData();
  }, [viewType, page]);

  const fetchStats = async () => {
    try {
      const [rev, vip, req] = await Promise.all([
        axios.get(`${API_URL}/payments/revenue`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/payments/registerVip`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/paymentRequests/count`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setStats({
        totalRevenue: rev.data.totalRevenue || 0,
        vipCount: vip.data.numberOfVip || 0,
        pendingRequests: req.data.numberOfRequests || 0,
      });
    } catch (error) {
      console.error("Lỗi tải thống kê", error);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const endpoint =
        viewType === "pay" ? "payments/history" : "paymentRequests";
      const res = await axios.get(
        `${API_URL}/${endpoint}?page=${page}&size=10`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setDataList(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      toast.error("Không thể tải danh sách giao dịch");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentRequest = async (requestId, action) => {
    const confirmMsg =
      action === "APPROVE"
        ? "Xác nhận duyệt chi cho yêu cầu này?"
        : "Xác nhận từ chối yêu cầu này?";
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await axios.patch(
        `${API_URL}/paymentRequests/process?requestId=${requestId}&action=${action}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success(res.data.message);
      fetchData();
      fetchStats();
    } catch (error) {
      // ĐÃ SỬA LỖI: Lấy thông báo lỗi từ đối tượng error của axios
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Lỗi khi xử lý yêu cầu!",
      );
    }
  };

  // ==============================================================
  // THUẬT TOÁN LỌC DỮ LIỆU TẠI FRONTEND
  // ==============================================================
  const filteredData = dataList.filter((item) => {
    let matchDate = true;
    let matchStatus = true;

    // Lọc theo ngày
    if (filters.date) {
      const dateObj = new Date(item.paidTime || item.paidAt || item.createdAt);
      const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")}`;
      matchDate = dateStr === filters.date;
    }

    // Lọc theo trạng thái
    if (filters.status !== "all") {
      const itemStatus = (item.status || "").toUpperCase();
      const filterStatus = filters.status.toUpperCase();

      if (filterStatus === "PAID") {
        matchStatus = itemStatus === "PAID" || itemStatus === "ACCEPT";
      } else {
        matchStatus = itemStatus === filterStatus;
      }
    }

    return matchDate && matchStatus;
  });

  const renderStatusBadge = (status) => {
    const s = status?.toUpperCase();

    if (s === "PAID" || s === "ACCEPT") {
      return (
        <span className="px-3 py-1 text-xs font-bold text-green-700 bg-green-100 rounded-full">
          {viewType === "pay" ? "Thành công" : "Đã duyệt"}
        </span>
      );
    }
    if (s === "PENDING") {
      return (
        <span className="px-3 py-1 text-xs font-bold text-yellow-700 bg-yellow-100 rounded-full">
          Chờ xử lý
        </span>
      );
    }
    if (s === "FAIL") {
      return (
        <span className="px-3 py-1 text-xs font-bold text-red-700 bg-red-100 rounded-full">
          Thất bại
        </span>
      );
    }
    if (s === "CANCELLED") {
      return (
        <span className="px-3 py-1 text-xs font-bold text-red-700 bg-red-100 rounded-full">
          Đã hủy
        </span>
      );
    }
    if (s === "REJECTED") {
      return (
        <span className="px-3 py-1 text-xs font-bold text-red-700 bg-red-100 rounded-full">
          Đã từ chối
        </span>
      );
    }

    return (
      <span className="px-3 py-1 text-xs font-bold text-gray-700 bg-gray-100 rounded-full">
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Quản lý Tài chính</h1>

      {/* OVERVIEW CARDS */}
      <div className="grid grid-cols-3 gap-6">
        <div className="flex items-center gap-4 p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="p-4 text-green-600 bg-green-50 rounded-xl">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              Doanh thu tháng này
            </p>
            <h3 className="text-xl font-bold text-gray-800">
              {stats.totalRevenue.toLocaleString()}đ
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-4 p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="p-4 text-blue-600 bg-blue-50 rounded-xl">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              Số lượt nạp VIP mới
            </p>
            <h3 className="text-xl font-bold text-gray-800">
              {stats.vipCount} lượt
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-4 p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="p-4 text-yellow-600 bg-yellow-50 rounded-xl">
            <Bell size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              Yêu cầu rút tiền chờ xử lý
            </p>
            <h3 className="text-xl font-bold text-gray-800">
              {stats.pendingRequests} đơn
            </h3>
          </div>
        </div>
      </div>

      {/* BỘ LỌC & CHUYỂN TAB */}
      <div className="flex flex-wrap items-center justify-between gap-6 p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
        <div className="flex p-1 bg-gray-100 rounded-xl">
          <button
            onClick={() => {
              setViewType("pay");
              setPage(0);
              setFilters({ date: "", status: "all" });
            }}
            className={`px-6 py-2 rounded-lg font-bold transition ${viewType === "pay" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Lịch sử nạp VIP
          </button>
          <button
            onClick={() => {
              setViewType("withdraw");
              setPage(0);
              setFilters({ date: "", status: "all" });
            }}
            className={`px-6 py-2 rounded-lg font-bold transition ${viewType === "withdraw" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Yêu cầu rút tiền
          </button>
        </div>

        {/* ĐÃ KHÔI PHỤC: Giao diện Bộ lọc */}
        <div className="flex items-center gap-4">
          <input
            type="date"
            value={filters.date}
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            className="p-2 text-sm border rounded-lg outline-none bg-gray-50"
          />
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="p-2 text-sm font-medium border rounded-lg outline-none cursor-pointer bg-gray-50"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="PAID">Thành công / Đã duyệt</option>
            <option value="PENDING">Chờ xử lý</option>
            <option value="FAIL">Thất bại</option>
            <option value="CANCELLED">Đã hủy</option>
            {viewType === "withdraw" && (
              <option value="REJECTED">Đã từ chối</option>
            )}
          </select>
        </div>
      </div>

      {/* BẢNG DỮ LIỆU */}
      <div className="overflow-hidden bg-white border shadow-sm rounded-2xl">
        <table className="w-full text-left border-collapse">
          <thead className="text-white bg-gray-900">
            {viewType === "pay" ? (
              <tr>
                <th className="p-4 text-sm">Người dùng</th>
                <th className="p-4 text-sm">Username</th>
                <th className="p-4 text-sm text-right">Loại giao dịch</th>
                <th className="p-4 text-sm">Số tiền</th>
                <th className="p-4 text-sm">Thời gian</th>
                <th className="p-4 text-sm text-center">Trạng thái</th>
              </tr>
            ) : (
              <tr>
                <th className="p-4 text-sm">Tác giả</th>
                <th className="p-4 text-sm">Nội dung</th>
                <th className="p-4 text-sm text-right">Số tiền yêu cầu</th>
                <th className="p-4 text-sm">Thời gian tạo</th>
                <th className="p-4 text-sm text-center">Trạng thái</th>
                <th className="p-4 text-sm text-center">Hành động</th>
              </tr>
            )}
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td
                  colSpan="6"
                  className="p-10 text-center text-gray-400 animate-pulse"
                >
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="p-10 italic text-center text-gray-500"
                >
                  Không có giao dịch nào phù hợp với bộ lọc.
                </td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr
                  key={item.paymentId || item.paymentRequestId}
                  className="transition hover:bg-gray-50"
                >
                  {viewType === "pay" ? (
                    <>
                      <td className="p-4 text-sm text-gray-700">
                        {item.userRole}
                      </td>
                      <td className="p-4 text-sm font-bold text-gray-800">
                        {item.username}
                      </td>
                      <td className="p-4 text-sm text-right text-gray-700">
                        {item.vipId}
                      </td>
                      <td className="p-4 text-sm font-bold text-green-600">
                        {item.status === "PAID" && "+"}{" "}
                        {item.amount.toLocaleString()}đ
                      </td>
                      <td className="p-4 text-sm">
                        {new Date(
                          item.paidTime || item.paidAt || item.createdAt,
                        ).toLocaleString("vi-VN")}
                      </td>
                      <td className="p-4 text-center">
                        {renderStatusBadge(item.status)}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-4 text-sm font-bold text-gray-800">
                        {item.authorName}
                      </td>
                      <td className="p-2 text-sm">
                        <span className="block font-medium">
                          {item.content}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-right text-red-600">
                        {item.status === "PAID" && "-"}{" "}
                        {item.amount.toLocaleString()}đ
                      </td>
                      <td className="p-4 text-sm">
                        {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="p-2 text-center">
                        {renderStatusBadge(item.status)}
                      </td>
                      <td className="p-2 text-xs">
                        {/* ĐÃ SỬA LỖI: Chỉ hiện nút duyệt/từ chối nếu trạng thái là PENDING */}
                        {item.status?.toUpperCase() === "PENDING" ? (
                          <div className="flex justify-center gap-1">
                            <button
                              onClick={() =>
                                handlePaymentRequest(
                                  item.paymentRequestId,
                                  "APPROVE",
                                )
                              }
                              className="px-3 py-1.5 text-white bg-green-500 rounded hover:bg-green-600 font-bold transition"
                            >
                              Duyệt
                            </button>
                            <button
                              onClick={() =>
                                handlePaymentRequest(
                                  item.paymentRequestId,
                                  "REJECT",
                                )
                              }
                              className="px-3 py-1.5 text-white bg-red-500 rounded hover:bg-red-600 font-bold transition"
                            >
                              Từ chối
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs italic font-bold text-gray-400">
                            Đã hoàn tất
                          </span>
                        )}
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PHÂN TRANG */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="p-2 transition bg-white border rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="font-bold">
            Trang {page + 1} / {totalPages}
          </span>
          <button
            disabled={page === totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            className="p-2 transition bg-white border rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminTransactions;
