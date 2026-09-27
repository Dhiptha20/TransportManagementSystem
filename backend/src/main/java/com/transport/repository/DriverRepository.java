package com.transport.repository;

import com.transport.model.Driver;
import com.transport.model.Driver.DriverStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DriverRepository extends JpaRepository<Driver, Long> {

    // Find drivers by status
    List<Driver> findByStatus(DriverStatus status);

    // Count drivers by status
    long countByStatus(DriverStatus status);

    // Search by name or license number (case-insensitive)
    @Query("SELECT d FROM Driver d WHERE LOWER(d.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(d.licenseNumber) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Driver> searchDrivers(@Param("keyword") String keyword);

    // Check if license number already exists (for validation)
    boolean existsByLicenseNumber(String licenseNumber);
}
