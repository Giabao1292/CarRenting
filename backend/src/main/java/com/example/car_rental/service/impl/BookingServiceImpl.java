package com.example.car_rental.service.impl;

import com.example.car_rental.dto.response.*;
import com.example.car_rental.model.Booking;
import com.example.car_rental.model.User;
import com.example.car_rental.model.Vehicle;
import com.example.car_rental.model.VehicleImage;
import com.example.car_rental.repository.BookingRepository;
import com.example.car_rental.repository.UserRepository;
import com.example.car_rental.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

        private final BookingRepository bookingRepository;
        private final UserRepository userRepository;

        @Override
        public Page<AdminBookingResponse> getBookings(
                        String status,
                        String email,
                        Integer locationId,
                        LocalDate fromDate,
                        LocalDate toDate,
                        int page,
                        int size) {
                int pageNo = Math.max(page - 1, 0);
                Pageable pageable = PageRequest.of(pageNo, size);

                LocalDateTime from = fromDate != null ? fromDate.atStartOfDay() : null;
                LocalDateTime to = toDate != null ? toDate.atTime(23, 59, 59) : null;

                Page<Object[]> raw = bookingRepository.searchBookings(
                                status, email, locationId, from, to, pageable);

                return raw.map(obj -> AdminBookingResponse.builder()
                                .id(toInteger(obj[0]))
                                .bookingCode(toStringValue(obj[1]))
                                .customerName(toStringValue(obj[2]))
                                .customerEmail(toStringValue(obj[3]))
                                .pickupLocation(toStringValue(obj[4]))
                                .pickupAt(toLocalDateTime(obj[5]))
                                .dropoffAt(toLocalDateTime(obj[6]))
                                .totalAmount(toBigDecimal(obj[7]))
                                .status(toStringValue(obj[8]))
                                .createdAt(toLocalDateTime(obj[9]))
                                .build());
        }

        @Override
        public AdminBookingDetailResponse getBookingDetail(Integer id) {
                Object[] raw = bookingRepository.findBookingDetailRaw(id)
                                .orElseThrow(() -> new RuntimeException("Booking not found"));

                // unwrap nếu bị lồng Object[] bên trong Object[]
                if (raw.length == 1 && raw[0] instanceof Object[]) {
                        raw = (Object[]) raw[0];
                }

                List<Object[]> itemRows = bookingRepository.findBookingItemsRaw(id);

                List<AdminBookingDetailResponse.BookingItemInfo> items = itemRows.stream()
                                .map(item -> AdminBookingDetailResponse.BookingItemInfo.builder()
                                                .bookingItemId(toInteger(item[0]))
                                                .vehicleId(toInteger(item[1]))
                                                .vehicleName(toStringValue(item[2]))
                                                .pricePerDay(toBigDecimal(item[3]))
                                                .quantity(toInteger(item[4]))
                                                .subtotal(toBigDecimal(item[5]))
                                                .build())
                                .toList();

                AdminBookingDetailResponse.PaymentInfo payment = null;
                if (raw.length > 18 && raw[18] != null) {
                        payment = AdminBookingDetailResponse.PaymentInfo.builder()
                                        .id(toInteger(raw[18]))
                                        .amount(toBigDecimal(raw[19]))
                                        .method(toStringValue(raw[20]))
                                        .status(toStringValue(raw[21]))
                                        .paidAt(toLocalDateTime(raw[22]))
                                        .build();
                }

                AdminBookingDetailResponse.PromotionInfo promotion = null;
                if (raw.length > 23 && raw[23] != null) {
                        promotion = AdminBookingDetailResponse.PromotionInfo.builder()
                                        .id(toInteger(raw[23]))
                                        .code(toStringValue(raw[24]))
                                        .discountAmount(toBigDecimal(raw[25]))
                                        .build();
                }

                return AdminBookingDetailResponse.builder()
                                .id(toInteger(raw[0]))
                                .bookingCode(toStringValue(raw[1]))
                                .status(toStringValue(raw[2]))
                                .pickupAt(toLocalDateTime(raw[3]))
                                .dropoffAt(toLocalDateTime(raw[4]))
                                .totalAmount(toBigDecimal(raw[5]))
                                .createdAt(toLocalDateTime(raw[6]))
                                .customer(AdminBookingDetailResponse.CustomerInfo.builder()
                                                .id(toInteger(raw[7]))
                                                .fullName(toStringValue(raw[8]))
                                                .email(toStringValue(raw[9]))
                                                .phone(toStringValue(raw[10]))
                                                .avatar(toStringValue(raw[11]))
                                                .build())
                                .pickupLocation(AdminBookingDetailResponse.LocationInfo.builder()
                                                .id(toInteger(raw[12]))
                                                .name(toStringValue(raw[13]))
                                                .address(toStringValue(raw[14]))
                                                .build())
                                .dropoffLocation(AdminBookingDetailResponse.LocationInfo.builder()
                                                .id(toInteger(raw[15]))
                                                .name(toStringValue(raw[16]))
                                                .address(toStringValue(raw[17]))
                                                .build())
                                .items(items)
                                .payment(payment)
                                .promotion(promotion)
                                .build();
        }

        @Override
        @Transactional
        public void completeBooking(Integer id) {
                int updated = bookingRepository.completeBooking(id);
                if (updated == 0) {
                        throw new RuntimeException("Booking not found or booking is not active");
                }
        }

        @Override
        public List<BookingCountStatsResponse> getBookingCountStats(
                        String groupBy,
                        LocalDate fromDate,
                        LocalDate toDate) {
                String finalGroupBy = normalizeGroupBy(groupBy);
                LocalDateTime from = fromDate != null ? fromDate.atStartOfDay() : null;
                LocalDateTime to = toDate != null ? toDate.atTime(23, 59, 59) : null;

                return bookingRepository.getBookingCountStats(finalGroupBy, from, to)
                                .stream()
                                .map(obj -> new BookingCountStatsResponse(
                                                toStringValue(obj[0]),
                                                toLong(obj[1])))
                                .toList();
        }

        @Override
        public List<BookingRevenueStatsResponse> getRevenueStats(
                        String groupBy,
                        LocalDate fromDate,
                        LocalDate toDate) {
                String finalGroupBy = normalizeGroupBy(groupBy);
                LocalDateTime from = fromDate != null ? fromDate.atStartOfDay() : null;
                LocalDateTime to = toDate != null ? toDate.atTime(23, 59, 59) : null;

                return bookingRepository.getRevenueStats(finalGroupBy, from, to)
                                .stream()
                                .map(obj -> new BookingRevenueStatsResponse(
                                                toStringValue(obj[0]),
                                                toBigDecimal(obj[1])))
                                .toList();
        }

        @Override
        public List<BookingStatusStatsResponse> getBookingStatusStats(
                        LocalDate fromDate,
                        LocalDate toDate) {
                LocalDateTime from = fromDate != null ? fromDate.atStartOfDay() : null;
                LocalDateTime to = toDate != null ? toDate.atTime(23, 59, 59) : null;

                return bookingRepository.getBookingStatusStats(from, to)
                                .stream()
                                .map(obj -> new BookingStatusStatsResponse(
                                                toStringValue(obj[0]),
                                                toLong(obj[1])))
                                .toList();
        }

        @Override
        public List<TopBookedVehicleResponse> getTopBookedVehicles(int limit) {
                Pageable pageable = PageRequest.of(0, limit);
                return bookingRepository.getTopBookedVehicles(pageable)
                                .stream()
                                .map(obj -> new TopBookedVehicleResponse(
                                                toStringValue(obj[0]),
                                                toLong(obj[1])))
                                .toList();
        }

        private String normalizeGroupBy(String groupBy) {
                if (groupBy == null || groupBy.isBlank()) {
                        return "month";
                }
                String value = groupBy.toLowerCase();
                if (!value.equals("day") && !value.equals("month") && !value.equals("year")) {
                        return "month";
                }
                return value;
        }

        private Integer toInteger(Object value) {
                if (value == null)
                        return null;
                return ((Number) value).intValue();
        }

        private Long toLong(Object value) {
                if (value == null)
                        return 0L;
                return ((Number) value).longValue();
        }

        private BigDecimal toBigDecimal(Object value) {
                if (value == null)
                        return BigDecimal.ZERO;
                if (value instanceof BigDecimal bigDecimal)
                        return bigDecimal;
                return new BigDecimal(value.toString());
        }

        private String toStringValue(Object value) {
                return value == null ? null : value.toString();
        }

        private LocalDateTime toLocalDateTime(Object value) {
                if (value == null)
                        return null;
                if (value instanceof LocalDateTime localDateTime)
                        return localDateTime;
                if (value instanceof Timestamp timestamp)
                        return timestamp.toLocalDateTime();
                return LocalDateTime.parse(value.toString().replace(" ", "T"));
        }

        @Override
        public List<OwnerBookingRequestResponse> getBookingRequest(String userEmail) {
                List<Booking> bookings = bookingRepository
                                .findAllByBookingItemsVehicleOwnerUserEmailAndStatus(userEmail, "pending");
                return bookings.stream().flatMap(booking -> booking.getBookingItems().stream()
                                .map(item -> {
                                        Vehicle vehicle = item.getVehicle();
                                        String imageUrl = vehicle.getVehicleImages()
                                                        .stream()
                                                        .filter(VehicleImage::getIsPrimary)
                                                        .findFirst()
                                                        .map(VehicleImage::getImageUrl)
                                                        .orElse(null);
                                        return OwnerBookingRequestResponse.builder()
                                                        .bookingId(booking.getId())
                                                        .pickupAt(LocalDateTime.ofInstant(booking.getPickupAt(),
                                                                        ZoneId.systemDefault()))
                                                        .dropoffAt(LocalDateTime.ofInstant(booking.getDropoffAt(),
                                                                        ZoneId.systemDefault()))
                                                        .totalAmount(booking.getTotalAmount())
                                                        .status(booking.getStatus())
                                                        .vehicleName(vehicle.getBrand() + " " + vehicle.getModel())
                                                        .imageUrl(imageUrl).customerEmail(booking.getUser().getEmail())
                                                        .build();
                                })).toList();
        }

        @Override
        public List<MyTripResponse> getMyTrips(String userEmail) {
                User user = userRepository.findUserByEmail(userEmail)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                List<Object[]> rows = bookingRepository.findMyTripsRaw(user.getId());
                return rows.stream()
                                .map(row -> MyTripResponse.builder()
                                                .bookingId(toInteger(row[0]))
                                                .bookingCode(toStringValue(row[1]))
                                                .status(toStringValue(row[2]))
                                                .pickupAt(toLocalDateTime(row[3]))
                                                .dropoffAt(toLocalDateTime(row[4]))
                                                .createdAt(toLocalDateTime(row[5]))
                                                .totalAmount(toBigDecimal(row[6]))
                                                .currency(toStringValue(row[7]))
                                                .vehicleId(toInteger(row[8]))
                                                .vehicleName(normalizeWhitespace(toStringValue(row[9])))
                                                .vehicleImageUrl(toStringValue(row[10]))
                                                .ownerPhone(toStringValue(row[11]))
                                                .pickupLocation(toStringValue(row[12]))
                                                .build())
                                .toList();
        }

        private String normalizeWhitespace(String value) {
                if (value == null) {
                        return null;
                }
                return value.trim().replaceAll("\\s+", " ");
        }
}