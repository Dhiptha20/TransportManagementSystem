package com.transport.service;

import com.transport.model.Driver;
import com.transport.model.Driver.DriverStatus;
import com.transport.model.Vehicle;
import com.transport.repository.DriverRepository;
import com.transport.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DriverService {

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    // Get all drivers
    public List<Driver> getAllDrivers() {
        return driverRepository.findAll();
    }

    // Get driver by ID
    public Driver getDriverById(Long id) {
        return driverRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Driver not found with id: " + id));
    }

    // Add a new driver
    public Driver addDriver(Driver driver) {
        if (driverRepository.existsByLicenseNumber(driver.getLicenseNumber())) {
            throw new RuntimeException("Driver with license number " + driver.getLicenseNumber() + " already exists.");
        }
        return driverRepository.save(driver);
    }

    // Update an existing driver
    public Driver updateDriver(Long id, Driver updatedDriver) {
        Driver existing = getDriverById(id);

        existing.setName(updatedDriver.getName());
        existing.setLicenseNumber(updatedDriver.getLicenseNumber());
        existing.setPhone(updatedDriver.getPhone());
        existing.setExperienceYears(updatedDriver.getExperienceYears());
        existing.setStatus(updatedDriver.getStatus());

        // Handle assigned vehicle (can be null if unassigned)
        if (updatedDriver.getAssignedVehicle() != null && updatedDriver.getAssignedVehicle().getId() != null) {
            Vehicle vehicle = vehicleRepository.findById(updatedDriver.getAssignedVehicle().getId())
                    .orElseThrow(() -> new RuntimeException("Vehicle not found"));
            existing.setAssignedVehicle(vehicle);
        } else {
            existing.setAssignedVehicle(null);
        }

        return driverRepository.save(existing);
    }

    // Delete a driver
    public void deleteDriver(Long id) {
        if (!driverRepository.existsById(id)) {
            throw new RuntimeException("Driver not found with id: " + id);
        }
        driverRepository.deleteById(id);
    }

    // Search drivers by keyword
    public List<Driver> searchDrivers(String keyword) {
        return driverRepository.searchDrivers(keyword);
    }

    // Get drivers by status
    public List<Driver> getDriversByStatus(String status) {
        return driverRepository.findByStatus(DriverStatus.valueOf(status));
    }

    // Check if a driver is available for assignment to a trip
    public boolean isDriverAvailableForTrip(Long driverId) {
        Driver driver = getDriverById(driverId);
        return driver.getStatus() == DriverStatus.AVAILABLE || driver.getStatus() == DriverStatus.ASSIGNED;
    }
}
