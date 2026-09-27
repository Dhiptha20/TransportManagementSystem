package com.transport.controller;

import com.transport.model.Vehicle.VehicleStatus;
import com.transport.model.Driver.DriverStatus;
import com.transport.model.Route.RouteStatus;
import com.transport.model.Trip.TripStatus;
import com.transport.model.Maintenance.MaintenanceStatus;
import com.transport.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private RouteRepository routeRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private MaintenanceRepository maintenanceRepository;

    // GET /api/dashboard/summary - returns all dashboard statistics
    @GetMapping("/summary")
    public Map<String, Object> getDashboardSummary() {
        Map<String, Object> summary = new HashMap<>();

        // Vehicle stats
        summary.put("totalVehicles", vehicleRepository.count());
        summary.put("availableVehicles", vehicleRepository.countByStatus(VehicleStatus.AVAILABLE));
        summary.put("vehiclesInService", vehicleRepository.countByStatus(VehicleStatus.IN_SERVICE));
        summary.put("vehiclesUnderMaintenance", vehicleRepository.countByStatus(VehicleStatus.MAINTENANCE));
        summary.put("inactiveVehicles", vehicleRepository.countByStatus(VehicleStatus.INACTIVE));

        // Driver stats
        summary.put("totalDrivers", driverRepository.count());
        summary.put("availableDrivers", driverRepository.countByStatus(DriverStatus.AVAILABLE));
        summary.put("assignedDrivers", driverRepository.countByStatus(DriverStatus.ASSIGNED));
        summary.put("driversOnLeave", driverRepository.countByStatus(DriverStatus.ON_LEAVE));

        // Route stats
        summary.put("totalRoutes", routeRepository.count());
        summary.put("activeRoutes", routeRepository.countByStatus(RouteStatus.ACTIVE));

        // Trip stats
        summary.put("totalTrips", tripRepository.count());
        summary.put("todaysTrips", tripRepository.countByTripDate(LocalDate.now()));
        summary.put("completedTrips", tripRepository.countByStatus(TripStatus.COMPLETED));
        summary.put("scheduledTrips", tripRepository.countByStatus(TripStatus.SCHEDULED));
        summary.put("cancelledTrips", tripRepository.countByStatus(TripStatus.CANCELLED));

        // Maintenance stats
        summary.put("totalMaintenanceRecords", maintenanceRepository.count());
        summary.put("scheduledMaintenance", maintenanceRepository.countByStatus(MaintenanceStatus.SCHEDULED));
        summary.put("inProgressMaintenance", maintenanceRepository.countByStatus(MaintenanceStatus.IN_PROGRESS));
        summary.put("completedMaintenance", maintenanceRepository.countByStatus(MaintenanceStatus.COMPLETED));
        summary.put("totalMaintenanceCost", maintenanceRepository.getTotalMaintenanceCost());

        return summary;
    }
}
