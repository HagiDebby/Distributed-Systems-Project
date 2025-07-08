/**
 * Convert date and time to epoch timestamp
 * @param {string} dateTimeValue - Date-time string from datetime-local input
 * @returns {number} Epoch timestamp in seconds
 */
function dateTimeToEpoch(dateTimeValue) {
    const date = new Date(dateTimeValue);
    return Math.floor(date.getTime() / 1000);
}

/**
 * Convert epoch timestamp to datetime-local format
 * @param {number} epoch - Epoch timestamp in seconds
 * @returns {string} Datetime string for datetime-local input
 */
function epochToDateTime(epoch) {
    if (!epoch) return '';
    // If epoch is in seconds, convert to ms
    if (epoch < 10000000000) epoch *= 1000;
    const date = new Date(epoch);

    // Format to YYYY-MM-DDTHH:MM format required by datetime-local
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Helper to format timestamps
function formatDate(epoch) {
    if (!epoch) return '';
    // If epoch is in seconds, convert to ms
    if (epoch < 10000000000) epoch *= 1000;
    const d = new Date(epoch);
    return d.toLocaleString();
}

// Get companyId from URL
function getCompanyIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('companyId');
}

// Load company name
function loadCompanyName(companyId) {
    $.get(`/business`, function(companies) {
        const company = companies.find(c => c._id === companyId);
        if (company) {
            $('#companyName').text(`Packages for "${company.name}"`);
        }
    });
}

// Load packages for company
function loadPackages(companyId) {
    $.get(`/business/${companyId}/packages`, function(result) {
        let packages = result;
        if (!Array.isArray(packages)) packages = packages.data || [];
        // Sort by start_date descending
        packages.sort((a, b) => b.start_date - a.start_date);
        let rows = '';
        packages.forEach(pkg => {
            rows += `<tr>
        <td class="pointer package-route" data-id="${pkg._id}" data-path='${JSON.stringify(pkg.path || [])}'>${pkg._id}</td>
        <td>${pkg.prod_id}</td>
        <td>${pkg.name}</td>
        <td class="pointer customer-id" data-id="${pkg.customer_id}">${pkg.customer_id.toString()}</td>
        <td>${formatDate(pkg.start_date)}</td>
        <td>${formatDate(pkg.eta)}</td>
        <td>${pkg.status}</td>
        <td>
          <button class="btn btn-primary add-loc-to-path" data-package-id="${pkg._id}">Add to Route</button>
          <button class="btn btn-info package-route" data-path='${JSON.stringify(pkg.path || [])}'>Show Route</button>
        </td>
      </tr>`;
        });
        $('#packagesTable tbody').html(rows.length ? rows : '<tr><td colspan="8">No packages found.</td></tr>');
    }).fail(function() {
        $('#packagesTable tbody').html('<tr><td colspan="8">Failed to load packages.</td></tr>');
    });
}

$(document).ready(function() {
    const companyId = getCompanyIdFromUrl();
    if (!companyId) {
        $('.col-sm-10').html('<h2>No company selected.</h2>');
        return;
    }

    // Initialize modal system
    window.modalManager.init();

    // Load required modals for this page
    window.modalManager.loadModals(['add-package-modal', 'location-modal', 'map-modal'])
        .then(() => {
            // Initialize modal components after loading
            window.packageModal.init();
            window.locationModal.init();
            window.mapModal.init();

            // Set up global modal listeners
            window.modalManager.setupGlobalListeners();

            console.log('All modals loaded and initialized');
        })
        .catch(error => {
            console.error('Failed to load modals:', error);
        });

    // Load initial data
    loadCompanyName(companyId);
    loadPackages(companyId);

    // Back button functionality
    $('#backBtn').on('click', function() {
        window.location.href = '/list';
    });

    // Show customer details on click
    $('#packagesTable').on('click', '.customer-id', function() {
        const customerId = $(this).data('id');
        $.get(`/customers`, function(customers) {
            const customer = customers.find(c => c._id === customerId);
            if (customer) {
                alert(
                    `Name: ${customer.name}\nEmail: ${customer.email}\nAddress: ${customer.address.street} ${customer.address.number}, ${customer.address.city}`
                );
            } else {
                alert('Customer not found');
            }
        });
    });

    // Show add package modal
    $('#addPackageTop, #addPackageBottom').on('click', function() {
        window.packageModal.show(companyId);
    });

    // Add location to package path - show modal
    $('#packagesTable').on('click', '.add-loc-to-path', function() {
        const packageId = $(this).data('package-id'); // Changed from data-id to data-package-id
        console.log('Add to route clicked for package:', packageId); // Debug log
        if (!packageId) {
            alert('Package ID not found. Please refresh the page and try again.');
            console.error('Package ID is undefined. Button data attributes:', $(this).data());
            return;
        }
        window.locationModal.show(packageId);
    });

    // Show package path on click (map)
    $('#packagesTable').on('click', '.package-route', function() {
        const path = $(this).data('path');
        const packageId = $(this).data('id') || $(this).closest('tr').find('.package-route').first().data('id');

        if (!packageId) {
            alert('Package ID not found');
            return;
        }

        if (!path || !Array.isArray(path)) {
            alert('No path data for this package.');
            return;
        }

        // Get package data from the table row
        const row = $(this).closest('tr');
        const customerIdCell = row.find('.customer-id');
        const customerId = customerIdCell.data('id');

        if (!customerId) {
            alert('Customer information not found');
            return;
        }

        // Create package object for the map modal
        const packageData = {
            _id: packageId,
            customer_id: customerId,
            path: path
        };

        // Show the map modal
        window.mapModal.showRoute(packageData);
    });

    // Listen for custom events from modal components
    $(document).on('packageAdded', function(event, companyId) {
        loadPackages(companyId);
    });

    $(document).on('locationAdded', function(event, packageId) {
        loadPackages(companyId);
    });
});