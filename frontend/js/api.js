// api.js — Shared fetch() helper for all backend API calls
// All requests go to Spring Boot on localhost:8080

const BASE_URL = 'http://localhost:8080/api';

async function apiGet(endpoint) {
    const res = await fetch(BASE_URL + endpoint);
    if (!res.ok) throw new Error(await res.text() || 'Request failed');
    return res.json();
}

async function apiPost(endpoint, data) {
    const res = await fetch(BASE_URL + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const text = await res.text();
    if (!res.ok) throw new Error(text || 'POST failed');
    return text ? JSON.parse(text) : {};
}

async function apiPut(endpoint, data) {
    const res = await fetch(BASE_URL + endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const text = await res.text();
    if (!res.ok) throw new Error(text || 'PUT failed');
    return text ? JSON.parse(text) : {};
}

async function apiDelete(endpoint) {
    const res = await fetch(BASE_URL + endpoint, { method: 'DELETE' });
    const text = await res.text();
    if (!res.ok) throw new Error(text || 'DELETE failed');
    return text;
}

// Show a Bootstrap toast notification
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const id = 'toast_' + Date.now();
    const bg = type === 'success' ? 'bg-success' : 'bg-danger';
    container.insertAdjacentHTML('beforeend', `
        <div id="${id}" class="toast align-items-center text-white ${bg} border-0 mb-2" role="alert">
            <div class="d-flex">
                <div class="toast-body fw-semibold">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>`);
    const el = document.getElementById(id);
    new bootstrap.Toast(el, { delay: 3500 }).show();
    el.addEventListener('hidden.bs.toast', () => el.remove());
}

// Return a Bootstrap badge for a status string
function statusBadge(status) {
    const colors = {
        AVAILABLE: 'success', IN_SERVICE: 'primary', MAINTENANCE: 'warning',
        INACTIVE: 'secondary', ASSIGNED: 'primary', ON_LEAVE: 'warning',
        ACTIVE: 'success', SCHEDULED: 'info', IN_PROGRESS: 'warning',
        COMPLETED: 'success', CANCELLED: 'danger'
    };
    const c = colors[status] || 'secondary';
    return `<span class="badge bg-${c}">${status.replace(/_/g, ' ')}</span>`;
}

// Format a date string to readable form
function fmtDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
