# Intelligent Vehicle Rental Platform 🚗

An advanced MERN Stack (MongoDB, Express, React, Node.js) application for vehicle rentals, featuring user authentication, booking management, and real-time vehicle tracking.

---

## 📖 Project Description

This platform bridges the gap between vehicle owners and renters, providing a seamless experience for managing bookings, tracking vehicles, and handling payments. It is built with a robust backend and a responsive frontend to ensure high performance and usability.

### Key Features
*   **User Management**: Secure registration and login for Drivers, Customers, and Admins.
*   **Booking System**: Intuitive interface for browsing and booking vehicles.
*   **Real-time Tracking**: Live GPS tracking of rented vehicles.
*   **Admin Dashboard**: comprehensive tools for managing users, fleets, and system settings.

---

## 🔄 User Functions & Flow

1.  **Registration/Login**: Users sign up and log in to access their respective dashboards (Customer/Driver/Admin).
2.  **Browse & Select**: Customers can filter vehicles by type, price, and availability.
3.  **Booking**: A customer selects a vehicle, chooses dates, and confirms the booking.
4.  **Tracking**: Once a trip starts, the customer can track the vehicle's location in real-time.
5.  **Completion**: Improving feedback and ratings upon trip completion.

---

## 🚀 Installation & Setup

### Prerequisites
*   [Node.js](https://nodejs.org/) (v14+)
*   [MongoDB](https://www.mongodb.com/try/download/community)

### 1. Clone the Repository
```bash
git clone https://github.com/unnikrishnan-sics/Intelligent-Vehicle-Rental-Platform.git
cd Intelligent-Vehicle-Rental-Platform
```

### 2. Server Setup
```bash
cd server
npm install
```

**Configuration (.env)**:
Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
```

### 3. Client Setup
```bash
cd ../client
npm install
```

**Configuration (.env)**:
Create a `.env` file in the `client` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Running the Application
**Server** (in `server` folder):
```bash
npm run dev
```

**Client** (in `client` folder):
```bash
npm run dev
```

Visit the client URL displayed in the terminal to start using the application.
