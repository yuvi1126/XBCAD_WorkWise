import React, { useState } from "react";
import { auth, db } from "../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import "./AdminLoginPage.css";

const AdminLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const adminDocRef = doc(db, "admin", "adminAccount");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const adminDoc = await getDoc(adminDocRef);

      if (adminDoc.exists() && adminDoc.data().uid === userCredential.user.uid) {
        alert("Login successful!");
        window.location.href = "/dashboard"; // Redirect to the dashboard
      } else {
        setError("You are not authorized to access this application.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="background-elements">
        <div className="circle large"></div>
        <div className="circle medium"></div>
        <div className="circle small"></div>
        <div className="diagonal-lines"></div>
      </div>
      <div className="login-container">
        <div className="welcome-text">
          <h1 className="animated-text">Welcome Back To WorkWise</h1>
        </div>
        <div className="login-box">
          <h2>Login</h2>
          {error && <p className="error-message">{error}</p>}
          <form onSubmit={handleLogin} className="login-form">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="login-input"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="login-input"
            />
            <button type="submit" className="login-button">LOGIN</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
