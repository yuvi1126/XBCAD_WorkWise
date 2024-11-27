import React, { useState } from "react";
import { collection, doc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import "./AddEmployee.css";
import employeeImage from "../assets/employeeImage.jpg";
import { v4 as uuidv4 } from "uuid"; // For generating unique employee IDs

const AddEmployeePage = () => {
  const [employee, setEmployee] = useState({
    fullName: "",
    role: "",
    department: "",
    contactNumber: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState(""); // To handle error messages
  const [successMessage, setSuccessMessage] = useState(""); // To handle success messages

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEmployee((prev) => ({ ...prev, [name]: value }));
    setError(""); // Clear the error message when typing
    setSuccessMessage(""); // Clear the success message when typing
  };

  const validateFields = () => {
    const { fullName, role, department, contactNumber, email, password } =
      employee;
    if (
      !fullName ||
      !role ||
      !department ||
      !contactNumber ||
      !email ||
      !password
    ) {
      setError("Please fill out all fields.");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return false;
    }
    return true;
  };

  const handleAddEmployee = async () => {
    if (!validateFields()) return;

    const { fullName, role, department, contactNumber, email, password } =
      employee;
    const actualEmployeeId = uuidv4(); // Generate unique actual_employee_id

    try {
      // Register employee in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const userId = userCredential.user.uid;

      // Create employee object
      const employeeData = {
        actual_employee_id: actualEmployeeId,
        FullName: fullName,
        Role: role,
        Department: department,
        Phone: contactNumber,
        Email: email,
      };

      // Save employee in Firestore
      await setDoc(doc(db, "actual_employees", actualEmployeeId), employeeData);

      setSuccessMessage("Employee added successfully!");
      setEmployee({
        fullName: "",
        role: "",
        department: "",
        contactNumber: "",
        email: "",
        password: "",
      });
    } catch (error) {
      console.error("Error adding employee:", error);
      setError("Failed to add employee. Please try again.");
    }
  };
  const handleBackToDashboard = () => {
    window.location.href = "/dashboard"; // Replace with the correct route to your dashboard
  };

  return (
    <div className="admin-login-page">
      <div className="background-elements">
        <div className="circle large"></div>
        <div className="circle medium"></div>
        <div className="circle small"></div>
        <div className="diagonal-lines"></div>
      </div>
      <div className="login-container-fullscreen">
        <div className="add-employee-container">
          <button className="back-to-dashboard" onClick={handleBackToDashboard}>
            &larr; Back to Dashboard
          </button>
          <div className="form-section">
            <h1 className="form-title animated-text">Add New Employee</h1>
            {error && <p className="error-message">{error}</p>}{" "}
            {/* Display error message */}
            {successMessage && (
              <p className="success-message">{successMessage}</p>
            )}{" "}
            {/* Display success message */}
            <form className="employee-form">
              <input
                type="text"
                className="base-input"
                name="fullName"
                placeholder="Full Name"
                value={employee.fullName}
                onChange={handleInputChange}
              />
              <select
                name="role"
                className="base-input"
                value={employee.role}
                onChange={handleInputChange}
              >
                <option value="">Select Role</option>
                <option value="Junior">Junior</option>
                <option value="Senior">Senior</option>
                <option value="Executive">Executive</option>
              </select>
              <select
                name="department"
                className="base-input"
                value={employee.department}
                onChange={handleInputChange}
              >
                <option value="">Select Department</option>
                <option value="IT">IT</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
              </select>
              <input
                type="text"
                className="base-input"
                name="contactNumber"
                placeholder="Contact Number"
                value={employee.contactNumber}
                onChange={handleInputChange}
              />
              <input
                type="email"
                name="email"
                className="base-input"
                placeholder="Email"
                value={employee.email}
                onChange={handleInputChange}
              />
              <input
                type="password"
                name="password"
                className="base-input"
                placeholder="Password"
                value={employee.password}
                onChange={handleInputChange}
              />
              <button
                type="button"
                className="base-button"
                onClick={handleAddEmployee}
              >
                Add Employee
              </button>
            </form>
          </div>
          <div className="image-section">
            <img
              src={employeeImage}
              alt="Employee Placeholder"
              className="employee-image"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEmployeePage;
