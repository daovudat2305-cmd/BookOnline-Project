import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Crown, X, CheckCircle, XCircle, Loader2 } from "lucide-react";

const API_URL = "http://localhost:8080/api";

const VipTab = ({ user, refreshUser }) => {
  const token = localStorage.getItem("jwtToken");
  const [qrData, setQrData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("PENDING");

  const buyVip = async (vipId) => {
    try {
      const res = await axios.post(
        `${API_URL}/payment/create?vipId=${vipId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setQrData(res.data);
      setPaymentStatus("PENDING");
    } catch (error) {
      toast.error(error.response?.data?.error || "Lỗi tạo hóa đơn!");
    }
  };

  useEffect(() => {
    let interval;
    if (qrData && paymentStatus === "PENDING") {
      interval = setInterval(async () => {
        try {
          const res = await axios.get(
            `${API_URL}/payment/status?paymentId=${qrData.paymentId}`,
            { headers: { Authorization: `Bearer ${token}` } },
          );

          if (res.data.status === "PAID") {
            setPaymentStatus("PAID");
            refreshUser();
          } else if (
            res.data.status === "FAIL" ||
            res.data.status === "CANCELLED"
          ) {
            setPaymentStatus("FAIL");
          }
        } catch (error) {
          console.error("Lỗi kiểm tra thanh toán", error);
        }
      }, 3000);
    }

    return () => clearInterval(interval);
  }, [qrData, paymentStatus]);

  const closeQrModal = () => {
    setQrData(null);
    setPaymentStatus("PENDING");
  };

  return (
    <div className="space-y-8">
      <h2 className="pb-4 text-3xl font-bold border-b text-n-800">
        Đăng ký VIP
      </h2>

      {user.isVip && (
        <div className="p-4 mb-6 border border-green-200 bg-green-50 rounded-xl">
          <p className="flex items-center gap-2 text-lg font-bold text-green-700">
            <Crown /> Bạn đang là thành viên VIP
          </p>
          <p className="font-medium text-green-600">
            Thời hạn còn lại:{" "}
            <span className="text-xl font-black">
              {user.vipDetail?.daysRemaining || 0}
            </span>{" "}
            ngày
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Gói Tháng */}
        <div className="flex flex-col items-center p-8 transition-all border border-green-200 shadow-sm bg-gradient-to-t from-green-50 to-green-100 rounded-3xl hover:shadow-xl hover:-translate-y-2">
          <Crown size={40} className="mb-2 text-green-500" />
          <h3 className="text-2xl font-bold text-green-800">Gói Tháng</h3>
          <p className="mt-4 mb-6 text-3xl font-black text-green-600">
            25.000đ
          </p>
          <ul className="w-full px-4 mb-8 space-y-2 text-sm font-medium text-left text-green-700 list-disc list-inside">
            <li>Kích hoạt VIP trong 30 ngày</li>
            <li>Đọc không giới hạn toàn bộ sách VIP</li>
          </ul>
          <button
            onClick={() => buyVip("VIP_THANG")}
            className="w-full px-8 py-3 mt-auto text-sm font-bold text-white transition bg-green-500 rounded-full shadow-md hover:cursor-pointer hover:bg-green-600"
          >
            {user.isVip ? "Gia hạn thêm" : "Đăng ký ngay"}
          </button>
        </div>

        {/* Gói Quý */}
        <div className="relative flex flex-col items-center p-8 transition-all border-2 border-yellow-300 shadow-md bg-gradient-to-t from-yellow-50 to-yellow-100 rounded-3xl hover:shadow-2xl hover:-translate-y-2">
          <div className="absolute px-4 py-1 text-xs font-bold text-white bg-yellow-500 rounded-full shadow-md -top-4">
            PHỔ BIẾN NHẤT
          </div>
          <Crown size={40} className="mb-2 text-yellow-500" />
          <h3 className="text-2xl font-bold text-yellow-800">Gói Quý</h3>
          <p className="mt-4 mb-6 text-3xl font-black text-yellow-600">
            70.000đ
          </p>
          <ul className="w-full px-4 mb-8 space-y-2 text-sm font-medium text-left text-yellow-700 list-disc list-inside">
            <li>Kích hoạt VIP trong 90 ngày</li>
            <li>Tiết kiệm hơn so với gói tháng</li>
          </ul>
          <button
            onClick={() => buyVip("VIP_QUY")}
            className="w-full px-6 py-3 mt-auto text-sm font-bold text-white transition bg-yellow-500 rounded-full shadow-md hover:cursor-pointer hover:bg-yellow-600"
          >
            {user.isVip ? "Gia hạn thêm" : "Đăng ký ngay"}
          </button>
        </div>

        {/* Gói Năm */}
        <div className="flex flex-col items-center p-8 transition-all border shadow-sm bg-gradient-to-t from-p-50 to-p-100 border-p-200 rounded-3xl hover:shadow-xl hover:-translate-y-2">
          <Crown size={40} className="mb-2 text-p-500" />
          <h3 className="text-2xl font-bold text-p-800">Gói Năm</h3>
          <p className="mt-4 mb-6 text-3xl font-black text-p-600">270.000đ</p>
          <ul className="w-full px-4 mb-8 space-y-2 text-sm font-medium text-left list-disc list-inside text-p-700">
            <li>Kích hoạt VIP trong 365 ngày</li>
            <li>Tối ưu chi phí dài hạn nhất</li>
          </ul>
          <button
            onClick={() => buyVip("VIP_NAM")}
            className="w-full px-8 py-3 mt-auto text-sm font-bold text-white transition rounded-full shadow-md bg-p-500 hover:cursor-pointer hover:bg-p-600"
          >
            {user.isVip ? "Gia hạn thêm" : "Đăng ký ngay"}
          </button>
        </div>
      </div>

      {/* MODAL QUÉT MÃ QR */}
      {qrData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-sm overflow-hidden duration-200 bg-white shadow-2xl rounded-2xl animate-in fade-in zoom-in">
            <button
              onClick={closeQrModal}
              className="absolute text-gray-400 transition top-4 right-4 hover:cursor-pointer hover:text-gray-700"
            >
              <X size={24} />
            </button>

            {paymentStatus === "PENDING" && (
              <div className="p-6 text-center">
                <h3 className="mb-4 text-xl font-bold text-n-800">
                  Thanh toán Quét mã QR
                </h3>
                <img
                  src={`https://qr.sepay.vn/img?bank=MBBank&acc=0343649920&template=compact&amount=${qrData.amount}&des=${qrData.content}`}
                  alt="QR Code"
                  className="w-56 h-56 p-2 mx-auto mb-4 border shadow-sm rounded-xl"
                />
                <p className="mb-4 text-lg font-bold text-n-800">
                  Số tiền:{" "}
                  <span className="text-red-500">
                    {qrData.amount.toLocaleString("vi-VN")} VNĐ
                  </span>
                </p>
                <div className="p-4 mb-4 space-y-1 text-sm text-left text-gray-600 border border-gray-100 bg-gray-50 rounded-xl">
                  <p>
                    <b>Ngân hàng:</b> MB Bank
                  </p>
                  <p>
                    <b>Chủ TK:</b> DAO VU DAT
                  </p>
                  <p>
                    <b>Nội dung CK:</b>{" "}
                    <span className="px-1 font-mono font-bold text-blue-600 rounded bg-blue-50">
                      {qrData.content}
                    </span>
                  </p>
                </div>
                <p className="flex items-center justify-center gap-2 text-sm font-semibold text-yellow-600 animate-pulse">
                  <Loader2 size={16} className="animate-spin" /> Đang chờ thanh
                  toán...
                </p>
              </div>
            )}

            {paymentStatus === "PAID" && (
              <div className="p-8 text-center bg-green-50">
                <CheckCircle
                  size={64}
                  className="mx-auto mb-4 text-green-500"
                />
                <h3 className="mb-2 text-2xl font-bold text-green-700">
                  Thanh toán thành công!
                </h3>
                <p className="mb-6 text-green-600">
                  Tài khoản của bạn đã được nâng cấp VIP.
                </p>
                <button
                  onClick={closeQrModal}
                  className="w-full py-3 font-bold text-white transition bg-green-500 shadow hover:cursor-pointer hover:bg-green-600 rounded-xl"
                >
                  Tuyệt vời!
                </button>
              </div>
            )}

            {paymentStatus === "FAIL" && (
              <div className="p-8 text-center bg-red-50">
                <XCircle size={64} className="mx-auto mb-4 text-red-500" />
                <h3 className="mb-2 text-2xl font-bold text-red-700">
                  Thanh toán thất bại!
                </h3>
                <p className="mb-6 text-red-600">
                  Vui lòng thực hiện lại và chuyển đúng số tiền hoặc nội dung.
                </p>
                <button
                  onClick={closeQrModal}
                  className="w-full py-3 font-bold text-white transition bg-red-500 shadow hover:cursor-pointer hover:bg-red-600 rounded-xl"
                >
                  Thoát
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VipTab;
