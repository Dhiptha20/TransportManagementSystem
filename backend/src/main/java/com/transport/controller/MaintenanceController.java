package com.transport.controller;

import com.transport.model.Maintenance;
import com.transport.service.MaintenanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
@CrossOrigin(origins = "*")
public class MaintenanceController {

    @Autowired
    private MaintenanceService maintenanceService;

    // GET /api/maintenance - get all maintenance records
    @GetMapping
    public List<Maintenance> getAllMaintenance() {
        return maintenanceService.getAllMaintenance();
    }

    // GET /api/maintenance/{id} - get maintenance record by id
    @GetMapping("/{id}")
    public ResponseEntity<Maintenance> getMaintenanceById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(maintenanceService.getMaintenanceById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // POST /api/maintenance - add new maintenance record
    @PostMapping
    public ResponseEntity<?> addMaintenance(@RequestBody Maintenance maintenance) {
        try {
            return ResponseEntity.ok(maintenanceService.addMaintenance(maintenance));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // PUT /api/maintenance/{id} - update maintenance record
    @PutMapping("/{id}")
    public ResponseEntity<?> updateMaintenance(@PathVariable Long id, @RequestBody Maintenance maintenance) {
        try {
            return ResponseEntity.ok(maintenanceService.updateMaintenance(id, maintenance));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // DELETE /api/maintenance/{id} - delete maintenance record
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMaintenance(@PathVariable Long id) {
        try {
            maintenanceService.deleteMaintenance(id);
            return ResponseEntity.ok("Maintenance record deleted successfully.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET /api/maintenance/search?keyword=... - search maintenance records
    @GetMapping("/search")
    public List<Maintenance> searchMaintenance(@RequestParam String keyword) {
        return maintenanceService.searchMaintenance(keyword);
    }

    // GET /api/maintenance/status/{status} - filter by status
    @GetMapping("/status/{status}")
    public List<Maintenance> getMaintenanceByStatus(@PathVariable String status) {
        return maintenanceService.getMaintenanceByStatus(status);
    }

    // GET /api/maintenance/vehicle/{vehicleId} - get maintenance history for a vehicle
    @GetMapping("/vehicle/{vehicleId}")
    public List<Maintenance> getMaintenanceByVehicle(@PathVariable Long vehicleId) {
        return maintenanceService.getMaintenanceByVehicle(vehicleId);
    }
}
