import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { PenTool, X, Eye } from "lucide-react";

const API_URL = "http://localhost:8080/api";

const RegisterAuthorTab = ({ user, refreshUser }) => {
  const token = localStorage.getItem("jwtToken");

  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    dob: user?.dob || "",
    gender: user?.gender || "Khác",
    bankAccount: user?.bankAccount || "",
    description: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [registerDetail, setRegisterDetail] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchRegisterHistory();
  }, []);

  const fetchRegisterHistory = async () => {
    try {
      const res = await axios.get(`${API_URL}/authors/register`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data && res.data.requestId) {
        setRegisterDetail(res.data);
      }
    } catch (error) {
      console.error("Lỗi lấy lịch sử nộp đơn: ", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await axios.post(`${API_URL}/authors/register`, formData, {
        headers: { Authorization: `Bearer: ${token}` },
      });

      toast.success(res.data?.message || "Đã nộp đơn đăng ký thành công!");
      fetchRegisterHistory();
      refreshUser();

      setFormData((prev) => ({ ...prev, description: "" }));
    } catch (error) {
      toast.error(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Lỗi khi nộp đơn!",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStatus = (status) => {
    switch (status) {
      case "ACCEPT":
        return (
          <span className="px-3 py-1 text-xs font-bold text-green-700 bg-green-100 rounded-full">
            Đã duyệt
          </span>
        );
      case "REJECT":
        return (
          <span className="px-3 py-1 text-xs font-bold text-red-700 bg-red-100 rounded-full">
            Bị từ chối
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 text-xs font-bold text-yellow-700 bg-yellow-100 rounded-full">
            Chờ duyệt
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      <div className="p-8 bg-white border border-gray-100 shadow-sm rounded-2xl">
        <h2 className="flex items-center gap-2 mb-6 text-2xl font-bold text-p-700">
          <PenTool /> Đăng ký làm tác giả
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
          <div className="col-span-1">
            <label className="block mb-1 text-sm font-medium text-n-700">
              Họ và tên
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              required
              placeholder="Nhập họ tên đầy đủ"
              className="text-sm w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-p-300 outline-none"
            />
          </div>

          <div className="col-span-1">
            <label className="block mb-1 text-sm font-medium text-n-700">
              Email
            </label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="text-sm w-full p-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
            />
          </div>

          <div className="col-span-1">
            <label className="block mb-1 text-sm font-medium text-n-700">
              Ngày sinh
            </label>
            <input
              type="date"
              value={formData.dob}
              onChange={(e) =>
                setFormData({ ...formData, dob: e.target.value })
              }
              required
              className="text-sm w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-p-300 outline-none hover:cursor-pointer"
            />
          </div>

          <div className="col-span-1">
            <label className="block mb-1 text-sm font-medium text-n-700">
              Giới tính
            </label>
            <select
              value={formData.gender}
              onChange={(e) =>
                setFormData({ ...formData, gender: e.target.value })
              }
              className="text-sm w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-p-300 outline-none hover:cursor-pointer"
            >
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="block mb-1 text-sm font-medium text-n-700">
              Số tài khoản ngân hàng (Để nhận nhuận bút)
            </label>
            <input
              type="text"
              value={formData.bankAccount}
              onChange={(e) =>
                setFormData({ ...formData, bankAccount: e.target.value })
              }
              required
              placeholder="VD: 0123456789 - MB Bank"
              className="text-sm w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-p-300 outline-none"
            />
          </div>

          <div className="col-span-2">
            <label className="block mb-1 text-sm font-medium text-n-700">
              Lý do muốn làm tác giả / Kinh nghiệm sáng tác
            </label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
              placeholder="Hãy giới thiệu một chút về khả năng sáng tác của bạn..."
              className="text-sm w-full p-3 bg-white border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-p-300 outline-none custom-scrollbar"
            ></textarea>
          </div>

          <div className="col-span-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="text-sm px-8 py-3 font-bold text-white transition shadow-lg bg-p-500 rounded-xl hover:bg-p-600 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Đang xử lý..." : "Nộp đơn đăng ký"}
            </button>
          </div>
        </form>
      </div>

      {registerDetail && (
        <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <h3 className="mb-4 text-xl font-bold text-n-800">Lịch sử nộp đơn</h3>
          <div className="overflow-hidden border border-gray-200 rounded-lg">
            <table className="w-full text-left bg-white border-collapse">
              <thead className="bg-gray-50 text-n-700">
                <tr>
                  <th className="text-sm p-4 font-semibold border-b">Mã đơn</th>
                  <th className="text-sm p-4 font-semibold border-b">
                    Ngày nộp
                  </th>
                  <th className="text-sm p-4 font-semibold border-b">
                    Ngày duyệt
                  </th>
                  <th className="text-sm p-4 font-semibold border-b">
                    Trạng thái
                  </th>
                  <th className="text-sm p-4 font-semibold text-center border-b">
                    Chi tiết
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-n-800">
                <tr className="transition hover:bg-gray-50">
                  <td className="p-4 font-mono text-xs">
                    {registerDetail.requestId}
                  </td>
                  <td className="p-4 text-xs">{registerDetail.createdAt}</td>
                  <td className="p-4 text-xs">
                    {registerDetail.reviewAt || "Chưa duyệt"}
                  </td>
                  <td className="p-4 text-xs">
                    {renderStatus(registerDetail.status)}
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="flex items-center justify-center p-2 mx-auto text-blue-600 transition bg-blue-50 rounded-lg hover:cursor-pointer hover:bg-blue-100 hover:text-blue-800"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL CHI TIẾT ĐƠN */}
      {isModalOpen && registerDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg p-6 overflow-hidden duration-200 bg-white shadow-2xl rounded-2xl animate-in fade-in zoom-in">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute text-gray-400 transition top-4 right-4 hover:cursor-pointer hover:text-gray-700"
            >
              <X size={24} />
            </button>

            <h2 className="mb-6 text-2xl font-bold border-b pb-3 text-n-800">
              Chi tiết đơn đăng ký
            </h2>

            <div className="space-y-3 text-sm text-n-800">
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-gray-500">Mã đơn:</span>
                <span className="font-mono font-medium">
                  {registerDetail.requestId}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-gray-500">Họ và tên:</span>
                <span className="font-medium">{registerDetail.fullName}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-gray-500">Email:</span>
                <span className="font-medium">{registerDetail.email}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-gray-500">
                  Tài khoản ngân hàng:
                </span>
                <span className="font-medium">
                  {registerDetail.bankAccount}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-gray-500">Trạng thái:</span>
                <span>{renderStatus(registerDetail.status)}</span>
              </div>

              <div className="pt-2">
                <span className="block mb-2 font-semibold text-gray-500">
                  Kinh nghiệm / Lý do:
                </span>
                <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg max-h-[150px] overflow-y-auto whitespace-pre-line custom-scrollbar">
                  {registerDetail.description}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(false)}
              className="w-full py-2.5 mt-6 font-bold text-white transition bg-gray-800 rounded-xl hover:cursor-pointer hover:bg-gray-900"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterAuthorTab;
