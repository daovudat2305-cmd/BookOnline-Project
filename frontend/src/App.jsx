import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";

import Login from "./pages/Login";
import Register from "./pages/Register";
import MainLayout from "./components/layout/MainLayout";

import Home from "./pages/Home";
import Category from "./pages/Category";
import Rank from "./pages/Rank";
import History from "./pages/History";
import BookDetail from "./pages/BookDetail";

import Profile from "./pages/Profile";

import AdminLayout from "./components/layout/AdminLayout";
import AdminHome from "./pages/admin/AdminHome";
import AdminApproveBook from "./pages/admin/AdminApproveBook";
import AdminBookDetail from "./pages/admin/AdminBookDetail";
import AdminAuthors from "./pages/admin/AdminAuthors";
import AdminAuthorRequests from "./pages/admin/AdminAuthorRequests";
import AdminTransactions from "./pages/admin/AdminTransactions";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />

      {/* Cấu hình các đường dẫn (Routes) */}
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/profile" element={<Profile />} />

        {/* Các trang dùng chung MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/category" element={<Category />} />
          <Route path="/rank" element={<Rank />} />
          <Route path="/history" element={<History />} />
          <Route path="/book-detail/:id" element={<BookDetail />} />
        </Route>

        {/* Các trang dùng chung AdminLayout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/home" replace />} />
          <Route path="home" element={<AdminHome />} />

          <Route path="approve-book/:id" element={<AdminApproveBook />} />
          <Route path="book-detail/:id" element={<AdminBookDetail />} />

          <Route path="authors" element={<AdminAuthors />} />
          <Route path="author-requests" element={<AdminAuthorRequests />} />
          <Route path="transactions" element={<AdminTransactions />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
