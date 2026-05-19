import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { CreditCard, ChevronLeft, ChevronRight } from "lucide-react";

const API_URL = "http://localhost:8080/api";

const PaymentHistoryTab = () => {
  const token = localStorage.getItem("jwtToken");
  const username = localStorage.getItem("username");

  const [payments, setPayments] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPaymentHistory();
  }, [currentPage]);

  const fetchPaymentHistory = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${API_URL}/payment/history/${username}?page=${currentPage}&size=10`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setPayments(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
    } catch (error) {
      console.error("Lỗi lấy lịch sử thanh toán: ", error);
      toast.error("Không thể tải lịch sử thanh toán!");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case "PAID":
        return (
          <span className="px-3 py-1 text-xs font-bold text-green-700 bg-green-100 rounded-full">
            Thành công
          </span>
        );
      case "FAIL":
        return (
          <span className="px-3 py-1 text-xs font-bold text-red-700 bg-red-100 rounded-full">
            Thất bại
          </span>
        );
      case "CANCELLED":
        return (
          <span className="px-3 py-1 text-xs font-bold text-gray-700 bg-gray-200 rounded-full">
            Đã hủy
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 text-xs font-bold text-yellow-700 bg-yellow-100 rounded-full">
            Đang xử lý
          </span>
        );
    }
  };

  return (
    <div className="p-8 bg-white border border-gray-100 shadow-sm rounded-2xl">
      <h2 className="flex items-center gap-2 mb-6 text-2xl font-bold text-p-700">
        <CreditCard /> Lịch sử thanh toán
      </h2>

      <div className="overflow-hidden border border-gray-200 rounded-xl">
        <table className="w-full text-left bg-white border-collapse">
          <thead className="bg-gray-50 text-n-700">
            <tr>
              <th className="text-sm p-4 font-semibold border-b">Gói VIP</th>
              <th className="text-sm p-4 font-semibold border-b">Nội dung</th>
              <th className="text-sm p-4 font-semibold border-b">Số tiền</th>
              <th className="text-sm p-4 font-semibold border-b">Thời gian</th>
              <th className="text-sm p-4 font-semibold border-b">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-n-800">
            {isLoading ? (
              <tr>
                <td
                  colSpan="5"
                  className="p-8 text-center text-gray-500 animate-pulse"
                >
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : payments.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500">
                  Bạn chưa có giao dịch nào.
                </td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr
                  key={payment.paymentId}
                  className="transition hover:bg-gray-50"
                >
                  <td className="p-4 font-semibold text-xs">{payment.vipId}</td>
                  <td className="p-4 text-xs">{payment.content}</td>
                  <td className="p-4 font-bold text-p-600 text-xs">
                    {payment.amount?.toLocaleString("vi-VN")} VNĐ
                  </td>
                  <td className="p-4 text-xs text-gray-600">
                    {payment.paidTime
                      ? new Date(payment.paidTime).toLocaleString("vi-VN")
                      : "Chưa thanh toán"}
                  </td>
                  <td className="p-4">{renderStatusBadge(payment.status)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            disabled={currentPage === 0}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="flex items-center gap-1 px-4 py-2 text-sm font-medium transition bg-white border border-gray-300 rounded-lg text-n-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} /> Trước
          </button>

          <span className="text-sm font-semibold text-n-800">
            Trang {currentPage + 1} / {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages - 1}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="flex items-center gap-1 px-4 py-2 text-sm font-medium transition bg-white border border-gray-300 rounded-lg text-n-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sau <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentHistoryTab;
