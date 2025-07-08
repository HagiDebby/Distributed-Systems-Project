/**
 * Customer Modal Component
 * Handles all functionality related to the Add Customer modal
 */

class CustomerModal {
    constructor() {
        this.modalId = 'customerModal';
        this.formId = 'customerForm';
    }

    /**
     * Initialize the customer modal events
     */
    init() {
        this.setupEventListeners();
    }

    /**
     * Set up all event listeners for the customer modal
     */
    setupEventListeners() {
        // Handle customer form submission
        $(document).on('submit', '#customerForm', (e) => {
            this.handleSubmit(e);
        });
    }

    /**
     * Show the customer modal
     */
    show() {
        // Reset form
        window.modalManager.resetForm(this.formId);

        // Show the modal
        window.modalManager.showModal(this.modalId);
    }

    /**
     * Hide the customer modal
     */
    hide() {
        window.modalManager.hideModal(this.modalId);
    }

    /**
     * Handle form submission
     * @param {Event} e - Form submit event
     */
    handleSubmit(e) {
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
            success: () => {
                alert('Customer added successfully!');
                this.hide();
                // Trigger custom event for parent to reload or update
                $(document).trigger('customerAdded');
            },
            error: (xhr) => {
                alert("Error: " + (xhr.responseJSON && xhr.responseJSON.message ? xhr.responseJSON.message : "Unknown error"));
            }
        });
    }
}

// Create global instance
window.customerModal = new CustomerModal();