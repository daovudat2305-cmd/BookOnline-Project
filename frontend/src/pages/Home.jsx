import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Star,
  Book,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const Home = () => {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const searchKeyword = searchParams.get("search") || "";

  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [isRecLoading, setIsRecLoading] = useState(true);

  const [books, setBooks] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isBooksLoading, setIsBooksLoading] = useState(true);

  useEffect(() => {
    fetchRecommendedBooks();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetchBooks(currentPage, searchKeyword);
    window.scrollTo({ top: 400, behavior: "smooth" });
  }, [currentPage, searchKeyword]);

  const fetchRecommendedBooks = async () => {
    setIsRecLoading(true);
    try {
      const username = localStorage.getItem("username") || "";
      const res = await axios.get(
        `http://localhost:8080/api/books/recommend?username=${username}`,
      );
      setRecommendedBooks(res.data);
    } catch (error) {
      console.error("Lỗi tải sách đề xuất:", error);
    } finally {
      setIsRecLoading(false);
    }
  };

  const fetchBooks = async (page, keyword) => {
    setIsBooksLoading(true);
    try {
      const safeKeyword = encodeURIComponent(keyword);
      const res = await axios.get(
        `http://localhost:8080/api/books/filter?keyword=${safeKeyword}&page=${page}&size=16&sort=latest`,
      );
      setBooks(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error("Lỗi load sách:", error);
      setBooks([]);
    } finally {
      setIsBooksLoading(false);
    }
  };

  const generatePagination = () => {
    const maxVisible = 5;
    let start = Math.max(0, currentPage - Math.floor(maxVisible / 2));
    let end = start + maxVisible - 1;

    if (end >= totalPages) {
      end = totalPages - 1;
      start = Math.max(0, end - maxVisible + 1);
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="w-full">
      <div className="w-full mb-12 relative">
        <h2 className="mb-4 text-2xl font-semibold text-n-800 flex items-center">
          <Star className="mr-2 text-yellow-400 fill-yellow-400" /> Đề xuất
        </h2>

        <div className="p-2 rounded-xl bg-white/30 backdrop-blur-sm">
          {isRecLoading ? (
            <div className="flex gap-4 overflow-hidden">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="flex-1 p-3 bg-white border border-transparent rounded-lg shadow min-w-[200px]"
                >
                  <div className="mb-3 overflow-hidden rounded-md h-56 bg-gray-200 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-2/3 mb-2"></div>
                </div>
              ))}
            </div>
          ) : (
            <Swiper
              modules={[Autoplay, Navigation]}
              slidesPerView={4}
              spaceBetween={20}
              loop={true}
              autoplay={{ delay: 3500, disableOnInteraction: false }}
              navigation={true}
              className="mySwiper !static"
            >
              {recommendedBooks.map((book) => (
                <SwiperSlide key={book.bookId}>
                  <div
                    className="relative flex flex-col w-full h-full p-3 transition bg-white border border-transparent rounded-lg shadow cursor-pointer hover:shadow-xl group hover:border-p-300"
                    onClick={() => navigate(`/book-detail/${book.bookId}`)}
                  >
                    <div className="relative mb-3 overflow-hidden rounded-md">
                      {book.type?.toUpperCase() === "VIP" && (
                        <span className="absolute px-2 py-1 text-[10px] font-bold text-white bg-gradient-to-r from-yellow-500 to-orange-500 rounded shadow z-10 top-2 left-2">
                          VIP
                        </span>
                      )}

                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="object-cover w-full h-56 transition duration-500 group-hover:scale-110"
                      />
                      <div className="absolute bottom-0 left-0 w-full p-2 text-xs font-medium text-white bg-gradient-to-t from-black/70 to-transparent flex items-center gap-1">
                        <Eye size={14} /> {book.viewCount || 0}
                      </div>
                    </div>
                    <h3 className="mb-1 text-sm font-bold line-clamp-2 text-n-800 h-10">
                      {book.title}
                    </h3>
                    <p className="mt-auto text-xs text-gray-500 truncate">
                      {book.authorName || "Ẩn danh"}
                    </p>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-2xl font-semibold text-n-800 flex items-center">
          <Book className="mr-2" /> Sách hay{" "}
          {searchKeyword && (
            <span className="text-sm font-normal ml-2 text-gray-500">
              (Kết quả cho: "{searchKeyword}")
            </span>
          )}
        </h2>

        {isBooksLoading ? (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-72 bg-white/50 animate-pulse rounded-lg shadow"
              ></div>
            ))}
          </div>
        ) : books.length === 0 ? (
          <p className="text-center w-full mt-10 text-gray-500">
            Không tìm thấy cuốn sách nào phù hợp.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {books.map((book) => (
              <div
                key={book.bookId}
                className="cursor-pointer bg-white p-3 rounded-lg shadow hover:shadow-lg transition group relative"
                onClick={() => navigate(`/book-detail/${book.bookId}`)}
              >
                <div className="overflow-hidden rounded-md mb-3 relative">
                  {book.type?.toUpperCase() === "VIP" && (
                    <span className="absolute px-2 py-1 text-[10px] font-bold text-white bg-gradient-to-r from-yellow-500 to-orange-500 rounded shadow z-10 top-2 left-2">
                      VIP
                    </span>
                  )}
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-full h-64 object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
                <h3 className="font-bold text-n-800 text-sm line-clamp-2 mb-1">
                  {book.title}
                </h3>
                <p className="text-xs text-gray-500">
                  {book.authorName || "Ẩn danh"}
                </p>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10 mb-8">
            <button
              disabled={currentPage === 0}
              onClick={() => setCurrentPage(0)}
              className="px-3 py-2 border rounded-lg bg-white disabled:bg-gray-100 disabled:text-gray-400 hover:bg-p-100"
            >
              <ChevronsLeft size={18} />
            </button>

            <button
              disabled={currentPage === 0}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="px-4 py-2 border rounded-lg bg-white disabled:bg-gray-100 disabled:text-gray-400 hover:bg-p-100 flex items-center gap-1"
            >
              <ChevronLeft size={16} /> Trước
            </button>

            {generatePagination().map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-4 py-2 border rounded-lg transition ${
                  pageNum === currentPage
                    ? "bg-p-500 text-white font-bold shadow-md"
                    : "bg-white text-n-800 hover:bg-p-100"
                }`}
              >
                {pageNum + 1}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages - 1}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="px-4 py-2 border rounded-lg bg-white disabled:bg-gray-100 disabled:text-gray-400 hover:bg-p-100 flex items-center gap-1"
            >
              Sau <ChevronRight size={16} />
            </button>

            <button
              disabled={currentPage === totalPages - 1}
              onClick={() => setCurrentPage(totalPages - 1)}
              className="px-3 py-2 border rounded-lg bg-white disabled:bg-gray-100 disabled:text-gray-400 hover:bg-p-100"
            >
              <ChevronsRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
