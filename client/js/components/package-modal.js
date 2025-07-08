/**
 * Package Modal Component
 * Handles all functionality related to the Add Package modal
 */

class PackageModal {
    constructor() {
        this.modalId = 'packageModal';
        this.formId = 'packageForm';
        this.customers = []; // Cache for customers
        this.selectedCustomer = null;
    }

    /**
     * Initialize the package modal events
     */
    init() {
        this.setupEventListeners();
        this.loadCustomers(); // Load customers on init
    }

    /**
     * Load all customers from the server
     */
    async loadCustomers() {
        try {
            const response = await $.get('/customers');
            this.customers = response || [];
            console.log(`Loaded ${this.customers.length} customers`);
        } catch (error) {
            console.error('Failed to load customers:', error);
            this.customers = [];
        }
    }

    /**
     * Set up all event listeners for the package modal
     */
    setupEventListeners() {
        // Customer input focus - show dropdown
        $(document).on('focus', '#customerInput', (e) => {
            this.showCustomerDropdown();
        });

        // Customer input typing - filter dropdown
        $(document).on('input', '#customerInput', (e) => {
            const query = $(e.target).val().trim();
            this.filterAndShowCustomers(query);

            // Clear selection if user types after selecting
            if (this.selectedCustomer && $(e.target).val() !== this.selectedCustomer.name) {
                this.clearCustomerSelection();
            }
        });

        // Customer input blur - hide dropdown after a delay
        $(document).on('blur', '#customerInput', (e) => {
            setTimeout(() => {
                this.hideCustomerDropdown();
            }, 200); // Delay to allow clicking on dropdown items
        });

        // Customer dropdown item click
        $(document).on('click', '.customer-dropdown-item', (e) => {
            const customerId = $(e.currentTarget).data('customer-id');
            this.selectCustomer(customerId);
        });

        // Handle package form submission
        $(document).on('submit', '#packageForm', (e) => {
            this.handleSubmit(e);
        });

        // Hide dropdown when clicking outside
        $(document).on('click', (e) => {
            if (!$(e.target).closest('.customer-dropdown-container').length) {
                this.hideCustomerDropdown();
            }
        });
    }

    /**
     * Show the package modal
     * @param {string} companyId - Company ID to set in the form
     */
    show(companyId) {
        if (companyId) {
            $('#companyId').val(companyId);
        }

        // Reset form and clear selection
        window.modalManager.resetForm(this.formId);
        this.clearCustomerSelection();
        this.hideCustomerDropdown();

        // Set minimum datetime to current time
        const now = new Date();
        now.setMinutes(now.getMinutes() + 30); // Set minimum to 30 minutes from now
        $('#eta').attr('min', epochToDateTime(Math.floor(now.getTime() / 1000)));

        // Reload customers to ensure fresh data
        this.loadCustomers();

        // Show the modal
        window.modalManager.showModal(this.modalId);
    }

    /**
     * Hide the package modal
     */
    hide() {
        this.hideCustomerDropdown();
        window.modalManager.hideModal(this.modalId);
    }

    /**
     * Filter customers based on search query
     * @param {string} query - Search query
     * @returns {Array} Filtered customers
     */
    filterCustomers(query) {
        if (!query) return this.customers;

        const lowerQuery = query.toLowerCase();
        return this.customers.filter(customer =>
            customer.name.toLowerCase().includes(lowerQuery) ||
            customer.email.toLowerCase().includes(lowerQuery) ||
            (customer.address &&
                (customer.address.city.toLowerCase().includes(lowerQuery) ||
                    customer.address.street.toLowerCase().includes(lowerQuery)))
        );
    }

    /**
     * Show customer dropdown with all customers
     */
    showCustomerDropdown() {
        this.filterAndShowCustomers('');
    }

    /**
     * Filter and show customers in dropdown
     * @param {string} query - Search query
     */
    filterAndShowCustomers(query) {
        const filteredCustomers = this.filterCustomers(query);
        const dropdown = $('#customerDropdown');

        if (filteredCustomers.length === 0) {
            dropdown.html('<div class="customer-dropdown-item" style="color: #999;">No customers found</div>');
        } else {
            let html = '';
            filteredCustomers.forEach(customer => {
                const address = customer.address ?
                    `${customer.address.street} ${customer.address.number}, ${customer.address.city}` :
                    'No address';

                html += `
          <div class="customer-dropdown-item" data-customer-id="${customer._id}">
            <div class="customer-name">${customer.name}</div>
            <div class="customer-email">${customer.email}</div>
            <div class="customer-address">${address}</div>
          </div>
        `;
            });
            dropdown.html(html);
        }

        dropdown.show();
    }

    /**
     * Hide customer dropdown
     */
    hideCustomerDropdown() {
        $('#customerDropdown').hide();
    }

    /**
     * Select a customer from dropdown
     * @param {string} customerId - Customer ID
     */
    selectCustomer(customerId) {
        const customer = this.customers.find(c => c._id === customerId);
        if (!customer) return;

        this.selectedCustomer = customer;
        $('#selectedCustomerId').val(customerId);
        $('#customerInput').val(customer.name).addClass('customer-input-selected');
        this.hideCustomerDropdown();
    }

    /**
     * Clear customer selection
     */
    clearCustomerSelection() {
        this.selectedCustomer = null;
        $('#selectedCustomerId').val('');
        $('#customerInput').removeClass('customer-input-selected');
    }

    /**
     * Handle form submission
     * @param {Event} e - Form submit event
     */
    handleSubmit(e) {
        e.preventDefault();

        const companyId = $('#companyId').val();
        const customerId = $('#selectedCustomerId').val();

        if (!customerId) {
            alert('Please select a customer from the dropdown');
            $('#customerInput').focus();
            return;
        }

        // Get current timestamp for start_date
        const startDate = Math.floor(Date.now() / 1000);
        const etaDateTime = $('#eta').val();

        if (!etaDateTime) {
            alert('Please select an ETA date and time');
            $('#eta').focus();
            return;
        }

        const eta = dateTimeToEpoch(etaDateTime);

        // Validate that ETA is after start date
        if (eta <= startDate) {
            alert('ETA must be in the future');
            $('#eta').focus();
            return;
        }

        const packageData = {
            prod_id: $('#prodId').val().trim(),
            name: $('#packageName').val().trim(),
            customer_id: customerId,
            business_id: companyId,
            start_date: startDate,
            eta: eta,
            status: $('#status').val()
        };

        // Show loading state
        const submitBtn = $('#packageForm button[type="submit"]');
        const originalText = submitBtn.text();
        submitBtn.text('Adding...').prop('disabled', true);

        $.ajax({
            url: `/packages`,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(packageData),
            success: () => {
                alert('Package added successfully!');
                this.hide();
                // Trigger custom event for parent to reload packages
                $(document).trigger('packageAdded', [companyId]);
            },
            error: (xhr) => {
                console.error('Package creation error:', xhr.responseJSON);
                const errorMessage = xhr.responseJSON && xhr.responseJSON.message ?
                    xhr.responseJSON.message : "Unknown error occurred";
                alert("Error: " + errorMessage);
            },
            complete: () => {
                // Restore button state
                submitBtn.text(originalText).prop('disabled', false);
            }
        });
    }
}

// Create global instance
window.packageModal = new PackageModal();