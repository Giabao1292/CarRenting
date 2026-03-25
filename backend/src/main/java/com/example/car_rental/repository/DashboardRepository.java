package com.example.car_rental.repository;

import com.example.car_rental.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface DashboardRepository extends JpaRepository<User, Integer> {

    @Query(value = """
        SELECT COUNT(*)
        FROM users u
        WHERE u.is_deleted = 0
        """, nativeQuery = true)
    Long countTotalUsers();

    @Query(value = """
        SELECT COUNT(*)
        FROM owner_profiles op
        INNER JOIN users u ON u.id = op.user_id
        WHERE op.verification_status = 'APPROVED'
          AND u.is_deleted = 0
        """, nativeQuery = true)
    Long countTotalOwners();

    @Query(value = """
        SELECT COUNT(*)
        FROM vehicles v
        WHERE v.is_deleted = 0
          AND v.status = 'available'
          AND NOT EXISTS (
              SELECT 1
              FROM booking_items bi
              INNER JOIN bookings b ON b.id = bi.booking_id
              WHERE bi.vehicle_id = v.id
                AND b.status IN ('pending', 'active')
                AND GETUTCDATE() BETWEEN b.pickup_at AND b.dropoff_at
          )
          AND NOT EXISTS (
              SELECT 1
              FROM availability_slots av
              WHERE av.vehicle_id = v.id
                AND av.status = 'blocked'
                AND GETUTCDATE() BETWEEN av.start_at AND av.end_at
          )
        """, nativeQuery = true)
    Long countTotalAvailableCars();

    @Query(value = """
        SELECT ISNULL(SUM(p.amount), 0)
        FROM payments p
        WHERE p.status = 'paid'
          AND YEAR(p.created_at) = YEAR(GETUTCDATE())
          AND MONTH(p.created_at) = MONTH(GETUTCDATE())
        """, nativeQuery = true)
    BigDecimal getRevenueThisMonth();

    @Query(value = """
        SELECT TOP 5
            v.id AS vehicleId,
            LTRIM(RTRIM(CONCAT(ISNULL(v.brand, ''), ' ', ISNULL(v.model, '')))) AS vehicleName,
            v.license_plate AS licensePlate,
            ISNULL(u.full_name, '') AS ownerName,
            ISNULL(img.image_url, '') AS imageUrl,
            COUNT(DISTINCT b.id) AS totalBookings,
            ISNULL(SUM(bi.subtotal), 0) AS totalRevenue
        FROM booking_items bi
        INNER JOIN bookings b ON b.id = bi.booking_id
        INNER JOIN vehicles v ON v.id = bi.vehicle_id
        LEFT JOIN users u ON u.id = v.owner_user_id
        OUTER APPLY (
            SELECT TOP 1 vi.image_url
            FROM vehicle_images vi
            WHERE vi.vehicle_id = v.id
            ORDER BY vi.is_primary DESC, vi.created_at ASC
        ) img
        WHERE v.is_deleted = 0
          AND b.status IN ('active', 'completed')
        GROUP BY
            v.id,
            v.brand,
            v.model,
            v.license_plate,
            u.full_name,
            img.image_url
        ORDER BY COUNT(DISTINCT b.id) DESC, ISNULL(SUM(bi.subtotal), 0) DESC
        """, nativeQuery = true)
    List<Object[]> getTop5MostBookedVehicles();
}