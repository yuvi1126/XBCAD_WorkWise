import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { signOut } from "firebase/auth";
import "./Dashboard.css";
import logo from "../assets/WorkWiseLogo.png";
import {
  Dashboard,
  People,
  AddCircle,
  AdminPanelSettings,
} from "@mui/icons-material";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const DashboardPage = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setCurrentUser(user);
    }

    const fetchLeaveRequests = async () => {
      const querySnapshot = await getDocs(collection(db, "leave_requests"));
      setLeaveRequests(querySnapshot.docs.map((doc) => doc.data()));
    };

    const fetchEmployees = async () => {
      const querySnapshot = await getDocs(collection(db, "employees"));
      setEmployees(querySnapshot.docs.map((doc) => doc.data()));
    };

    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      setUsers(querySnapshot.docs.map((doc) => doc.data()));
    };

    fetchLeaveRequests();
    fetchEmployees();
    fetchUsers();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const employeeUserData = {
    labels: ["Completed Profiles (Employees)", "Signed-Up Users (Incomplete)"],
    datasets: [
      {
        data: [employees.length, users.length - employees.length],
        backgroundColor: ["#36A2EB", "#FF6384"],
        hoverBackgroundColor: ["#36A2EB80", "#FF638480"],
      },
    ],
  };

  const headcountData = {
    labels: ["Total Users"],
    datasets: [
      {
        label: "Total Users (Employees + Incomplete Users)",
        data: [users.length],
        backgroundColor: "#4BC0C0",
      },
    ],
  };

  return (
    <div className="dashboard-container">
      <header className="top-nav">
        <div className="logo-container">
          <img src={logo} alt="WorkWise Logo" className="logo" />
          <h1>WorkWise</h1>
        </div>
        <div className="user-actions">
          {currentUser && (
            <span className="user-email">{currentUser.email}</span>
          )}
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <aside className={`sidebar ${isSidebarOpen ? "open" : "collapsed"}`}>
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          {isSidebarOpen ? "<" : ">"}
        </button>
        <ul>
          <li onClick={() => navigate("/employee-database-management")}>
            <Dashboard />
            {isSidebarOpen && <span>Employee Database Management</span>}
          </li>
          <li onClick={() => navigate("/recruitment-onboarding")}>
            <People />
            {isSidebarOpen && <span>Recruitment and Onboarding</span>}
          </li>
          <li onClick={() => navigate("/time-attendance-tracking")}>
            <AddCircle />
            {isSidebarOpen && <span>Time and Attendance Tracking</span>}
          </li>
          <li onClick={() => navigate("/payroll-compensation")}>
            <AdminPanelSettings />
            {isSidebarOpen && <span>Payroll and Compensation</span>}
          </li>
          <li onClick={() => navigate("/performance-management")}>
            <AdminPanelSettings />
            {isSidebarOpen && <span>Performance Management</span>}
          </li>
          <li onClick={() => navigate("/learning-development")}>
            <AdminPanelSettings />
            {isSidebarOpen && <span>Learning and Development</span>}
          </li>
        </ul>
      </aside>

      <main className="main-content">
        <div className="graph-container">
          <div className="card central-chart">
            <h3>Employee vs. User Breakdown</h3>
            <Pie data={employeeUserData} />
          </div>
          <div className="card central-chart">
            <h3>Total Headcount</h3>
            <Bar data={headcountData} />
          </div>
        </div>
        <div className="widget-container">
          <div
            className="card widget"
            onClick={() => navigate("/leave-requests")}
          >
            <h3>Leave Requests</h3>
            <p>{leaveRequests.length} Pending</p>
          </div>
          <div
            className="card widget"
            onClick={() => navigate("/add-employee")}
          >
            <h3>Add Employee</h3>
            <p>Add Employees To The Database</p>
          </div>
          <div className="card widget" onClick={() => navigate("/add-admin")}>
            <h3>Add Admin</h3>
            <p>Add An Admin To The Database</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
