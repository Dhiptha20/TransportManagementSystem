package com.transport.controller;

import com.transport.model.Driver;
import com.transport.service.DriverService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/drivers")
@CrossOrigin(origins = "*")
public class DriverController {

    @Autowired
    private DriverService driverService;

    // GET /api/drivers - get all drivers
    @GetMapping
    public List<Driver> getAllDrivers() {
        return driverService.getAllDrivers();
    }

    // GET /api/drivers/{id} - get driver by id
    @GetMapping("/{id}")
    public ResponseEntity<Driver> getDriverById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(driverService.getDriverById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // POST /api/drivers - add new driver
    @PostMapping
    public ResponseEntity<?> addDriver(@RequestBody Driver driver) {
        try {
            return ResponseEntity.ok(driverService.addDriver(driver));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // PUT /api/drivers/{id} - update driver
    @PutMapping("/{id}")
    public ResponseEntity<?> updateDriver(@PathVariable Long id, @RequestBody Driver driver) {
        try {
            return ResponseEntity.ok(driverService.updateDriver(id, driver));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // DELETE /api/drivers/{id} - delete driver
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDriver(@PathVariable Long id) {
        try {
            driverService.deleteDriver(id);
            return ResponseEntity.ok("Driver deleted successfully.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET /api/drivers/search?keyword=... - search drivers
    @GetMapping("/search")
    public List<Driver> searchDrivers(@RequestParam String keyword) {
        return driverService.searchDrivers(keyword);
    }

    // GET /api/drivers/status/{status} - filter by status
    @GetMapping("/status/{status}")
    public List<Driver> getDriversByStatus(@PathVariable String status) {
        return driverService.getDriversByStatus(status);
    }
}
