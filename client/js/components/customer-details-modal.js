/**
 * Customer Details Modal Component
 * Handles displaying customer information
 */

class CustomerDetailsModal {
    constructor() {
        this.modalId = 'customerDetailsModal';
        this.customers = []; // Cache for customers
    }

    /**
     * Initialize the customer details modal events
     */
    init() {
        this.setupEventListeners();
        this.loadCustomers();
    }

    /**
     * Load all customers for lookup
     */
    async loadCustomers() {
        try {
            const response = await $.get('/customers');
            this.customers = response || [];
            console.log(`Customer Details Modal: Loaded ${this.customers.length} customers`);
        } catch (error) {
            console.error('Failed to load customers:', error);
            this.customers = [];
        }
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Close button
        $(document).on('click', '#closeCustomerDetailsBtn', () => {
            this.hide();
        });
    }

    /**
     * Show customer details by customer ID
     * @param {string} customerId - Customer ID to display
     */
    async showCustomer(customerId) {
        // Ensure we have fresh customer data
        await this.loadCustomers();

        // Convert customer ID to string for comparison (handle ObjectId)
        let customerIdToFind;
        if (customerId && typeof customerId === 'object' && customerId.$oid) {
            customerIdToFind = customerId.$oid;
        } else if (customerId && typeof customerId === 'object' && customerId.toHexString) {
            customerIdToFind = customerId.toHexString();
        } else if (customerId && typeof customerId === 'object') {
            customerIdToFind = customerId._id || customerId.id || String(customerId);
        } else {
            customerIdToFind = String(customerId);
        }

        console.log('Customer Details Modal: Looking for customer ID:', customerIdToFind);

        // Find customer
        const customer = this.customers.find(c => {
            const customerIdString = c._id.toString ? c._id.toString() : String(c._id);
            return customerIdString === customerIdToFind;
        });

        if (!customer) {
            this.showError('Customer not found');
            return;
        }

        console.log('Customer Details Modal: Found customer:', customer);

        // Display customer details
        this.displayCustomerDetails(customer);

        // Show modal
        window.modalManager.showModal(this.modalId);
    }

    /**
     * Display customer details in the modal
     * @param {Object} customer - Customer object
     */
    displayCustomerDetails(customer) {
        // Build address string (without coordinates)
        const address = customer.address ?
            `${customer.address.street} ${customer.address.number}, ${customer.address.city}` :
            'No address available';

        const customerHtml = `
      <div style="padding: 10px 0;">
        <div style="margin-bottom: 15px; padding: 10px; background-color: #f8f9fa; border-radius: 5px;">
          <h4 style="margin: 0 0 10px 0; color: #1f63e6;">👤 Personal Information</h4>
          <p style="margin: 5px 0;"><strong>Name:</strong> ${customer.name}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${customer.email}" style="color: #1f63e6;">${customer.email}</a></p>
          <p style="margin: 5px 0;"><strong>Customer ID:</strong> <code style="background: #e9ecef; padding: 2px 4px; border-radius: 3px;">${customer._id}</code></p>
        </div>
        
        <div style="padding: 10px; background-color: #f8f9fa; border-radius: 5px;">
          <h4 style="margin: 0 0 10px 0; color: #1f63e6;">📍 Address Information</h4>
          <p style="margin: 5px 0;"><strong>Full Address:</strong> ${address}</p>
          ${customer.address ? `
            <p style="margin: 5px 0;"><strong>Street:</strong> ${customer.address.street}</p>
            <p style="margin: 5px 0;"><strong>Number:</strong> ${customer.address.number}</p>
            <p style="margin: 5px 0;"><strong>City:</strong> ${customer.address.city}</p>
          ` : '<p style="margin: 5px 0; color: #666;"><em>No detailed address information available</em></p>'}
        </div>
      </div>
    `;

        $('#customerDetailsContent').html(customerHtml);
    }

    /**
     * Show error message
     * @param {string} message - Error message to display
     */
    showError(message) {
        $('#customerDetailsContent').html(`
      <div style="text-align: center; padding: 20px; color: #dc3545;">
        <p><strong>Error:</strong> ${message}</p>
        <p>Please try again or contact support if the problem persists.</p>
      </div>
    `);

        window.modalManager.showModal(this.modalId);
    }

    /**
     * Hide the customer details modal
     */
    hide() {
        window.modalManager.hideModal(this.modalId);
    }
}

// Create global instance
window.customerDetailsModal = new CustomerDetailsModal();