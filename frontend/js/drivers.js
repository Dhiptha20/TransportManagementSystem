// drivers.js
// Driver CRUD operations for Transport Management System

let allDrivers = [];
let allVehicles = [];
let driverModal;

// ================================
// PAGE LOAD
// ================================

document.addEventListener('DOMContentLoaded', async () => {
    driverModal = new bootstrap.Modal(
        document.getElementById('driverModal')
    );

    await loadVehicles();
    await loadDrivers();
});

// ================================
// LOAD VEHICLES
// Used for Assigned Vehicle dropdown
// ================================

async function loadVehicles() {

    try {

        allVehicles = await apiGet('/vehicles');

        const select =
            document.getElementById('assignedVehicleId');

        select.innerHTML =
            '<option value="">— None —</option>';

        allVehicles.forEach(vehicle => {

            const option = document.createElement('option');

            option.value = vehicle.id;

            option.textContent =
                `${vehicle.registrationNumber} — ${vehicle.model}`;

            select.appendChild(option);
        });

    } catch (error) {

        console.error('Error loading vehicles:', error);

        showToast(
            'Unable to load vehicles for assignment.',
            'danger'
        );
    }
}

// ================================
// LOAD ALL DRIVERS
// ================================

async function loadDrivers() {

    const table =
        document.getElementById('driversTbl');

    try {

        table.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-4 text-muted">
                    <div class="spinner-border spinner-border-sm me-2"></div>
                    Loading drivers...
                </td>
            </tr>
        `;

        allDrivers =
            await apiGet('/drivers');

        renderDrivers(allDrivers);

    } catch (error) {

        console.error('Error loading drivers:', error);

        table.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-4 text-danger">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    Failed to load drivers
                </td>
            </tr>
        `;

        showToast(
            'Failed to load drivers: ' + error.message,
            'danger'
        );
    }
}

// ================================
// DISPLAY DRIVERS
// ================================

function renderDrivers(drivers) {

    const table =
        document.getElementById('driversTbl');

    const count =
        document.getElementById('driverCount');

    count.textContent = drivers.length;

    if (drivers.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-4 text-muted">
                    <i class="bi bi-person-badge fs-3 d-block mb-2"></i>
                    No drivers found
                </td>
            </tr>
        `;

        return;
    }

    table.innerHTML = drivers.map((driver, index) => {

        const vehicle =
            driver.assignedVehicle;

        const vehicleText = vehicle
            ? `${vehicle.registrationNumber} — ${vehicle.model || ''}`
            : '—';

        return `
            <tr>

                <td>${index + 1}</td>

                <td>
                    <strong>
                        ${escapeHtml(driver.name || '—')}
                    </strong>
                </td>

                <td>
                    ${escapeHtml(driver.licenseNumber || '—')}
                </td>

                <td>
                    ${escapeHtml(driver.phone || '—')}
                </td>

                <td>
                    ${driver.experienceYears ?? 0} years
                </td>

                <td>
                    ${escapeHtml(vehicleText)}
                </td>

                <td>
                    ${statusBadge(driver.status)}
                </td>

                <td>
                    <div class="btn-group btn-group-sm">

                        <button
                            class="btn btn-outline-info"
                            title="View Details"
                            onclick="viewDriver(${driver.id})">
                            <i class="bi bi-eye"></i>
                        </button>

                        <button
                            class="btn btn-outline-primary"
                            title="Edit Driver"
                            onclick="openEditModal(${driver.id})">
                            <i class="bi bi-pencil"></i>
                        </button>

                        <button
                            class="btn btn-outline-danger"
                            title="Delete Driver"
                            onclick="deleteDriver(${driver.id})">
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

function filterDrivers() {

    const keyword =
        document.getElementById('searchInput')
            .value
            .trim()
            .toLowerCase();

    const status =
        document.getElementById('statusFilter').value;

    const filtered =
        allDrivers.filter(driver => {

            const matchesKeyword =
                !keyword ||
                (driver.name || '')
                    .toLowerCase()
                    .includes(keyword) ||
                (driver.licenseNumber || '')
                    .toLowerCase()
                    .includes(keyword);

            const matchesStatus =
                !status ||
                driver.status === status;

            return matchesKeyword && matchesStatus;
        });

    renderDrivers(filtered);
}

// ================================
// CLEAR FILTERS
// ================================

function clearFilters() {

    document.getElementById('searchInput').value = '';
    document.getElementById('statusFilter').value = '';

    renderDrivers(allDrivers);
}

// ================================
// OPEN ADD MODAL
// ================================

async function openAddModal() {

    document.getElementById('modalTitle').textContent =
        'Add Driver';

    document.getElementById('driverId').value = '';

    document.getElementById('driverName').value = '';

    document.getElementById('licenseNumber').value = '';

    document.getElementById('phone').value = '';

    document.getElementById('experienceYears').value = '';

    document.getElementById('driverStatus').value =
        'AVAILABLE';

    document.getElementById('assignedVehicleId').value =
        '';

    await loadVehicles();

    driverModal.show();
}

// ================================
// OPEN EDIT MODAL
// ================================

async function openEditModal(id) {

    try {

        const driver =
            await apiGet(`/drivers/${id}`);

        await loadVehicles();

        document.getElementById('modalTitle').textContent =
            'Edit Driver';

        document.getElementById('driverId').value =
            driver.id;

        document.getElementById('driverName').value =
            driver.name || '';

        document.getElementById('licenseNumber').value =
            driver.licenseNumber || '';

        document.getElementById('phone').value =
            driver.phone || '';

        document.getElementById('experienceYears').value =
            driver.experienceYears ?? '';

        document.getElementById('driverStatus').value =
            driver.status || 'AVAILABLE';

        document.getElementById('assignedVehicleId').value =
            driver.assignedVehicle
                ? driver.assignedVehicle.id
                : '';

        driverModal.show();

    } catch (error) {

        console.error('Error loading driver:', error);

        showToast(
            'Unable to load driver details: ' + error.message,
            'danger'
        );
    }
}

// ================================
// SAVE DRIVER
// ADD OR UPDATE
// ================================

async function saveDriver() {

    const id =
        document.getElementById('driverId').value;

    const name =
        document.getElementById('driverName')
            .value
            .trim();

    const licenseNumber =
        document.getElementById('licenseNumber')
            .value
            .trim();

    const phone =
        document.getElementById('phone')
            .value
            .trim();

    const experienceYears =
        document.getElementById('experienceYears')
            .value;

    const status =
        document.getElementById('driverStatus').value;

    const assignedVehicleId =
        document.getElementById('assignedVehicleId').value;

    // ----------------------------
    // Basic validation
    // ----------------------------

    if (!name) {

        showToast(
            'Driver name is required.',
            'danger'
        );

        return;
    }

    if (!licenseNumber) {

        showToast(
            'License number is required.',
            'danger'
        );

        return;
    }

    // ----------------------------
    // Build request body
    // ----------------------------

    const driver = {

        name: name,

        licenseNumber: licenseNumber,

        phone: phone || null,

        experienceYears:
            experienceYears
                ? Number(experienceYears)
                : 0,

        status: status
    };

    // Only send vehicle when selected
    if (assignedVehicleId) {

        driver.assignedVehicle = {
            id: Number(assignedVehicleId)
        };

    } else {

        driver.assignedVehicle = null;
    }

    try {

        if (id) {

            // UPDATE
            await apiPut(
                `/drivers/${id}`,
                driver
            );

            showToast(
                'Driver updated successfully.',
                'success'
            );

        } else {

            // CREATE
            await apiPost(
                '/drivers',
                driver
            );

            showToast(
                'Driver added successfully.',
                'success'
            );
        }

        driverModal.hide();

        await loadDrivers();

    } catch (error) {

        console.error('Error saving driver:', error);

        showToast(
            'Failed to save driver: ' + error.message,
            'danger'
        );
    }
}

// ================================
// VIEW DRIVER
// ================================

async function viewDriver(id) {

    try {

        const driver =
            await apiGet(`/drivers/${id}`);

        const vehicle =
            driver.assignedVehicle;

        const vehicleText = vehicle
            ? `${vehicle.registrationNumber} — ${vehicle.model || ''}`
            : 'None';

        const details = `
Driver Name       : ${driver.name || '—'}
License Number    : ${driver.licenseNumber || '—'}
Phone             : ${driver.phone || '—'}
Experience        : ${driver.experienceYears ?? 0} years
Assigned Vehicle  : ${vehicleText}
Status            : ${driver.status || '—'}
        `;

        alert(details);

    } catch (error) {

        console.error('Error viewing driver:', error);

        showToast(
            'Unable to load driver details.',
            'danger'
        );
    }
}

// ================================
// DELETE DRIVER
// ================================

async function deleteDriver(id) {

    const driver =
        allDrivers.find(d => d.id === id);

    const name =
        driver?.name ||
        `Driver #${id}`;

    const confirmed =
        confirm(
            `Are you sure you want to delete ${name}?`
        );

    if (!confirmed) {
        return;
    }

    try {

        await apiDelete(
            `/drivers/${id}`
        );

        showToast(
            'Driver deleted successfully.',
            'success'
        );

        await loadDrivers();

    } catch (error) {

        console.error('Error deleting driver:', error);

        showToast(
            'Failed to delete driver: ' + error.message,
            'danger'
        );
    }
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