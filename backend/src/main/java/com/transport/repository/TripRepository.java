package com.transport.repository;

import com.transport.model.Trip;
import com.transport.model.Trip.TripStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface TripRepository extends JpaRepository<Trip, Long> {

    // Find trips by status
    List<Trip> findByStatus(TripStatus status);

    // Count trips by status
    long countByStatus(TripStatus status);

    // Find trips scheduled for today
    List<Trip> findByTripDate(LocalDate date);

    // Count trips for today
    long countByTripDate(LocalDate date);

    // Find upcoming trips (today or future, not cancelled)
    @Query("SELECT t FROM Trip t WHERE t.tripDate >= :today AND t.status != 'CANCELLED' ORDER BY t.tripDate ASC")
    List<Trip> findUpcomingTrips(@Param("today") LocalDate today);

    // Search trips by vehicle registration or driver name
    @Query("SELECT t FROM Trip t WHERE LOWER(t.vehicle.registrationNumber) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(t.driver.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Trip> searchTrips(@Param("keyword") String keyword);

    // Find trips by vehicle id (useful for checking if vehicle is in use)
    List<Trip> findByVehicleId(Long vehicleId);

    // Find trips by driver id
    List<Trip> findByDriverId(Long driverId);
}
