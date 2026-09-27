// ============================================================
// MAINTENANCE MANAGEMENT
// ============================================================

let maintenanceRecords = [];
let vehicles = [];

document.addEventListener("DOMContentLoaded", () => {
    initializeMaintenancePage();
});

async function initializeMaintenancePage() {
    setupEventListeners();

    try {
        await loadVehicles();
        await loadMaintenanceRecords();
    } catch (error) {
        console.error("Maintenance page error:", error);
        showTableError(error.message);
    }
}


// ============================================================
// EVENT LISTENERS
// ============================================================

function setupEventListeners() {

    const addBtn = document.getElementById("addMaintenanceBtn");
    if (addBtn) {
        addBtn.addEventListener("click", openAddModal);
    }

    const form = document.getElementById("maintenanceForm");
    if (form) {
        form.addEventListener("submit", saveMaintenance);
    }

    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("input", applyFilters);
    }

    const statusFilter = document.getElementById("statusFilter");
    if (statusFilter) {
        statusFilter.addEventListener("change", applyFilters);
    }

    const vehicleFilter = document.getElementById("vehicleFilter");
    if (vehicleFilter) {
        vehicleFilter.addEventListener("change", applyFilters);
    }

    const clearBtn = document.getElementById("clearFiltersBtn");
    if (clearBtn) {
        clearBtn.addEventListener("click", clearFilters);
    }
}


// ============================================================
// LOAD VEHICLES
// ============================================================

async function loadVehicles() {

    try {
        vehicles = await apiGet("/vehicles");

        populateVehicleDropdowns();

    } catch (error) {
        console.error("Failed to load vehicles:", error);
        throw error;
    }
}


// ============================================================
// POPULATE VEHICLE DROPDOWNS
// ============================================================

function populateVehicleDropdowns() {

    const maintenanceVehicle =
        document.getElementById("maintenanceVehicle");

    const vehicleFilter =
        document.getElementById("vehicleFilter");


    // Maintenance form dropdown
    if (maintenanceVehicle) {

        maintenanceVehicle.innerHTML =
            '<option value="">Select Vehicle</option>';

        vehicles.forEach(vehicle => {

            const option = document.createElement("option");

            option.value = vehicle.id;

            option.textContent =
                `${vehicle.registrationNumber} - ${vehicle.model}`;

            maintenanceVehicle.appendChild(option);
        });
    }


    // Filter dropdown
    if (vehicleFilter) {

        vehicleFilter.innerHTML =
            '<option value="">All Vehicles</option>';

        vehicles.forEach(vehicle => {

            const option = document.createElement("option");

            option.value = vehicle.id;

            option.textContent =
                `${vehicle.registrationNumber} - ${vehicle.model}`;

            vehicleFilter.appendChild(option);
        });
    }
}


// ============================================================
// LOAD MAINTENANCE RECORDS
// ============================================================

async function loadMaintenanceRecords() {

    try {

        maintenanceRecords = await apiGet("/maintenance");

        console.log(
            "Maintenance records loaded:",
            maintenanceRecords
        );

        renderMaintenanceTable(maintenanceRecords);

    } catch (error) {

        console.error(
            "Failed to load maintenance records:",
            error
        );

        showTableError(error.message);

        throw error;
    }
}


// ============================================================
// RENDER TABLE
// ============================================================

function renderMaintenanceTable(records) {

    const tableBody =
        document.getElementById("maintenanceTbl");

    const countElement =
        document.getElementById("maintenanceCount");


    if (!tableBody) {
        console.error("maintenanceTbl not found");
        return;
    }


    if (countElement) {
        countElement.textContent = records.length;
    }


    if (records.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="8"
                    class="text-center py-4 text-muted">
                    No maintenance records found.
                </td>
            </tr>
        `;

        return;
    }


    tableBody.innerHTML = records.map((record, index) => {

        const vehicle =
            record.vehicle || {};

        const registration =
            vehicle.registrationNumber || "N/A";

        const model =
            vehicle.model || "";

        const type =
            formatMaintenanceType(record.maintenanceType);

        const description =
            record.description || "-";

        const serviceDate =
            formatDate(record.serviceDate);

        const cost =
            formatCurrency(record.cost);

        const status =
            statusBadge(record.status);


        return `
            <tr>

                <td>${index + 1}</td>

                <td>
                    <strong>${escapeHtml(registration)}</strong>
                    <br>
                    <small class="text-muted">
                        ${escapeHtml(model)}
                    </small>
                </td>

                <td>
                    ${escapeHtml(type)}
                </td>

                <td>
                    ${escapeHtml(description)}
                </td>

                <td>
                    ${serviceDate}
                </td>

                <td>
                    ${cost}
                </td>

                <td>
                    ${status}
                </td>

                <td>

                    <div class="btn-group btn-group-sm">

                        <button
                            class="btn btn-outline-primary"
                            onclick="viewMaintenance(${record.id})"
                            title="View">

                            <i class="bi bi-eye"></i>

                        </button>

                        <button
                            class="btn btn-outline-warning"
                            onclick="editMaintenance(${record.id})"
                            title="Edit">

                            <i class="bi bi-pencil"></i>

                        </button>

                        <button
                            class="btn btn-outline-danger"
                            onclick="deleteMaintenance(${record.id})"
                            title="Delete">

                            <i class="bi bi-trash"></i>

                        </button>

                    </div>

                </td>

            </tr>
        `;

    }).join("");
}


// ============================================================
// ADD MAINTENANCE
// ============================================================

function openAddModal() {

    const form =
        document.getElementById("maintenanceForm");

    if (form) {
        form.reset();
    }


    const idField =
        document.getElementById("maintenanceId");

    if (idField) {
        idField.value = "";
    }


    const title =
        document.getElementById("maintenanceModalTitle");

    if (title) {
        title.textContent = "Add Maintenance Record";
    }


    const modalElement =
        document.getElementById("maintenanceModal");

    if (modalElement) {

        const modal =
            bootstrap.Modal.getOrCreateInstance(
                modalElement
            );

        modal.show();
    }
}


// ============================================================
// SAVE MAINTENANCE
// ============================================================

async function saveMaintenance(event) {

    event.preventDefault();


    const id =
        document.getElementById("maintenanceId")?.value;


    const vehicleId =
        document.getElementById("maintenanceVehicle")?.value;


    const maintenanceType =
        document.getElementById("maintenanceType")?.value;


    const description =
        document.getElementById("maintenanceDescription")?.value;


    const serviceDate =
        document.getElementById("serviceDate")?.value;


    const cost =
        document.getElementById("maintenanceCost")?.value;


    const status =
        document.getElementById("maintenanceStatus")?.value;


    // Validation

    if (!vehicleId) {
        showToast("Please select a vehicle.", "warning");
        return;
    }

    if (!maintenanceType) {
        showToast("Please enter maintenance type.", "warning");
        return;
    }

    if (!serviceDate) {
        showToast("Please select service date.", "warning");
        return;
    }


    const data = {

        vehicle: {
            id: Number(vehicleId)
        },

        maintenanceType: maintenanceType,

        description: description,

        serviceDate: serviceDate,

        cost: Number(cost || 0),

        status: status || "SCHEDULED"
    };


    try {

        if (id) {

            // UPDATE
            await apiPut(
                `/maintenance/${id}`,
                data
            );

            showToast(
                "Maintenance record updated successfully.",
                "success"
            );

        } else {

            // ADD
            await apiPost(
                "/maintenance",
                data
            );

            showToast(
                "Maintenance record added successfully.",
                "success"
            );
        }


        closeMaintenanceModal();

        await loadMaintenanceRecords();


    } catch (error) {

        console.error(error);

        showToast(
            error.message ||
            "Failed to save maintenance record.",
            "danger"
        );
    }
}


// ============================================================
// EDIT MAINTENANCE
// ============================================================

async function editMaintenance(id) {

    try {

        const record =
            await apiGet(`/maintenance/${id}`);


        document.getElementById("maintenanceId").value =
            record.id;


        document.getElementById("maintenanceVehicle").value =
            record.vehicle?.id || "";


        document.getElementById("maintenanceType").value =
            record.maintenanceType || "";


        document.getElementById("maintenanceDescription").value =
            record.description || "";


        document.getElementById("serviceDate").value =
            record.serviceDate || "";


        document.getElementById("maintenanceCost").value =
            record.cost || 0;


        document.getElementById("maintenanceStatus").value =
            record.status || "SCHEDULED";


        const title =
            document.getElementById("maintenanceModalTitle");

        if (title) {
            title.textContent = "Edit Maintenance Record";
        }


        const modalElement =
            document.getElementById("maintenanceModal");

        if (modalElement) {

            const modal =
                bootstrap.Modal.getOrCreateInstance(
                    modalElement
                );

            modal.show();
        }


    } catch (error) {

        console.error(error);

        showToast(
            error.message ||
            "Failed to load maintenance record.",
            "danger"
        );
    }
}


// ============================================================
// VIEW MAINTENANCE
// ============================================================

async function viewMaintenance(id) {

    try {

        const record =
            await apiGet(`/maintenance/${id}`);


        const vehicle =
            record.vehicle || {};


        const details =
            document.getElementById("maintenanceDetails");


        if (!details) {
            return;
        }


        details.innerHTML = `

            <div class="row g-3">

                <div class="col-md-6">

                    <strong>Vehicle</strong>

                    <div>
                        ${escapeHtml(
                            vehicle.registrationNumber || "N/A"
                        )}
                    </div>

                </div>


                <div class="col-md-6">

                    <strong>Vehicle Model</strong>

                    <div>
                        ${escapeHtml(
                            vehicle.model || "N/A"
                        )}
                    </div>

                </div>


                <div class="col-md-6">

                    <strong>Maintenance Type</strong>

                    <div>
                        ${escapeHtml(
                            formatMaintenanceType(
                                record.maintenanceType
                            )
                        )}
                    </div>

                </div>


                <div class="col-md-6">

                    <strong>Service Date</strong>

                    <div>
                        ${formatDate(
                            record.serviceDate
                        )}
                    </div>

                </div>


                <div class="col-md-6">

                    <strong>Cost</strong>

                    <div>
                        ${formatCurrency(
                            record.cost
                        )}
                    </div>

                </div>


                <div class="col-md-6">

                    <strong>Status</strong>

                    <div>
                        ${statusBadge(
                            record.status
                        )}
                    </div>

                </div>


                <div class="col-12">

                    <strong>Description</strong>

                    <div class="mt-1">
                        ${escapeHtml(
                            record.description || "-"
                        )}
                    </div>

                </div>

            </div>
        `;


        const modalElement =
            document.getElementById("viewMaintenanceModal");


        if (modalElement) {

            const modal =
                bootstrap.Modal.getOrCreateInstance(
                    modalElement
                );

            modal.show();
        }


    } catch (error) {

        console.error(error);

        showToast(
            error.message ||
            "Failed to load maintenance record.",
            "danger"
        );
    }
}


// ============================================================
// DELETE MAINTENANCE
// ============================================================

async function deleteMaintenance(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this maintenance record?"
        );


    if (!confirmed) {
        return;
    }


    try {

        await apiDelete(
            `/maintenance/${id}`
        );


        showToast(
            "Maintenance record deleted successfully.",
            "success"
        );


        await loadMaintenanceRecords();


    } catch (error) {

        console.error(error);

        showToast(
            error.message ||
            "Failed to delete maintenance record.",
            "danger"
        );
    }
}


// ============================================================
// SEARCH + FILTER
// ============================================================

function applyFilters() {

    const search =
        document.getElementById("searchInput")?.value
            .trim()
            .toLowerCase() || "";


    const status =
        document.getElementById("statusFilter")?.value || "";


    const vehicleId =
        document.getElementById("vehicleFilter")?.value || "";


    const filtered =
        maintenanceRecords.filter(record => {

            const vehicle =
                record.vehicle || {};


            const registration =
                (vehicle.registrationNumber || "")
                    .toLowerCase();


            const type =
                (record.maintenanceType || "")
                    .toLowerCase();


            const description =
                (record.description || "")
                    .toLowerCase();


            const matchesSearch =
                !search ||
                registration.includes(search) ||
                type.includes(search) ||
                description.includes(search);


            const matchesStatus =
                !status ||
                record.status === status;


            const matchesVehicle =
                !vehicleId ||
                String(vehicle.id) === String(vehicleId);


            return (
                matchesSearch &&
                matchesStatus &&
                matchesVehicle
            );
        });


    renderMaintenanceTable(filtered);
}


// ============================================================
// CLEAR FILTERS
// ============================================================

function clearFilters() {

    const searchInput =
        document.getElementById("searchInput");

    const statusFilter =
        document.getElementById("statusFilter");

    const vehicleFilter =
        document.getElementById("vehicleFilter");


    if (searchInput) {
        searchInput.value = "";
    }


    if (statusFilter) {
        statusFilter.value = "";
    }


    if (vehicleFilter) {
        vehicleFilter.value = "";
    }


    renderMaintenanceTable(
        maintenanceRecords
    );
}


// ============================================================
// CLOSE MODAL
// ============================================================

function closeMaintenanceModal() {

    const modalElement =
        document.getElementById("maintenanceModal");


    if (modalElement) {

        const modal =
            bootstrap.Modal.getInstance(
                modalElement
            );

        if (modal) {
            modal.hide();
        }
    }
}


// ============================================================
// STATUS BADGE
// ============================================================

function statusBadge(status) {

    let badgeClass = "bg-secondary";


    if (status === "SCHEDULED") {
        badgeClass = "bg-info";
    }

    if (status === "IN_PROGRESS") {
        badgeClass = "bg-warning text-dark";
    }

    if (status === "COMPLETED") {
        badgeClass = "bg-success";
    }


    return `
        <span class="badge ${badgeClass}">
            ${formatStatus(status)}
        </span>
    `;
}


// ============================================================
// FORMAT STATUS
// ============================================================

function formatStatus(status) {

    if (!status) {
        return "Unknown";
    }


    return status
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/\b\w/g, char =>
            char.toUpperCase()
        );
}


// ============================================================
// FORMAT MAINTENANCE TYPE
// ============================================================

function formatMaintenanceType(type) {

    if (!type) {
        return "-";
    }


    return type
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/\b\w/g, char =>
            char.toUpperCase()
        );
}


// ============================================================
// FORMAT DATE
// ============================================================

function formatDate(date) {

    if (!date) {
        return "-";
    }


    const parts =
        date.split("-");


    if (parts.length === 3) {

        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }


    return date;
}


// ============================================================
// FORMAT CURRENCY
// ============================================================

function formatCurrency(value) {

    const amount =
        Number(value || 0);


    return "₹" +
        amount.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
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
// TABLE ERROR
// ============================================================

function showTableError(message) {

    const tableBody =
        document.getElementById("maintenanceTbl");


    if (tableBody) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="8"
                    class="text-center py-4 text-danger">

                    <i class="bi bi-exclamation-triangle"></i>

                    <br>

                    Failed to load maintenance records.

                    <br>

                    <small>
                        ${escapeHtml(message || "Unknown error")}
                    </small>

                </td>
            </tr>
        `;
    }
}


// ============================================================
// TOAST
// ============================================================

function showToast(message, type = "success") {

    const container =
        document.getElementById("toastContainer");


    if (!container) {
        alert(message);
        return;
    }


    const toast =
        document.createElement("div");


    toast.className =
        `alert alert-${type} shadow-sm`;


    toast.style.position = "fixed";
    toast.style.bottom = "20px";
    toast.style.right = "20px";
    toast.style.zIndex = "9999";
    toast.style.minWidth = "280px";


    toast.innerHTML = `
        ${escapeHtml(message)}
    `;


    container.appendChild(toast);


    setTimeout(() => {

        toast.remove();

    }, 3000);
}