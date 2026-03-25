package com.example.car_rental.repository;

import com.example.car_rental.model.Booking;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Integer> {

    boolean existsByBookingCode(String bookingCode);

    @Query(value = """
            SELECT
                b.id,
                b.booking_code,
                u.full_name,
                u.email,
                pl.name,
                b.pickup_at,
                b.dropoff_at,
                b.total_amount,
                b.status,
                b.created_at
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN locations pl ON b.pickup_location_id = pl.id
            WHERE (:status IS NULL OR b.status = :status)
              AND (:email IS NULL OR u.email LIKE CONCAT('%', :email, '%'))
              AND (:locationId IS NULL OR b.pickup_location_id = :locationId)
              AND (:fromDate IS NULL OR b.pickup_at >= :fromDate)
              AND (:toDate IS NULL OR b.pickup_at <= :toDate)
            ORDER BY b.created_at DESC
            """, countQuery = """
            SELECT COUNT(*)
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            WHERE (:status IS NULL OR b.status = :status)
              AND (:email IS NULL OR u.email LIKE CONCAT('%', :email, '%'))
              AND (:locationId IS NULL OR b.pickup_location_id = :locationId)
              AND (:fromDate IS NULL OR b.pickup_at >= :fromDate)
              AND (:toDate IS NULL OR b.pickup_at <= :toDate)
            """, nativeQuery = true)
    Page<Object[]> searchBookings(
            @Param("status") String status,
            @Param("email") String email,
            @Param("locationId") Integer locationId,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate,
            Pageable pageable);

    @Query(value = """
            SELECT
                b.id,
                b.booking_code,
                b.status,
                b.pickup_at,
                b.dropoff_at,
                b.total_amount,
                b.created_at,

                u.id AS customer_id,
                u.full_name,
                u.email,
                u.phone,
                u.avatar,

                pl.id AS pickup_location_id,
                pl.name AS pickup_location_name,
                pl.address AS pickup_location_address,

                dl.id AS dropoff_location_id,
                dl.name AS dropoff_location_name,
                dl.address AS dropoff_location_address,

                p.id AS payment_id,
                p.amount AS payment_amount,
                p.provider AS payment_provider,
                p.status AS payment_status,
                p.created_at AS payment_created_at,

                bp.promotion_id,
                pr.code AS promotion_code,
                bp.discount_amount
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            LEFT JOIN locations pl ON b.pickup_location_id = pl.id
            LEFT JOIN locations dl ON b.dropoff_location_id = dl.id
            LEFT JOIN payments p ON p.booking_id = b.id
            LEFT JOIN booking_promotions bp ON bp.booking_id = b.id
            LEFT JOIN promotions pr ON pr.id = bp.promotion_id
            WHERE b.id = :bookingId
            """, nativeQuery = true)
    Optional<Object[]> findBookingDetailRaw(@Param("bookingId") Integer bookingId);

    @Query(value = """
            SELECT
                bi.id,
                v.id,
                CONCAT(v.brand, ' ', v.model),
                bi.price_per_unit,
                bi.quantity,
                bi.subtotal
            FROM booking_items bi
            JOIN vehicles v ON bi.vehicle_id = v.id
            WHERE bi.booking_id = :bookingId
            ORDER BY bi.id ASC
            """, nativeQuery = true)
    List<Object[]> findBookingItemsRaw(@Param("bookingId") Integer bookingId);

    @Modifying
    @Transactional
    @Query(value = """
            UPDATE bookings
            SET status = 'completed'
            WHERE id = :bookingId
              AND status <> 'completed'
            """, nativeQuery = true)
    int completeBooking(@Param("bookingId") Integer bookingId);

    @Query(value = """
            SELECT t.time, COUNT(*) AS count_value
            FROM (
                SELECT
                    CASE
                        WHEN :groupBy = 'day' THEN CONVERT(VARCHAR(10), b.created_at, 23)
                        WHEN :groupBy = 'year' THEN CONVERT(VARCHAR(4), YEAR(b.created_at))
                        ELSE CONVERT(VARCHAR(7), b.created_at, 120)
                    END AS time
                FROM bookings b
                WHERE (:fromDate IS NULL OR b.created_at >= :fromDate)
                  AND (:toDate IS NULL OR b.created_at <= :toDate)
            ) t
            GROUP BY t.time
            ORDER BY t.time
            """, nativeQuery = true)
    List<Object[]> getBookingCountStats(
            @Param("groupBy") String groupBy,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate);

    @Query(value = """
            SELECT t.time, COALESCE(SUM(t.total_amount), 0) AS revenue
            FROM (
                SELECT
                    CASE
                        WHEN :groupBy = 'day' THEN CONVERT(VARCHAR(10), b.created_at, 23)
                        WHEN :groupBy = 'year' THEN CONVERT(VARCHAR(4), YEAR(b.created_at))
                        ELSE CONVERT(VARCHAR(7), b.created_at, 120)
                    END AS time,
                    b.total_amount
                FROM bookings b
                WHERE b.status = 'completed'
                  AND (:fromDate IS NULL OR b.created_at >= :fromDate)
                  AND (:toDate IS NULL OR b.created_at <= :toDate)
            ) t
            GROUP BY t.time
            ORDER BY t.time
            """, nativeQuery = true)
    List<Object[]> getRevenueStats(
            @Param("groupBy") String groupBy,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate);

    @Query(value = """
            SELECT
                b.status,
                COUNT(*) AS count_value
            FROM bookings b
            WHERE (:fromDate IS NULL OR b.created_at >= :fromDate)
              AND (:toDate IS NULL OR b.created_at <= :toDate)
            GROUP BY b.status
            ORDER BY b.status
            """, nativeQuery = true)
    List<Object[]> getBookingStatusStats(
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate);

    @Query(value = """
            SELECT
                CONCAT(v.brand, ' ', v.model) AS vehicle_name,
                COUNT(*) AS count_value
            FROM booking_items bi
            JOIN vehicles v ON bi.vehicle_id = v.id
            GROUP BY v.brand, v.model
            ORDER BY count_value DESC
            """, nativeQuery = true)
    List<Object[]> getTopBookedVehicles(Pageable pageable);

    List<Booking> findAllByBookingItemsVehicleOwnerUserEmailAndStatus(String email, String status);
}