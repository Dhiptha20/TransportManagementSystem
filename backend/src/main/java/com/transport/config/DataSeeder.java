package com.transport.config;

import com.transport.model.*;
import com.transport.model.Vehicle.VehicleStatus;
import com.transport.model.Driver.DriverStatus;
import com.transport.model.Route.RouteStatus;
import com.transport.model.Trip.TripStatus;
import com.transport.model.Maintenance.MaintenanceStatus;
import com.transport.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired private VehicleRepository vehicleRepository;
    @Autowired private DriverRepository driverRepository;
    @Autowired private RouteRepository routeRepository;
    @Autowired private TripRepository tripRepository;
    @Autowired private MaintenanceRepository maintenanceRepository;

    @Override
    public void run(String... args) {
        // Only seed if the database is empty - prevents duplicate data on restart
        if (vehicleRepository.count() > 0) {
            System.out.println("Database already has data. Skipping seeding.");
            return;
        }

        System.out.println("Seeding sample data...");

        // ---- VEHICLES ----
        Vehicle v1 = createVehicle("TN 01 AB 1234", "BUS", "Tata Starbus", 52, "DIESEL",
                LocalDate.of(2024, 1, 10), LocalDate.of(2025, 7, 10), VehicleStatus.AVAILABLE);
        Vehicle v2 = createVehicle("MH 12 CD 5678", "BUS", "Ashok Leyland Viking", 48, "DIESEL",
                LocalDate.of(2024, 3, 5), LocalDate.of(2025, 9, 5), VehicleStatus.IN_SERVICE);
        Vehicle v3 = createVehicle("KA 05 EF 9012", "TRUCK", "Tata 407", 10, "DIESEL",
                LocalDate.of(2023, 11, 20), LocalDate.of(2025, 5, 20), VehicleStatus.MAINTENANCE);
        Vehicle v4 = createVehicle("DL 08 GH 3456", "VAN", "Force Traveller", 17, "CNG",
                LocalDate.of(2024, 6, 15), LocalDate.of(2025, 12, 15), VehicleStatus.AVAILABLE);
        Vehicle v5 = createVehicle("GJ 01 IJ 7890", "BUS", "Volvo 9400", 45, "DIESEL",
                LocalDate.of(2024, 2, 28), LocalDate.of(2025, 8, 28), VehicleStatus.AVAILABLE);
        Vehicle v6 = createVehicle("RJ 14 KL 2345", "CAR", "Toyota Innova", 7, "PETROL",
                LocalDate.of(2024, 4, 10), LocalDate.of(2025, 10, 10), VehicleStatus.IN_SERVICE);
        Vehicle v7 = createVehicle("UP 32 MN 6789", "TRUCK", "Mahindra Bolero Pickup", 8, "DIESEL",
                LocalDate.of(2023, 9, 1), LocalDate.of(2025, 3, 1), VehicleStatus.INACTIVE);
        Vehicle v8 = createVehicle("WB 06 OP 1122", "BUS", "Eicher Skyline Pro", 35, "DIESEL",
                LocalDate.of(2024, 5, 20), LocalDate.of(2025, 11, 20), VehicleStatus.AVAILABLE);

        List<Vehicle> vehicles = vehicleRepository.saveAll(List.of(v1, v2, v3, v4, v5, v6, v7, v8));

        // ---- DRIVERS ----
        Driver d1 = createDriver("Rajesh Kumar", "TN-2010-0012345", "9876543210", 12, DriverStatus.AVAILABLE, null);
        Driver d2 = createDriver("Suresh Patel", "MH-2015-0067890", "9823456789", 8, DriverStatus.ASSIGNED, vehicles.get(1));
        Driver d3 = createDriver("Arun Sharma", "KA-2012-0034567", "9745678901", 10, DriverStatus.AVAILABLE, null);
        Driver d4 = createDriver("Vikram Singh", "DL-2018-0089012", "9612345678", 5, DriverStatus.ASSIGNED, vehicles.get(3));
        Driver d5 = createDriver("Mohan Das", "GJ-2009-0045678", "9534567890", 14, DriverStatus.AVAILABLE, null);
        Driver d6 = createDriver("Pradeep Nair", "RJ-2016-0023456", "9456789012", 7, DriverStatus.ON_LEAVE, null);
        Driver d7 = createDriver("Sanjay Yadav", "UP-2013-0078901", "9378901234", 9, DriverStatus.ASSIGNED, vehicles.get(5));
        Driver d8 = createDriver("Ramesh Babu", "WB-2011-0056789", "9290123456", 11, DriverStatus.AVAILABLE, null);

        List<Driver> drivers = driverRepository.saveAll(List.of(d1, d2, d3, d4, d5, d6, d7, d8));

        // ---- ROUTES ----
        Route r1 = createRoute("Chennai", "Bangalore", 346.0, 360, RouteStatus.ACTIVE);
        Route r2 = createRoute("Mumbai", "Pune", 148.0, 180, RouteStatus.ACTIVE);
        Route r3 = createRoute("Delhi", "Agra", 233.0, 240, RouteStatus.ACTIVE);
        Route r4 = createRoute("Hyderabad", "Vijayawada", 275.0, 300, RouteStatus.ACTIVE);
        Route r5 = createRoute("Kolkata", "Bhubaneswar", 440.0, 480, RouteStatus.ACTIVE);
        Route r6 = createRoute("Jaipur", "Jodhpur", 335.0, 360, RouteStatus.ACTIVE);
        Route r7 = createRoute("Ahmedabad", "Surat", 265.0, 270, RouteStatus.INACTIVE);
        Route r8 = createRoute("Coimbatore", "Madurai", 213.0, 240, RouteStatus.ACTIVE);

        List<Route> routes = routeRepository.saveAll(List.of(r1, r2, r3, r4, r5, r6, r7, r8));

        // ---- TRIPS ----
        LocalDate today = LocalDate.now();

        Trip t1 = createTrip(vehicles.get(0), drivers.get(0), routes.get(0),
                today, LocalTime.of(6, 0), LocalTime.of(12, 0), 52, 45, TripStatus.SCHEDULED);
        Trip t2 = createTrip(vehicles.get(1), drivers.get(1), routes.get(1),
                today, LocalTime.of(8, 30), LocalTime.of(11, 30), 48, 48, TripStatus.IN_PROGRESS);
        Trip t3 = createTrip(vehicles.get(4), drivers.get(2), routes.get(2),
                today.minusDays(1), LocalTime.of(7, 0), LocalTime.of(11, 0), 45, 40, TripStatus.COMPLETED);
        Trip t4 = createTrip(vehicles.get(3), drivers.get(3), routes.get(3),
                today.plusDays(1), LocalTime.of(9, 0), LocalTime.of(14, 0), 17, 12, TripStatus.SCHEDULED);
        Trip t5 = createTrip(vehicles.get(7), drivers.get(4), routes.get(4),
                today.plusDays(2), LocalTime.of(6, 30), LocalTime.of(14, 30), 35, 30, TripStatus.SCHEDULED);
        Trip t6 = createTrip(vehicles.get(5), drivers.get(6), routes.get(5),
                today.minusDays(3), LocalTime.of(10, 0), LocalTime.of(16, 0), 7, 6, TripStatus.COMPLETED);
        Trip t7 = createTrip(vehicles.get(0), drivers.get(7), routes.get(7),
                today.minusDays(2), LocalTime.of(5, 30), LocalTime.of(9, 30), 52, 50, TripStatus.COMPLETED);
        Trip t8 = createTrip(vehicles.get(4), drivers.get(2), routes.get(0),
                today.plusDays(3), LocalTime.of(7, 0), LocalTime.of(13, 0), 45, 20, TripStatus.SCHEDULED);
        Trip t9 = createTrip(vehicles.get(1), drivers.get(1), routes.get(1),
                today.minusDays(5), LocalTime.of(8, 0), LocalTime.of(11, 0), 48, 0, TripStatus.CANCELLED);

        tripRepository.saveAll(List.of(t1, t2, t3, t4, t5, t6, t7, t8, t9));

        // ---- MAINTENANCE ----
        Maintenance m1 = createMaintenance(vehicles.get(2), "ENGINE_REPAIR",
                "Major engine overhaul required after breakdown", today.minusDays(2), 18500.0, MaintenanceStatus.IN_PROGRESS);
        Maintenance m2 = createMaintenance(vehicles.get(0), "OIL_CHANGE",
                "Routine engine oil and filter change", today.minusDays(10), 2500.0, MaintenanceStatus.COMPLETED);
        Maintenance m3 = createMaintenance(vehicles.get(1), "TYRE_REPLACEMENT",
                "Replaced 2 rear tyres due to wear", today.minusDays(7), 8000.0, MaintenanceStatus.COMPLETED);
        Maintenance m4 = createMaintenance(vehicles.get(4), "BRAKE_SERVICE",
                "Brake pads and fluid replacement", today.plusDays(5), 4500.0, MaintenanceStatus.SCHEDULED);
        Maintenance m5 = createMaintenance(vehicles.get(6), "GENERAL_SERVICE",
                "Full vehicle service and inspection", today.minusDays(30), 6000.0, MaintenanceStatus.COMPLETED);
        Maintenance m6 = createMaintenance(vehicles.get(3), "AC_REPAIR",
                "Air conditioning compressor replacement", today.plusDays(3), 12000.0, MaintenanceStatus.SCHEDULED);

        maintenanceRepository.saveAll(List.of(m1, m2, m3, m4, m5, m6));

        System.out.println("Sample data seeded successfully!");
    }

    // ---- Helper methods to keep code clean ----

    private Vehicle createVehicle(String regNo, String type, String model, int capacity,
                                   String fuel, LocalDate lastService, LocalDate nextService, VehicleStatus status) {
        Vehicle v = new Vehicle();
        v.setRegistrationNumber(regNo);
        v.setVehicleType(type);
        v.setModel(model);
        v.setCapacity(capacity);
        v.setFuelType(fuel);
        v.setLastServiceDate(lastService);
        v.setNextServiceDate(nextService);
        v.setStatus(status);
        return v;
    }

    private Driver createDriver(String name, String license, String phone, int experience,
                                 DriverStatus status, Vehicle assignedVehicle) {
        Driver d = new Driver();
        d.setName(name);
        d.setLicenseNumber(license);
        d.setPhone(phone);
        d.setExperienceYears(experience);
        d.setStatus(status);
        d.setAssignedVehicle(assignedVehicle);
        return d;
    }

    private Route createRoute(String source, String destination, double distance,
                               int duration, RouteStatus status) {
        Route r = new Route();
        r.setSource(source);
        r.setDestination(destination);
        r.setDistanceKm(distance);
        r.setEstimatedDurationMinutes(duration);
        r.setStatus(status);
        return r;
    }

    private Trip createTrip(Vehicle vehicle, Driver driver, Route route, LocalDate date,
                             LocalTime departure, LocalTime arrival, int capacity,
                             int bookings, TripStatus status) {
        Trip t = new Trip();
        t.setVehicle(vehicle);
        t.setDriver(driver);
        t.setRoute(route);
        t.setTripDate(date);
        t.setDepartureTime(departure);
        t.setArrivalTime(arrival);
        t.setPassengerCapacity(capacity);
        t.setBookingCount(bookings);
        t.setStatus(status);
        return t;
    }

    private Maintenance createMaintenance(Vehicle vehicle, String type, String description,
                                           LocalDate serviceDate, double cost, MaintenanceStatus status) {
        Maintenance m = new Maintenance();
        m.setVehicle(vehicle);
        m.setMaintenanceType(type);
        m.setDescription(description);
        m.setServiceDate(serviceDate);
        m.setCost(cost);
        m.setStatus(status);
        return m;
    }
}
