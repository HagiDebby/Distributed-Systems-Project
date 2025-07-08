/**
 * Company Modal Component
 * Handles all functionality related to the Add Company modal
 */

class CompanyModal {
    constructor() {
        this.modalId = 'companyModal';
        this.formId = 'companyForm';
    }

    /**
     * Initialize the company modal events
     */
    init() {
        this.setupEventListeners();
    }

    /**
     * Set up all event listeners for the company modal
     */
    setupEventListeners() {
        // Handle company form submission
        $(document).on('submit', '#companyForm', (e) => {
            this.handleSubmit(e);
        });
    }

    /**
     * Show the company modal
     */
    show() {
        // Reset form
        window.modalManager.resetForm(this.formId);

        // Show the modal
        window.modalManager.showModal(this.modalId);
    }

    /**
     * Hide the company modal
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

        const name = $('#companyName').val();
        const site_url = $('#companyUrl').val();

        $.ajax({
            url: '/business',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ name, site_url }),
            success: () => {
                alert('Company added successfully!');
                this.hide();
                // Trigger custom event for parent to reload companies
                $(document).trigger('companyAdded');
            },
            error: (xhr) => {
                alert("Error: " + (xhr.responseJSON && xhr.responseJSON.message ? xhr.responseJSON.message : "Unknown error"));
            }
        });
    }
}

// Create global instance
window.companyModal = new CompanyModal();