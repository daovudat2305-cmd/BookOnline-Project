import React, { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { BookPlus, FileText, Image as ImageIcon } from "lucide-react";

const API_URL = "http://localhost:8080/api";

const CATEGORY_LIST = [
  { id: "1", name: "Tiên hiệp" },
  { id: "2", name: "Kiếm hiệp" },
  { id: "3", name: "Hành động" },
  { id: "4", name: "Ngôn tình" },
  { id: "5", name: "Trinh thám" },
  { id: "6", name: "Kinh dị" },
  { id: "7", name: "Linh dị" },
  { id: "8", name: "Viễn tưởng" },
  { id: "9", name: "Học đường" },
  { id: "10", name: "Hài hước" },
  { id: "11", name: "Lịch sử" },
  { id: "12", name: "Thể thao" },
];

const PublishBookTab = () => {
  const token = localStorage.getItem("jwtToken");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "FREE",
  });

  const [categoryIds, setCategoryIds] = useState([]);
  const [coverFile, setCoverFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);

  const [totalPages, setTotalPages] = useState("");
  const [isCounting, setIsCounting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCategoryChange = (id) => {
    setCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    setPdfFile(file);

    if (file && file.type === "application/pdf") {
      setTotalPages("Đang đếm số trang...");
      setIsCounting(true);

      const reader = new FileReader();
      reader.onload = function (evt) {
        const typedarray = new Uint8Array(evt.target.result);
        if (window.pdfjsLib) {
          window.pdfjsLib
            .getDocument(typedarray)
            .promise.then((pdf) => {
              setTotalPages(pdf.numPages);
              setIsCounting(false);
            })
            .catch((err) => {
              toast.error("Lỗi đọc PDF, vui lòng tự nhập số trang.");
              setTotalPages("");
              setIsCounting(false);
            });
        } else {
          // Đề phòng trường hợp chưa nạp thư viện ở index.html
          setTotalPages("");
          setIsCounting(false);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isCounting) return toast.info("Đang xử lý file PDF, vui lòng chờ...");
    if (categoryIds.length === 0)
      return toast.warning("Vui lòng chọn ít nhất 1 thể loại!");
    if (!coverFile || !pdfFile)
      return toast.warning("Vui lòng đính kèm Bìa sách và File sách (PDF)!");

    setIsSubmitting(true);
    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("totalPages", totalPages);
    data.append("type", formData.type);
    data.append("coverImage", coverFile);
    data.append("pdfFile", pdfFile);

    categoryIds.forEach((id) => data.append("categoryIds", id));

    try {
      const res = await axios.post(`${API_URL}/author/books/create`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("🎉 Đăng sách thành công!");

      setFormData({ title: "", description: "", type: "FREE" });
      setCategoryIds([]);
      setCoverFile(null);
      setPdfFile(null);
      setTotalPages("");

      document.getElementById("coverImage").value = "";
      document.getElementById("pdfFile").value = "";
    } catch (error) {
      toast.error(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Lỗi khi đăng sách!",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 bg-white border border-gray-100 shadow-sm rounded-2xl">
      <h2 className="flex items-center gap-2 mb-6 text-2xl font-bold text-p-700">
        <BookPlus /> Đăng sách mới
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-1 text-sm font-medium text-n-700">
            Tiêu đề sách
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
            placeholder="Nhập tiêu đề..."
            className="text-sm w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-p-300 outline-none"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-n-700">
            Mô tả tóm tắt
          </label>
          <textarea
            rows="3"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            required
            placeholder="Mô tả nội dung sách..."
            className="text-sm w-full p-3 bg-white border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-p-300 outline-none"
          ></textarea>
        </div>

        <div className="grid gap-6 grid-cols-3">
          <div className="col-span-1">
            <label className="block mb-1 text-sm font-medium text-n-700">
              Số trang
            </label>
            <input
              type="text"
              value={totalPages}
              onChange={(e) => setTotalPages(e.target.value)}
              disabled={isCounting}
              required
              placeholder="Nhập số trang..."
              className="text-xs w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-p-300 outline-none disabled:bg-gray-100"
            />
          </div>

          <div className="col-span-1">
            <label className="block mb-1 text-sm font-medium text-n-700 flex items-center gap-1">
              <FileText size={16} /> File sách (PDF)
            </label>
            <input
              id="pdfFile"
              type="file"
              accept=".pdf"
              onChange={handlePdfChange}
              required
              className="text-xs w-full p-2 bg-white border border-gray-300 rounded-lg outline-none file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
          </div>

          <div className="col-span-1">
            <label className="block mb-1 text-sm font-medium text-n-700 flex items-center gap-1">
              <ImageIcon size={16} /> Bìa sách (Ảnh)
            </label>
            <input
              id="coverImage"
              type="file"
              accept="image/*"
              onChange={(e) => setCoverFile(e.target.files[0])}
              required
              className="text-xs w-full p-2 bg-white border border-gray-300 rounded-lg outline-none file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 cursor-pointer"
            />
          </div>
        </div>

        <div className="flex flex-col gap-6 md:flex-row md:gap-12">
          <div className="flex-1">
            <label className="block mb-2 text-sm font-medium text-n-700">
              Thể loại
            </label>
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 max-h-48 overflow-y-auto custom-scrollbar">
              <div className="grid gap-3 grid-cols-3">
                {CATEGORY_LIST.map((cat) => (
                  <label
                    key={cat.id}
                    className="flex items-center space-x-2 text-sm cursor-pointer hover:text-p-600 font-medium"
                  >
                    <input
                      type="checkbox"
                      checked={categoryIds.includes(cat.id)}
                      onChange={() => handleCategoryChange(cat.id)}
                      className="w-4 h-4 rounded text-p-500 focus:ring-p-500 cursor-pointer"
                    />
                    <span>{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full md:w-48">
            <label className="block mb-2 text-sm font-medium text-n-700">
              Loại sách
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              className="text-sm w-full p-2.5 bg-white border border-gray-300 rounded-lg outline-none cursor-pointer focus:ring-2 focus:ring-p-300 font-medium text-n-800"
            >
              <option value="FREE">Miễn phí</option>
              <option value="VIP">Truyện VIP</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || isCounting}
          className="w-full py-3 mt-4 text-sm font-bold text-white transition shadow-lg bg-p-500 hover:bg-p-600 rounded-xl disabled:opacity-70"
        >
          {isSubmitting ? "Đang xử lý..." : "Đăng sách"}
        </button>
      </form>
    </div>
  );
};

export default PublishBookTab;
