package bookonline.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "book")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Book {
    
    @Id
    @Column(name = "bookId", length = 50)
    private String bookId; 

    private String title;

    @Column(columnDefinition = "TEXT") 
    private String description;
    
    @Column(name = "authorId", length = 50)
    private String authorId;
    
    private String type;
    
    private String fileUrl;
    
    private String coverImage;
    
    /**
     * TRẠNG THÁI SÁCH:
     * 0: Đang chờ duyệt (Pending)
     * 1: Đã duyệt - Đang hiển thị (Approved)
     * 2: Bị từ chối duyệt (Rejected)
     * 3: Đã bị Admin xóa (Deleted)
     */
    private Integer status; 
    
    @Column(name = "message", columnDefinition = "TEXT")
    private String message;
    
    private Integer totalPages;
    
    private Integer viewCount;
    
    private LocalDate createdAt;
    
    private String authorName;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "book_category", 
        joinColumns = @JoinColumn(name = "bookId"), 
        inverseJoinColumns = @JoinColumn(name = "categoryId") 
    )
    private List<Category> categories;
}