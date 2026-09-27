package com.transport.controller;

import com.transport.model.Vehicle;
import com.transport.service.VehicleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@CrossOrigin(origins = "*")
public class VehicleController {

    @Autowired
    private VehicleService vehicleService;

    // GET /api/vehicles - get all vehicles
    @GetMapping
    public List<Vehicle> getAllVehicles() {
        return vehicleService.getAllVehicles();
    }

    // GET /api/vehicles/{id} - get vehicle by id
    @GetMapping("/{id}")
    public ResponseEntity<Vehicle> getVehicleById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(vehicleService.getVehicleById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // POST /api/vehicles - add new vehicle
    @PostMapping
    public ResponseEntity<?> addVehicle(@RequestBody Vehicle vehicle) {
        try {
            return ResponseEntity.ok(vehicleService.addVehicle(vehicle));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // PUT /api/vehicles/{id} - update vehicle
    @PutMapping("/{id}")
    public ResponseEntity<?> updateVehicle(@PathVariable Long id, @RequestBody Vehicle vehicle) {
        try {
            return ResponseEntity.ok(vehicleService.updateVehicle(id, vehicle));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // DELETE /api/vehicles/{id} - delete vehicle
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteVehicle(@PathVariable Long id) {
        try {
            vehicleService.deleteVehicle(id);
            return ResponseEntity.ok("Vehicle deleted successfully.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET /api/vehicles/search?keyword=... - search vehicles
    @GetMapping("/search")
    public List<Vehicle> searchVehicles(@RequestParam String keyword) {
        return vehicleService.searchVehicles(keyword);
    }

    // GET /api/vehicles/status/{status} - filter by status
    @GetMapping("/status/{status}")
    public List<Vehicle> getVehiclesByStatus(@PathVariable String status) {
        return vehicleService.getVehiclesByStatus(status);
    }

    // GET /api/vehicles/alerts/service-due - vehicles due for service soon
    @GetMapping("/alerts/service-due")
    public List<Vehicle> getVehiclesDueForService() {
        return vehicleService.getVehiclesDueForService();
    }
}
