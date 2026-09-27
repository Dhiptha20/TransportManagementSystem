// ============================================================
// ROUTES MANAGEMENT
// frontend/js/routes.js
// ============================================================

let allRoutes = [];
let routeModalInstance = null;
let viewRouteModalInstance = null;

// ============================================================
// PAGE INITIALIZATION
// ============================================================

document.addEventListener("DOMContentLoaded", function () {

    // Bootstrap modals
    const routeModalElement = document.getElementById("routeModal");
    const viewRouteModalElement = document.getElementById("viewRouteModal");

    if (routeModalElement) {
        routeModalInstance = new bootstrap.Modal(routeModalElement);
    }

    if (viewRouteModalElement) {
        viewRouteModalInstance = new bootstrap.Modal(viewRouteModalElement);
    }

    // Add Route button
    const addRouteBtn = document.getElementById("addRouteBtn");

    if (addRouteBtn) {
        addRouteBtn.addEventListener("click", openAddModal);
    }

    // Save Route button
    const saveRouteBtn = document.getElementById("saveRouteBtn");

    if (saveRouteBtn) {
        saveRouteBtn.addEventListener("click", saveRoute);
    }

    // Search
    const searchInput = document.getElementById("searchInput");

    if (searchInput) {
        searchInput.addEventListener("input", filterRoutes);
    }

    // Status filter
    const statusFilter = document.getElementById("statusFilter");

    if (statusFilter) {
        statusFilter.addEventListener("change", filterRoutes);
    }

    // Clear filters
    const clearFiltersBtn = document.getElementById("clearFiltersBtn");

    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener("click", clearFilters);
    }

    // Load routes from backend
    loadRoutes();
});


// ============================================================
// LOAD ROUTES
// ============================================================

async function loadRoutes() {

    try {

        const data = await apiGet("/routes");

        allRoutes = Array.isArray(data) ? data : [];

        renderRoutes(allRoutes);

    } catch (error) {

        console.error("Error loading routes:", error);

        showRouteToast(
            "Failed to load routes: " + error.message,
            "danger"
        );
    }
}


// ============================================================
// RENDER ROUTES TABLE
// ============================================================

function renderRoutes(routes) {

    const tableBody = document.getElementById("routesTbl");
    const routeCount = document.getElementById("routeCount");

    if (!tableBody) {
        console.error("routesTbl element not found.");
        return;
    }

    tableBody.innerHTML = "";

    if (routeCount) {
        routeCount.textContent = routes.length;
    }

    if (routes.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4 text-muted">
                    No routes found
                </td>
            </tr>
        `;

        return;
    }

    routes.forEach(route => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${route.id}</td>

            <td>
                <strong>${escapeHtml(route.source)}</strong>
            </td>

            <td>
                <strong>${escapeHtml(route.destination)}</strong>
            </td>

            <td>
                ${route.distanceKm} km
            </td>

            <td>
                ${formatDuration(route.estimatedDurationMinutes)}
            </td>

            <td>
                ${getStatusBadge(route.status)}
            </td>

            <td>
                <button
                    class="btn btn-sm btn-outline-info me-1"
                    onclick="viewRoute(${route.id})"
                    title="View">
                    <i class="bi bi-eye"></i>
                </button>

                <button
                    class="btn btn-sm btn-outline-primary me-1"
                    onclick="editRoute(${route.id})"
                    title="Edit">
                    <i class="bi bi-pencil"></i>
                </button>

                <button
                    class="btn btn-sm btn-outline-danger"
                    onclick="deleteRoute(${route.id})"
                    title="Delete">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}


// ============================================================
// OPEN ADD ROUTE MODAL
// ============================================================

function openAddModal() {

    const form = document.getElementById("routeForm");

    if (form) {
        form.reset();
    }

    document.getElementById("routeId").value = "";

    document.getElementById("routeModalTitle").textContent =
        "Add Route";

    document.getElementById("routeStatus").value = "ACTIVE";

    if (routeModalInstance) {
        routeModalInstance.show();
    }
}


// ============================================================
// EDIT ROUTE
// ============================================================

async function editRoute(id) {

    try {

        const route = await apiGet(`/routes/${id}`);

        document.getElementById("routeId").value = route.id;
        document.getElementById("routeSource").value = route.source || "";
        document.getElementById("routeDestination").value =
            route.destination || "";

        document.getElementById("distanceKm").value =
            route.distanceKm ?? "";

        document.getElementById("estimatedDurationMinutes").value =
            route.estimatedDurationMinutes ?? "";

        document.getElementById("routeStatus").value =
            route.status || "ACTIVE";

        document.getElementById("routeModalTitle").textContent =
            "Edit Route";

        if (routeModalInstance) {
            routeModalInstance.show();
        }

    } catch (error) {

        console.error("Error loading route:", error);

        showRouteToast(
            "Failed to load route: " + error.message,
            "danger"
        );
    }
}


// ============================================================
// SAVE ROUTE
// ============================================================

async function saveRoute() {

    console.log("SAVE ROUTE BUTTON CLICKED");

    const id = document.getElementById("routeId").value;

    const source = document.getElementById("routeSource").value.trim();
    const destination =
        document.getElementById("routeDestination").value.trim();

    const distanceValue =
        document.getElementById("distanceKm").value;

    const durationValue =
        document.getElementById("estimatedDurationMinutes").value;

    const status =
        document.getElementById("routeStatus").value;

    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

    if (!source) {
        showRouteToast("Please enter the source.", "danger");
        return;
    }

    if (!destination) {
        showRouteToast("Please enter the destination.", "danger");
        return;
    }

    if (distanceValue === "") {
        showRouteToast("Please enter the distance.", "danger");
        return;
    }

    if (durationValue === "") {
        showRouteToast(
            "Please enter the estimated duration.",
            "danger"
        );
        return;
    }

    const distanceKm = Number(distanceValue);
    const estimatedDurationMinutes = Number(durationValue);

    if (isNaN(distanceKm) || distanceKm <= 0) {
        showRouteToast(
            "Distance must be greater than 0.",
            "danger"
        );
        return;
    }

    if (
        isNaN(estimatedDurationMinutes) ||
        estimatedDurationMinutes <= 0
    ) {
        showRouteToast(
            "Estimated duration must be greater than 0.",
            "danger"
        );
        return;
    }

    // --------------------------------------------------------
    // DATA SENT TO SPRING BOOT
    // --------------------------------------------------------

    const routeData = {
        source: source,
        destination: destination,
        distanceKm: distanceKm,
        estimatedDurationMinutes: estimatedDurationMinutes,
        status: status
    };

    console.log("Route data being sent:", routeData);

    try {

        let result;

        // ----------------------------------------------------
        // ADD
        // ----------------------------------------------------

        if (!id) {

            console.log("Sending POST /api/routes");

            result = await apiPost(
                "/routes",
                routeData
            );

            console.log("POST response:", result);

            showRouteToast(
                "Route added successfully!",
                "success"
            );

        }

        // ----------------------------------------------------
        // UPDATE
        // ----------------------------------------------------

        else {

            console.log(`Sending PUT /api/routes/${id}`);

            result = await apiPut(
                `/routes/${id}`,
                routeData
            );

            console.log("PUT response:", result);

            showRouteToast(
                "Route updated successfully!",
                "success"
            );
        }

        // ----------------------------------------------------
        // CLOSE MODAL
        // ----------------------------------------------------

        if (routeModalInstance) {
            routeModalInstance.hide();
        }

        // ----------------------------------------------------
        // RELOAD TABLE
        // ----------------------------------------------------

        await loadRoutes();

    } catch (error) {

        console.error("SAVE ROUTE ERROR:", error);

        showRouteToast(
            "Failed to save route: " + error.message,
            "danger"
        );
    }
}


// ============================================================
// VIEW ROUTE
// ============================================================

async function viewRoute(id) {

    try {

        const route = await apiGet(`/routes/${id}`);

        const details = document.getElementById("routeDetails");

        if (details) {

            details.innerHTML = `
                <div class="row g-3">

                    <div class="col-md-6">
                        <div class="border rounded p-3">
                            <small class="text-muted">
                                Route ID
                            </small>
                            <div class="fw-bold">
                                ${route.id}
                            </div>
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="border rounded p-3">
                            <small class="text-muted">
                                Status
                            </small>
                            <div>
                                ${getStatusBadge(route.status)}
                            </div>
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="border rounded p-3">
                            <small class="text-muted">
                                Source
                            </small>
                            <div class="fw-bold">
                                ${escapeHtml(route.source)}
                            </div>
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="border rounded p-3">
                            <small class="text-muted">
                                Destination
                            </small>
                            <div class="fw-bold">
                                ${escapeHtml(route.destination)}
                            </div>
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="border rounded p-3">
                            <small class="text-muted">
                                Distance
                            </small>
                            <div class="fw-bold">
                                ${route.distanceKm} km
                            </div>
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="border rounded p-3">
                            <small class="text-muted">
                                Estimated Duration
                            </small>
                            <div class="fw-bold">
                                ${formatDuration(
                                    route.estimatedDurationMinutes
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            `;
        }

        if (viewRouteModalInstance) {
            viewRouteModalInstance.show();
        }

    } catch (error) {

        console.error("Error viewing route:", error);

        showRouteToast(
            "Failed to load route: " + error.message,
            "danger"
        );
    }
}


// ============================================================
// DELETE ROUTE
// ============================================================

async function deleteRoute(id) {

    const confirmed = confirm(
        "Are you sure you want to delete this route?"
    );

    if (!confirmed) {
        return;
    }

    try {

        await apiDelete(`/routes/${id}`);

        showRouteToast(
            "Route deleted successfully!",
            "success"
        );

        await loadRoutes();

    } catch (error) {

        console.error("Delete route error:", error);

        showRouteToast(
            "Failed to delete route: " + error.message,
            "danger"
        );
    }
}


// ============================================================
// SEARCH + FILTER
// ============================================================

function filterRoutes() {

    const searchInput =
        document.getElementById("searchInput");

    const statusFilter =
        document.getElementById("statusFilter");

    const keyword =
        searchInput
            ? searchInput.value.trim().toLowerCase()
            : "";

    const status =
        statusFilter
            ? statusFilter.value
            : "";

    const filtered = allRoutes.filter(route => {

        const matchesSearch =
            !keyword ||
            (route.source &&
                route.source.toLowerCase().includes(keyword)) ||
            (route.destination &&
                route.destination.toLowerCase().includes(keyword));

        const matchesStatus =
            !status ||
            route.status === status;

        return matchesSearch && matchesStatus;
    });

    renderRoutes(filtered);
}


// ============================================================
// CLEAR FILTERS
// ============================================================

function clearFilters() {

    const searchInput =
        document.getElementById("searchInput");

    const statusFilter =
        document.getElementById("statusFilter");

    if (searchInput) {
        searchInput.value = "";
    }

    if (statusFilter) {
        statusFilter.value = "";
    }

    renderRoutes(allRoutes);
}


// ============================================================
// FORMAT DURATION
// ============================================================

function formatDuration(minutes) {

    if (minutes === null || minutes === undefined) {
        return "—";
    }

    const mins = Number(minutes);

    if (isNaN(mins)) {
        return "—";
    }

    const hours = Math.floor(mins / 60);
    const remainingMinutes = mins % 60;

    if (hours === 0) {
        return `${remainingMinutes} min`;
    }

    if (remainingMinutes === 0) {
        return `${hours} hr`;
    }

    return `${hours} hr ${remainingMinutes} min`;
}


// ============================================================
// STATUS BADGE
// ============================================================

function getStatusBadge(status) {

    if (status === "ACTIVE") {
        return `<span class="badge bg-success">ACTIVE</span>`;
    }

    if (status === "INACTIVE") {
        return `<span class="badge bg-secondary">INACTIVE</span>`;
    }

    return `<span class="badge bg-secondary">
        ${escapeHtml(status || "UNKNOWN")}
    </span>`;
}


// ============================================================
// TOAST
// ============================================================

function showRouteToast(message, type = "success") {

    const container =
        document.getElementById("toastContainer");

    if (!container) {

        alert(message);

        return;
    }

    const toastId =
        "routeToast_" + Date.now();

    const bgClass =
        type === "success"
            ? "bg-success"
            : "bg-danger";

    container.insertAdjacentHTML(
        "beforeend",
        `
        <div
            id="${toastId}"
            class="toast align-items-center text-white ${bgClass} border-0 mb-2"
            role="alert">

            <div class="d-flex">

                <div class="toast-body fw-semibold">
                    ${escapeHtml(message)}
                </div>

                <button
                    type="button"
                    class="btn-close btn-close-white me-2 m-auto"
                    data-bs-dismiss="toast">
                </button>

            </div>

        </div>
        `
    );

    const toastElement =
        document.getElementById(toastId);

    const toast =
        new bootstrap.Toast(toastElement, {
            delay: 3500
        });

    toast.show();

    toastElement.addEventListener(
        "hidden.bs.toast",
        () => toastElement.remove()
    );
}


// ============================================================
// HTML ESCAPE
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