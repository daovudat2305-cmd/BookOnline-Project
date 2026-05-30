package bookonline.service;


import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import bookonline.dto.response.BookRankResponse;
import bookonline.entity.Book;
import bookonline.entity.BookEarning;
import bookonline.entity.User;
import bookonline.repository.BookEarningRepository;
import bookonline.repository.BookRepository;
import bookonline.repository.CommentRepository;
import bookonline.repository.FavoriteRepository;
import bookonline.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;
    private final CloudinaryService cloudinaryService;
    @Autowired private CommentRepository commentRepository;
    @Autowired private FavoriteRepository favoriteRepository;
    @Autowired private BookEarningRepository bookEarningRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private RecommendationService recommendationService;
    
    
    public List<Book> getPendingBooks() {
        return bookRepository.findByStatus(0);
    }

    
    public List<Book> getApprovedBooks() {
        return bookRepository.findByStatus(1);
    }

    
    public Book approveBook(String bookId) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sách có ID: " + bookId));
        
        book.setStatus(1);
        book.setMessage(null);
        
        if(book.getType().equalsIgnoreCase("VIP")) {
        	BookEarning bookEarning = BookEarning.builder()
        			.authorId(book.getAuthorId())
        			.bookId(bookId)
        			.amount(10000)
        			.status("UNPAID")
        			.build();
        	bookEarningRepository.save(bookEarning);
        }
        
        return bookRepository.save(book);
    }

    
    public Book rejectBook(String bookId, String reason) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sách có ID: " + bookId));
        
        book.setStatus(2);
        book.setMessage(reason);
        return bookRepository.save(book);
    }

    
    @Transactional 
    public Book createBook(String title, String description, String authorId, String authorName, 
                           String type, Integer totalPages, 
                           MultipartFile coverFile, MultipartFile pdfFile,
                           List<Integer> categoryIds) throws IOException { 
        
        String coverUrl = cloudinaryService.uploadImage(coverFile);
        String pdfUrl = cloudinaryService.uploadPdf(pdfFile);
        
        String newBookId = UUID.randomUUID().toString();
        
        Book newBook = Book.builder()
                .bookId(newBookId)
                .title(title)
                .description(description)
                .authorId(authorId)
                .authorName(authorName)
                .type(type)
                .fileUrl(pdfUrl) 
                .coverImage(coverUrl) 
                .status(0)
                .totalPages(totalPages)
                .viewCount(0) 
                .createdAt(LocalDate.now()) 
                .build();
                
        Book savedBook = bookRepository.save(newBook);

        if (categoryIds != null && !categoryIds.isEmpty()) {
            for (Integer catId : categoryIds) {
                bookRepository.insertBookCategory(newBookId, catId);
            }
        }
        
        return savedBook;
    }
    
    
    public void deleteBookWithReason(String bookId, String reason) {
        try {
            Book book = bookRepository.findById(bookId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy sách có ID: " + bookId));
            
            book.setStatus(3);
            book.setMessage(reason);
            bookRepository.save(book);
            
        } catch (Exception e) {
            System.err.println("========== LỖI KHI XÓA SÁCH ==========");
            e.printStackTrace(); 
            throw new RuntimeException("Lỗi khi xóa: " + e.getMessage());
        }
    }

    
    public List<Book> getBooksByAuthorId(String authorId) {
        return bookRepository.findByAuthorId(authorId);
    }
    
    public Book getBookById(String bookId) {
        return bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cuốn sách có ID: " + bookId));
    }

    
    public Page<Book> filterBooks(String keyword, String categories, String type, Integer status, int page, int size, String sort) {
    	
    	Sort sortOrder = Sort.by(Sort.Direction.DESC, "createdAt")
    	        .and(Sort.by(Sort.Direction.DESC, "bookId")); 

    	if ("oldest".equalsIgnoreCase(sort)) {
    	    sortOrder = Sort.by(Sort.Direction.ASC, "createdAt")
    	            .and(Sort.by(Sort.Direction.ASC, "bookId"));
    	}

        Pageable pageable = PageRequest.of(page, size, sortOrder);

       	
        List<Integer> categoryIdList = null;
        if (categories != null && !categories.trim().isEmpty()) {
            categoryIdList = new ArrayList<>();
            String[] catArray = categories.split(",");
            for (String cat : catArray) {
                try {
                    categoryIdList.add(Integer.parseInt(cat.trim()));
                } catch (NumberFormatException e) {
                    
                }
            }
            if (categoryIdList.isEmpty()) categoryIdList = null; 
        }

        
        if (keyword != null && keyword.trim().isEmpty()) keyword = null;
        if (type != null && (type.trim().isEmpty() || type.equalsIgnoreCase("ALL"))) type = null;

        
        return bookRepository.filterBooks(keyword, categoryIdList, type, status, pageable);
    }
    
    //xếp hạng 10 quyển sách rating cao nhất
    public List<BookRankResponse> findTop10Books() {
    	List<Book> listBooks = bookRepository.findTop10BooksSortedByRating();
    	
    	List<BookRankResponse> response = new ArrayList<>(); 
    	
    	for(Book book : listBooks) {
    		long commentCount = commentRepository.countByBookId(book.getBookId());
    		long favoCount = favoriteRepository.countByBookId(book.getBookId());
    		List<String> categories = bookRepository.findCategoryNamesByBookId(book.getBookId());
    		BookRankResponse item = BookRankResponse.builder()
    				.bookId(book.getBookId())
    				.title(book.getTitle())
    				.authorName(book.getAuthorName())
    				.type(book.getType())
    				.coverImage(book.getCoverImage())
    				.viewCount(book.getViewCount())
    				.commentCount(commentCount)
    				.favoCount(favoCount)
    				.categories(categories)
    				.build();
    		response.add(item);
    				
    	}
    	
    	return response;
    }
    
    
    public List<Book> getBookByAuthorName(String authorName) {
    	return bookRepository.findByAuthorNameAndStatus(authorName, 1);
    }
    
    // đề xuất sách
    @Cacheable(value = "userRecommendations", key = "#username", unless = "#result.size() == 0")
    public List<Book> getRecommendBooks(String username) {
        return generateRecommendationsBypassCache(username);
    }
    
    public List<Book> generateRecommendationsBypassCache(String username) {
        if (username == null || username.trim().isEmpty()) {
            return bookRepository.findTop10BooksSortedByRating();
        }
        User user = userRepository.findByUsername(username);
        if (user == null) {
            return bookRepository.findTop10BooksSortedByRating();
        }
        
        String userId = user.getUserId();
        
        List<String> readDeeplyIds = bookRepository.findBookIdsReadDeeplyIn30Days(userId);
        List<String> readShallowlyIds = bookRepository.findBookIdsReadShallowlyIn30Days(userId);
        List<String> favIds = bookRepository.findBookIdsFavoritedIn30Days(userId);
        List<String> cmtIds = bookRepository.findBookIdsCommentedIn30Days(userId);
        
        if (readDeeplyIds.isEmpty() && readShallowlyIds.isEmpty() && favIds.isEmpty() && cmtIds.isEmpty()) {
            return bookRepository.findTop10BooksSortedByRating();
        }
        
        List<Book> candidateBooks = bookRepository.findCandidateBooks(userId);
        
        if (candidateBooks.isEmpty()) {
            return bookRepository.findTop10BooksSortedByRating();
        }

        // lấy thông tin sách
        List<Book> favBooks = bookRepository.findAllById(favIds);
        List<Book> deepReadBooks = bookRepository.findAllById(readDeeplyIds);
        List<Book> shallowReadBooks = bookRepository.findAllById(readShallowlyIds);
        List<Book> cmtBooks = bookRepository.findAllById(cmtIds);

        // gọi GROQ AI
        List<String> aiRecommendedIds = recommendationService.getAiRecommendedBookIds(
                favBooks, deepReadBooks, shallowReadBooks, cmtBooks, candidateBooks
        );

        // xử lý kết quả tra về
        if (aiRecommendedIds != null && !aiRecommendedIds.isEmpty()) {
            List<Book> finalBooks = bookRepository.findAllById(aiRecommendedIds);
            
            return aiRecommendedIds.stream()
                    .map(id -> finalBooks.stream()
                               .filter(b -> b.getBookId().equals(id))
                               .findFirst().orElse(null))
                    .filter(Objects::nonNull)
                    .toList();
        }

        System.out.println("Groq AI không trả về kết quả, dùng fallback SQL.");
        return candidateBooks.stream().limit(10).toList();
    }
    
}