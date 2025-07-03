# Client Application Documentation

## Overview
This client application is built using React and serves as the front-end for the Delivery Handling Company project. It interacts with a RESTful API to manage businesses, customers, and packages.

## Project Structure
The project is organized as follows:

- **public/**: Contains static files.
  - **index.html**: The main HTML file for the application.

- **src/**: Contains the source code for the application.
  - **api/**: Contains functions for making API calls.
    - **index.js**: API interaction functions.
  - **components/**: Contains reusable React components.
    - **BusinessList.js**: Displays a list of businesses.
    - **CustomerList.js**: Displays a list of customers.
    - **PackageList.js**: Displays a list of packages.
    - **LocationMap.js**: Displays a map with package locations.
  - **pages/**: Contains page components.
    - **Home.js**: Home page component.
    - **Businesses.js**: Business list page component.
    - **Customers.js**: Customer list page component.
    - **Packages.js**: Package list page component.
  - **App.js**: Main application component that sets up routing.
  - **index.js**: Entry point for the React application.

## Setup Instructions
1. **Clone the repository**:
   ```
   git clone <repository-url>
   ```

2. **Navigate to the client directory**:
   ```
   cd client
   ```

3. **Install dependencies**:
   ```
   npm install
   ```

4. **Start the development server**:
   ```
   npm start
   ```

5. **Open your browser** and go to `http://localhost:3000` to view the application.

## Usage
- The application allows users to view and manage businesses, customers, and packages.
- Navigate through the application using the links provided on the home page.
- Each section (Businesses, Customers, Packages) fetches data from the server and displays it in a user-friendly format.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.