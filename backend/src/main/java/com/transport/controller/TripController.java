package com.transport.controller;

import com.transport.model.Trip;
import com.transport.service.TripService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips")
@CrossOrigin(origins = "*")
public class TripController {

    @Autowired
    private TripService tripService;

    // GET /api/trips - get all trips
    @GetMapping
    public List<Trip> getAllTrips() {
        return tripService.getAllTrips();
    }

    // GET /api/trips/{id} - get trip by id
    @GetMapping("/{id}")
    public ResponseEntity<Trip> getTripById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(tripService.getTripById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // POST /api/trips - schedule a new trip
    @PostMapping
    public ResponseEntity<?> scheduleTrip(@RequestBody Trip trip) {
        try {
            return ResponseEntity.ok(tripService.scheduleTrip(trip));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // PUT /api/trips/{id} - update trip
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTrip(@PathVariable Long id, @RequestBody Trip trip) {
        try {
            return ResponseEntity.ok(tripService.updateTrip(id, trip));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // DELETE /api/trips/{id} - cancel/delete trip
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTrip(@PathVariable Long id) {
        try {
            tripService.deleteTrip(id);
            return ResponseEntity.ok("Trip deleted successfully.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET /api/trips/search?keyword=... - search trips
    @GetMapping("/search")
    public List<Trip> searchTrips(@RequestParam String keyword) {
        return tripService.searchTrips(keyword);
    }

    // GET /api/trips/status/{status} - filter by status
    @GetMapping("/status/{status}")
    public List<Trip> getTripsByStatus(@PathVariable String status) {
        return tripService.getTripsByStatus(status);
    }

    // GET /api/trips/today - get today's trips
    @GetMapping("/today")
    public List<Trip> getTodaysTrips() {
        return tripService.getTodaysTrips();
    }

    // GET /api/trips/upcoming - get upcoming trips
    @GetMapping("/upcoming")
    public List<Trip> getUpcomingTrips() {
        return tripService.getUpcomingTrips();
    }
}
