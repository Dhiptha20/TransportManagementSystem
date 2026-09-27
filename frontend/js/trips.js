let trips = [];
let vehicles = [];
let drivers = [];
let routes = [];

let tripModal;
let viewTripModal;

document.addEventListener("DOMContentLoaded", () => {

    tripModal = new bootstrap.Modal(
        document.getElementById("tripModal")
    );

    viewTripModal = new bootstrap.Modal(
        document.getElementById("viewTripModal")
    );

    document
        .getElementById("addTripBtn")
        .addEventListener("click", openAddTripModal);

    document
        .getElementById("tripForm")
        .addEventListener("submit", saveTrip);

    document
        .getElementById("searchInput")
        .addEventListener("input", applyFilters);

    document
        .getElementById("statusFilter")
        .addEventListener("change", applyFilters);

    document
        .getElementById("clearFiltersBtn")
        .addEventListener("click", clearFilters);

    loadInitialData();
});


/* =========================
   LOAD DATA
========================= */

async function loadInitialData() {

    try {

        const results = await Promise.all([
            apiGet("/trips"),
            apiGet("/vehicles"),
            apiGet("/drivers"),
            apiGet("/routes")
        ]);

        trips = results[0] || [];
        vehicles = results[1] || [];
        drivers = results[2] || [];
        routes = results[3] || [];

        renderTrips();

    } catch (error) {

        console.error(error);

        showToast(
            error.message || "Failed to load trip data",
            "danger"
        );
    }
}


/* =========================
   RENDER TRIPS
========================= */

function renderTrips(list = trips) {

    const table = document.getElementById("tripsTbl");

    table.innerHTML = "";

    document.getElementById("tripCount").textContent = list.length;

    if (list.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="10" class="empty-message">
                    No trips found
                </td>
            </tr>
        `;

        return;
    }

    list.forEach(trip => {

        const vehicle =
            trip.vehicle?.registrationNumber || "-";

        const driver =
            trip.driver?.name || "-";

        const route = trip.route
            ? `${trip.route.source} → ${trip.route.destination}`
            : "-";

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${trip.id}</td>

            <td>${formatDate(trip.tripDate)}</td>

            <td>${escapeHtml(vehicle)}</td>

            <td>${escapeHtml(driver)}</td>

            <td>${escapeHtml(route)}</td>

            <td>${trip.departureTime || "-"}</td>

            <td>${trip.arrivalTime || "-"}</td>

            <td>
                ${trip.bookingCount || 0}
                /
                ${trip.passengerCapacity || 0}
            </td>

            <td>
                ${statusBadge(trip.status)}
            </td>

            <td>

                <button
                    class="btn btn-sm btn-outline-info action-btn"
                    onclick="viewTrip(${trip.id})">
                    View
                </button>

                <button
                    class="btn btn-sm btn-outline-primary action-btn"
                    onclick="editTrip(${trip.id})">
                    Edit
                </button>

                <button
                    class="btn btn-sm btn-outline-danger"
                    onclick="deleteTrip(${trip.id})">
                    Delete
                </button>

            </td>
        `;

        table.appendChild(row);
    });
}


/* =========================
   ADD TRIP
========================= */

function openAddTripModal() {

    document.getElementById("tripModalTitle").textContent =
        "Schedule Trip";

    document.getElementById("tripForm").reset();

    document.getElementById("tripId").value = "";

    document.getElementById("passengerCapacity").value = 0;
    document.getElementById("bookingCount").value = 0;
    document.getElementById("tripStatus").value = "SCHEDULED";

    populateDropdowns();

    tripModal.show();
}


/* =========================
   DROPDOWNS
========================= */

function populateDropdowns(
    selectedVehicle = "",
    selectedDriver = "",
    selectedRoute = ""
) {

    const vehicleSelect =
        document.getElementById("tripVehicle");

    const driverSelect =
        document.getElementById("tripDriver");

    const routeSelect =
        document.getElementById("tripRoute");


    vehicleSelect.innerHTML =
        `<option value="">Select Vehicle</option>`;

    vehicles.forEach(vehicle => {

        const option = document.createElement("option");

        option.value = vehicle.id;

        option.textContent =
            `${vehicle.registrationNumber} - ${vehicle.vehicleType}`;

        if (String(vehicle.id) === String(selectedVehicle)) {
            option.selected = true;
        }

        vehicleSelect.appendChild(option);
    });


    driverSelect.innerHTML =
        `<option value="">Select Driver</option>`;

    drivers.forEach(driver => {

        const option = document.createElement("option");

        option.value = driver.id;

        option.textContent =
            `${driver.name} - ${driver.licenseNumber}`;

        if (String(driver.id) === String(selectedDriver)) {
            option.selected = true;
        }

        driverSelect.appendChild(option);
    });


    routeSelect.innerHTML =
        `<option value="">Select Route</option>`;

    routes.forEach(route => {

        const option = document.createElement("option");

        option.value = route.id;

        option.textContent =
            `${route.source} → ${route.destination}`;

        if (String(route.id) === String(selectedRoute)) {
            option.selected = true;
        }

        routeSelect.appendChild(option);
    });
}


/* =========================
   SAVE TRIP
========================= */

async function saveTrip(event) {

    event.preventDefault();

    const tripId =
        document.getElementById("tripId").value;

    const vehicleId =
        document.getElementById("tripVehicle").value;

    const driverId =
        document.getElementById("tripDriver").value;

    const routeId =
        document.getElementById("tripRoute").value;


    if (!vehicleId || !driverId || !routeId) {

        showToast(
            "Please select vehicle, driver and route.",
            "warning"
        );

        return;
    }


    const vehicle =
        vehicles.find(v => String(v.id) === String(vehicleId));

    const driver =
        drivers.find(d => String(d.id) === String(driverId));

    const route =
        routes.find(r => String(r.id) === String(routeId));


    /* Vehicle validation */

    if (
        vehicle &&
        (
            vehicle.status === "MAINTENANCE" ||
            vehicle.status === "INACTIVE"
        )
    ) {

        showToast(
            `Vehicle ${vehicle.registrationNumber} cannot be assigned because its status is ${vehicle.status}.`,
            "warning"
        );

        return;
    }


    /* Driver validation */

    if (
        driver &&
        (
            driver.status === "ON_LEAVE" ||
            driver.status === "INACTIVE"
        )
    ) {

        showToast(
            `Driver ${driver.name} cannot be assigned because their status is ${driver.status}.`,
            "warning"
        );

        return;
    }


    const bookingCount =
        Number(document.getElementById("bookingCount").value) || 0;

    const passengerCapacity =
        Number(document.getElementById("passengerCapacity").value) || 0;


    if (bookingCount > passengerCapacity) {

        showToast(
            "Booking count cannot exceed passenger capacity.",
            "warning"
        );

        return;
    }


    const trip = {

        vehicle: {
            id: Number(vehicleId)
        },

        driver: {
            id: Number(driverId)
        },

        route: {
            id: Number(routeId)
        },

        tripDate:
            document.getElementById("tripDate").value,

        departureTime:
            document.getElementById("departureTime").value || null,

        arrivalTime:
            document.getElementById("arrivalTime").value || null,

        passengerCapacity,

        bookingCount,

        status:
            document.getElementById("tripStatus").value

    };


    try {

        if (tripId) {

            await apiPut(
                `/trips/${tripId}`,
                trip
            );

            showToast(
                "Trip updated successfully.",
                "success"
            );

        } else {

            await apiPost(
                "/trips",
                trip
            );

            showToast(
                "Trip scheduled successfully.",
                "success"
            );
        }


        tripModal.hide();

        await loadInitialData();

    } catch (error) {

        console.error(error);

        showToast(
            error.message || "Failed to save trip.",
            "danger"
        );
    }
}


/* =========================
   EDIT TRIP
========================= */

async function editTrip(id) {

    try {

        const trip =
            await apiGet(`/trips/${id}`);

        document.getElementById("tripModalTitle").textContent =
            "Edit Trip";

        document.getElementById("tripId").value =
            trip.id;

        populateDropdowns(
            trip.vehicle?.id,
            trip.driver?.id,
            trip.route?.id
        );

        document.getElementById("tripDate").value =
            trip.tripDate || "";

        document.getElementById("departureTime").value =
            trip.departureTime || "";

        document.getElementById("arrivalTime").value =
            trip.arrivalTime || "";

        document.getElementById("passengerCapacity").value =
            trip.passengerCapacity ?? 0;

        document.getElementById("bookingCount").value =
            trip.bookingCount ?? 0;

        document.getElementById("tripStatus").value =
            trip.status || "SCHEDULED";

        tripModal.show();

    } catch (error) {

        showToast(
            error.message || "Failed to load trip.",
            "danger"
        );
    }
}


/* =========================
   VIEW TRIP
========================= */

async function viewTrip(id) {

    try {

        const trip =
            await apiGet(`/trips/${id}`);

        const vehicle =
            trip.vehicle?.registrationNumber || "-";

        const driver =
            trip.driver?.name || "-";

        const route =
            trip.route
                ? `${trip.route.source} → ${trip.route.destination}`
                : "-";


        document.getElementById("tripDetails").innerHTML = `

            <div class="row g-3">

                <div class="col-md-6">
                    <strong>Trip ID</strong>
                    <div>${trip.id}</div>
                </div>

                <div class="col-md-6">
                    <strong>Status</strong>
                    <div>${statusBadge(trip.status)}</div>
                </div>

                <div class="col-md-6">
                    <strong>Vehicle</strong>
                    <div>${escapeHtml(vehicle)}</div>
                </div>

                <div class="col-md-6">
                    <strong>Driver</strong>
                    <div>${escapeHtml(driver)}</div>
                </div>

                <div class="col-md-12">
                    <strong>Route</strong>
                    <div>${escapeHtml(route)}</div>
                </div>

                <div class="col-md-4">
                    <strong>Trip Date</strong>
                    <div>${formatDate(trip.tripDate)}</div>
                </div>

                <div class="col-md-4">
                    <strong>Departure</strong>
                    <div>${trip.departureTime || "-"}</div>
                </div>

                <div class="col-md-4">
                    <strong>Arrival</strong>
                    <div>${trip.arrivalTime || "-"}</div>
                </div>

                <div class="col-md-6">
                    <strong>Passenger Capacity</strong>
                    <div>${trip.passengerCapacity || 0}</div>
                </div>

                <div class="col-md-6">
                    <strong>Booking Count</strong>
                    <div>${trip.bookingCount || 0}</div>
                </div>

            </div>
        `;

        viewTripModal.show();

    } catch (error) {

        showToast(
            error.message || "Failed to load trip details.",
            "danger"
        );
    }
}


/* =========================
   DELETE TRIP
========================= */

async function deleteTrip(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this trip?"
        );

    if (!confirmed) {
        return;
    }


    try {

        await apiDelete(`/trips/${id}`);

        showToast(
            "Trip deleted successfully.",
            "success"
        );

        await loadInitialData();

    } catch (error) {

        showToast(
            error.message || "Failed to delete trip.",
            "danger"
        );
    }
}


/* =========================
   SEARCH + FILTER
========================= */

function applyFilters() {

    const keyword =
        document.getElementById("searchInput")
            .value
            .toLowerCase()
            .trim();

    const status =
        document.getElementById("statusFilter").value;


    const filtered =
        trips.filter(trip => {

            const vehicle =
                trip.vehicle?.registrationNumber || "";

            const driver =
                trip.driver?.name || "";

            const route =
                trip.route
                    ? `${trip.route.source} ${trip.route.destination}`
                    : "";


            const searchable =
                `${trip.id} ${vehicle} ${driver} ${route} ${trip.tripDate}`
                    .toLowerCase();


            const matchesSearch =
                !keyword ||
                searchable.includes(keyword);

            const matchesStatus =
                !status ||
                trip.status === status;


            return matchesSearch && matchesStatus;
        });


    renderTrips(filtered);
}


/* =========================
   CLEAR FILTERS
========================= */

function clearFilters() {

    document.getElementById("searchInput").value = "";

    document.getElementById("statusFilter").value = "";

    renderTrips();
}


/* =========================
   HELPERS
========================= */

function statusBadge(status) {

    if (!status) {
        return `<span class="status-badge">-</span>`;
    }

    const className =
        status
            .toLowerCase()
            .replace("_", "-");


    const label =
        status
            .replace("_", " ");


    return `
        <span class="status-badge ${className}">
            ${label}
        </span>
    `;
}


function formatDate(date) {

    if (!date) {
        return "-";
    }

    const parts = date.split("-");

    if (parts.length !== 3) {
        return date;
    }

    return `${parts[2]}-${parts[1]}-${parts[0]}`;
}


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


function showToast(message, type = "success") {

    const container =
        document.getElementById("toastContainer");

    const toast =
        document.createElement("div");

    toast.className =
        `toast align-items-center text-bg-${type} border-0`;

    toast.setAttribute("role", "alert");

    toast.innerHTML = `

        <div class="d-flex">

            <div class="toast-body">
                ${escapeHtml(message)}
            </div>

            <button
                type="button"
                class="btn-close btn-close-white me-2 m-auto"
                data-bs-dismiss="toast">
            </button>

        </div>
    `;

    container.appendChild(toast);

    const bsToast =
        new bootstrap.Toast(toast, {
            delay: 3000
        });

    bsToast.show();

    toast.addEventListener(
        "hidden.bs.toast",
        () => toast.remove()
    );
}