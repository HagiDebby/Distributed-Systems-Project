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
    // Initialize modal system
    window.modalManager.init();

    // Load required modals for this page
    window.modalManager.loadModals(['company-modal', 'customer-modal'])
        .then(() => {
            // Initialize modal components after loading
            window.companyModal.init();
            window.customerModal.init();

            // Set up global modal listeners
            window.modalManager.setupGlobalListeners();

            console.log('All modals loaded and initialized');
        })
        .catch(error => {
            console.error('Failed to load modals:', error);
        });

    // Load initial data
    loadCompanies();

    // Open add company modal
    $('#addCompanyTop, #addCompanyBottom').on('click', function() {
        window.companyModal.show();
    });

    // Go to company packages on name click
    $('#companiesTable').on('click', '.company-name', function() {
        const companyId = $(this).data('id');
        window.location.href = `/business_page?companyId=${companyId}`;
    });

    // Open add customer modal
    $('#addCustomerTop, #addCustomerBottom').on('click', function() {
        window.customerModal.show();
    });

    // Listen for custom events from modal components
    $(document).on('companyAdded', function() {
        loadCompanies();
    });

    $(document).on('customerAdded', function() {
        // Customer was added successfully
        console.log('Customer added successfully');
    });
});