# Distributed Systems Project

[//]: # (general description)

This is a comprehensive web-based package management system built with Node.js, Express, and MongoDB that enables businesses to track and manage their package deliveries with interactive mapping capabilities. The system allows companies to create and manage customer profiles, add packages with delivery details, and track package routes through an intuitive interface. Key features include a modular component-based frontend architecture with reusable modals, an interactive map system powered by Leaflet and Geoapify that displays customer locations and delivery routes, real-time package status tracking, and location-based route planning with Israel boundary validation. Users can search and select customers through a smart dropdown interface, add locations to package delivery routes, view detailed customer information, and visualize delivery paths on an interactive map with clickable markers and smooth navigation. The application employs modern web development practices with separated JavaScript components, responsive design, and comprehensive error handling to provide a professional package tracking solution for logistics and delivery operations.

# Client Documentation

## Overview

The client-side component provides a modern, responsive web interface for the package management system. Built with vanilla JavaScript and jQuery, it features a modular component architecture with dynamic modal loading, interactive maps, and comprehensive form handling. The interface offers businesses an intuitive way to manage packages, customers, and delivery routes through multiple interconnected views.

## Technology Stack

- **Frontend Framework**: Vanilla JavaScript with jQuery 3.4.1
- **CSS Framework**: Custom responsive CSS with modern styling
- **Mapping Library**: Leaflet 1.9.4 for interactive maps
- **Map Tiles**: Geoapify API with OSM Bright styling
- **Location Services**: LocationIQ API for geocoding
- **Architecture**: Component-based modular system with dynamic loading

## Project Structure

```
client/
├── html/
│   ├── index.html              # Main packages management page
│   └── list.html               # Companies and customers list
├── css/
│   └── global.css              # Global styles and responsive design
├── js/
│   ├── modal-manager.js        # Component loading and management system
│   ├── packages.js             # Main packages page functionality
│   ├── companies.js            # Companies list page functionality
│   └── components/             # Modular component system
│       ├── package-modal.js    # Package creation modal
│       ├── location-modal.js   # Location search and selection
│       ├── map-modal.js        # Interactive route visualization
│       ├── company-modal.js    # Company creation modal
│       ├── customer-modal.js   # Customer creation modal
│       └── customer-details-modal.js # Customer information display
└── templates/                  # HTML templates for dynamic loading
    ├── add-package-modal.html
    ├── location-modal.html
    ├── map-modal.html
    ├── company-modal.html
    ├── customer-modal.html
    └── customer-details-modal.html
```

## Component Architecture

### Modal Manager System
A React-like component system for vanilla JavaScript that provides:
- **Dynamic template loading** from separate HTML files
- **Component lifecycle management** (show, hide, reset)
- **Global event handling** for modal interactions
- **Memory management** with proper cleanup
- **Error handling** for failed component loads

#### Key Features:
```javascript
// Load multiple components dynamically
modalManager.loadModals(['package-modal', 'location-modal', 'map-modal'])

// Component initialization
window.packageModal.init()
window.mapModal.showRoute(packageData)

// Event-driven communication
$(document).trigger('packageAdded', [companyId])
```

### Core Components

#### Package Modal (`package-modal.js`)
Advanced package creation interface with:
- **Smart customer selection** with real-time search and filtering
- **DateTime picker** with validation (replaces epoch timestamp input)
- **Two selection modes**: Basic (ObjectId input) and Advanced (searchable dropdown)
- **Form validation** with business rules enforcement
- **Error handling** with user-friendly messages

#### Map Modal (`map-modal.js`)
Interactive route visualization featuring:
- **Leaflet integration** with Geoapify tile layers
- **Custom markers**: Red house icon for customer home, numbered blue markers for route stops
- **Clickable interactions**: Route stop list navigation that pans map to locations
- **Auto-fitting bounds** to display all relevant locations
- **Popup information** for detailed location data
- **Smooth animations** for map transitions

#### Location Modal (`location-modal.js`)
Comprehensive location search and selection:
- **Multiple search results** from LocationIQ API
- **Israel boundary validation** with visual warnings
- **Enter key search** functionality
- **Rich location display** with full address details
- **Click-to-select** interface with visual feedback
- **Error handling** for API failures

#### Customer Components
- **Customer Modal**: Create new customers with address geocoding
- **Customer Details Modal**: Display comprehensive customer information
- **Smart customer search** with dropdown filtering by name and email

## Page Structure

### Companies List (`list.html`)
- **Company management**: Create and view all registered companies
- **Customer management**: Add customers with automatic geocoding
- **Navigation hub**: Access point to individual company package management
- **Responsive table** with clickable company names for drill-down

### Package Management (`index.html`)
- **Company-specific** package view with URL parameter routing
- **Interactive package table** with real-time data loading
- **Multiple action buttons**: Add packages, manage routes, view maps
- **Customer information** integration with popup details
- **Navigation breadcrumbs** with back-to-companies functionality

## Key Features

### Interactive Mapping
- **Real-time visualization** of package delivery routes
- **Customer home centering** with appropriate zoom levels
- **Route stop navigation** via clickable list items
- **Boundary validation** for Israel geographic limits
- **Professional styling** with custom markers and popups

### Smart Form Handling
- **Dynamic customer search** with real-time filtering
- **Validation feedback** with specific error messages
- **DateTime integration** replacing complex timestamp inputs
- **Auto-completion** and suggestion systems
- **Form state management** with proper reset and cleanup

### Responsive Design
- **Mobile-friendly** interface with touch gesture support
- **Flexible layouts** that adapt to screen sizes
- **Accessible navigation** with keyboard support
- **Professional styling** with modern CSS practices
- **Cross-browser compatibility** with graceful degradation

### Data Management
- **MongoDB ObjectId handling** with proper string conversion
- **Real-time data synchronization** between components
- **Error recovery** with retry mechanisms
- **Loading states** and user feedback
- **Memory management** with component cleanup

## API Integration

### RESTful Communication
The client integrates with the server through comprehensive API calls:

```javascript
// Package management
GET /business/${companyId}/packages    // Load company packages
POST /packages                         // Create new package
PUT /packages/${packageId}/path       // Add route locations

// Customer operations  
GET /customers                        // Load customer data
POST /customers                       // Create new customer

// Business operations
GET /business                         // Load companies
POST /business                        // Create new company
```

### External Service Integration
- **LocationIQ API**: Real-time location search and geocoding
- **Geoapify Maps**: High-quality tile layers and mapping services
- **Boundary validation**: Client-side geographic limit checking

## User Experience Features

### Navigation Flow
1. **Companies List** → Select company → **Package Management**
2. **Add Package** → Customer selection → Form completion
3. **Route Management** → Location search → Map visualization
4. **Customer Details** → Click customer ID → Information modal

### Interactive Elements
- **Hover effects** on all clickable elements
- **Loading spinners** for async operations
- **Success/error feedback** with appropriate messaging
- **Keyboard shortcuts** for common operations
- **Visual feedback** for form validation

### Professional Interface
- **Consistent styling** across all components
- **Modern modal design** with backdrop and animations
- **Responsive tables** with proper mobile behavior
- **Clean typography** with proper hierarchy
- **Intuitive iconography** for better user guidance

## Configuration

### Environment Setup
```html
<!-- Required external libraries -->
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
```

## Browser Compatibility

- **Modern browsers**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Mobile support**: iOS Safari, Chrome Mobile, Samsung Internet
- **Graceful degradation**: Fallbacks for older browsers
- **Progressive enhancement**: Core functionality without JavaScript

## Performance Optimizations

- **Component lazy loading**: Templates loaded only when needed
- **Image optimization**: Efficient map tile caching
- **Event delegation**: Minimal event listener overhead
- **Memory management**: Proper component cleanup and disposal
- **Responsive images**: Appropriate sizing for different devices

## Security Considerations

- **Input validation**: Client-side validation with server-side verification
- **XSS prevention**: Proper HTML escaping and sanitization
- **API key management**: Restricted domain usage for external services
- **Data sanitization**: Clean user input before API submission

## Development Workflow

### Component Development Pattern
1. **Create HTML template** in `/templates/` directory
2. **Build component class** in `/js/components/`
3. **Add to modal manager** loading sequence
4. **Integrate with page logic** in main JavaScript files
5. **Style with global CSS** for consistency

### Debugging Features
- **Console logging**: Comprehensive debug output for development
- **Error boundaries**: Graceful failure handling with user feedback
- **Development tools**: Easy inspection of component state
- **API monitoring**: Request/response logging for troubleshooting

[//]: # (server description)

# Server Documentation

## Overview

The server-side component of the Distributed Systems Project is built using Node.js with Express.js framework, providing RESTful API endpoints for managing a network of suppliers (businesses) handling packages for customers. The system tracks package deliveries through real-time location updates and integrates with external geocoding services.

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **External API**: LocationIQ for geocoding services
- **Architecture**: REST API with AJAX support

## Project Structure

```
server/
├── app.js                 # Main application entry point
├── mongoose.js            # Database connection configuration
├── routes.js              # All REST endpoints
├── package.json           # Dependencies and scripts
├── package-lock.json      # Dependency lock file (auto-generated)
├── models/                # Database schemas
│   ├── business.js        # Business/company model
│   ├── customer.js        # Customer model
│   └── package.js         # Package model
├── services/              # Business logic layer
│   ├── businessService.js # Business operations
│   ├── customerService.js # Customer operations
│   ├── packageService.js  # Package operations
│   └── validators.js      # Custom validation functions
└── helpers/               # Utility functions
    └── locationService.js # LocationIQ API integration
```

## Database Models

### Business Model
Represents supplier companies in the network.

**Fields:**
- `name`: Company name (String, required, unique, 2-100 chars)
- `site_url`: Company website (String, required, unique, valid URL format)

**Validation:**
- Name must contain only letters, numbers, spaces, and basic punctuation
- URL must be valid HTTP/HTTPS format
- Both fields must be unique across the system

### Customer Model
Represents end users receiving packages.

**Fields:**
- `name`: Customer full name (String, required, 2-50 chars)
- `email`: Email address (String, required, unique, valid email format)
- `address`: Embedded object containing:
  - `street`: Street name (String, required)
  - `number`: Street number (Number, required, positive)
  - `city`: City name (String, required)
  - `lon`: Longitude (Number, optional, 34 to 36)
  - `lat`: Latitude (Number, optional, 29 to 35)

**Validation:**
- Email must be unique and valid format
- Address coordinates automatically populated via LocationIQ API
- All text fields trimmed and length-validated

### Package Model
Represents deliverable items with tracking capabilities.

**Fields:**
- `prod_id`: Product identifier (String, required, 3-50 chars)
- `name`: Product name (String, required, 2-100 chars)
- `start_date`: Creation timestamp (Number, Unix epoch, required)
- `eta`: Estimated delivery time (Number, Unix epoch, required, future)
- `status`: Current status (Enum: "packed", "shipped", "intransit", "delivered")
- `business_id`: Reference to Business model (ObjectId, required)
- `customer_id`: Reference to Customer model (ObjectId, required)
- `path`: Array of location coordinates (lon/lat) tracking package movement

**Validation:**
- ETA must be in the future and after start_date
- Business and customer IDs must reference existing documents
- Path coordinates validated for proper lat/lon ranges
- Status restricted to predefined values

## API Endpoints

All endpoints are accessible from the root path (`localhost:3001/`).

### Business Management

#### Create Business
- **POST** `/companies`
- **Body**: `{name: string, site_url: string}`
- **Response**: `{success: boolean, data?: ObjectId, message: string}`

#### Get All Businesses
- **GET** `/companies`
- **Response**: Array of business objects

### Customer Management

#### Create Customer
- **POST** `/customers`
- **Body**: `{name: string, email: string, address: {street, number, city}}`
- **Response**: `{success: boolean, data?: ObjectId, message: string}`
- **Note**: Coordinates automatically added via LocationIQ API

#### Get All Customers
- **GET** `/customers`
- **Response**: Array of customer objects

### Package Management

#### Create Package
- **POST** `/packages`
- **Body**: `{prod_id, name, start_date, eta, status, business_id, customer_id}`
- **Response**: `{success: boolean, data?: ObjectId, message: string}`

#### Add Location to Package
- **PUT** `/packages/:id/location`
- **Body**: `{lat: number, lon: number}`
- **Response**: `{success: boolean, message: string}`
- **Note**: Prevents duplicate locations in tracking path

#### Get Company Packages
- **GET** `/companies/:id/packages`
- **Response**: `{success: boolean, data?: Array, message: string}`
- **Note**: Includes populated business and customer information

## Service Functions

### Business Service (`businessService.js`)

#### `createCompany(businessDetails)`
Creates a new business with validation.
- **Input**: Object with name and site_url
- **Output**: Success status and ObjectId on success
- **Validation**: URL format, uniqueness, character restrictions

#### `getCompanies()`
Retrieves all registered businesses.
- **Output**: Array of business documents (empty array if none exist)

### Customer Service (`customerService.js`)

#### `createCustomer(customerDetails)`
Creates a new customer with automatic geocoding.
- **Input**: Object with name, email, and address
- **Output**: Success status and ObjectId on success
- **Features**: Integrates with LocationIQ to populate coordinates

#### `getCustomers()`
Retrieves all registered customers.
- **Output**: Array of customer documents (empty array if none exist)

### Package Service (`packageService.js`)

#### `createPackage(packageDetails)`
Creates a new package with business/customer validation.
- **Input**: Package details without path array
- **Output**: Success status and ObjectId on success
- **Validation**: Ensures referenced business and customer exist

#### `addLocationToPackage(packageId, locationDetails)`
Adds tracking coordinates to package path.
- **Input**: Package ID and lat/lon coordinates
- **Output**: Success status and message
- **Features**: Prevents duplicate locations, validates coordinates

#### `getPackages(companyId)`
Retrieves all packages for a specific company.
- **Input**: Business ObjectId
- **Output**: Array of packages with populated references
- **Validation**: Ensures company exists before querying

## External Integrations

### LocationIQ API (`locationService.js`)

#### `getCoordinatesFromAddress(address, apiKey)`
Converts street addresses to geographic coordinates.
- **Input**: Full address string and API key
- **Output**: Array of location objects with lat/lon
- **Usage**: Automatically called during customer creation
- **API Format**: `https://us1.locationiq.com/v1/search?key={key}&q={address}&format=json`

## Validation System

### Custom Validators (`services/validators.js`)

#### `validateEpochTimestamp(timestamp, field, mustBeFuture, maxPastDays)`
Validates Unix timestamp values.
- **Parameters**: Timestamp, field name, future requirement, past limit
- **Usage**: Validates start_date and eta fields in packages
- **Features**: Configurable future/past requirements

### Database Validation
- **Field-level validation**: Type, length, format constraints
- **Custom async validators**: Reference integrity for ObjectIds
- **Regex patterns**: Email, URL, and text format validation
- **Enum restrictions**: Status field limited to predefined values

## Database Indexes

Performance-optimized indexes created automatically:
- `business_id` index on packages for company queries
- `customer_id` index on packages for customer lookups
- `status` index on packages for status filtering
- `email` index on customers for unique email validation

## Environment Configuration

Required environment variables:
```
LOCATIONIQ_API_KEY=your_api_key_here
MONGODB_URI=mongodb://localhost:27017/your_database_name
```

## Error Handling

- **Validation errors**: Detailed field-specific error messages
- **Reference errors**: Clear messages for invalid ObjectId references
- **API errors**: Graceful handling of LocationIQ service failures
- **Database errors**: Connection and operation error management

## Usage Example

```javascript
// Create a business
POST /companies
{
    "name": "Express Delivery Co",
    "site_url": "https://expressdelivery.com"
}

// Create a customer
POST /customers
{
    "name": "John Doe",
    "email": "john@example.com",
    "address": {
        "street": "Main Street",
        "number": 123,
        "city": "New York"
    }
}

// Create a package
POST /packages
{
    "prod_id": "PROD001",
    "name": "Laptop Computer",
    "start_date": 1640995200,
    "eta": 1641081600,
    "status": "packed",
    "business_id": "507f1f77bcf86cd799439011",
    "customer_id": "507f1f77bcf86cd799439012"
}

// Track package location
PUT /packages/507f1f77bcf86cd799439013/location
{
    "lat": 40.7128,
    "lon": -74.0060
}
```

## System Requirements

- Node.js 14+
- MongoDB 4.4+
- Internet connection for LocationIQ API
- Environment variables configured
- Dependencies installed via `npm install`

## Getting Started

1. Install dependencies: `npm install`
2. Configure environment variables in `.env`
3. Start MongoDB service
4. Run server: `node app.js`
5. Server accessible at `http://localhost:3001`