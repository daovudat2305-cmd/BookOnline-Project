import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";

const MainLayout = () => {
  return (
    <div className="flex min-h-screen bg-gradient-to-t from-p-100 to-p-50">
      <Sidebar />

      <div className="flex flex-col w-full">
        <main className="flex-1 p-6 ml-50 max-w-7xl">
          <Header />

          {/* Outlet là nơi mà các trang (Category, Rank, History) sẽ được render ra */}
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
