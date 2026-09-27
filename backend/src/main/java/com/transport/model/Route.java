<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Routes - Transport Management System</title>

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">
    <link rel="stylesheet" href="css/style.css">
</head>

<body>

<!-- SIDEBAR -->
<nav id="sidebar">

    <a class="sb-brand" href="index.html">
        <i class="bi bi-truck-front-fill"></i>
        <span class="brand-name">Transport Management</span>
        <span class="brand-sub">Operations System</span>
    </a>

    <div class="sb-section">Main Menu</div>

    <a href="index.html" class="sb-link">
        <i class="bi bi-speedometer2"></i>
        Dashboard
    </a>

    <a href="vehicles.html" class="sb-link">
        <i class="bi bi-truck"></i>
        Vehicles
    </a>

    <a href="drivers.html" class="sb-link">
        <i class="bi bi-person-badge"></i>
        Drivers
    </a>

    <a href="routes.html" class="sb-link active">
        <i class="bi bi-signpost-2"></i>
        Routes
    </a>

    <a href="trips.html" class="sb-link">
        <i class="bi bi-map"></i>
        Trips
    </a>

    <a href="maintenance.html" class="sb-link">
        <i class="bi bi-tools"></i>
        Maintenance
    </a>

    <div class="sb-section">Analytics</div>

    <a href="reports.html" class="sb-link">
        <i class="bi bi-bar-chart-line"></i>
        Reports
    </a>

</nav>


<!-- MAIN -->
<div id="main">

    <!-- TOPBAR -->
    <div id="topbar">
        <span class="topbar-title">
            <i class="bi bi-signpost-2 me-2 text-primary"></i>
            Routes
        </span>

        <span class="topbar-pill" id="clock"></span>
    </div>


    <!-- CONTENT -->
    <div id="content">

        <!-- PAGE HEADER -->
        <div class="d-flex justify-content-between align-items-center mb-4">

            <div>
                <h3 class="fw-bold mb-1">Route Management</h3>
                <p class="text-muted mb-0">
                    Manage transport routes and route schedules.
                </p>
            </div>

            <button class="btn btn-primary" onclick="openAddModal()">
                <i class="bi bi-plus-lg me-1"></i>
                Add Route
            </button>

        </div>


        <!-- FILTER CARD -->
        <div class="card border-0 shadow-sm mb-4">

            <div class="card-body">

                <div class="row g-3">

                    <!-- SEARCH -->
                    <div class="col-md-6">

                        <label class="form-label fw-semibold">
                            Search
                        </label>

                        <div class="input-group">

                            <span class="input-group-text">
                                <i class="bi bi-search"></i>
                            </span>

                            <input
                                type="text"
                                id="searchInput"
                                class="form-control"
                                placeholder="Search source or destination..."
                                oninput="filterRoutes()"
                            >

                        </div>

                    </div>


                    <!-- STATUS -->
                    <div class="col-md-4">

                        <label class="form-label fw-semibold">
                            Status
                        </label>

                        <select
                            id="statusFilter"
                            class="form-select"
                            onchange="filterRoutes()"
                        >

                            <option value="">All Statuses</option>
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>

                        </select>

                    </div>


                    <!-- CLEAR -->
                    <div class="col-md-2 d-flex align-items-end">

                        <button
                            class="btn btn-outline-secondary w-100"
                            onclick="clearFilters()"
                        >
                            <i class="bi bi-x-circle me-1"></i>
                            Clear
                        </button>

                    </div>

                </div>

            </div>

        </div>


        <!-- ROUTES TABLE -->
        <div class="card border-0 shadow-sm">

            <div class="card-header bg-white border-0 py-3">

                <div class="d-flex justify-content-between align-items-center">

                    <h5 class="fw-bold mb-0">
                        <i class="bi bi-signpost-2 me-2 text-primary"></i>
                        Routes
                    </h5>

                    <span class="badge bg-light text-dark" id="routeCount">
                        0 routes
                    </span>

                </div>

            </div>


            <div class="table-responsive">

                <table class="table table-hover align-middle mb-0">

                    <thead class="table-light">

                        <tr>
                            <th>ID</th>
                            <th>Route</th>
                            <th>Distance</th>
                            <th>Estimated Time</th>
                            <th>Status</th>
                            <th class="text-end">Actions</th>
                        </tr>

                    </thead>

                    <tbody id="routesTbl">

                        <tr>
                            <td colspan="6" class="text-center text-muted py-5">
                                Loading routes...
                            </td>
                        </tr>

                    </tbody>

                </table>

            </div>

        </div>

    </div>

</div>


<!-- ADD / EDIT ROUTE MODAL -->
<div class="modal fade" id="routeModal" tabindex="-1">

    <div class="modal-dialog">

        <div class="modal-content">

            <div class="modal-header">

                <h5 class="modal-title fw-bold" id="routeModalTitle">
                    Add Route
                </h5>

                <button
                    type="button"
                    class="btn-close"
                    data-bs-dismiss="modal"
                ></button>

            </div>


            <div class="modal-body">

                <input type="hidden" id="routeId">


                <!-- SOURCE -->
                <div class="mb-3">

                    <label class="form-label fw-semibold">
                        Source
                    </label>

                    <input
                        type="text"
                        id="routeSource"
                        class="form-control"
                        placeholder="Example: Coimbatore"
                        required
                    >

                </div>


                <!-- DESTINATION -->
                <div class="mb-3">

                    <label class="form-label fw-semibold">
                        Destination
                    </label>

                    <input
                        type="text"
                        id="routeDestination"
                        class="form-control"
                        placeholder="Example: Tiruppur"
                        required
                    >

                </div>


                <!-- DISTANCE -->
                <div class="mb-3">

                    <label class="form-label fw-semibold">
                        Distance (km)
                    </label>

                    <input
                        type="number"
                        id="distanceKm"
                        class="form-control"
                        min="0"
                        step="0.1"
                        placeholder="Example: 55.5"
                        required
                    >

                </div>


                <!-- DURATION -->
                <div class="mb-3">

                    <label class="form-label fw-semibold">
                        Estimated Duration (minutes)
                    </label>

                    <input
                        type="number"
                        id="estimatedDurationMinutes"
                        class="form-control"
                        min="1"
                        placeholder="Example: 120"
                        required
                    >

                </div>


                <!-- STATUS -->
                <div class="mb-3">

                    <label class="form-label fw-semibold">
                        Status
                    </label>

                    <select
                        id="routeStatus"
                        class="form-select"
                    >

                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>

                    </select>

                </div>

            </div>


            <div class="modal-footer">

                <button
                    type="button"
                    class="btn btn-secondary"
                    data-bs-dismiss="modal"
                >
                    Cancel
                </button>

                <button
                    type="button"
                    class="btn btn-primary"
                    onclick="saveRoute()"
                >
                    <i class="bi bi-check-lg me-1"></i>
                    Save Route
                </button>

            </div>

        </div>

    </div>

</div>


<!-- VIEW ROUTE MODAL -->
<div class="modal fade" id="viewRouteModal" tabindex="-1">

    <div class="modal-dialog">

        <div class="modal-content">

            <div class="modal-header">

                <h5 class="modal-title fw-bold">
                    <i class="bi bi-signpost-2 me-2 text-primary"></i>
                    Route Details
                </h5>

                <button
                    type="button"
                    class="btn-close"
                    data-bs-dismiss="modal"
                ></button>

            </div>


            <div class="modal-body" id="routeDetails">

            </div>


            <div class="modal-footer">

                <button
                    type="button"
                    class="btn btn-secondary"
                    data-bs-dismiss="modal"
                >
                    Close
                </button>

            </div>

        </div>

    </div>

</div>


<!-- TOAST -->
<div
    id="toastContainer"
    class="toast-container position-fixed bottom-0 end-0 p-3"
    style="z-index: 9999;"
></div>


<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

<script src="js/api.js"></script>
<script src="js/routes.js"></script>


<script>
    function updateClock() {
        const clock = document.getElementById("clock");

        if (clock) {
            clock.textContent = new Date().toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short"
            });
        }
    }

    updateClock();
    setInterval(updateClock, 1000);
</script>

</body>
</html>