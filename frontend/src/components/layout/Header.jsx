import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Crown } from "lucide-react";
import axios from "axios";

import { Button } from "../ui/button";
import { Input } from "../ui/input";

const Header = () => {
  const navigate = useNavigate();

  const location = useLocation();

  const [isLogin, setIsLogin] = useState(false);
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      setIsLogin(true);
      fetchUserInfo(token);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchUserInfo = async (token) => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/users/myInfo",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setUser(response.data);
      if (response.data.avatar) {
        localStorage.setItem("avatar", response.data.avatar);
      }
    } catch (error) {
      console.error("Lỗi lấy thông tin user:", error);
      // Nếu token hết hạn, tự động đăng xuất
      handleLogout();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("avatar");
    setIsLogin(false);
    setUser(null);

    window.location.reload();
  };

  return (
    <div className="sticky z-50 flex items-center justify-around mb-8 top-4">
      {/* Search */}
      <div className="relative w-1/2">
        <Input
          type="text"
          placeholder="Tìm kiếm sách..."
          className="w-full pl-10 pr-4 py-2 bg-white border rounded-full shadow-md outline-none border-secondary-light"
          onChange={(e) => {
            const keyword = e.target.value;

            const currentPath =
              location.pathname === "/category" ? "/category" : "/home";

            if (keyword.trim() !== "") {
              navigate(`${currentPath}?search=${encodeURIComponent(keyword)}`);
            } else {
              navigate(currentPath);
            }
          }}
        />
        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
      </div>

      {/* Auth / User Menu */}
      {!isLogin ? (
        <div className="flex gap-2">
          <Button
            onClick={() => navigate("/login")}
            className="hover:cursor-pointer"
            variant="outline"
          >
            Đăng nhập
          </Button>
          <Button
            onClick={() => navigate("/register")}
            className="bg-p-500 hover:cursor-pointer hover:bg-p-600"
          >
            Đăng ký
          </Button>
        </div>
      ) : (
        <div className="relative" ref={dropdownRef}>
          <div
            className="flex items-center gap-2 hover:cursor-pointer"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div
              className={`relative rounded-full p-0.5 ${user?.isVip ? "bg-yellow-400" : "bg-n-500"}`}
            >
              <img
                src={user?.avatar}
                alt="Avatar"
                className="w-10 h-10 rounded-full border-2 border-white"
              />
            </div>
            <span className="flex gap-2 text-sm font-semibold text-n-800">
              {user?.username || localStorage.getItem("username")}
              {user?.isVip ? (
                <Crown className="text-yellow-400 font-bold" />
              ) : (
                ""
              )}
            </span>
          </div>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-auto w-40 mt-2 rounded-lg shadow-lg bg-white overflow-hidden border border-gray-100">
              <Link
                to="/profile"
                className="block px-4 py-2 hover:bg-n-100 text-sm"
              >
                Tài khoản
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-n-100 text-sm text-red-600 font-medium"
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Header;
