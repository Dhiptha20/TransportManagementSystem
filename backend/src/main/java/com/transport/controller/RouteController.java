package com.transport.controller;

import com.transport.model.Route;
import com.transport.service.RouteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/routes")
@CrossOrigin(origins = "*")
public class RouteController {

    @Autowired
    private RouteService routeService;

    // GET /api/routes - get all routes
    @GetMapping
    public List<Route> getAllRoutes() {
        return routeService.getAllRoutes();
    }

    // GET /api/routes/{id} - get route by id
    @GetMapping("/{id}")
    public ResponseEntity<Route> getRouteById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(routeService.getRouteById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // POST /api/routes - add new route
    @PostMapping
    public ResponseEntity<?> addRoute(@RequestBody Route route) {
        try {
            return ResponseEntity.ok(routeService.addRoute(route));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // PUT /api/routes/{id} - update route
    @PutMapping("/{id}")
    public ResponseEntity<?> updateRoute(@PathVariable Long id, @RequestBody Route route) {
        try {
            return ResponseEntity.ok(routeService.updateRoute(id, route));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // DELETE /api/routes/{id} - delete route
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRoute(@PathVariable Long id) {
        try {
            routeService.deleteRoute(id);
            return ResponseEntity.ok("Route deleted successfully.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET /api/routes/search?keyword=... - search routes
    @GetMapping("/search")
    public List<Route> searchRoutes(@RequestParam String keyword) {
        return routeService.searchRoutes(keyword);
    }

    // GET /api/routes/status/{status} - filter by status
    @GetMapping("/status/{status}")
    public List<Route> getRoutesByStatus(@PathVariable String status) {
        return routeService.getRoutesByStatus(status);
    }
}
