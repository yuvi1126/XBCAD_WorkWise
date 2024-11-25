import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import "./EmployeePage.css";
import "./../App.css";

const EmployeePage = () => {
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [viewMode, setViewMode] = useState("table");
  const [editEmployee, setEditEmployee] = useState(null); // To store the employee being edited

  useEffect(() => {
    const fetchEmployees = async () => {
      const querySnapshot = await getDocs(collection(db, "actual_employees"));
      setEmployees(
        querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
      );
    };
    fetchEmployees();
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const handleEdit = (employee) => {
    setEditEmployee(employee); // Set the employee to be edited
  };

  const handleSaveEdit = async () => {
    try {
      const employeeDoc = doc(db, "actual_employees", editEmployee.id);
      await updateDoc(employeeDoc, {
        FullName: editEmployee.FullName,
        Email: editEmployee.Email,
        Role: editEmployee.Role,
        Department: editEmployee.Department,
        Phone: editEmployee.Phone,
      });
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === editEmployee.id ? { ...editEmployee } : emp
        )
      );
      setEditEmployee(null); // Close the modal
      alert("Employee updated successfully!");
    } catch (err) {
      console.error("Error updating employee:", err);
    }
  };

  const handleCancelEdit = () => {
    setEditEmployee(null); // Close the modal without saving
  };

  const filteredEmployees = employees.filter((employee) => {
    const fullName = employee.FullName?.toLowerCase() || "";
    const email = employee.Email?.toLowerCase() || "";
    const role = employee.Role?.toLowerCase() || "";
    const department = employee.Department?.toLowerCase() || "";

    return (
      (fullName.includes(searchQuery) ||
        email.includes(searchQuery) ||
        role.includes(searchQuery)) &&
      (!filterRole || role === filterRole.toLowerCase()) &&
      (!filterDepartment || department === filterDepartment.toLowerCase())
    );
  });

  return (
    <div className="recruitment-page">
      <div className="side-panel">
        <h2>Employee</h2>
        <ul>
          <li onClick={() => (window.location.href = "/add-employee")}>
            Add Employee
          </li>
          <li onClick={() => setViewMode("table")}>Table View</li>
          <li onClick={() => setViewMode("grid")}>Grid View</li>
          <li onClick={() => (window.location.href = "/dashboard")}>Back</li>
        </ul>
      </div>
      <div className="main-content-recruitment">
        {/* <button
        className="back-button"
        onClick={() => (window.location.href = "/dashboard")}
      >
        &larr; Back to Dashboard
      </button> */}
       

        <section className="employee-content">
          {viewMode === "table" ? (
            <div className="base-table">
               <div className="employee-header">
      
          <h1>Employee Management</h1>
          <div className="actions">
            <input
              type="text"
              className="search-bar"
              placeholder="Search employees..."
              value={searchQuery}
              onChange={handleSearch}
            />
         
      
          
           
          </div>
        </div>
              <table className="base-table">
                <thead>
                  <tr>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Phone</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id}>
                      <td>{employee.FullName}</td>
                      <td>{employee.Email}</td>
                      <td>{employee.Role}</td>
                      <td>{employee.Department}</td>
                      <td>{employee.Phone}</td>
                      <td>
                        <button
                          className="base-button"
                          onClick={() => handleEdit(employee)}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="gridView">
              {filteredEmployees.map((employee) => (
                <div className="employee-card" key={employee.id}>
                  <p className="card-header">{employee.FullName}</p>
                  <p className="card-detail">Email: {employee.Email}</p>
                  <p className="card-detail">Role: {employee.Role}</p>
                  <p className="card-detail">
                    Department: {employee.Department}
                  </p>
                  <p className="card-detail">Phone: {employee.Phone}</p>
                  <button
                    className="base-button"
                    onClick={() => handleEdit(employee)}
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {editEmployee && (
          <div className="modal">
            <div className="modal-content">
              <h2>Edit Employee</h2>
              <label>Full Name:</label>
              <input
                type="text"
                value={editEmployee.FullName}
                onChange={(e) =>
                  setEditEmployee({ ...editEmployee, FullName: e.target.value })
                }
              />
              <label>Email:</label>
              <input
                type="email"
                value={editEmployee.Email}
                onChange={(e) =>
                  setEditEmployee({ ...editEmployee, Email: e.target.value })
                }
              />
              <label>Role:</label>
              <select
                value={editEmployee.Role}
                onChange={(e) =>
                  setEditEmployee({ ...editEmployee, Role: e.target.value })
                }
              >
                <option value="Junior">Junior</option>
                <option value="Senior">Senior</option>
                <option value="Executive">Executive</option>
              </select>
              <label>Department:</label>
              <select
                value={editEmployee.Department}
                onChange={(e) =>
                  setEditEmployee({
                    ...editEmployee,
                    Department: e.target.value,
                  })
                }
              >
                <option value="IT">IT</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
              </select>
              <label>Phone:</label>
              <input
                type="text"
                value={editEmployee.Phone}
                onChange={(e) =>
                  setEditEmployee({ ...editEmployee, Phone: e.target.value })
                }
              />
              <div className="modal-actions">
                <button onClick={handleSaveEdit} className="action-button">
                  Save
                </button>
                <button onClick={handleCancelEdit} className="cancel-button">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeePage;
