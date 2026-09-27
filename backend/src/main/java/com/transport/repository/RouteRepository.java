package com.transport.repository;

import com.transport.model.Route;
import com.transport.model.Route.RouteStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RouteRepository extends JpaRepository<Route, Long> {

    // Find routes by status
    List<Route> findByStatus(RouteStatus status);

    // Count routes by status
    long countByStatus(RouteStatus status);

    // Search by source or destination (case-insensitive)
    @Query("SELECT r FROM Route r WHERE LOWER(r.source) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(r.destination) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Route> searchRoutes(@Param("keyword") String keyword);
}
