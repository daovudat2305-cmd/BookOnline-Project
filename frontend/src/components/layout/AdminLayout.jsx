import React, { useEffect } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { toast } from "sonner";
import { Book, Users, ClipboardList, CreditCard, LogOut } from "lucide-react";

import logoImg from "../../assets/logo.png";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("jwtToken");
  const role = localStorage.getItem("role");

  useEffect(() => {
    if (!token || role !== "ADMIN") {
      toast.error("Bạn không có quyền truy cập khu vực này!");
      navigate("/login");
    }
  }, [token, role, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("role");
    localStorage.removeItem("avatar");
    navigate("/login");
  };

  const navItems = [
    { path: "/admin/home", label: "Quản lý Sách", icon: <Book size={20} /> },
    {
      path: "/admin/authors",
      label: "Quản lý Tác giả",
      icon: <Users size={20} />,
    },
    {
      path: "/admin/author-requests",
      label: "Yêu cầu Tác giả",
      icon: <ClipboardList size={20} />,
    },
    {
      path: "/admin/transactions",
      label: "Quản lý Giao dịch",
      icon: <CreditCard size={20} />,
    },
  ];

  if (role !== "ADMIN") return null;

  return (
    <div className="flex min-h-screen bg-gradient-to-t from-p-100 to-white">
      <aside className="sticky top-0 flex flex-col h-screen p-6 text-white bg-gray-900 border-r w-72 shrink-0">
        <div className="flex items-center gap-3 mb-10">
          <img
            src={logoImg}
            className="w-10 h-10 p-1 bg-white rounded-lg"
            alt="Logo"
          />
          <h2 className="text-xl font-bold tracking-wider text-blue-400 uppercase">
            Admin Panel
          </h2>
        </div>

        <nav className="flex flex-col flex-1 gap-2">
          {navItems.map((item) => {
            const isActive = location.pathname.includes(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 p-3 font-medium rounded-xl transition ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                {item.icon} {item.label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 p-3 mt-auto font-medium text-red-400 transition rounded-xl hover:bg-red-500/10"
        >
          <LogOut size={20} /> Đăng xuất
        </button>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="p-10 mx-auto max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
