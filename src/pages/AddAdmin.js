import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import "./AddAdmin.css";

const AddAdminPage = () => {
  const [admin, setAdmin] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAdmin((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccessMessage("");
  };

  const validateFields = () => {
    const { email, password } = admin;
    if (!email || !password) {
      setError("Please fill out all fields.");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return false;
    }
    return true;
  };

  const handleAddAdmin = async () => {
    if (!validateFields()) return;

    const { email, password } = admin;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      const adminData = {
        email: email,
        uid: uid,
      };

      await addDoc(collection(db, "admin"), adminData);

      setSuccessMessage("Admin added successfully!");
      setAdmin({ email: "", password: "" });
    } catch (error) {
      console.error("Error adding admin:", error);
      setError("Failed to add admin. Please try again.");
    }
  };

  const handleBackToDashboard = () => {
    window.location.href = "/dashboard"; // Replace with the correct route to your dashboard
  };

  return (
    <div className="add-admin-container">
      <button className="back-to-dashboard" onClick={handleBackToDashboard}>
        &larr; Back to Dashboard
      </button>
      <div className="form-section">
        <h1 className="form-title">Add New Admin</h1>
        {error && <p className="error-message">{error}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
        <form className="admin-form">
          <input
            type="email"
            name="email"
            placeholder="Admin Email"
            value={admin.email}
            onChange={handleInputChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Admin Password"
            value={admin.password}
            onChange={handleInputChange}
          />
          <button type="button" className="add-admin-button" onClick={handleAddAdmin}>
            Add Admin
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddAdminPage;
