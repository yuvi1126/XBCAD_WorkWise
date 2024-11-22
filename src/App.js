import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardPage from "./pages/Dashboard";
import LeaveRequestsPage from "./pages/LeaveRequests";
import AddEmployee from "./pages/AddEmployee"; // Update the path based on your file structure
import AddAdminPage from "./pages/AddAdmin";
import EmployeePage from "./pages/EmployeePage";
import TrainingPage from "./pages/Training";
import Recruitment from "./pages/Recruitment";
import PayrollPage from "./pages/Payroll";
import AdminLoginPage from "./pages/AdminLoginPage";
import TimeandAttendancePage from "./pages/TimeandAttendancePage";
import PerformancePage from "./pages/PerformancePage";





const App = () => {
  return (
    <Router>
      <Routes>
        {/* Default route for signup/login */}
        <Route path="/" element={<AdminLoginPage />} />
        
        {/* Other routes */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/employee-database-management" element={<EmployeePage />} />
        <Route path="/leave-requests" element={<LeaveRequestsPage />} />
        <Route path="/add-employee" element={<AddEmployee />} />
        <Route path="/add-admin" element={<AddAdminPage />} />
        <Route path="/learning-development" element={<TrainingPage />} />
        <Route path="/recruitment-onboarding" element={<Recruitment />} />
        <Route path="/payroll" element={<PayrollPage />} />
        <Route path="/add-employee" element={<AddEmployee />} />
        <Route path="/time-attendance-tracking" element={<TimeandAttendancePage />} />
        <Route path="/performance-management" element={<PerformancePage />} />





      </Routes>
    </Router>
  );
};

export default App;
