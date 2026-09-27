const API_BASE_URL = "http://localhost:8080/api";

async function loadDashboard() {
    try {
        const response = await fetch(`${API_BASE_URL}/dashboard/summary`);

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();

        // Dashboard cards
        setStat("Total Vehicles", data.totalVehicles);
        setStat("Available", data.availableVehicles);
        setStat("In Service", data.vehiclesInService);
        setStat("Under Maintenance", data.vehiclesUnderMaintenance);

        setStat("Total Drivers", data.totalDrivers);
        setStat("Available Drivers", data.availableDrivers);

        setStat("Total Routes", data.totalRoutes);
        setStat("Active Routes", data.activeRoutes);

        setStat("Today's Trips", data.todaysTrips);
        setStat("Completed Trips", data.completedTrips);
        setStat("Scheduled Trips", data.scheduledTrips);

        setStat(
            "Maintenance Cost",
            "₹" + Number(data.totalMaintenanceCost || 0).toLocaleString("en-IN")
        );

        // Charts
        createVehicleChart(data);
        createTripChart(data);

    } catch (error) {
        console.error("Dashboard error:", error);

        const errorBox = document.getElementById("dashboardError");

        if (errorBox) {
            errorBox.textContent =
                "Unable to load dashboard data. Please make sure the backend is running.";
        }
    }
}


// Find a dashboard card by its visible label
function setStat(label, value) {
    const idMap = {
        "Total Vehicles": "s-totalVehicles",
        "Available": "s-availableVehicles",
        "In Service": "s-inService",
        "Under Maintenance": "s-maintenance",

        "Total Drivers": "s-totalDrivers",
        "Available Drivers": "s-availableDrivers",

        "Total Routes": "s-totalRoutes",
        "Active Routes": "s-activeRoutes",

        "Today's Trips": "s-todaysTrips",
        "Completed Trips": "s-completedTrips",
        "Scheduled Trips": "s-scheduledTrips",

        "Maintenance Cost": "s-cost"
    };

    const elementId = idMap[label];
    const element = document.getElementById(elementId);

    if (element) {
        element.textContent = value;
    }
}// Vehicle Status Chart
function createVehicleChart(data) {
    const canvas = document.getElementById("vehicleChart");

    if (!canvas || typeof Chart === "undefined") {
        return;
    }

    new Chart(canvas, {
        type: "doughnut",
        data: {
            labels: [
                "Available",
                "In Service",
                "Under Maintenance",
                "Inactive"
            ],
            datasets: [{
                data: [
                    data.availableVehicles || 0,
                    data.vehiclesInService || 0,
                    data.vehiclesUnderMaintenance || 0,
                    data.inactiveVehicles || 0
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}


// Trip Status Chart
function createTripChart(data) {
    const canvas = document.getElementById("tripChart");

    if (!canvas || typeof Chart === "undefined") {
        return;
    }

    new Chart(canvas, {
        type: "bar",
        data: {
            labels: [
                "Scheduled",
                "In Progress",
                "Completed",
                "Cancelled"
            ],
            datasets: [{
                label: "Trips",
                data: [
                    data.scheduledTrips || 0,
                    data.inProgressTrips || 0,
                    data.completedTrips || 0,
                    data.cancelledTrips || 0
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}


// Load dashboard when page opens
document.addEventListener("DOMContentLoaded", loadDashboard);