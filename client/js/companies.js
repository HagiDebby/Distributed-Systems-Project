// Load companies
function loadCompanies() {
    $.get('/business', function(companies) {
        let rows = '';
        companies.forEach(company => {
            rows += `<tr>
        <td class="pointer company-name" data-id="${company._id}">${company.name}</td>
        <td><a href="${company.site_url}" target="_blank">${company.site_url}</a></td>
      </tr>`;
        });
        $('#companiesTable tbody').html(rows);
    });
}

$(document).ready(function() {
    loadCompanies();

    // Open add company modal
    $('#addCompanyTop, #addCompanyBottom').on('click', function() {
        $('#companyModal').show();
    });

    // Add company
    $('#companyForm').submit(function(e) {
        e.preventDefault();
        const name = $('#companyName').val();
        const site_url = $('#companyUrl').val();
        $.ajax({
            url: '/business',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ name, site_url }),
            success: function() {
                $('#companyModal').hide();
                loadCompanies();
            },
            error: function(xhr) {
                alert("Error: " + (xhr.responseJSON && xhr.responseJSON.message ? xhr.responseJSON.message : "Unknown error"));
            }
        });
    });

    // Go to company packages on name click
    $('#companiesTable').on('click', '.company-name', function() {
        const companyId = $(this).data('id');
        window.location.href = `/business_page?companyId=${companyId}`;
    });

    // Open add customer modal
    $('#addCustomerTop, #addCustomerBottom').on('click', function() {
        $('#customerModal').show();
    });

    // Add customer
    $('#customerForm').submit(function(e) {
        e.preventDefault();
        const name = $('#customerName').val();
        const email = $('#customerEmail').val();
        const street = $('#customerStreet').val();
        const number = $('#customerNumber').val();
        const city = $('#customerCity').val();
        $.ajax({
            url: '/customers',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                name,
                email,
                address: { street, number, city }
            }),
            success: function() {
                $('#customerModal').hide();
                alert('Customer added!');
            },
            error: function(xhr) {
                alert("Error: " + (xhr.responseJSON && xhr.responseJSON.message ? xhr.responseJSON.message : "Unknown error"));
            }
        });
    });

    // Hide modals on background click
    $('.modal-bg').on('click', function(e) {
        if (e.target === this) $(this).hide();
    });
});