import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  User,
  List,
  Eye,
  MessageCircle,
  Heart,
  Trophy,
  Flame,
} from "lucide-react";

const Rank = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRanking();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const fetchRanking = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get("http://localhost:8080/api/books/rank");
      setBooks(res.data);
    } catch (error) {
      console.log("Lỗi tải xếp hạng: " + error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankStyle = (index) => {
    if (index === 0)
      return { text: "text-[#FFD700]", border: "border-2 border-[#FFD700]" }; // Top 1 (Vàng)
    if (index === 1)
      return { text: "text-[#9CA3AF]", border: "border-2 border-[#9CA3AF]" }; // Top 2 (Bạc)
    if (index === 2)
      return { text: "text-[#CD7F32]", border: "border-2 border-[#CD7F32]" }; // Top 3 (Đồng)
    return { text: "text-n-700", border: "" }; // Các hạng khác
  };

  return (
    <div>
      <h2 class="flex gap-2 items-center mb-6 text-2xl font-semibold">
        <Flame className="text-red-400 fill-red-400" />
        XẾP HẠNG
      </h2>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex gap-4 p-4 bg-white rounded-2xl shadow animate-pulse h-40"
            ></div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {books.map((book, index) => {
            const rankStyle = getRankStyle(index);

            return (
              <div
                key={book.bookId}
                onClick={() => navigate(`/book-detail/${book.bookId}`)}
                className="flex gap-4 rounded-2xl p-2 hover:bg-p-200 hover:cursor-pointer hover:-translate-y-1 hover:shadow-lg"
              >
                {/* Cột Thứ hạng */}
                <div
                  class={`w-8 flex items-center justify-center text-2xl font-bold ${rankStyle.text}`}
                >
                  <span
                    class={`flex items-center justify-center w-9 h-9 rounded-full ${rankStyle.border}`}
                  >
                    {index + 1}
                  </span>
                </div>

                {/* Cột Ảnh bìa */}
                <div class="relative w-25 overflow-hidden rounded-lg shadow-lg h-35">
                  {book.type?.toUpperCase() === "VIP" && (
                    <span class="absolute px-2 text-[8px] font-bold text-white bg-gradient-to-r from-yellow-500 to-orange-500 rounded shadow z-10 top-1 left-1">
                      VIP
                    </span>
                  )}

                  <img
                    src={`${book.coverImage}`}
                    alt={`${book.title}`}
                    class="object-cover w-full h-full"
                  />
                </div>

                {/* Cột nội dung */}
                <div className="flex flex-col justify-center space-y-2 flex-1">
                  <h3 className="text-lg font-bold text-n-800 line-clamp-1">
                    {book.title}
                  </h3>

                  <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2">
                    <p className="text-sm text-n-700 flex items-start gap-1">
                      <User size={16} className="mt-0.5 text-p-500" />
                      <span>
                        Tác giả:
                        <br />
                        <span className="font-medium">
                          {book.authorName || "Ẩn danh"}
                        </span>
                      </span>
                    </p>
                    <p className="text-sm text-n-700 flex items-start gap-1">
                      <List size={16} className="mt-0.5 text-p-500" />
                      <span>
                        Thể loại:
                        <br />
                        <span className="font-medium line-clamp-1">
                          {book.categories.join(", ") || "Chưa cập nhật"}
                        </span>
                      </span>
                    </p>
                    <p className="text-sm text-n-700 flex items-start gap-1">
                      <Eye size={16} className="mt-0.5 text-p-500" />
                      <span>
                        Lượt đọc:
                        <br />
                        <span className="font-medium">
                          {book.viewCount || 0}
                        </span>
                      </span>
                    </p>
                    <p className="text-sm text-n-700 flex items-start gap-1">
                      <MessageCircle size={16} className="mt-0.5 text-p-500" />
                      <span>
                        Bình luận:
                        <br />
                        <span className="font-medium">
                          {book.commentCount || 0}
                        </span>
                      </span>
                    </p>
                    <p className="text-sm text-n-700 flex items-start gap-1">
                      <Heart size={16} className="mt-0.5 text-red-500" />
                      <span>
                        Lượt thích:
                        <br />
                        <span className="font-medium">
                          {book.favoCount || 0}
                        </span>
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Rank;
