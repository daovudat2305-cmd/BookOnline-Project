import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import {
  LogOut,
  User,
  Crown,
  CreditCard,
  PenTool,
  Book,
  List,
  X,
  CheckCircle,
  XCircle,
  Loader2,
  Pen,
} from "lucide-react";

import UserInfoTab from "../components/profile-tabs/UserInfoTab";
import VipTab from "../components/profile-tabs/VipTab";
import RegisterAuthorTab from "@/components/profile-tabs/RegisterAuthorTab";
import PaymentHistoryTab from "@/components/profile-tabs/PaymentHistoryTab";
import PublishBookTab from "@/components/profile-tabs/PublishBookTab";
import AuthorHistoryTab from "@/components/profile-tabs/AuthorHistoryTab";
import logoImg from "../assets/logo.png";

const API_URL = "http://localhost:8080/api";

const Profile = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("jwtToken");

  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      toast.error("Vui lòng đăng nhập!");
      navigate("/login");
      return;
    }
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const res = await axios.get(`${API_URL}/users/myInfo`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(res.data);
    } catch (error) {
      toast.error("Phiên đăng nhập hết hạn!");
      navigate("/login");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !user)
    return (
      <div className="p-10 text-center animate-pulse">Đang tải dữ liệu...</div>
    );

  return (
    <div className="flex min-h-screen bg-gradient-to-t from-p-100 to-white">
      {/* SIDEBAR */}
      <div className="sticky top-0 h-screen p-8 border-r w-80">
        <div className="flex items-center gap-3 mb-8">
          <img src={logoImg} className="w-10 h-10 rounded-lg" />
          <h2 className="text-xl font-bold">Thông tin tài khoản</h2>
        </div>

        <div className="flex flex-col space-y-2">
          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-3 p-3 font-bold transition text-n-800 hover:bg-p-200 hover:cursor-pointer rounded-xl"
          >
            <LogOut size={20} /> Quay lại trang chủ
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-3 p-3 font-bold transition hover:cursor-pointer rounded-xl ${
              activeTab === "profile"
                ? "bg-p-200 text-p-700 shadow-md"
                : "text-n-800 hover:bg-p-100"
            }`}
          >
            <User size={20} /> Thông tin cá nhân
          </button>

          <button
            onClick={() => setActiveTab("vip")}
            className={`flex items-center gap-3 p-3 font-bold transition hover:cursor-pointer rounded-xl ${
              activeTab === "vip"
                ? "bg-p-200 text-p-700 shadow-md"
                : "text-n-800 hover:bg-p-100"
            }`}
          >
            <Crown size={20} /> Đăng ký VIP
          </button>

          <button
            onClick={() => setActiveTab("payment")}
            className={`flex items-center gap-3 p-3 font-bold transition hover:cursor-pointer rounded-xl ${
              activeTab === "payment"
                ? "bg-p-200 text-p-700 shadow-md"
                : "text-n-800 hover:bg-p-100"
            }`}
          >
            <CreditCard size={20} /> Lịch sử thanh toán
          </button>

          {user.role === "USER" && (
            <button
              onClick={() => setActiveTab("register-author")}
              className={`flex items-center gap-3 p-3 font-bold transition hover:cursor-pointer rounded-xl ${
                activeTab === "register-author"
                  ? "bg-p-200 text-p-700 shadow-md"
                  : "text-n-800 hover:bg-p-100"
              }`}
            >
              <PenTool size={20} /> Đăng ký làm tác giả
            </button>
          )}

          {user.role === "AUTHOR" && (
            <>
              <button
                onClick={() => setActiveTab("publish")}
                className={`flex items-center gap-3 p-3 font-bold transition hover:cursor-pointer rounded-xl ${
                  activeTab === "publish"
                    ? "bg-p-200 text-p-700 shadow-md"
                    : "text-n-800 hover:bg-p-100"
                }`}
              >
                <Book size={20} /> Đăng sách
              </button>
              <button
                onClick={() => setActiveTab("author-history")}
                className={`flex items-center gap-3 p-3 font-bold transition hover:cursor-pointer rounded-xl ${
                  activeTab === "author-history"
                    ? "bg-p-200 text-p-700 shadow-md"
                    : "text-n-800 hover:bg-p-100"
                }`}
              >
                <List size={20} /> Lịch sử đăng sách
              </button>
            </>
          )}
        </div>
      </div>

      {/* Nội dung */}
      <div className="flex-1 p-10 overflow-y-auto">
        {activeTab === "profile" && (
          <UserInfoTab user={user} refreshUser={fetchUserInfo} />
        )}

        {activeTab === "vip" && (
          <VipTab user={user} refreshUser={fetchUserInfo} />
        )}

        {activeTab === "payment" && <PaymentHistoryTab />}

        {activeTab === "register-author" && (
          <RegisterAuthorTab user={user} refreshUser={fetchUserInfo} />
        )}

        {activeTab === "publish" && <PublishBookTab />}
        {activeTab === "author-history" && <AuthorHistoryTab />}
      </div>
    </div>
  );
};

export default Profile;
