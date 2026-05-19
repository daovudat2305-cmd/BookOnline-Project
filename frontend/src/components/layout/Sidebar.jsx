import React from "react";
import { NavLink } from "react-router-dom";
import { Home, Layers, Trophy, Clock } from "lucide-react";
import logoImg from "../../assets/logo.png";

const Sidebar = () => {
  const menuItems = [
    { path: "/home", icon: <Home size={20} />, label: "Trang chủ" },
    { path: "/category", icon: <Layers size={20} />, label: "Thể loại" },
    { path: "/rank", icon: <Trophy size={20} />, label: "Xếp hạng" },
    { path: "/history", icon: <Clock size={20} />, label: "Lịch sử đọc" },
  ];

  return (
    <aside className="fixed flex flex-col items-center p-2 m-auto ml-4 -translate-y-1/2 shadow-md w-fit h-fit bg-p-300 rounded-2xl top-1/2 left-4 z-50">
      <div className="mt-6 mb-6">
        <img src={logoImg} alt="Logo" className="w-10 h-10 rounded-full" />
      </div>

      <nav className="flex flex-col gap-6">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `home-btn ${isActive ? "home-btn-active" : ""}`
            }
          >
            <span className="text-center w-5">{item.icon}</span>
            <span className="font-medium home-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
