package com.transport.repository;

import com.transport.model.Maintenance;
import com.transport.model.Maintenance.MaintenanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MaintenanceRepository extends JpaRepository<Maintenance, Long> {

    // Find maintenance records by status
    List<Maintenance> findByStatus(MaintenanceStatus status);

    // Count maintenance records by status
    long countByStatus(MaintenanceStatus status);

    // Find all maintenance records for a specific vehicle
    List<Maintenance> findByVehicleId(Long vehicleId);

    // Search by vehicle registration or maintenance type
    @Query("SELECT m FROM Maintenance m WHERE LOWER(m.vehicle.registrationNumber) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(m.maintenanceType) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Maintenance> searchMaintenance(@Param("keyword") String keyword);

    // Sum of total maintenance cost
    @Query("SELECT COALESCE(SUM(m.cost), 0) FROM Maintenance m")
    double getTotalMaintenanceCost();
}
