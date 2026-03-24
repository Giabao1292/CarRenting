package com.example.car_rental.repository.impl;

import com.example.car_rental.model.*;
import com.example.car_rental.repository.SearchCriteriaRepository;
import com.example.car_rental.repository.criteria.BaseSearchCriteria;
import jakarta.persistence.criteria.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Repository
public class SearchCriteriaRepositoryImpl extends BaseSearchCriteria implements SearchCriteriaRepository {
    @Override
    public Page<Vehicle> searchVehicles(Pageable pageable,LocalDateTime pickupAt, LocalDateTime dropoffAt, String... search) {
        log.info("Start Search Vehicles...");
        return executSearch(
                Vehicle.class, pageable,
                root -> {
                    root.fetch("type", JoinType.LEFT);
                    root.fetch("defaultLocation", JoinType.LEFT);
                },
                (root, query, cb) -> {
                    Join<Vehicle, VehicleType> joinType = root.join("type", JoinType.LEFT);
                    Join<Vehicle, VehicleFeature> joinFeature = root.join("vehicleFeatures", JoinType.LEFT);
                    Join<Vehicle, AvailabilitySlot> joinAvailability = root.join("availabilitySlots", JoinType.LEFT);
                    Join<Vehicle, Location> joinLocation = root.join("defaultLocation", JoinType.LEFT);
                    Join<User, OwnerProfile> joinOwnerProfile = root.join("ownerUser", JoinType.LEFT)
                            .join("ownerProfile", JoinType.LEFT);
                    Predicate searchPredicate = getSearchPredicate(
                            List.of(root, joinType, joinFeature, joinAvailability, joinLocation, joinOwnerProfile),
                            cb, search
                    );
                    Predicate availPredicate = buildAvailabilityPredicate(root, query, cb, pickupAt, dropoffAt);
                    return cb.and(searchPredicate, availPredicate);
                },
                search
        );
    }

    protected <T> Predicate buildAvailabilityPredicate(Root<T> root,
                                                       AbstractQuery<?> query,
                                                       CriteriaBuilder cb,
                                                       LocalDateTime pickupAt,
                                                       LocalDateTime dropoffAt) {
        if (pickupAt == null || dropoffAt == null) return cb.conjunction();
        Subquery<Integer> sub = query.subquery(Integer.class);
        Root<AvailabilitySlot> slotRoot = sub.from(AvailabilitySlot.class);
        sub.select(slotRoot.get("vehicle").get("id"))
                .where(cb.and(
                        cb.equal(slotRoot.get("vehicle").get("id"), root.get("id")),  // cùng xe
                        cb.lessThan(slotRoot.get("startAt"), dropoffAt),              // slot bắt đầu trước dropoff
                        cb.greaterThan(slotRoot.get("endAt"), pickupAt)               // slot kết thúc sau pickup
                ));
        return cb.not(cb.exists(sub));
    }
}
