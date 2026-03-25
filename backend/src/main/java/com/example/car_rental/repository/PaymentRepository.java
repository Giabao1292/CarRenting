package com.example.car_rental.repository;

import com.example.car_rental.model.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Integer> {

    Optional<Payment> findByProviderTxnId(String providerTxnId);

    Optional<Payment> findTopByBooking_IdOrderByCreatedAtDesc(Integer bookingId);

    @EntityGraph(attributePaths = { "booking", "user" })
    @Query("""
                SELECT p
                FROM Payment p
                LEFT JOIN p.booking b
                LEFT JOIN p.user u
                WHERE (:providerTxnId IS NULL OR LOWER(p.providerTxnId) LIKE LOWER(CONCAT('%', :providerTxnId, '%')))
                  AND (:provider IS NULL OR LOWER(p.provider) = LOWER(:provider))
                  AND (:status IS NULL OR LOWER(p.status) = LOWER(:status))
                  AND (:bookingId IS NULL OR b.id = :bookingId)
                  AND (:userId IS NULL OR u.id = :userId)
                  AND (:fromDate IS NULL OR p.createdAt >= :fromDate)
                  AND (:toDate IS NULL OR p.createdAt < :toDate)
            """)
    Page<Payment> searchAdminPayments(
            @Param("providerTxnId") String providerTxnId,
            @Param("provider") String provider,
            @Param("status") String status,
            @Param("bookingId") Integer bookingId,
            @Param("userId") Integer userId,
            @Param("fromDate") Instant fromDate,
            @Param("toDate") Instant toDate,
            Pageable pageable);

    @Query("""
                SELECT COALESCE(SUM(p.amount), 0)
                FROM Payment p
                WHERE LOWER(p.status) = 'paid'
                  AND p.createdAt >= :fromDate
                  AND p.createdAt < :toDate
            """)
    BigDecimal getRevenueBetween(
            @Param("fromDate") Instant fromDate,
            @Param("toDate") Instant toDate);

    @Query(value = """
                SELECT
                    MONTH(p.created_at) AS month,
                    COALESCE(SUM(p.amount), 0) AS revenue
                FROM payments p
                WHERE LOWER(p.status) = 'paid'
                  AND YEAR(p.created_at) = :year
                GROUP BY MONTH(p.created_at)
                ORDER BY MONTH(p.created_at)
            """, nativeQuery = true)
    List<Object[]> getMonthlyRevenue(@Param("year") Integer year);

    @Query(value = """
                SELECT
                    o.id AS owner_id,
                    o.full_name AS owner_name,
                    o.email AS owner_email,
                    COALESCE(SUM(bi.subtotal), 0) AS revenue
                FROM payments p
                JOIN bookings b ON p.booking_id = b.id
                JOIN booking_items bi ON bi.booking_id = b.id
                JOIN vehicles v ON v.id = bi.vehicle_id
                JOIN users o ON o.id = v.owner_user_id
                WHERE LOWER(p.status) = 'paid'
                  AND (:fromDate IS NULL OR p.created_at >= :fromDate)
                  AND (:toDate IS NULL OR p.created_at < :toDate)
                GROUP BY o.id, o.full_name, o.email
                ORDER BY revenue DESC
            """, nativeQuery = true)
    List<Object[]> getOwnerRevenue(
            @Param("fromDate") Instant fromDate,
            @Param("toDate") Instant toDate);
}