let vehicles = [];
let drivers = [];
let routes = [];
let trips = [];
let maintenance = [];


// ============================================================
// PAGE LOAD
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    loadReportData();
});


// ============================================================
// LOAD ALL REPORT DATA
// ============================================================

async function loadReportData() {

    try {

        const results = await Promise.all([
            apiGet("/vehicles"),
            apiGet("/drivers"),
            apiGet("/routes"),
            apiGet("/trips"),
            apiGet("/maintenance")
        ]);

        vehicles = results[0];
        drivers = results[1];
        routes = results[2];
        trips = results[3];
        maintenance = results[4];

        console.log("Report data loaded successfully");
        console.log("Vehicles:", vehicles);
        console.log("Drivers:", drivers);
        console.log("Routes:", routes);
        console.log("Trips:", trips);
        console.log("Maintenance:", maintenance);

        updateGeneratedDate();

        generateSummary();

        generateVehicleReport();

        generateDriverReport();

        generateTripReport();

        generateMaintenanceReport();

        generateFinancialSummary();

        generateOperationalSummary();

    } catch (error) {

        console.error("Failed to load report data:", error);

        showReportError(error.message);

    }
}


// ============================================================
// GENERATED DATE
// ============================================================

function updateGeneratedDate() {

    const element = document.getElementById("reportGeneratedDate");

    if (!element) {
        return;
    }

    const now = new Date();

    element.textContent = now.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}


// ============================================================
// EXECUTIVE SUMMARY
// ============================================================

function generateSummary() {

    document.getElementById("totalVehicles").textContent =
        vehicles.length;

    document.getElementById("totalDrivers").textContent =
        drivers.length;

    document.getElementById("totalRoutes").textContent =
        routes.length;

    document.getElementById("totalTrips").textContent =
        trips.length;


    const availableVehicles = vehicles.filter(
        vehicle => getStatusValue(vehicle.status) === "AVAILABLE"
    ).length;

    const activeRoutes = routes.filter(
        route => getStatusValue(route.status) === "ACTIVE"
    ).length;

    const completedTrips = trips.filter(
        trip => getStatusValue(trip.status) === "COMPLETED"
    ).length;


    const summaryText =
        `The system currently manages ${vehicles.length} vehicles, ` +
        `${drivers.length} drivers, ${routes.length} routes and ` +
        `${trips.length} trips. ` +
        `${availableVehicles} vehicles are currently available, ` +
        `${activeRoutes} routes are active and ` +
        `${completedTrips} trips have been completed.`;

    const summaryElement =
        document.getElementById("executiveSummary");

    if (summaryElement) {
        summaryElement.textContent = summaryText;
    }
}


// ============================================================
// VEHICLE REPORT
// ============================================================

function generateVehicleReport() {

    const table =
        document.getElementById("vehicleReportTable");

    if (!table) {
        return;
    }


    if (!vehicles || vehicles.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">
                    No vehicle records available.
                </td>
            </tr>
        `;

        return;
    }


    table.innerHTML = vehicles.map((vehicle, index) => {

        return `
            <tr>

                <td>${index + 1}</td>

                <td>
                    ${escapeHtml(
                        vehicle.registrationNumber || "-"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        vehicle.vehicleType || "-"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        vehicle.model || "-"
                    )}
                </td>

                <td>
                    ${vehicle.capacity ?? "-"}
                </td>

                <td>
                    ${escapeHtml(
                        vehicle.fuelType || "-"
                    )}
                </td>

                <td>
                    ${statusBadge(vehicle.status)}
                </td>

                <td>
                    ${formatDate(vehicle.nextServiceDate)}
                </td>

            </tr>
        `;

    }).join("");
}


// ============================================================
// DRIVER REPORT
// ============================================================

function generateDriverReport() {

    const table =
        document.getElementById("driverReportTable");

    if (!table) {
        return;
    }


    if (!drivers || drivers.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    No driver records available.
                </td>
            </tr>
        `;

        return;
    }


    table.innerHTML = drivers.map((driver, index) => {

        const vehicle =
            driver.assignedVehicle
                ? driver.assignedVehicle.registrationNumber
                : "Not Assigned";


        return `
            <tr>

                <td>${index + 1}</td>

                <td>
                    ${escapeHtml(
                        driver.name || "-"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        driver.licenseNumber || "-"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        driver.phone || "-"
                    )}
                </td>

                <td>
                    ${driver.experienceYears ?? 0} years
                </td>

                <td>
                    ${escapeHtml(vehicle)}
                </td>

                <td>
                    ${statusBadge(driver.status)}
                </td>

            </tr>
        `;

    }).join("");
}


// ============================================================
// TRIP REPORT
// ============================================================

function generateTripReport() {

    const table =
        document.getElementById("tripReportTable");

    if (!table) {
        return;
    }


    if (!trips || trips.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">
                    No trip records available.
                </td>
            </tr>
        `;

        return;
    }


    table.innerHTML = trips.map((trip, index) => {

        const vehicle =
            trip.vehicle
                ? trip.vehicle.registrationNumber
                : "-";

        const driver =
            trip.driver
                ? trip.driver.name
                : "-";

        const route =
            trip.route
                ? `${trip.route.source} → ${trip.route.destination}`
                : "-";


        return `
            <tr>

                <td>${index + 1}</td>

                <td>
                    ${formatDate(trip.tripDate)}
                </td>

                <td>
                    ${escapeHtml(vehicle)}
                </td>

                <td>
                    ${escapeHtml(driver)}
                </td>

                <td>
                    ${escapeHtml(route)}
                </td>

                <td>
                    ${formatTime(trip.departureTime)}
                </td>

                <td>
                    ${formatTime(trip.arrivalTime)}
                </td>

                <td>
                    ${statusBadge(trip.status)}
                </td>

            </tr>
        `;

    }).join("");
}


// ============================================================
// MAINTENANCE REPORT
// ============================================================

function generateMaintenanceReport() {

    const table =
        document.getElementById("maintenanceReportTable");

    if (!table) {
        return;
    }


    if (!maintenance || maintenance.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    No maintenance records available.
                </td>
            </tr>
        `;

        return;
    }


    table.innerHTML = maintenance.map((record, index) => {

        const vehicle =
            record.vehicle
                ? record.vehicle.registrationNumber
                : "-";


        return `
            <tr>

                <td>${index + 1}</td>

                <td>
                    ${escapeHtml(vehicle)}
                </td>

                <td>
                    ${escapeHtml(
                        record.maintenanceType || "-"
                    )}
                </td>

                <td>
                    ${formatDate(record.serviceDate)}
                </td>

                <td>
                    ${escapeHtml(
                        record.description || "-"
                    )}
                </td>

                <td>
                    ${formatCurrency(record.cost)}
                </td>

                <td>
                    ${statusBadge(record.status)}
                </td>

            </tr>
        `;

    }).join("");
}


// ============================================================
// FINANCIAL SUMMARY
// ============================================================

function generateFinancialSummary() {

    const totalRecords =
        maintenance.length;


    const completed =
        maintenance.filter(
            record =>
                getStatusValue(record.status) === "COMPLETED"
        ).length;


    const inProgress =
        maintenance.filter(
            record =>
                getStatusValue(record.status) === "IN_PROGRESS"
        ).length;


    const scheduled =
        maintenance.filter(
            record =>
                getStatusValue(record.status) === "SCHEDULED"
        ).length;


    const totalCost =
        maintenance.reduce(
            (total, record) =>
                total + Number(record.cost || 0),
            0
        );


    document.getElementById(
        "financialMaintenanceCount"
    ).textContent = totalRecords;


    document.getElementById(
        "financialCompletedMaintenance"
    ).textContent = completed;


    document.getElementById(
        "financialInProgressMaintenance"
    ).textContent = inProgress;


    document.getElementById(
        "financialScheduledMaintenance"
    ).textContent = scheduled;


    document.getElementById(
        "financialTotalCost"
    ).textContent = formatCurrency(totalCost);
}


// ============================================================
// OPERATIONAL SUMMARY
// ============================================================

function generateOperationalSummary() {

    const summaryElement =
        document.getElementById("operationalSummary");

    if (!summaryElement) {
        return;
    }


    const availableVehicles =
        vehicles.filter(
            vehicle =>
                getStatusValue(vehicle.status) === "AVAILABLE"
        ).length;


    const maintenanceVehicles =
        vehicles.filter(
            vehicle =>
                getStatusValue(vehicle.status) === "MAINTENANCE"
        ).length;


    const availableDrivers =
        drivers.filter(
            driver =>
                getStatusValue(driver.status) === "AVAILABLE"
        ).length;


    const assignedDrivers =
        drivers.filter(
            driver =>
                getStatusValue(driver.status) === "ASSIGNED"
        ).length;


    const scheduledTrips =
        trips.filter(
            trip =>
                getStatusValue(trip.status) === "SCHEDULED"
        ).length;


    const activeTrips =
        trips.filter(
            trip =>
                getStatusValue(trip.status) === "IN_PROGRESS"
        ).length;


    const completedTrips =
        trips.filter(
            trip =>
                getStatusValue(trip.status) === "COMPLETED"
        ).length;


    const maintenanceInProgress =
        maintenance.filter(
            record =>
                getStatusValue(record.status) === "IN_PROGRESS"
        ).length;


    const observations = [];

    observations.push(
        `There are ${availableVehicles} vehicles currently available for operations.`
    );

    observations.push(
        `${maintenanceVehicles} vehicle(s) are currently marked for maintenance.`
    );

    observations.push(
        `${availableDrivers} driver(s) are available and ${assignedDrivers} driver(s) are assigned.`
    );

    observations.push(
        `${scheduledTrips} trip(s) are scheduled and ${activeTrips} trip(s) are currently in progress.`
    );

    observations.push(
        `${completedTrips} trip(s) have been completed.`
    );

    observations.push(
        `${maintenanceInProgress} maintenance record(s) are currently in progress.`
    );


    summaryElement.innerHTML = `
        <ul style="margin: 0; padding-left: 20px;">
            ${observations.map(
                item => `<li style="margin-bottom: 8px;">${escapeHtml(item)}</li>`
            ).join("")}
        </ul>
    `;
}


// ============================================================
// STATUS BADGE
// ============================================================

function statusBadge(status) {

    const value =
        getStatusValue(status);


    let className =
        "status-info";


    if (
        value === "AVAILABLE" ||
        value === "ACTIVE" ||
        value === "COMPLETED"
    ) {

        className =
            "status-active";

    } else if (
        value === "MAINTENANCE" ||
        value === "IN_PROGRESS" ||
        value === "SCHEDULED" ||
        value === "ASSIGNED"
    ) {

        className =
            "status-warning";

    } else if (
        value === "INACTIVE" ||
        value === "CANCELLED" ||
        value === "ON_LEAVE"
    ) {

        className =
            "status-danger";

    }


    return `
        <span class="status ${className}">
            ${escapeHtml(value || "-")}
        </span>
    `;
}


// ============================================================
// GET STATUS VALUE
// ============================================================

function getStatusValue(status) {

    if (status === null || status === undefined) {
        return "";
    }

    if (typeof status === "string") {
        return status.toUpperCase();
    }

    if (typeof status === "object") {

        if (status.name) {
            return String(status.name).toUpperCase();
        }

        if (status.status) {
            return String(status.status).toUpperCase();
        }
    }

    return String(status).toUpperCase();
}


// ============================================================
// DATE FORMAT
// ============================================================

function formatDate(dateValue) {

    if (!dateValue) {
        return "-";
    }

    const date =
        new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return escapeHtml(String(dateValue));
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


// ============================================================
// TIME FORMAT
// ============================================================

function formatTime(timeValue) {

    if (!timeValue) {
        return "-";
    }

    const value =
        String(timeValue);


    if (value.includes(":")) {

        const parts =
            value.split(":");

        if (parts.length >= 2) {

            return `${parts[0]}:${parts[1]}`;
        }
    }

    return escapeHtml(value);
}


// ============================================================
// CURRENCY FORMAT
// ============================================================

function formatCurrency(value) {

    const amount =
        Number(value || 0);


    return amount.toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2
    });
}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHtml(value) {

    if (value === null || value === undefined) {
        return "";
    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ============================================================
// ERROR MESSAGE
// ============================================================

function showReportError(message) {

    const summary =
        document.getElementById("executiveSummary");

    if (summary) {

        summary.innerHTML = `
            <div class="alert alert-danger">
                <strong>Unable to load report data.</strong><br>
                ${escapeHtml(message)}
                <br><br>
                Please make sure the Spring Boot backend
                is running on port 8080.
            </div>
        `;
    }


    const tables = [
        "vehicleReportTable",
        "driverReportTable",
        "tripReportTable",
        "maintenanceReportTable"
    ];


    tables.forEach(id => {

        const table =
            document.getElementById(id);

        if (table) {

            table.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center text-danger">
                        Failed to load data.
                    </td>
                </tr>
            `;
        }

    });
}