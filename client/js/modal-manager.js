/**
 * Modal Manager - Component-like system for loading and managing modals
 * This provides React-like component functionality for vanilla JS
 */

class ModalManager {
    constructor() {
        this.loadedModals = new Set();
        this.modalContainer = null;
    }

    /**
     * Initialize the modal container
     */
    init() {
        // Create a container for modals if it doesn't exist
        if (!this.modalContainer) {
            this.modalContainer = document.createElement('div');
            this.modalContainer.id = 'modal-container';
            document.body.appendChild(this.modalContainer);
        }
    }

    /**
     * Load a modal component from template file
     * @param {string} modalName - Name of the modal template file (without .html)
     * @param {string} templatePath - Path to templates folder
     * @returns {Promise} - Resolves when modal is loaded
     */
    async loadModal(modalName, templatePath = '/templates') {
        // Check if modal is already loaded
        if (this.loadedModals.has(modalName)) {
            return Promise.resolve();
        }

        try {
            const response = await fetch(`${templatePath}/${modalName}.html`);
            if (!response.ok) {
                throw new Error(`Failed to load modal: ${modalName}`);
            }

            const html = await response.text();

            // Create a temporary div to parse the HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;

            // Append the modal to the container
            while (tempDiv.firstChild) {
                this.modalContainer.appendChild(tempDiv.firstChild);
            }

            // Mark as loaded
            this.loadedModals.add(modalName);

            console.log(`Modal ${modalName} loaded successfully`);
            return Promise.resolve();

        } catch (error) {
            console.error(`Error loading modal ${modalName}:`, error);
            return Promise.reject(error);
        }
    }

    /**
     * Load multiple modals at once
     * @param {Array} modalNames - Array of modal names to load
     * @param {string} templatePath - Path to templates folder
     * @returns {Promise} - Resolves when all modals are loaded
     */
    async loadModals(modalNames, templatePath = '/templates') {
        const loadPromises = modalNames.map(name => this.loadModal(name, templatePath));
        return Promise.all(loadPromises);
    }

    /**
     * Show a modal by ID
     * @param {string} modalId - ID of the modal to show
     */
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
        } else {
            console.error(`Modal with ID ${modalId} not found`);
        }
    }

    /**
     * Hide a modal by ID
     * @param {string} modalId - ID of the modal to hide
     */
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }

    /**
     * Hide all modals
     */
    hideAllModals() {
        const modals = document.querySelectorAll('.modal-bg');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
    }

    /**
     * Set up global modal event listeners (close buttons, background clicks)
     */
    setupGlobalListeners() {
        // Close modal when clicking the X button
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('close-modal')) {
                this.hideAllModals();
            }
        });

        // Close modal when clicking background
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-bg')) {
                this.hideAllModals();
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideAllModals();
            }
        });
    }

    /**
     * Reset/clear a form in a modal
     * @param {string} formId - ID of the form to reset
     */
    resetForm(formId) {
        const form = document.getElementById(formId);
        if (form) {
            // Store important values before reset
            const packageId = form.querySelector('#packageId')?.value;
            const companyId = form.querySelector('#companyId')?.value;

            form.reset();

            // Restore important values after reset
            if (packageId && form.querySelector('#packageId')) {
                form.querySelector('#packageId').value = packageId;
            }
            if (companyId && form.querySelector('#companyId')) {
                form.querySelector('#companyId').value = companyId;
            }

            // Clear any custom elements (like search results)
            const searchResults = form.querySelectorAll('[id$="Results"], [id$="searchResults"]');
            searchResults.forEach(element => {
                element.innerHTML = '';
                element.style.display = 'none';
            });

            // Clear other hidden fields except packageId and companyId
            const hiddenInputs = form.querySelectorAll('input[type="hidden"]');
            hiddenInputs.forEach(input => {
                if (input.id !== 'packageId' && input.id !== 'companyId') {
                    input.value = '';
                }
            });
        }
    }
}

// Create global instance
window.modalManager = new ModalManager();

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModalManager;
}