package bookonline.repository;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import bookonline.entity.ReadingProgress;

@Repository
public interface ReadingProgressRepository extends JpaRepository<ReadingProgress, String> {
	
    Page<ReadingProgress> findByUser_UserIdOrderByLastTimeReadDesc(String userId, Pageable pageable);

    
    Optional<ReadingProgress> findByUser_UserIdAndBook_BookId(String userId, String bookId);

    @Modifying
    @Transactional
    @Query("UPDATE ReadingProgress r SET r.totalReadingTimeSeconds = coalesce(r.totalReadingTimeSeconds, 0) + :seconds WHERE r.user.userId = :userId AND r.book.bookId = :bookId")
    void incrementReadingTime(@Param("userId") String userId, 
                              @Param("bookId") String bookId, 
                              @Param("seconds") Long seconds);
    
    
    @Modifying
    @Transactional
    @Query("UPDATE ReadingProgress r SET r.lastTimeRead = :now WHERE r.progressId = :id")
    void updateTimeOnly(@Param("id") String id, @Param("now") java.time.LocalDateTime now);

    
    @Modifying
    @Transactional
    @Query("UPDATE ReadingProgress r SET r.lastTimeRead = :now, r.currentPage = :page WHERE r.progressId = :id")
    void updateTimeAndPage(@Param("id") String id, @Param("now") LocalDateTime now, @Param("page") Integer page);
    

    @Modifying
    @Transactional
    @Query(value = "INSERT INTO reading_progress (progressId, userId, bookId, currentPage, isCounted, lastTimeRead, total_reading_time_seconds) VALUES (:id, :userId, :bookId, :page, 0, :now, 0)", nativeQuery = true)
    void insertNewProgress(
            @Param("id") String id, 
            @Param("userId") String userId, 
            @Param("bookId") String bookId, 
            @Param("page") Integer page, 
            @Param("now") java.time.LocalDateTime now
    );
}