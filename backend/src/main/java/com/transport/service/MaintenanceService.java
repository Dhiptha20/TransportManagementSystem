package com.transport.service;

import com.transport.model.Maintenance;
import com.transport.model.Maintenance.MaintenanceStatus;
import com.transport.model.Vehicle;
import com.transport.model.Vehicle.VehicleStatus;
import com.transport.repository.MaintenanceRepository;
import com.transport.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MaintenanceService {

    @Autowired
    private MaintenanceRepository maintenanceRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    // Get all maintenance records
    public List<Maintenance> getAllMaintenance() {
        return maintenanceRepository.findAll();
    }

    // Get maintenance record by ID
    public Maintenance getMaintenanceById(Long id) {
        return maintenanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Maintenance record not found with id: " + id));
    }

    // Add a new maintenance record
    // When a maintenance record is added with IN_PROGRESS status, vehicle status is set to MAINTENANCE
    public Maintenance addMaintenance(Maintenance maintenance) {
        Vehicle vehicle = vehicleRepository.findById(maintenance.getVehicle().getId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        maintenance.setVehicle(vehicle);

        // If maintenance is in progress, mark vehicle as under maintenance
        if (maintenance.getStatus() == MaintenanceStatus.IN_PROGRESS) {
            vehicle.setStatus(VehicleStatus.MAINTENANCE);
            vehicleRepository.save(vehicle);
        }

        return maintenanceRepository.save(maintenance);
    }

    // Update a maintenance record
    public Maintenance updateMaintenance(Long id, Maintenance updatedMaintenance) {
        Maintenance existing = getMaintenanceById(id);

        Vehicle vehicle = vehicleRepository.findById(updatedMaintenance.getVehicle().getId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        existing.setVehicle(vehicle);
        existing.setMaintenanceType(updatedMaintenance.getMaintenanceType());
        existing.setDescription(updatedMaintenance.getDescription());
        existing.setServiceDate(updatedMaintenance.getServiceDate());
        existing.setCost(updatedMaintenance.getCost());
        existing.setStatus(updatedMaintenance.getStatus());

        // If maintenance is now completed, set vehicle back to AVAILABLE
        if (updatedMaintenance.getStatus() == MaintenanceStatus.COMPLETED) {
            vehicle.setStatus(VehicleStatus.AVAILABLE);
            vehicleRepository.save(vehicle);
        }

        // If maintenance is in progress, mark vehicle as under maintenance
        if (updatedMaintenance.getStatus() == MaintenanceStatus.IN_PROGRESS) {
            vehicle.setStatus(VehicleStatus.MAINTENANCE);
            vehicleRepository.save(vehicle);
        }

        return maintenanceRepository.save(existing);
    }

    // Delete a maintenance record
    public void deleteMaintenance(Long id) {
        if (!maintenanceRepository.existsById(id)) {
            throw new RuntimeException("Maintenance record not found with id: " + id);
        }
        maintenanceRepository.deleteById(id);
    }

    // Search maintenance records by keyword
    public List<Maintenance> searchMaintenance(String keyword) {
        return maintenanceRepository.searchMaintenance(keyword);
    }

    // Get maintenance records by status
    public List<Maintenance> getMaintenanceByStatus(String status) {
        return maintenanceRepository.findByStatus(MaintenanceStatus.valueOf(status));
    }

    // Get all maintenance records for a specific vehicle
    public List<Maintenance> getMaintenanceByVehicle(Long vehicleId) {
        return maintenanceRepository.findByVehicleId(vehicleId);
    }
}
