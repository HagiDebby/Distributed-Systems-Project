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
            $('#companyId').val(companyId);
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
          <button class="btn btn-primary add-loc-to-path" data-id="${pkg._id}">Add to Route</button>
          <button class="btn btn-info package-route" data-path='${JSON.stringify(pkg.path || [])}'>Show Route</button>
        </td>
      </tr>`;
        });
        $('#packagesTable tbody').html(rows.length ? rows : '<tr><td colspan="7">No packages found.</td></tr>');
    }).fail(function() {
        $('#packagesTable tbody').html('<tr><td colspan="7">Failed to load packages.</td></tr>');
    });
}

$(document).ready(function() {
    const companyId = getCompanyIdFromUrl();
    if (!companyId) {
        $('.col-sm-10').html('<h2>No company selected.</h2>');
        return;
    }
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

    // Modal handling
    $('.close-modal').on('click', function() {
        $('#packageModal').hide();
        $('#locationModal').hide();
    });

    // Click outside modal to close
    $(document).on('click', function(e) {
        if ($(e.target).hasClass('modal-bg')) {
            $('#packageModal').hide();
            $('#locationModal').hide();
        }
    });

    // Tab switching
    $('.tab-button').on('click', function() {
        const tabId = $(this).data('tab');
        $('.tab-button').removeClass('active');
        $(this).addClass('active');
        $('.tab-content').removeClass('active');
        $(`#${tabId}Tab`).addClass('active');
    });

    // Show add package modal
    $('#addPackageTop, #addPackageBottom').on('click', function() {
        $('#packageForm')[0].reset();
        $('#customerResults').empty().hide();
        $('#selectedCustomerId').val('');
        $('#packageModal').show();
    });

    // Search customers for advanced selection
    $('#searchCustomerBtn').on('click', function() {
        const searchTerm = $('#customerSearch').val().trim();
        if (!searchTerm) {
            $('#customerResults').html('<div class="customer-result">Please enter search term</div>').show();
            return;
        }

        $.get('/customers', function(customers) {
            const results = customers.filter(c =>
                c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.email.toLowerCase().includes(searchTerm.toLowerCase())
            );

            if (results.length === 0) {
                $('#customerResults').html('<div class="customer-result">No customers found</div>').show();
                return;
            }

            let html = '';
            results.forEach(customer => {
                html += `<div class="customer-result" data-id="${customer._id}" data-name="${customer.name}" data-email="${customer.email}">
          <strong>${customer.name}</strong><br>
          ${customer.email}
        </div>`;
            });

            $('#customerResults').html(html).show();
        });
    });

    // Select customer from search results
    $('#customerResults').on('click', '.customer-result', function() {
        const customerId = $(this).data('id');
        const customerName = $(this).data('name');
        $('#selectedCustomerId').val(customerId);
        $('#customerSearch').val(`${customerName} (selected)`);
        $('#customerResults').hide();
    });

    // Handle package form submission
    $('#packageForm').on('submit', function(e) {
        e.preventDefault();
        const companyId = $('#companyId').val();
        const customerId = $('#advancedTab').hasClass('active') ? $('#selectedCustomerId').val() : $('#customerId').val();

        if (!customerId) {
            alert('Please select a customer');
            return;
        }

        // Get current timestamp for start_date
        const startDate = Math.floor(Date.now() / 1000); // Current time in seconds
        const eta = $('#eta').val();

        // Validate that ETA is after start date
        if (Number(eta) <= startDate) {
            alert('ETA must be after the current time');
            return;
        }

        const packageData = {
            prod_id: $('#prodId').val(),
            name: $('#packageName').val(),
            customer_id: customerId,
            business_id: companyId,
            start_date: startDate,
            eta: eta,
            status: $('#status').val()
        };

        $.ajax({
            url: `/packages`,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(packageData),
            success: function() {
                alert('Package added successfully!');
                $('#packageModal').hide();
                loadPackages(companyId);
            },
            error: function(xhr) {
                alert("Error: " + (xhr.responseJSON && xhr.responseJSON.message ? xhr.responseJSON.message : "Unknown error"));
            }
        });
    });

    // Add location to package path - show modal
    $('#packagesTable').on('click', '.add-loc-to-path', function() {
        const packageId = $(this).data('id');
        $('#packageId').val(packageId);
        $('#locationSearch').val('');
        $('#searchResult').html('');
        $('#locLat').val('');
        $('#locLon').val('');
        $('#addLocBtn').prop('disabled', true);
        $('#locationModal').show();
    });

    // Search location using LocationIQ
    $('#searchLocationBtn').on('click', function() {
        const query = $('#locationSearch').val().trim();
        if (!query) {
            $('#searchResult').html('<span style="color:red;">Please enter a location to search.</span>');
            return;
        }

        $('#searchResult').html('Searching...');
        const apiKey = 'pk.c52ccfeb30e8982c368c12b8d4fc83dd'; // Replace with your LocationIQ key

        $.get(`https://us1.locationiq.com/v1/search.php?key=${apiKey}&q=${encodeURIComponent(query)}&format=json`, function(data) {
            if (Array.isArray(data) && data.length > 0) {
                const loc = data[0];
                $('#searchResult').html(
                    `<b>Found:</b> ${loc.display_name}<br>
           <b>Lat:</b> ${loc.lat}, <b>Lon:</b> ${loc.lon}`
                );
                $('#locLat').val(loc.lat);
                $('#locLon').val(loc.lon);
                $('#addLocBtn').prop('disabled', false);
            } else {
                $('#searchResult').html('<span style="color:red;">No location found. Try again.</span>');
                $('#addLocBtn').prop('disabled', true);
            }
        }).fail(function() {
            $('#searchResult').html('<span style="color:red;">Error searching location. Try again.</span>');
            $('#addLocBtn').prop('disabled', true);
        });
    });

    // Handle location form submission
    $('#locationForm').on('submit', function(e) {
        e.preventDefault();
        const packageId = $('#packageId').val();
        const lat = $('#locLat').val();
        const lon = $('#locLon').val();

        if (!lat || !lon) {
            alert('Please search and select a location first');
            return;
        }

        $.ajax({
            url: `/packages/${packageId}/path`,
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({ lat, lon }),
            success: function() {
                alert('Location added successfully!');
                $('#locationModal').hide();
                loadPackages(getCompanyIdFromUrl());
            },
            error: function(xhr) {
                alert("Error: " + (xhr.responseJSON && xhr.responseJSON.message ? xhr.responseJSON.message : "Unknown error"));
            }
        });
    });

    // Show package path on click (map)
    $('#packagesTable').on('click', '.package-route', function() {
        const path = $(this).data('path');
        if (!path || !Array.isArray(path) || path.length === 0) {
            alert('No path data for this package.');
            return;
        }

        // Build Geoapify static map URL
        const apiKey = '34f2ec45ff2945c9896a5401cce5f107'; // Replace with your API key
        const markers = path.map((p, i) =>
            `lonlat:${p.lon},${p.lat};type:material;color:%231f63e6;size:x-large;icon:cloud;icontype:awesome;text:${i+1};whitecircle:no`
        ).join('|');
        const mapUrl = `https://maps.geoapify.com/v1/staticmap?style=osm-bright-grey&width=600&height=400&marker=${markers}&apiKey=${apiKey}`;
        window.open(mapUrl, '_blank');
    });
});