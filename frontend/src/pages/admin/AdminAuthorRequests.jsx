import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  Search,
  ClipboardCheck,
  ChevronLeft,
  User,
  Calendar,
  Info,
  Check,
  X,
} from "lucide-react";

const API_URL = "http://localhost:8080/api/admin/author-request";

const AdminAuthorRequests = () => {
  const token = localStorage.getItem("jwtToken");

  const [requests, setRequests] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, [page, keyword]);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const url = keyword.trim()
        ? `${API_URL}/${keyword.trim()}?page=${page}&size=12`
        : `${API_URL}?page=${page}&size=12`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      toast.error("Lỗi tải danh sách yêu cầu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReview = async (requestId, status) => {
    const confirmMsg =
      status === "ACCEPT"
        ? "Duyệt người này làm tác giả?"
        : "Từ chối yêu cầu này?";
    if (!window.confirm(confirmMsg)) return;

    try {
      await axios.patch(`${API_URL}/${requestId}`, status, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "text/plain",
        },
      });
      toast.success(
        status === "ACCEPT" ? "Đã nâng cấp quyền tác giả!" : "Đã từ chối đơn.",
      );
      setSelectedReq(null);
      fetchRequests();
    } catch (error) {
      toast.error("Lỗi xử lý yêu cầu!");
    }
  };

  if (selectedReq) {
    return (
      <div className="space-y-6 duration-300 animate-in slide-in-from-bottom-4">
        <button
          onClick={() => setSelectedReq(null)}
          className="flex items-center gap-2 font-medium text-gray-500 transition hover:text-gray-800"
        >
          <ChevronLeft size={20} /> Quay lại
        </button>

        <div className="max-w-3xl p-8 bg-white border border-blue-100 shadow-xl rounded-2xl">
          <h2 className="flex items-center gap-2 mb-8 text-2xl font-bold text-gray-800">
            <ClipboardCheck className="text-blue-600" /> Chi tiết đơn đăng ký
          </h2>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6 pb-6 border-b">
              <p className="text-sm">
                <span className="block mb-1 text-xs font-bold text-gray-400 uppercase">
                  Họ tên
                </span>{" "}
                <b className="text-lg">{selectedReq.fullName}</b>
              </p>
              <p className="text-sm">
                <span className="block mb-1 text-xs font-bold text-gray-400 uppercase">
                  Username
                </span>{" "}
                <b className="text-lg">{selectedReq.username}</b>
              </p>
              <p className="text-sm">
                <span className="block mb-1 text-xs font-bold text-gray-400 uppercase">
                  Ngày sinh
                </span>{" "}
                <b>{selectedReq.dob}</b>
              </p>
              <p className="text-sm">
                <span className="block mb-1 text-xs font-bold text-gray-400 uppercase">
                  Giới tính
                </span>{" "}
                <b>{selectedReq.gender}</b>
              </p>
            </div>

            <div>
              <span className="block mb-2 text-xs font-bold text-gray-400 uppercase">
                Lý do / Kinh nghiệm
              </span>
              <div className="p-4 italic leading-relaxed text-gray-700 border bg-gray-50 rounded-xl">
                "{selectedReq.description}"
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <button
                onClick={() => handleReview(selectedReq.requestId, "ACCEPT")}
                className="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition bg-green-600 shadow-lg rounded-xl hover:bg-green-700"
              >
                <Check size={20} /> Chấp nhận
              </button>
              <button
                onClick={() => handleReview(selectedReq.requestId, "REJECT")}
                className="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition bg-red-500 shadow-lg rounded-xl hover:bg-red-600"
              >
                <X size={20} /> Từ chối
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          Yêu cầu làm Tác giả
        </h1>
        <div className="relative text-sm w-80">
          <input
            type="text"
            placeholder="Tìm theo tên..."
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

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <p className="py-10 font-bold text-center text-gray-400 col-span-full animate-pulse">
            Đang tải danh sách chờ...
          </p>
        ) : requests.length === 0 ? (
          <p className="py-10 italic font-bold text-center text-gray-500 col-span-full">
            Hiện không có yêu cầu nào đang chờ duyệt.
          </p>
        ) : (
          requests.map((req) => (
            <div
              key={req.requestId}
              className="p-6 transition bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-md group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center justify-center w-12 h-12 text-xl font-bold text-blue-600 rounded-full bg-blue-50">
                  <img src={req.avatar} className="rounded-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 truncate">
                    {req.fullName}
                  </h3>
                  <p className="text-xs text-gray-500 truncate">{req.email}</p>
                </div>
              </div>
              <div className="mb-6 space-y-2">
                <p className="flex items-center gap-2 text-xs text-gray-600">
                  <Calendar size={14} /> Ngày nộp: {req.createdAt}
                </p>
                <p className="text-sm italic text-gray-700 line-clamp-2">
                  "{req.description}"
                </p>
              </div>
              <button
                onClick={() => setSelectedReq(req)}
                className="flex items-center justify-center w-full gap-2 py-2 text-sm font-bold text-white transition bg-gray-900 rounded-lg hover:bg-blue-600"
              >
                <Info size={16} /> Xem xét đơn
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminAuthorRequests;
