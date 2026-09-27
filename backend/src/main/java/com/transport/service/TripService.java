package com.transport.service;

import com.transport.model.Driver;
import com.transport.model.Route;
import com.transport.model.Trip;
import com.transport.model.Trip.TripStatus;
import com.transport.model.Vehicle;
import com.transport.model.Vehicle.VehicleStatus;
import com.transport.model.Driver.DriverStatus;
import com.transport.repository.DriverRepository;
import com.transport.repository.RouteRepository;
import com.transport.repository.TripRepository;
import com.transport.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class TripService {

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private RouteRepository routeRepository;

    // Get all trips
    public List<Trip> getAllTrips() {
        return tripRepository.findAll();
    }

    // Get trip by ID
    public Trip getTripById(Long id) {
        return tripRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trip not found with id: " + id));
    }

    // Schedule a new trip - includes real-world validation
    public Trip scheduleTrip(Trip trip) {
        Vehicle vehicle = vehicleRepository.findById(trip.getVehicle().getId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        // Business rule: Cannot assign a vehicle under maintenance or inactive
        if (vehicle.getStatus() == VehicleStatus.MAINTENANCE) {
            throw new RuntimeException("Cannot schedule trip: Vehicle " + vehicle.getRegistrationNumber() + " is currently under MAINTENANCE.");
        }
        if (vehicle.getStatus() == VehicleStatus.INACTIVE) {
            throw new RuntimeException("Cannot schedule trip: Vehicle " + vehicle.getRegistrationNumber() + " is INACTIVE.");
        }

        Driver driver = driverRepository.findById(trip.getDriver().getId())
                .orElseThrow(() -> new RuntimeException("Driver not found"));

        // Business rule: Cannot assign an inactive or on-leave driver
        if (driver.getStatus() == DriverStatus.INACTIVE) {
            throw new RuntimeException("Cannot schedule trip: Driver " + driver.getName() + " is INACTIVE.");
        }
        if (driver.getStatus() == DriverStatus.ON_LEAVE) {
            throw new RuntimeException("Cannot schedule trip: Driver " + driver.getName() + " is ON LEAVE.");
        }

        Route route = routeRepository.findById(trip.getRoute().getId())
                .orElseThrow(() -> new RuntimeException("Route not found"));

        trip.setVehicle(vehicle);
        trip.setDriver(driver);
        trip.setRoute(route);

        return tripRepository.save(trip);
    }

    // Update an existing trip
    public Trip updateTrip(Long id, Trip updatedTrip) {
        Trip existing = getTripById(id);

        Vehicle vehicle = vehicleRepository.findById(updatedTrip.getVehicle().getId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        // Apply same validation on update
        if (vehicle.getStatus() == VehicleStatus.MAINTENANCE) {
            throw new RuntimeException("Cannot assign vehicle under MAINTENANCE.");
        }
        if (vehicle.getStatus() == VehicleStatus.INACTIVE) {
            throw new RuntimeException("Cannot assign INACTIVE vehicle.");
        }

        Driver driver = driverRepository.findById(updatedTrip.getDriver().getId())
                .orElseThrow(() -> new RuntimeException("Driver not found"));

        if (driver.getStatus() == DriverStatus.INACTIVE) {
            throw new RuntimeException("Cannot assign INACTIVE driver.");
        }
        if (driver.getStatus() == DriverStatus.ON_LEAVE) {
            throw new RuntimeException("Cannot assign driver who is ON LEAVE.");
        }

        Route route = routeRepository.findById(updatedTrip.getRoute().getId())
                .orElseThrow(() -> new RuntimeException("Route not found"));

        existing.setVehicle(vehicle);
        existing.setDriver(driver);
        existing.setRoute(route);
        existing.setTripDate(updatedTrip.getTripDate());
        existing.setDepartureTime(updatedTrip.getDepartureTime());
        existing.setArrivalTime(updatedTrip.getArrivalTime());
        existing.setPassengerCapacity(updatedTrip.getPassengerCapacity());
        existing.setBookingCount(updatedTrip.getBookingCount());
        existing.setStatus(updatedTrip.getStatus());

        return tripRepository.save(existing);
    }

    // Delete a trip
    public void deleteTrip(Long id) {
        if (!tripRepository.existsById(id)) {
            throw new RuntimeException("Trip not found with id: " + id);
        }
        tripRepository.deleteById(id);
    }

    // Search trips by keyword
    public List<Trip> searchTrips(String keyword) {
        return tripRepository.searchTrips(keyword);
    }

    // Get trips by status
    public List<Trip> getTripsByStatus(String status) {
        return tripRepository.findByStatus(TripStatus.valueOf(status));
    }

    // Get today's trips
    public List<Trip> getTodaysTrips() {
        return tripRepository.findByTripDate(LocalDate.now());
    }

    // Get upcoming trips
    public List<Trip> getUpcomingTrips() {
        return tripRepository.findUpcomingTrips(LocalDate.now());
    }
}
