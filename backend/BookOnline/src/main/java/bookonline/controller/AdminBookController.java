package bookonline.controller;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import bookonline.entity.Book;
import bookonline.service.BookService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/admin/books") 
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AdminBookController {

    private final BookService bookService;
    
    @GetMapping("/pending")
    public ResponseEntity<List<Book>> getPendingBooks() {
        return ResponseEntity.ok(bookService.getPendingBooks());
    }

    
    @GetMapping("/approved")
    public ResponseEntity<List<Book>> getApprovedBooks() {
        return ResponseEntity.ok(bookService.getApprovedBooks());
    }

    
    @PutMapping("/{id}/approve")
    public ResponseEntity<String> approveBook(@PathVariable String id) {
        bookService.approveBook(id);
        return ResponseEntity.ok("Đã duyệt sách thành công!");
    }

    
    @PutMapping("/{id}/reject")
    public ResponseEntity<String> rejectBook(@PathVariable String id, @RequestBody Map<String, String> request) {
        String reason = request.get("reason");
        bookService.rejectBook(id, reason);
        return ResponseEntity.ok("Đã từ chối sách!");
    }

    
    @PutMapping("/{id}/delete")
    public ResponseEntity<String> deleteBook(@PathVariable String id, @RequestBody Map<String, String> request) {
        String reason = request.get("reason");
        bookService.deleteBookWithReason(id, reason); 
        return ResponseEntity.ok("Xóa thành công và đã gửi thông báo tới tác giả!");
    }
    @GetMapping("/filter")
    public ResponseEntity<Page<Book>> adminFilterBooks(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String categories,
            @RequestParam(required = false) Integer status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "newest") String sort) {
        
        return ResponseEntity.ok(bookService.filterBooks(keyword, categories, null, status, page, size, sort));
    }
}