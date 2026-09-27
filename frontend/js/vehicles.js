// vehicles.js
// Vehicle CRUD operations for Transport Management System

let allVehicles = [];
let vehicleModal;

// ================================
// PAGE LOAD
// ================================

document.addEventListener('DOMContentLoaded', () => {
    vehicleModal = new bootstrap.Modal(document.getElementById('vehicleModal'));
    loadVehicles();
});

// ================================
// LOAD ALL VEHICLES
// ================================

async function loadVehicles() {
    const table = document.getElementById('vehiclesTbl');

    try {
        table.innerHTML = `
            <tr>
                <td colspan="10" class="text-center py-4 text-muted">
                    <div class="spinner-border spinner-border-sm me-2"></div>
                    Loading vehicles...
                </td>
            </tr>
        `;

        allVehicles = await apiGet('/vehicles');

        renderVehicles(allVehicles);

    } catch (error) {
        console.error('Error loading vehicles:', error);

        table.innerHTML = `
            <tr>
                <td colspan="10" class="text-center py-4 text-danger">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    Failed to load vehicles
                </td>
            </tr>
        `;

        showToast('Failed to load vehicles: ' + error.message, 'danger');
    }
}

// ================================
// DISPLAY VEHICLES
// ================================

function renderVehicles(vehicles) {

    const table = document.getElementById('vehiclesTbl');
    const count = document.getElementById('vehicleCount');

    count.textContent = vehicles.length;

    if (vehicles.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="10" class="text-center py-4 text-muted">
                    <i class="bi bi-truck fs-3 d-block mb-2"></i>
                    No vehicles found
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
                    <strong>${escapeHtml(vehicle.registrationNumber || '—')}</strong>
                </td>

                <td>
                    <span class="badge bg-light text-dark border">
                        ${escapeHtml(vehicle.vehicleType || '—')}
                    </span>
                </td>

                <td>${escapeHtml(vehicle.model || '—')}</td>

                <td>${vehicle.capacity ?? '—'}</td>

                <td>${escapeHtml(vehicle.fuelType || '—')}</td>

                <td>${fmtDate(vehicle.lastServiceDate)}</td>

                <td>
                    ${serviceDateDisplay(vehicle.nextServiceDate)}
                </td>

                <td>
                    ${statusBadge(vehicle.status)}
                </td>

                <td>
                    <div class="btn-group btn-group-sm">

                        <button
                            class="btn btn-outline-info"
                            title="View Details"
                            onclick="viewVehicle(${vehicle.id})">
                            <i class="bi bi-eye"></i>
                        </button>

                        <button
                            class="btn btn-outline-primary"
                            title="Edit Vehicle"
                            onclick="openEditModal(${vehicle.id})">
                            <i class="bi bi-pencil"></i>
                        </button>

                        <button
                            class="btn btn-outline-danger"
                            title="Delete Vehicle"
                            onclick="deleteVehicle(${vehicle.id})">
                            <i class="bi bi-trash"></i>
                        </button>

                    </div>
                </td>

            </tr>
        `;

    }).join('');
}

// ================================
// SEARCH + FILTER
// ================================

function filterVehicles() {

    const keyword =
        document.getElementById('searchInput').value
            .trim()
            .toLowerCase();

    const status =
        document.getElementById('statusFilter').value;

    const type =
        document.getElementById('typeFilter').value;

    const filtered = allVehicles.filter(vehicle => {

        const matchesKeyword =
            !keyword ||
            (vehicle.registrationNumber || '')
                .toLowerCase()
                .includes(keyword) ||
            (vehicle.model || '')
                .toLowerCase()
                .includes(keyword);

        const matchesStatus =
            !status || vehicle.status === status;

        const matchesType =
            !type || vehicle.vehicleType === type;

        return matchesKeyword && matchesStatus && matchesType;
    });

    renderVehicles(filtered);
}

// ================================
// CLEAR FILTERS
// ================================

function clearFilters() {

    document.getElementById('searchInput').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('typeFilter').value = '';

    renderVehicles(allVehicles);
}

// ================================
// OPEN ADD MODAL
// ================================

function openAddModal() {

    document.getElementById('modalTitle').textContent = 'Add Vehicle';

    document.getElementById('vehicleId').value = '';

    document.getElementById('regNumber').value = '';
    document.getElementById('vehicleType').value = '';
    document.getElementById('vehicleModel').value = '';
    document.getElementById('capacity').value = '';
    document.getElementById('fuelType').value = '';
    document.getElementById('lastServiceDate').value = '';
    document.getElementById('nextServiceDate').value = '';
    document.getElementById('vehicleStatus').value = 'AVAILABLE';

    vehicleModal.show();
}

// ================================
// OPEN EDIT MODAL
// ================================

async function openEditModal(id) {

    try {

        const vehicle = await apiGet(`/vehicles/${id}`);

        document.getElementById('modalTitle').textContent =
            'Edit Vehicle';

        document.getElementById('vehicleId').value =
            vehicle.id;

        document.getElementById('regNumber').value =
            vehicle.registrationNumber || '';

        document.getElementById('vehicleType').value =
            vehicle.vehicleType || '';

        document.getElementById('vehicleModel').value =
            vehicle.model || '';

        document.getElementById('capacity').value =
            vehicle.capacity ?? '';

        document.getElementById('fuelType').value =
            vehicle.fuelType || '';

        document.getElementById('lastServiceDate').value =
            vehicle.lastServiceDate || '';

        document.getElementById('nextServiceDate').value =
            vehicle.nextServiceDate || '';

        document.getElementById('vehicleStatus').value =
            vehicle.status || 'AVAILABLE';

        vehicleModal.show();

    } catch (error) {

        console.error('Error loading vehicle:', error);

        showToast(
            'Unable to load vehicle details: ' + error.message,
            'danger'
        );
    }
}

// ================================
// SAVE VEHICLE
// ADD OR UPDATE
// ================================

async function saveVehicle() {

    const id =
        document.getElementById('vehicleId').value;

    const registrationNumber =
        document.getElementById('regNumber').value.trim();

    const vehicleType =
        document.getElementById('vehicleType').value;

    const model =
        document.getElementById('vehicleModel').value.trim();

    const capacity =
        document.getElementById('capacity').value;

    const fuelType =
        document.getElementById('fuelType').value;

    const lastServiceDate =
        document.getElementById('lastServiceDate').value;

    const nextServiceDate =
        document.getElementById('nextServiceDate').value;

    const status =
        document.getElementById('vehicleStatus').value;

    // Basic validation
    if (!registrationNumber) {
        showToast('Registration number is required.', 'danger');
        return;
    }

    if (!vehicleType) {
        showToast('Please select a vehicle type.', 'danger');
        return;
    }

    if (!model) {
        showToast('Vehicle model is required.', 'danger');
        return;
    }

    const vehicle = {
        registrationNumber: registrationNumber,
        vehicleType: vehicleType,
        model: model,
        capacity: capacity ? Number(capacity) : 0,
        fuelType: fuelType || null,
        lastServiceDate: lastServiceDate || null,
        nextServiceDate: nextServiceDate || null,
        status: status
    };

    try {

        if (id) {

            // UPDATE
            await apiPut(`/vehicles/${id}`, vehicle);

            showToast(
                'Vehicle updated successfully.',
                'success'
            );

        } else {

            // CREATE
            await apiPost('/vehicles', vehicle);

            showToast(
                'Vehicle added successfully.',
                'success'
            );
        }

        vehicleModal.hide();

        await loadVehicles();

    } catch (error) {

        console.error('Error saving vehicle:', error);

        showToast(
            'Failed to save vehicle: ' + error.message,
            'danger'
        );
    }
}

// ================================
// VIEW VEHICLE DETAILS
// ================================

async function viewVehicle(id) {

    try {

        const vehicle =
            await apiGet(`/vehicles/${id}`);

        const details = `
Registration Number : ${vehicle.registrationNumber || '—'}
Vehicle Type        : ${vehicle.vehicleType || '—'}
Model               : ${vehicle.model || '—'}
Capacity            : ${vehicle.capacity ?? '—'}
Fuel Type           : ${vehicle.fuelType || '—'}
Last Service        : ${fmtDate(vehicle.lastServiceDate)}
Next Service        : ${fmtDate(vehicle.nextServiceDate)}
Status              : ${vehicle.status || '—'}
        `;

        alert(details);

    } catch (error) {

        console.error('Error viewing vehicle:', error);

        showToast(
            'Unable to load vehicle details.',
            'danger'
        );
    }
}

// ================================
// DELETE VEHICLE
// ================================

async function deleteVehicle(id) {

    const vehicle =
        allVehicles.find(v => v.id === id);

    const name =
        vehicle?.registrationNumber || `Vehicle #${id}`;

    const confirmed =
        confirm(
            `Are you sure you want to delete ${name}?`
        );

    if (!confirmed) {
        return;
    }

    try {

        await apiDelete(`/vehicles/${id}`);

        showToast(
            'Vehicle deleted successfully.',
            'success'
        );

        await loadVehicles();

    } catch (error) {

        console.error('Error deleting vehicle:', error);

        showToast(
            'Failed to delete vehicle: ' + error.message,
            'danger'
        );
    }
}

// ================================
// SERVICE DATE DISPLAY
// ================================

function serviceDateDisplay(date) {

    if (!date) {
        return '—';
    }

    const serviceDate =
        new Date(date);

    const today =
        new Date();

    today.setHours(0, 0, 0, 0);

    serviceDate.setHours(0, 0, 0, 0);

    if (serviceDate < today) {

        return `
            <span class="text-danger fw-semibold">
                <i class="bi bi-exclamation-circle me-1"></i>
                ${fmtDate(date)}
            </span>
        `;

    }

    const difference =
        Math.ceil(
            (serviceDate - today) /
            (1000 * 60 * 60 * 24)
        );

    if (difference <= 30) {

        return `
            <span class="text-warning fw-semibold">
                <i class="bi bi-clock me-1"></i>
                ${fmtDate(date)}
            </span>
        `;

    }

    return fmtDate(date);
}

// ================================
// HTML SAFETY
// ================================

function escapeHtml(value) {

    if (value === null || value === undefined) {
        return '';
    }

    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}