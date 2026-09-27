package com.transport.service;

import com.transport.model.Vehicle;
import com.transport.model.Vehicle.VehicleStatus;
import com.transport.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class VehicleService {

    @Autowired
    private VehicleRepository vehicleRepository;

    // Get all vehicles
    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    // Get vehicle by ID
    public Vehicle getVehicleById(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found with id: " + id));
    }

    // Add a new vehicle
    public Vehicle addVehicle(Vehicle vehicle) {
        if (vehicleRepository.existsByRegistrationNumber(vehicle.getRegistrationNumber())) {
            throw new RuntimeException("Vehicle with registration number " + vehicle.getRegistrationNumber() + " already exists.");
        }
        return vehicleRepository.save(vehicle);
    }

    // Update an existing vehicle
    public Vehicle updateVehicle(Long id, Vehicle updatedVehicle) {
        Vehicle existing = getVehicleById(id);

        existing.setRegistrationNumber(updatedVehicle.getRegistrationNumber());
        existing.setVehicleType(updatedVehicle.getVehicleType());
        existing.setModel(updatedVehicle.getModel());
        existing.setCapacity(updatedVehicle.getCapacity());
        existing.setFuelType(updatedVehicle.getFuelType());
        existing.setLastServiceDate(updatedVehicle.getLastServiceDate());
        existing.setNextServiceDate(updatedVehicle.getNextServiceDate());
        existing.setStatus(updatedVehicle.getStatus());

        return vehicleRepository.save(existing);
    }

    // Delete a vehicle
    public void deleteVehicle(Long id) {
        if (!vehicleRepository.existsById(id)) {
            throw new RuntimeException("Vehicle not found with id: " + id);
        }
        vehicleRepository.deleteById(id);
    }

    // Search vehicles by keyword
    public List<Vehicle> searchVehicles(String keyword) {
        return vehicleRepository.searchVehicles(keyword);
    }

    // Get vehicles by status
    public List<Vehicle> getVehiclesByStatus(String status) {
        return vehicleRepository.findByStatus(VehicleStatus.valueOf(status));
    }

    // Get vehicles due for service in the next 7 days (maintenance alerts)
    public List<Vehicle> getVehiclesDueForService() {
        LocalDate today = LocalDate.now();
        LocalDate alertDate = today.plusDays(7);
        return vehicleRepository.findVehiclesDueForService(today, alertDate);
    }

    // Check if a vehicle is available for assignment to a trip
    public boolean isVehicleAvailableForTrip(Long vehicleId) {
        Vehicle vehicle = getVehicleById(vehicleId);
        return vehicle.getStatus() == VehicleStatus.AVAILABLE || vehicle.getStatus() == VehicleStatus.IN_SERVICE;
    }
}
