package com.transport.repository;

import com.transport.model.Vehicle;
import com.transport.model.Vehicle.VehicleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    // Find vehicles by status
    List<Vehicle> findByStatus(VehicleStatus status);

    // Count vehicles by status
    long countByStatus(VehicleStatus status);

    // Search by registration number or model (case-insensitive)
    @Query("SELECT v FROM Vehicle v WHERE LOWER(v.registrationNumber) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(v.model) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Vehicle> searchVehicles(@Param("keyword") String keyword);

    // Find vehicles whose next service date is within the next 7 days (maintenance alerts)
    @Query("SELECT v FROM Vehicle v WHERE v.nextServiceDate BETWEEN :today AND :alertDate")
    List<Vehicle> findVehiclesDueForService(@Param("today") LocalDate today, @Param("alertDate") LocalDate alertDate);

    // Check if registration number already exists (for validation)
    boolean existsByRegistrationNumber(String registrationNumber);
}
