# 🌟 AURELLE

![MERN Stack](https://img.shields.io/badge/MERN-Stack-blue?style=for-the-badge&logo=mongodb)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=nodedotjs)
![Stripe](https://img.shields.io/badge/Stripe-Payments-008CDD?style=for-the-badge&logo=stripe)

Aurelle is a robust, full-stack web application built using the MERN stack (MongoDB, Express.js, React, Node.js). It features seamless e-commerce capabilities, secure authentication, and beautiful data visualizations.

---

## ✨ Features

- **🔒 Secure Authentication:** Handled via Passport.js, utilizing JWT and local strategies with `bcryptjs` password hashing.
- **💳 Payment Integration:** Secure and reliable payment processing powered by Stripe.
- **📊 Data Visualization:** Interactive charts and graphs integrated seamlessly via Recharts.
- **📱 Responsive & Rich UI:** Built with React 19, incorporating intelligent inputs for locations and phone numbers.
- **🔔 Notifications:** Beautiful alerts using SweetAlert2 and React Hot Toast.

## 🛠️ Technology Stack

### Frontend (Client)
- **Framework:** React 19 (Create React App)
- **Routing:** React Router v7
- **HTTP Client:** Axios
- **State/Auth:** JWT Decode
- **Styling & UI:** Recharts, SweetAlert2, React Hot Toast, React Phone Input 2

### Backend (Server)
- **Environment:** Node.js & Express.js
- **Database:** MongoDB & Mongoose
- **Authentication:** Passport.js, JSONWebToken, bcryptjs
- **Payments:** Stripe SDK

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing.

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) and a running [MongoDB](https://www.mongodb.com/) instance (local or Atlas) installed on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/hevinpatel19/AURELLE.git
   cd AURELLE
   ```

2. **Install Server Dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Install Client Dependencies:**
   ```bash
   cd ../client
   npm install
   ```

4. **Environment Variables:**
   Create a `.env` file in the `server` directory and add your environment variables. You will likely need:
   - `PORT` (e.g., 5000)
   - MongoDB Connection URI
   - Stripe Secret Key
   - JWT Secret

### Running the Application

1. **Start the backend server:**
   ```bash
   cd server
   npm start
   # or 'npx nodemon index.js' for development
   ```

2. **Start the frontend client:**
   In a new terminal window:
   ```bash
   cd client
   npm start
   ```

The application should now be running! The frontend will be accessible at [http://localhost:3000](http://localhost:3000) by default.

---

## 📄 License
This project is licensed under the ISC License.
