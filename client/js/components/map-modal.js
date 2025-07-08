/**
 * Map Modal Component
 * Handles displaying package routes on an interactive map
 */

class MapModal {
    constructor() {
        this.modalId = 'mapModal';
        this.apiKey = '34f2ec45ff2945c9896a5401cce5f107'; // Geoapify API key
        this.currentPackage = null;
        this.customers = []; // Cache for customers
        this.map = null; // Leaflet map instance
        this.markers = []; // Store markers for cleanup
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

        // Route stop click - focus map on location
        $(document).on('click', '.route-stop-item', (e) => {
            const lat = parseFloat($(e.currentTarget).data('lat'));
            const lon = parseFloat($(e.currentTarget).data('lon'));
            const index = $(e.currentTarget).data('index');

            if (this.map && lat && lon) {
                // Focus map on the selected location
                this.map.setView([lat, lon], 16, {
                    animate: true,
                    duration: 0.5
                });

                // Find and open the corresponding marker popup
                this.markers.forEach(marker => {
                    const markerLatLng = marker.getLatLng();
                    if (Math.abs(markerLatLng.lat - lat) < 0.0001 && Math.abs(markerLatLng.lng - lon) < 0.0001) {
                        setTimeout(() => {
                            marker.openPopup();
                        }, 600); // Wait for pan animation to complete
                    }
                });

                console.log(`Focusing map on stop ${index + 1}: [${lat}, ${lon}]`);
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

        // Generate and display interactive map
        this.generateInteractiveMap(customer, packageData.path);
    }

    /**
     * Generate interactive map and display it
     * @param {Object} customer - Customer object with address
     * @param {Array} path - Array of path coordinates
     */
    generateInteractiveMap(customer, path) {
        try {
            // Clear existing map
            this.clearMap();

            // Default to customer home if available, otherwise Israel center
            let initialLat = 31.7683; // Israel center fallback
            let initialLon = 35.2137;
            let initialZoom = 8;

            if (customer.address && customer.address.lat && customer.address.lon) {
                initialLat = customer.address.lat;
                initialLon = customer.address.lon;
                initialZoom = 14; // Close zoom on customer home
            }

            // Initialize map focused on customer home
            this.map = L.map('interactiveMap').setView([initialLat, initialLon], initialZoom);

            // Add Geoapify tile layer
            L.tileLayer(`https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${this.apiKey}`, {
                attribution: '© <a href="https://www.geoapify.com/">Geoapify</a> | © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 18
            }).addTo(this.map);

            // Add customer home marker
            if (customer.address && customer.address.lat && customer.address.lon) {
                const homeMarker = L.divIcon({
                    html: '<div class="custom-marker home-marker">🏠</div>',
                    className: 'custom-div-icon',
                    iconSize: [30, 30],
                    iconAnchor: [15, 15]
                });

                const marker = L.marker([customer.address.lat, customer.address.lon], { icon: homeMarker })
                    .addTo(this.map)
                    .bindPopup(`
            <div style="text-align: center;">
              <strong>🏠 Customer Home</strong><br>
              <em>${customer.name}</em><br>
              ${customer.address.street} ${customer.address.number}<br>
              ${customer.address.city}
            </div>
          `);

                this.markers.push(marker);
            }

            // Add route markers
            if (path && path.length > 0) {
                path.forEach((location, index) => {
                    const routeMarker = L.divIcon({
                        html: `<div class="custom-marker route-marker">${index + 1}</div>`,
                        className: 'custom-div-icon',
                        iconSize: [25, 25],
                        iconAnchor: [12.5, 12.5]
                    });

                    const marker = L.marker([location.lat, location.lon], { icon: routeMarker })
                        .addTo(this.map)
                        .bindPopup(`
              <div style="text-align: center;">
                <strong>📍 Stop ${index + 1}</strong><br>
                <em>Route Location</em><br>
                Lat: ${location.lat.toFixed(6)}<br>
                Lon: ${location.lon.toFixed(6)}
              </div>
            `);

                    this.markers.push(marker);
                });
            }

            // Hide loading and show map
            $('#mapLoading').hide();
            $('#interactiveMap').show();

            // Invalidate size to ensure proper rendering
            setTimeout(() => {
                this.map.invalidateSize();
            }, 200);

            console.log(`Interactive map initialized at customer home [${initialLat}, ${initialLon}] zoom ${initialZoom}`);

        } catch (error) {
            console.error('Error generating interactive map:', error);
            this.showError('Error generating interactive map');
        }
    }

    /**
     * Clear existing map and markers
     */
    clearMap() {
        if (this.map) {
            this.map.remove();
            this.map = null;
        }
        this.markers = [];
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
        <p><em>Click markers on the map for details</em></p>
      `);
            return;
        }

        let routeHtml = `
      <h4>🚚 Route Information</h4>
      <p><strong>Total Stops:</strong> ${path.length}</p>
      <p><em>Click stops below or markers on map</em></p>
      <div style="max-height: 120px; overflow-y: auto; border: 1px solid #eee; border-radius: 3px; padding: 5px;">
    `;

        path.forEach((location, index) => {
            routeHtml += `
        <p class="route-stop-item" data-lat="${location.lat}" data-lon="${location.lon}" data-index="${index}" 
           style="margin: 2px 0; padding: 6px; background: ${index % 2 === 0 ? '#f8f9fa' : 'transparent'}; 
                  cursor: pointer; border-radius: 3px; transition: background-color 0.2s;"
           onmouseover="this.style.backgroundColor='#e3f2fd'" 
           onmouseout="this.style.backgroundColor='${index % 2 === 0 ? '#f8f9fa' : 'transparent'}'">
          <strong>📍 Stop ${index + 1}:</strong> ${location.lat.toFixed(6)}, ${location.lon.toFixed(6)}
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
        $('#interactiveMap').hide();
        $('#mapError').hide();
    }

    /**
     * Show error state
     * @param {string} message - Error message
     */
    showError(message) {
        $('#mapLoading').hide();
        $('#interactiveMap').hide();
        $('#mapError').find('p').text(message);
        $('#mapError').show();
    }

    /**
     * Hide the map modal
     */
    hide() {
        this.clearMap();
        window.modalManager.hideModal(this.modalId);
        this.currentPackage = null;
    }
}

// Create global instance
window.mapModal = new MapModal();