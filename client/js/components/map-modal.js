/**
 * Map Modal Component
 * Handles displaying package routes on a map
 */

class MapModal {
    constructor() {
        this.modalId = 'mapModal';
        this.apiKey = '34f2ec45ff2945c9896a5401cce5f107'; // Geoapify API key
        this.currentPackage = null;
        this.customers = []; // Cache for customers
    }

    /**
     * Initialize the map modal events
     */
    init() {
        this.setupEventListeners();
        this.loadCustomers();
    }

    /**
     * Load all customers for address lookup
     */
    async loadCustomers() {
        try {
            const response = await $.get('/customers');
            this.customers = response || [];
            console.log(`Map Modal: Loaded ${this.customers.length} customers`);
        } catch (error) {
            console.error('Failed to load customers for map:', error);
            this.customers = [];
        }
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Close button
        $(document).on('click', '#closeMapBtn', () => {
            this.hide();
        });

        // Retry button
        $(document).on('click', '#retryMapBtn', () => {
            if (this.currentPackage) {
                this.showRoute(this.currentPackage);
            }
        });
    }

    /**
     * Show the map modal with package route
     * @param {Object} packageData - Package object with path and customer_id
     */
    async showRoute(packageData) {
        this.currentPackage = packageData;

        console.log('Map Modal: Package data received:', packageData);
        console.log('Map Modal: Looking for customer ID:', packageData.customer_id);
        console.log('Map Modal: Customer ID type:', typeof packageData.customer_id);

        // Ensure we have fresh customer data
        await this.loadCustomers();

        // Show modal with loading state
        $('#mapModalTitle').text(`Route for Package: ${packageData.name}`);
        this.showLoading();
        window.modalManager.showModal(this.modalId);

        // Debug: Log all customer IDs and their types
        console.log('Map Modal: Available customers:', this.customers);
        console.log('Map Modal: Available customer IDs:', this.customers.map(c => ({id: c._id, type: typeof c._id})));

        // Convert package customer_id to string for comparison
        // Handle MongoDB ObjectId properly
        let customerIdToFind;
        if (packageData.customer_id && typeof packageData.customer_id === 'object' && packageData.customer_id.$oid) {
            // MongoDB ObjectId with $oid property
            customerIdToFind = packageData.customer_id.$oid;
        } else if (packageData.customer_id && typeof packageData.customer_id === 'object' && packageData.customer_id.toHexString) {
            // MongoDB ObjectId with toHexString method
            customerIdToFind = packageData.customer_id.toHexString();
        } else if (packageData.customer_id && typeof packageData.customer_id === 'object') {
            // Try to get the _id or id property
            customerIdToFind = packageData.customer_id._id || packageData.customer_id.id || String(packageData.customer_id);
        } else {
            // Regular string or number
            customerIdToFind = String(packageData.customer_id);
        }

        console.log('Map Modal: Customer ID to find (converted):', customerIdToFind);
        console.log('Map Modal: Conversion method used for:', typeof packageData.customer_id);

        // Find customer for this package - compare strings
        const customer = this.customers.find(c => {
            const customerIdString = c._id.toString ? c._id.toString() : String(c._id);
            console.log(`Comparing: "${customerIdString}" === "${customerIdToFind}" = ${customerIdString === customerIdToFind}`);
            return customerIdString === customerIdToFind;
        });

        console.log('Map Modal: Found customer:', customer);

        if (!customer) {
            console.error('Map Modal: Customer not found after string comparison');
            console.error('Map Modal: Package customer_id:', customerIdToFind);
            console.error('Map Modal: Available customer ID strings:', this.customers.map(c => c._id.toString()));
            this.showError('Customer information not found');
            return;
        }

        // Display customer info
        this.displayCustomerInfo(customer);

        // Display route info
        this.displayRouteInfo(packageData.path);

        // Generate and display map
        this.generateMap(customer, packageData.path);
    }

    /**
     * Generate map URL and display it
     * @param {Object} customer - Customer object with address
     * @param {Array} path - Array of path coordinates
     */
    generateMap(customer, path) {
        try {
            // Determine center coordinates (longitude first, latitude second)
            let centerLon, centerLat;

            if (customer.address && customer.address.lat && customer.address.lon) {
                // Use customer's coordinates as center
                centerLon = customer.address.lon;
                centerLat = customer.address.lat;
            } else if (path && path.length > 0) {
                // Fallback: use last path location as center (path is in descending order)
                const lastLocation = path[path.length - 1];
                centerLon = lastLocation.lon;
                centerLat = lastLocation.lat;
            } else {
                // Default center (Israel) - longitude first, latitude second
                centerLon = 35.2137;
                centerLat = 31.7683;
            }

            // Build markers array (no encoding yet)
            let markers = [];

            // Add customer home marker (if coordinates available) - NO NUMBER, just house icon
            if (customer.address && customer.address.lat && customer.address.lon) {
                const homeMarker = `lonlat:${customer.address.lon},${customer.address.lat};type:material;color:#e74c3c;size:x-large;icon:home;icontype:awesome;whitecircle:no`;
                markers.push(homeMarker);
            }

            // Add path markers in descending order (path is already in descending order - latest first)
            if (path && path.length > 0) {
                path.forEach((location, index) => {
                    const pathMarker = `lonlat:${location.lon},${location.lat};type:material;color:#1f63e6;size:x-large;icon:cloud;icontype:awesome;text:${index + 1};whitecircle:no`;
                    markers.push(pathMarker);
                });
            }

            // If no markers at all, show error
            if (markers.length === 0) {
                this.showError('No location data available for this package');
                return;
            }

            // Join markers with pipe separator
            const markersString = markers.join('|');

            // Calculate appropriate zoom level based on number of locations
            let zoom = 13;
            if (path && path.length > 3) {
                zoom = 12; // Zoom out more for multiple locations
            } else if (!path || path.length === 0) {
                zoom = 14; // Zoom in more for single location
            }

            // Build complete URL with proper encoding
            const baseUrl = 'https://maps.geoapify.com/v1/staticmap';
            const params = new URLSearchParams({
                style: 'osm-bright-grey',
                width: '800',
                height: '400',
                center: `lonlat:${centerLon},${centerLat}`,
                zoom: zoom.toString(),
                marker: markersString,
                apiKey: this.apiKey
            });

            const mapUrl = `${baseUrl}?${params.toString()}`;

            console.log('Generated map URL:', mapUrl);
            console.log('Markers string before encoding:', markersString);

            // Load the image
            const img = new Image();
            img.onload = () => {
                $('#mapLoading').hide();
                $('#routeMapImage').attr('src', mapUrl).show();
            };
            img.onerror = () => {
                this.showError('Failed to load map image');
            };
            img.src = mapUrl;

        } catch (error) {
            console.error('Error generating map:', error);
            this.showError('Error generating map');
        }
    }

    /**
     * Display customer information
     * @param {Object} customer - Customer object
     */
    displayCustomerInfo(customer) {
        // Build address string from individual fields
        const address = customer.address ?
            `${customer.address.street} ${customer.address.number}, ${customer.address.city}` :
            'No address available';

        const hasCoordinates = customer.address && customer.address.lat && customer.address.lon;

        $('#customerInfo').html(`
      <h4>📍 Customer Information</h4>
      <p><strong>Name:</strong> ${customer.name}</p>
      <p><strong>Email:</strong> ${customer.email}</p>
      <p><strong>Address:</strong> ${address}</p>
      ${hasCoordinates ?
            `<p><strong>Coordinates:</strong> ${customer.address.lat.toFixed(6)}, ${customer.address.lon.toFixed(6)}</p>` :
            '<p><em>⚠️ No coordinates available for mapping</em></p>'
        }
    `);
    }

    /**
     * Display route information
     * @param {Array} path - Array of path coordinates (in descending order)
     */
    displayRouteInfo(path) {
        if (!path || path.length === 0) {
            $('#routeInfo').html(`
        <h4>🚚 Route Information</h4>
        <p><em>No route locations added yet</em></p>
      `);
            return;
        }

        let routeHtml = `
      <h4>🚚 Route Information</h4>
      <p><strong>Total Stops:</strong> ${path.length}</p>
      <p><em>Showing in chronological order (latest first)</em></p>
      <div style="max-height: 120px; overflow-y: auto; border: 1px solid #eee; border-radius: 3px; padding: 5px;">
    `;

        path.forEach((location, index) => {
            routeHtml += `
        <p style="margin: 2px 0; padding: 3px; background: ${index % 2 === 0 ? '#f8f9fa' : 'transparent'};">
          <strong>Stop ${index + 1}:</strong> ${location.lat.toFixed(6)}, ${location.lon.toFixed(6)}
        </p>
      `;
        });

        routeHtml += '</div>';
        $('#routeInfo').html(routeHtml);
    }

    /**
     * Show loading state
     */
    showLoading() {
        $('#mapLoading').show();
        $('#routeMapImage').hide();
        $('#mapError').hide();
    }

    /**
     * Show error state
     * @param {string} message - Error message
     */
    showError(message) {
        $('#mapLoading').hide();
        $('#routeMapImage').hide();
        $('#mapError').find('p').text(message);
        $('#mapError').show();
    }

    /**
     * Hide the map modal
     */
    hide() {
        window.modalManager.hideModal(this.modalId);
        this.currentPackage = null;
    }
}

// Create global instance
window.mapModal = new MapModal();