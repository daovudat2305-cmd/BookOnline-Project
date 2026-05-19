import React from "react";
import { FaFacebook, FaYoutube, FaGithub } from "react-icons/fa";

const Footer = () => {
  return (
    <footer class="mt-16 text-n-800 bg-p-200">
      <div class="flex justify-around gap-8 px-10 py-10">
        <div>
          <h2 class="mb-3 text-xl font-bold">Book Online</h2>
          <p class="text-sm text-n-700">
            Nền tảng đọc sách online miễn phí và VIP. Đọc mọi lúc, mọi nơi.
          </p>
        </div>

        <div>
          <h3 class="mb-3 font-semibold">Liên hệ</h3>
          <p class="text-sm text-n-700">Email: support@book.com</p>
          <p class="text-sm text-n-700">Hotline: 0123 456 789</p>

          <div class="flex gap-4 mt-3 text-lg">
            <FaFacebook class="cursor-pointer hover:text-blue-500" />
            <FaYoutube class="cursor-pointer hover:text-red-500" />
            <FaGithub class="cursor-pointer hover:text-white" />
          </div>
        </div>
      </div>

      <div class="py-4 text-sm text-center text-gray-500 border-t border-gray-700">
        © 2026 Book Online. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
