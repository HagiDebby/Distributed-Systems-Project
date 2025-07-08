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
// Load packages for company
function loadPackages(companyId) {
    $.get(`/business/${companyId}/packages`, function(result) {
        let packages = result;
        if (!Array.isArray(packages)) packages = packages.data || [];

        // Store packages globally for later use
        window.currentPackages = packages;

        // Sort by start_date descending
        packages.sort((a, b) => b.start_date - a.start_date);
        let rows = '';
        packages.forEach((pkg, index) => {
            // Handle customer_id conversion more robustly
            let customerIdString;
            if (pkg.customer_id && typeof pkg.customer_id === 'object') {
                // Handle MongoDB ObjectId object
                if (pkg.customer_id.$oid) {
                    customerIdString = pkg.customer_id.$oid;
                } else if (pkg.customer_id._id) {
                    customerIdString = pkg.customer_id._id;
                } else if (pkg.customer_id.toString && typeof pkg.customer_id.toString === 'function') {
                    customerIdString = pkg.customer_id.toString();
                } else {
                    customerIdString = JSON.stringify(pkg.customer_id);
                }
            } else {
                customerIdString = String(pkg.customer_id);
            }

            console.log(`Package ${index}: customer_id object:`, pkg.customer_id, 'converted to string:', customerIdString);

            // Store the package index for easy lookup
            rows += `<tr data-package-index="${index}">
        <td class="pointer package-route" data-package-index="${index}">${pkg._id}</td>
        <td>${pkg.prod_id}</td>
        <td>${pkg.name}</td>
        <td class="pointer customer-id" data-id="${customerIdString}" data-customer-object='${JSON.stringify(pkg.customer_id)}'>${customerIdString}</td>
        <td>${formatDate(pkg.start_date)}</td>
        <td>${formatDate(pkg.eta)}</td>
        <td>${pkg.status}</td>
        <td>
          <button class="btn btn-primary add-loc-to-path" data-package-id="${pkg._id}">Add to Route</button>
          <button class="btn btn-info package-route" data-package-index="${index}">Show Route</button>
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
    window.modalManager.loadModals(['add-package-modal', 'location-modal', 'map-modal', 'customer-details-modal'])
        .then(() => {
            // Initialize modal components after loading
            window.packageModal.init();
            window.locationModal.init();
            window.mapModal.init();
            window.customerDetailsModal.init();

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
        // Try to get the customer ID from the data attribute (string version)
        const customerIdString = $(this).data('id');
        // Also get the original object version as fallback
        const customerObjectData = $(this).data('customer-object');

        console.log('Customer ID clicked (string):', customerIdString);
        console.log('Customer ID clicked (object):', customerObjectData);

        let customerIdToUse = customerIdString;

        // If the string version is still [object Object], try to use the object data
        if (customerIdString === '[object Object]' && customerObjectData) {
            if (typeof customerObjectData === 'object') {
                customerIdToUse = customerObjectData;
            } else if (typeof customerObjectData === 'string') {
                try {
                    const parsed = JSON.parse(customerObjectData);
                    customerIdToUse = parsed;
                } catch (e) {
                    customerIdToUse = customerObjectData;
                }
            }
        }

        console.log('Final customer ID to use:', customerIdToUse);

        if (!customerIdToUse) {
            alert('Customer ID not found');
            return;
        }

        // Show customer details modal
        window.customerDetailsModal.showCustomer(customerIdToUse);
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

    // Show package path on click (map) - works for both Package ID and Show Route button
    $('#packagesTable').on('click', '.package-route', function() {
        // Get package data from stored packages array using index
        const packageIndex = $(this).data('package-index') !== undefined ?
            $(this).data('package-index') :
            $(this).closest('tr').data('package-index');

        if (packageIndex === undefined || !window.currentPackages) {
            alert('Package data not found. Please refresh the page.');
            return;
        }

        const packageData = window.currentPackages[packageIndex];

        console.log('Show Route: Package data from server:', packageData);
        console.log('Show Route: Customer ID from package:', packageData.customer_id);
        console.log('Show Route: Customer ID type:', typeof packageData.customer_id);

        if (!packageData.path || !Array.isArray(packageData.path)) {
            alert('No path data for this package.');
            return;
        }

        // Show the map modal with the complete package data
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