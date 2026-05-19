import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import logoImg from "../assets/logo.svg";

const API_URL = "http://localhost:8080/api/auth";

const Register = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/signup`, {
        email,
        username,
        password,
      });

      toast.success(response.data.message);
      navigate("/login");
    } catch (error) {
      const errMessage =
        error.response?.data?.error || "Có lỗi xảy ra khi đăng ký";
      toast.error(errMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen gap-20 bg-gradient-to-t from-p-200 to-p-50">
      <div>
        <img src={logoImg} alt="logo" className="w-72"></img>
      </div>

      <div className="bg-gradient-to-t from-secondary-light to-p-300 w-[480px] h-auto rounded-lg flex flex-col p-8 shadow-xl">
        <h2 className="mb-8 text-2xl font-semibold text-center text-n-800">
          Đăng ký
        </h2>

        <form onSubmit={handleRegister} className="flex flex-col space-y-6">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="email" className="font-medium text-n-800">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              className="bg-background"
              placeholder="Nhập email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col space-y-2">
            <Label htmlFor="username" className="font-medium text-n-800">
              Tên đăng nhập
            </Label>
            <Input
              id="username"
              type="text"
              className="bg-background"
              placeholder="Nhập tên đăng nhập"
              value={username}
              onChange={(e) => setUsername(e.target.value)} // Cập nhật state khi gõ
              required
            />
          </div>

          <div className="relative flex flex-col space-y-2">
            <Label htmlFor="password" className="font-medium text-n-800">
              Mật khẩu
            </Label>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              className="bg-background"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <span
              className="absolute right-3 top-[32px] cursor-pointer text-gray-500 hover:text-gray-700"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>

          <div className="text-right">
            <span className="text-n-700">Bạn đã có tài khoản? </span>
            <Link
              to="/login"
              className="font-bold text-p-600 hover:underline hover:text-n-50"
            >
              Đăng nhập ngay
            </Link>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="text-black w-full py-2 font-bold transition duration-200 rounded-md bg-background hover:-translate-y-1 hover:shadow-lg hover:cursor-pointer"
          >
            {isLoading ? "Đang xử lý..." : "Đăng ký"}
          </Button>

          <div className="text-right">
            <Link to="/home" className="text-sm font-bold hover:underline">
              Trang chủ
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
