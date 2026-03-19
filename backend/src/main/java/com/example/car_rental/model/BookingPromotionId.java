package com.example.car_rental.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.Hibernate;

import java.util.Objects;

@Getter
@Setter
@Embeddable
public class BookingPromotionId implements java.io.Serializable {
    private static final long serialVersionUID = 6008790458326404263L;
    @NotNull
    @Column(name = "booking_id", nullable = false)
    private Integer bookingId;

    @NotNull
    @Column(name = "promotion_id", nullable = false)
    private Integer promotionId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        BookingPromotionId entity = (BookingPromotionId) o;
        return Objects.equals(this.bookingId, entity.bookingId) &&
                Objects.equals(this.promotionId, entity.promotionId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(bookingId, promotionId);
    }

}