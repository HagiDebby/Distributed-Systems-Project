/**
 * Location Modal Component
 * Handles all functionality related to the Add Location modal
 */

class LocationModal {
    constructor() {
        this.modalId = 'locationModal';
        this.formId = 'locationForm';
        this.apiKey = 'pk.c52ccfeb30e8982c368c12b8d4fc83dd'; // LocationIQ API key
        this.selectedLocation = null;
    }

    /**
     * Initialize the location modal events
     */
    init() {
        this.setupEventListeners();
    }

    /**
     * Set up all event listeners for the location modal
     */
    setupEventListeners() {
        // Search location button
        $(document).on('click', '#searchLocationBtn', () => {
            this.searchLocation();
        });

        // Enter key to search
        $(document).on('keypress', '#locationSearch', (e) => {
            if (e.which === 13) { // Enter key
                e.preventDefault();
                this.searchLocation();
            }
        });

        // Location result item click
        $(document).on('click', '.location-result-item', (e) => {
            this.selectLocation(e.currentTarget);
        });

        // Handle location form submission
        $(document).on('submit', '#locationForm', (e) => {
            this.handleSubmit(e);
        });
    }

    /**
     * Show the location modal
     * @param {string} packageId - Package ID to add location to
     */
    show(packageId) {
        console.log('LocationModal.show() called with packageId:', packageId); // Debug log

        if (!packageId) {
            alert('Package ID is required to add location');
            return;
        }

        // Set package ID first
        $('#packageId').val(packageId);

        // Reset form but preserve packageId (resetForm will now preserve it)
        window.modalManager.resetForm(this.formId);

        // Ensure packageId is still set after reset
        $('#packageId').val(packageId);

        // Verify the value was set
        const verifyId = $('#packageId').val();
        console.log('Package ID set in hidden field after reset:', verifyId); // Debug log

        this.clearLocationSelection();
        $('#searchResults').html('').hide();
        $('#addLocBtn').prop('disabled', true);

        // Show the modal
        window.modalManager.showModal(this.modalId);

        // Focus on search input
        setTimeout(() => {
            $('#locationSearch').focus();
        }, 100);
    }

    /**
     * Hide the location modal
     */
    hide() {
        window.modalManager.hideModal(this.modalId);
    }

    /**
     * Search for location using LocationIQ API
     */
    searchLocation() {
        const query = $('#locationSearch').val().trim();
        if (!query) {
            this.showSearchStatus('Please enter a location to search.', 'error');
            return;
        }

        this.showSearchStatus('Searching...', 'loading');
        this.clearLocationSelection();

        $.get(`https://us1.locationiq.com/v1/search.php?key=${this.apiKey}&q=${encodeURIComponent(query)}&format=json&limit=10`)
            .done((data) => {
                this.displayLocationResults(data);
            })
            .fail(() => {
                this.showSearchStatus('Error searching location. Please try again.', 'error');
            });
    }

    /**
     * Check if coordinates are within Israel boundaries
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     * @returns {boolean} True if within Israel boundaries
     */
    isWithinIsraelBounds(lat, lon) {
        return lat >= 29 && lat <= 35 && lon >= 34 && lon <= 36;
    }

    /**
     * Display search results
     * @param {Array} results - Array of location results from API
     */
    displayLocationResults(results) {
        const resultsContainer = $('#searchResults');

        if (!Array.isArray(results) || results.length === 0) {
            this.showSearchStatus('No locations found. Try a different search term.', 'error');
            return;
        }

        let html = '';
        results.forEach((location, index) => {
            const displayName = location.display_name || 'Unknown location';
            const lat = parseFloat(location.lat);
            const lon = parseFloat(location.lon);
            const latDisplay = lat.toFixed(6);
            const lonDisplay = lon.toFixed(6);

            // Check if location is within Israel boundaries
            const isInBounds = this.isWithinIsraelBounds(lat, lon);
            const boundaryClass = isInBounds ? '' : 'out-of-bounds';

            // Extract main components for better display
            const parts = displayName.split(', ');
            const mainName = parts.slice(0, 2).join(', ');
            const details = parts.slice(2).join(', ');

            html += `
        <div class="location-result-item ${boundaryClass}" 
             data-lat="${location.lat}" 
             data-lon="${location.lon}" 
             data-name="${displayName}"
             data-in-bounds="${isInBounds}"
             data-index="${index}">
          <div class="location-name">${mainName}</div>
          ${details ? `<div class="location-details">${details}</div>` : ''}
          <div class="location-coordinates">Lat: ${latDisplay}, Lon: ${lonDisplay}</div>
          ${!isInBounds ? '<div class="location-warning">⚠️ Outside Israel boundaries - may be rejected by server</div>' : ''}
        </div>
      `;
        });

        resultsContainer.html(html).show();
    }

    /**
     * Show search status message
     * @param {string} message - Status message
     * @param {string} type - Status type (loading, error, success)
     */
    showSearchStatus(message, type = 'info') {
        const resultsContainer = $('#searchResults');
        const statusClass = type === 'error' ? 'color:red;' :
            type === 'loading' ? 'color:#1f63e6;' : 'color:#666;';

        resultsContainer.html(`<div class="search-status" style="${statusClass}">${message}</div>`).show();
    }

    /**
     * Select a location from results
     * @param {HTMLElement} element - The clicked location result element
     */
    selectLocation(element) {
        // Remove previous selection
        $('.location-result-item').removeClass('selected');

        // Add selection to clicked item
        $(element).addClass('selected');

        const isInBounds = $(element).data('in-bounds');

        // Store selection data
        this.selectedLocation = {
            lat: $(element).data('lat'),
            lon: $(element).data('lon'),
            name: $(element).data('name'),
            inBounds: isInBounds
        };

        // Update hidden fields
        $('#selectedLat').val(this.selectedLocation.lat);
        $('#selectedLon').val(this.selectedLocation.lon);
        $('#selectedLocationName').val(this.selectedLocation.name);

        // Enable add button but show warning if out of bounds
        $('#addLocBtn').prop('disabled', false);

        if (!isInBounds) {
            $('#addLocBtn').text('Add Location (Out of Bounds)').addClass('btn-warning');
        } else {
            $('#addLocBtn').text('Add Location').removeClass('btn-warning');
        }

        console.log('Location selected:', this.selectedLocation);
    }

    /**
     * Clear location selection
     */
    clearLocationSelection() {
        this.selectedLocation = null;
        $('#selectedLat').val('');
        $('#selectedLon').val('');
        $('#selectedLocationName').val('');
        $('.location-result-item').removeClass('selected');
        $('#addLocBtn').prop('disabled', true).text('Add Location').removeClass('btn-warning');
    }

    /**
     * Handle form submission
     * @param {Event} e - Form submit event
     */
    handleSubmit(e) {
        e.preventDefault();

        const packageId = $('#packageId').val();
        const lat = $('#selectedLat').val();
        const lon = $('#selectedLon').val();

        console.log('Form submission - Package ID:', packageId, 'Lat:', lat, 'Lon:', lon); // Debug log

        if (!packageId) {
            alert('Package ID is missing. Please try again.');
            console.error('Package ID is missing from form submission');
            return;
        }

        if (!lat || !lon) {
            alert('Please search and select a location first');
            return;
        }

        // Show loading state
        const submitBtn = $('#addLocBtn');
        const originalText = submitBtn.text();
        submitBtn.text('Adding...').prop('disabled', true);

        // Construct URL and log it
        const url = `/packages/${packageId}/path`;
        console.log('Making request to URL:', url); // Debug log

        // Fixed URL construction - was missing packageId
        $.ajax({
            url: url,
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({
                lat: parseFloat(lat),
                lon: parseFloat(lon)
            }),
            success: () => {
                alert('Location added successfully!');
                this.hide();
                // Trigger custom event for parent to reload packages
                $(document).trigger('locationAdded', [packageId]);
            },
            error: (xhr) => {
                console.error('Location addition error:', xhr);
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
window.locationModal = new LocationModal();