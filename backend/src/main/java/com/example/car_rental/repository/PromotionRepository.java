package com.example.car_rental.repository;

import com.example.car_rental.model.Promotion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PromotionRepository extends JpaRepository<Promotion, Integer> {
    @Query("""
            SELECT p FROM Promotion p
            WHERE p.startAt  <= :now
            AND   p.endAt    >= :now
            AND  (p.usageLimit IS NULL OR p.usageLimit > 0)
            AND  (:username IS NULL OR NOT EXISTS (
                    SELECT 1 FROM BookingPromotion bp
                    JOIN bp.booking b
                    WHERE bp.promotion.id = p.id
                    AND   b.user.email    = :username
                ))
            ORDER BY
                CASE WHEN p.discountType = 'percent' THEN p.discountValue ELSE 0 END DESC,
                p.discountValue DESC
            LIMIT 1
            """)
    Optional<Promotion> findBestPromotion(
            @Param("username") String username,
            @Param("now") LocalDateTime now
    );

    @Query("""
            SELECT p FROM Promotion p
            WHERE p.startAt  <= :now
            AND   p.endAt    >= :now
            AND  (p.usageLimit IS NULL OR p.usageLimit > 0)
            AND  (:username IS NULL OR NOT EXISTS (
                    SELECT 1 FROM BookingPromotion bp
                    JOIN bp.booking b
                    WHERE bp.promotion.id = p.id
                    AND   b.user.email    = :username
                ))
            ORDER BY
                CASE WHEN p.discountType = 'percent' THEN p.discountValue ELSE 0 END DESC,
                p.discountValue DESC
            """)
    List<Promotion> findPromotionsByUserEmail(
            @Param("username") String username,
            @Param("now") LocalDateTime now
    );
    boolean existsByCode(String code);

    boolean existsByCodeAndIdNot(String code, Integer id);

    Page<Promotion> findByCodeContainingIgnoreCase(String code, Pageable pageable);
}
