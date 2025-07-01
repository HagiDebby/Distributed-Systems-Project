# Distributed-Systems-Project

[//]: # (general description)




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
    - `lon`: Longitude (Number, optional, -180 to 180)
    - `lat`: Latitude (Number, optional, -90 to 90)

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
- `path`: Array of location coordinates tracking package movement

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


