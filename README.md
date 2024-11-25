WorkWise HR Web Application

Welcome to the WorkWise HR Web Application repository. This web app is designed for HR administrators to streamline employee management, payroll processing, performance tracking, and other HR tasks. Built using modern web technologies, it provides a secure, scalable, and user-friendly interface for managing workforce operations efficiently.


WorkWise HR Web Application
Welcome to the WorkWise HR Web Application repository. This web app is designed for HR administrators to streamline employee management, payroll processing, performance tracking, and other HR tasks. Built using modern web technologies, it provides a secure, scalable, and user-friendly interface for managing workforce operations efficiently.

Features

Employee Management
Add, update, and manage employee profiles.
Search and filter employees by name, role, department, or other attributes.

Payroll and Compensation
Auto-calculate payslips based on hours worked, roles, and department-specific pay rates.
Publish payslips for employees to access via the mobile app.

Performance Tracking
Monitor and evaluate employee performance goals.
Manage manager-to-employee feedback submissions.

Training and Development
Upload training videos and resources.
Track training progress and completion rates.

Leave and Attendance Management
Approve or reject leave requests submitted via the mobile app.
View and manage attendance records.

Analytics and Reporting
Generate comprehensive reports on workforce metrics, including performance, attendance, and payroll trends.

Technologies Used
Frontend: React.js, JavaScript, HTML, CSS
Backend: Firebase Firestore
Authentication: Firebase Authentication
Hosting: Firebase Hosting (or similar platform)
Version Control: GitHub

Getting Started

Prerequisites
Node.js (v16 or higher)
npm or yarn
Firebase CLI for deployment (optional)
Setup Instructions
Clone the repository:

bash
Copy code
git clone https://github.com/your-repository/workwise-web.git
cd workwise-web
Install dependencies:


npm install
Set up Firebase:

Create a Firebase project.
Enable Firestore Database and Authentication (Email/Password).
Add your Firebase configuration details in .env:

REACT_APP_FIREBASE_API_KEY=<your-api-key>
REACT_APP_FIREBASE_AUTH_DOMAIN=<your-auth-domain>
REACT_APP_FIREBASE_PROJECT_ID=<your-project-id>
REACT_APP_FIREBASE_STORAGE_BUCKET=<your-storage-bucket>
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=<your-sender-id>
REACT_APP_FIREBASE_APP_ID=<your-app-id>

Start the development server:


npm start
Access the app at http://localhost:3000.
