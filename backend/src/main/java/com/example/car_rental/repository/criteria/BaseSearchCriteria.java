package com.example.car_rental.repository.criteria;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.criteria.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public abstract class BaseSearchCriteria {
    @PersistenceContext
    private EntityManager entityManager;

    protected <T> Page<T> executSearch(Class<T> clazz,
                                       Pageable pageable,
                                       FetchConsumer<T> fetches,
                                       PredicateBuilder<T> predicateBuilder,
                                       String... search) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<T> criteriaQuery = cb.createQuery(clazz);
        Root<T> root = criteriaQuery.from(clazz);

        fetches.apply(root);
        Predicate predicate = predicateBuilder.build(root, criteriaQuery, cb);
        List<Order> orders = new ArrayList<>();
        for (Sort.Order sortOrder : pageable.getSort()) {
            Path<?> path = root.get(sortOrder.getProperty());
            orders.add(sortOrder.isAscending() ? cb.asc(path) : cb.desc(path));
        }
        criteriaQuery.select(root).where(predicate).distinct(true);

        if (!orders.isEmpty()) {
            criteriaQuery.orderBy(orders);
        }
        List<T> results = entityManager.createQuery(criteriaQuery)
                .setFirstResult((int) pageable.getOffset())
                .setMaxResults(pageable.getPageSize())
                .getResultList();

        Long count = executeCount(clazz, predicateBuilder, cb);
        return new PageImpl<>(results, pageable, count);
    }
    protected <T> Long executeCount(Class<T> clazz,
                                  PredicateBuilder<T> predicateBuilder,
                                  CriteriaBuilder cb) {
        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<T> root = countQuery.from(clazz);

        Predicate predicate = predicateBuilder.build(root, countQuery, cb);

        countQuery.select(cb.countDistinct(root)).where(predicate);
        return entityManager.createQuery(countQuery).getSingleResult();
    }

    protected Predicate getSearchPredicate(List<From<?, ?>> from,
                                         CriteriaBuilder cb,
                                         String... search) {
        Predicate predicate = cb.conjunction();
        List<SearchCriteria> criteriaList = new ArrayList<>();

        for (String searchStr : search) {
            Matcher matcher = Pattern.compile("^(\\w+)([:<>])(.*)$")
                    .matcher(searchStr);
            if (matcher.find()) {
                criteriaList.add(new SearchCriteria(
                        matcher.group(1),
                        matcher.group(2),
                        matcher.group(3)
                ));
            }
        }

        SearchCriteriaBuilder builder = new SearchCriteriaBuilder(cb, predicate, from);
        criteriaList.forEach(builder);
        return builder.getPredicate();
    }

    @FunctionalInterface
    protected interface FetchConsumer<T> {
        void apply(Root<T> root);
    }
    @FunctionalInterface
    public interface PredicateBuilder<T> {
        Predicate build(Root<T> root, AbstractQuery<?> query, CriteriaBuilder cb);
    }
}
