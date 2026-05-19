import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Crown } from "lucide-react";

const API_URL = "http://localhost:8080/api";

const UserInfoTab = ({ user, refreshUser }) => {
  const token = localStorage.getItem("jwtToken");
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: user.fullName || "",
    dob: user.dob || "",
    gender: user.gender || "Khác",
    bankAccount: user.bankAccount || "",
  });

  const [isUpdating, setIsUpdating] = useState(false);

  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (user.role === "AUTHOR") {
      fetchBalance();
    }
  }, [user.role]);

  const fetchBalance = async () => {
    try {
      const res = await axios.get(`${API_URL}/authors/balance`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setBalance(res.data.totalAmount || 0);
    } catch (error) {
      console.error("Lỗi lấy số dư: ", error);
    }
  };

  const handleRequestPay = async () => {
    if (balance <= 0) {
      toast.warning("Bạn không có số dư để yêu cầu rút tiền!");
      return;
    }

    try {
      const res = await axios.post(
        `${API_URL}/authors/paymentRequest`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      toast.success("Đã gửi yêu cầu thành công");
      fetchBalance();
    } catch (error) {
      toast.error(error.response?.data?.error || "Lỗi gửi yêu cầu thanh toán!");
    }
  };

  const handleUpdateInfo = async () => {
    setIsUpdating(true);
    try {
      const res = await axios.patch(`${API_URL}/users/myInfo`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(res.data?.message);
      refreshUser();
      setFormData({
        fullName: user.fullName || "",
        dob: user.dob || "",
        gender: user.gender || "Khác",
        bankAccount: user.bankAccount || "",
      });
    } catch (error) {
      toast.error(error.response?.data?.error || "Lỗi cập nhật!");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append("avatar", file);

    const toastId = toast.loading("Đang tải ảnh lên...");
    try {
      const res = await axios.patch(`${API_URL}/users/uploadAvatar`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(res.data?.message, { id: toastId });
      localStorage.setItem("avatar", res.data.avatarUrl);
      refreshUser();
    } catch (error) {
      toast.error("Lỗi khi tải ảnh lên!", { id: toastId });
    }
  };

  return (
    <div className="max-w-4xl p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
      <div className="flex flex-row gap-12">
        {/* AVATAR */}
        <div className="flex flex-col items-center">
          <div
            className={`relative flex items-center justify-center w-28 h-28 overflow-hidden border-4 rounded-full ${user.isVip ? "border-yellow-400" : "border-n-500"} bg-gray-100`}
          >
            <img
              src={user.avatar}
              alt="Avatar"
              className="object-cover w-full h-full"
            />
          </div>

          {user.isVip && (
            <span className="flex text-sm items-center gap-1 mt-2 font-semibold text-yellow-500">
              <Crown size={16} /> VIP Member
            </span>
          )}

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleAvatarUpload}
          />
          <button
            onClick={() => fileInputRef.current.click()}
            className="mt-4 text-sm font-medium transition text-p-600 hover:text-p-800 hover:cursor-pointer hover:underline"
          >
            Cập nhật ảnh đại diện
          </button>

          {user.role === "AUTHOR" && (
            <div className="flex flex-col items-center w-full mt-10">
              <label className="mb-2 text-sm font-medium text-n-700">
                Tiền có thể nhận được
              </label>
              <input
                type="text"
                value={`${balance.toLocaleString("vi-VN")} VNĐ`}
                disabled
                className="w-full text-sm max-w-[200px] p-2.5 mb-4 font-semibold text-center bg-white border border-gray-300 rounded-lg text-n-800"
              />
              <button
                onClick={handleRequestPay}
                disabled={balance <= 0}
                className="px-6 py-2.5 text-sm font-bold text-white transition bg-blue-500 rounded-lg shadow hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed w-full max-w-[200px]"
              >
                Yêu cầu gửi tiền
              </button>
            </div>
          )}
        </div>

        {/* CỘT FORM */}
        <div className="flex-1 space-y-5">
          <h2 className="pb-2 mb-6 text-2xl font-bold border-b text-n-800">
            Hồ sơ của tôi
          </h2>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block mb-1 text-sm font-medium text-n-700">
                Tên đăng nhập
              </label>
              <input
                type="text"
                value={user.username}
                disabled
                className="text-sm w-full p-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-n-700">
                Email
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="text-sm w-full p-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
              />
            </div>

            <div className="col-span-2">
              <label className="block mb-1 text-sm font-medium text-n-700">
                Họ và tên
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                placeholder="Nhập họ tên thật của bạn"
                className="text-sm w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-p-300 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-n-700">
                Ngày sinh
              </label>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) =>
                  setFormData({ ...formData, dob: e.target.value })
                }
                className="text-sm w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-p-300 outline-none"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-n-700">
                Giới tính
              </label>
              <select
                value={formData.gender}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
                className="text-sm w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-p-300 outline-none"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            {user.role === "AUTHOR" && (
              <div className="col-span-2">
                <label className="block mb-1 text-sm font-medium text-n-700">
                  Số tài khoản ngân hàng
                </label>
                <input
                  type="text"
                  value={formData.bankAccount}
                  onChange={(e) =>
                    setFormData({ ...formData, bankAccount: e.target.value })
                  }
                  placeholder="VD: 123456789 - MB Bank"
                  className="text-sm w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-p-300 outline-none"
                />
              </div>
            )}
          </div>

          <button
            onClick={handleUpdateInfo}
            disabled={isUpdating}
            className="px-8 py-3 mt-4 text-sm font-bold text-white transition shadow-md bg-p-500 hover:bg-p-600 hover:cursor-pointer rounded-xl disabled:opacity-70"
          >
            {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserInfoTab;
