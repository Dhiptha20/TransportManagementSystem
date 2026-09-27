package com.transport.service;

import com.transport.model.Route;
import com.transport.model.Route.RouteStatus;
import com.transport.repository.RouteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RouteService {

    @Autowired
    private RouteRepository routeRepository;

    // Get all routes
    public List<Route> getAllRoutes() {
        return routeRepository.findAll();
    }

    // Get route by ID
    public Route getRouteById(Long id) {
        return routeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Route not found with id: " + id));
    }

    // Add a new route
    public Route addRoute(Route route) {
        return routeRepository.save(route);
    }

    // Update an existing route
    public Route updateRoute(Long id, Route updatedRoute) {
        Route existing = getRouteById(id);

        existing.setSource(updatedRoute.getSource());
        existing.setDestination(updatedRoute.getDestination());
        existing.setDistanceKm(updatedRoute.getDistanceKm());
        existing.setEstimatedDurationMinutes(updatedRoute.getEstimatedDurationMinutes());
        existing.setStatus(updatedRoute.getStatus());

        return routeRepository.save(existing);
    }

    // Delete a route
    public void deleteRoute(Long id) {
        if (!routeRepository.existsById(id)) {
            throw new RuntimeException("Route not found with id: " + id);
        }
        routeRepository.deleteById(id);
    }

    // Search routes by keyword
    public List<Route> searchRoutes(String keyword) {
        return routeRepository.searchRoutes(keyword);
    }

    // Get routes by status
    public List<Route> getRoutesByStatus(String status) {
        return routeRepository.findByStatus(RouteStatus.valueOf(status));
    }
}
