# Multi-User Task Management System (Full-Stack)

A professional task management platform designed for team collaboration, featuring a robust Role-Based Access Control (RBAC) system. Built using the PERN stack (PostgreSQL, Express, React, Node.js) with Prisma ORM.

## 📌 Project Overview
This project addresses the challenge of managing multiple projects and tasks within a team. It differentiates between 'Admin' and 'Member' roles to ensure secure data handling and efficient delegation. Admins control the project lifecycle, while Members focus on execution and status updates.

## 🏗 Full-Stack Architecture
The application is built as a decoupled Full-Stack system:
- **Backend (MVC Architecture):** Structured using the Model-View-Controller pattern. Express handles routing, Controllers manage business logic, and Prisma serves as the interface for PostgreSQL.
- **Frontend (Component-Based):** Developed with React.js using a modular approach. Redux Toolkit is utilized for centralized state management (Auth/Tasks), ensuring a smooth and reactive user experience.

## 🛠 Tech Stack
- **Frontend:** React.js, Tailwind CSS, Framer Motion
- **State Management:** Redux Toolkit
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT (JSON Web Tokens)

## 🚀 Core Features
- **Admin Dashboard:** Real-time analytics for monitoring project health.
- **Role-Based Security:** Strict middleware-level checks for Admin-only actions.
- **Task Delegation:** Assign tasks to team members directly via their registered email.
- **Theme Support:** Fully integrated Dark and Light modes with local storage persistence.

## 🔌 API Endpoints (Mandatory Implementation)

### Auth Module
- `POST /auth/register` - Register user
- `POST /auth/login` - Login & Token generation

### Project Module
- `POST /project/create` - Create new project
- `POST /project/invite` - Invite/Assign member to project

### Task Module
- `POST /task/create` - Create task (Admin)
- `PATCH /task/update` - Update task details
- `PATCH /task/status` - Update task status (TODO/COMPLETED)
- `GET /task/my` - Fetch tasks assigned to current user

### Dashboard
- `GET /dashboard` - Get project analytics and stats

## ⚙️ Setup Instructions

### 1. Environment Variables (.env)
Create a `.env` file in the server directory:
```env
DATABASE_URL="your_postgresql_url"
JWT_SECRET="your_secret_key"
PORT=5000

2. Backend Setup
# Step 1: Install all core dependencies
npm install express @prisma/client jsonwebtoken bcryptjs cors dotenv

# Step 2: Install dev dependencies
npm install -D prisma nodemon

# Step 3: Initialize & Generate Prisma Client
npx prisma generate

# Step 4: Run migrations to create database tables
npx prisma migrate dev --name init

# Step 5: Start the backend server
npm run dev

3. Frontend Setup
# Step 1: Install all UI and State dependencies
npm install @reduxjs/toolkit react-redux axios lucide-react framer-motion react-router-dom

# Step 2: Install Styling dependencies
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Step 3: Start the React development server
npm start


