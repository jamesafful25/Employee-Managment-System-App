#  Employee Management System (EMS)

A full-stack **Employee Management System (EMS)** built with modern technologies to manage employees, payroll, attendance, leave, performance, and reporting in a secure and scalable way.

This project demonstrates **production-level architecture**, combining a robust backend API with a clean, responsive frontend.

---

##  Overview

EMS is designed to help organizations streamline HR operations through:

* Centralized employee management
* Automated payroll processing
* Real-time attendance tracking
* Role-based system access

---

##  Architecture

```id="arch1"
Frontend (React)  --->  Backend API (Node.js/Express)  --->  Database (MySQL)
                           |
                           ├── Authentication (JWT + Passport)
                           ├── Email Service (Nodemailer)
                           ├── File Uploads
                           └── Reporting System
---

##  Docker Setup

###  Prerequisites
- Docker installed
- Docker Compose installed

---

###  Run the Project

From the root directory:

```bash
docker-compose up --build


### docker-compose.yml

version: "3.8"

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    depends_on:
      - db
    environment:
      DB_HOST: db
      DB_USER: root
      DB_PASSWORD: root
      DB_NAME: employee_db

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"

  db:
    image: mysql:8
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: employee_db
    ports:
      - "3306:3306"
---
```

##  Frontend Structure

```id="front1"
frontend/src
├── api/           # API calls (Axios)
├── components/    # Reusable UI components
├── context/       # Global state (AuthContext)
├── hooks/         # Custom hooks
├── pages/         # Application pages
├── routes/        # Routing logic
├── utils/         # Helper functions
├── App.jsx
└── main.jsx
```

---

##  Backend Structure

```id="back1"
backend/
├── app.js
├── server.js
├── config/
├── controller/
├── middleware/
├── model/
├── route/
├── service/
├── utils/
├── uploads/
└── resetAdmin.js
```

---

##  Key Features

###  Authentication & Security

* JWT Authentication
* Role-Based Access Control (Admin, HR, Manager, Employee)
* Rate Limiting & Secure Headers

---

###  Employee Management

* Create, update, deactivate employees
* Role assignment & access control

---

###  Attendance System

* Clock-in / Clock-out
* Daily tracking & reports

---

###  Leave Management

* Apply for leave
* Approve / reject requests
* Leave balance tracking

---

### Payroll System

* Generate payroll
* Salary calculations
* Payslip notifications via email

---

###  Performance Management

* Employee reviews
* Performance tracking

---

###  Reports

* Attendance reports
* Payroll reports
* Leave reports
* Performance reports

---

###  Email Integration

* Welcome emails
* Password reset
* Leave updates
* Payslip notifications

---

### File Uploads

* Secure upload system
* Static file serving

---

##  Tech Stack

### Frontend

* React.js
* React Router
* Tailwind CSS
* Axios

---

### Backend

* Node.js
* Express.js
* Sequelize ORM
* MySQL
* Passport.js
* Nodemailer

---

## Setup Instructions

###  Clone Repository

```bash id="clone1"
git clone https://github.com/jamesafful25/Employee-Management-System-App.git
cd Employee-Management-System-App
```

---

###  Backend Setup

```bash id="backsetup"
cd backend
npm install
npm run dev
```

---

###  Frontend Setup

```bash id="frontsetup"
cd frontend
npm install
npm run dev
```

---

## Environment Variables

Create `.env` in backend:

```env id="env1"
PORT=5000
DB_NAME=your_db
DB_USER=your_user
DB_PASSWORD=your_password
DB_HOST=localhost

JWT_SECRET=your_secret

EMAIL_USER=your_email
EMAIL_PASS=your_password

CLIENT_URL=http://localhost:5173
```

---

## Future Improvements

* Docker support
* CI/CD pipeline
* AWS deployment (EC2, RDS, S3)
* Real-time notifications
* Charts & analytics dashboard
  
## Author

**James Afful**
Fullstack Developer | Backend-Focused | DevOps Engineer

---

##  Final Note

This project showcases:

* Scalable backend architecture
* Secure authentication system
* Real-world business logic
* Clean frontend design

 Built with a focus on **production readiness and scalability**
