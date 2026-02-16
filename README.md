# Intelligent Vehicle Rental Platform 🚗

An advanced MERN Stack (MongoDB, Express, React, Node.js) application for vehicle rentals, featuring user authentication, booking management, and real-time vehicle tracking.

---

## 🚀 Getting Started

This guide will help you set up and run the project from scratch.

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (Local or Atlas)
- [Git](https://git-scm.com/)

---

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone https://github.com/unnikrishnan-sics/Intelligent-Vehicle-Rental-Platform.git
cd Intelligent-Vehicle-Rental-Platform
```

### 2. server Setup (Backend)
Navigate to the server directory and install dependencies:
```bash
cd server
npm install
```

**Configuration (.env)**:
Create a `.env` file in the `server` directory with the following variables:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
```

### 3. Client Setup (Frontend)
Navigate to the client directory and install dependencies:
```bash
cd ../client
npm install
```

**Configuration (.env)**:
Create a `.env` file in the `client` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## ▶️ Running the Application

### 1. Start the Server
Open a terminal in the `server` directory:
```bash
npm run dev
# Server should run on http://localhost:5000
```

### 2. Start the Client
Open a *new* terminal in the `client` directory:
```bash
npm run dev
# Client should run on http://localhost:5173 (or similar)
```

Visit the client URL in your browser to see the application!

---

## 🎓 Student Exercise

This version of the project is designed for learning. Some key functionalities have been partially implemented or commented out for you to complete.

### Your Tasks:
1.  **Authentication**: Implement logical flow for User Registration and Login in `server/src/controllers/authController.js`.
2.  **State Management**: Complete the Redux logic in `client/src/redux/slices/userSlice.js` to connect to the backend.
3.  **Routing**: Uncomment and enable the protected routes in `client/src/App.jsx`.

Look for `TODO` comments in the codebase for guidance!

---

## 🤝 Contributing
Feel free to fork the repository and submit pull requests.

## 📄 License
This project is licensed under the MIT License.
