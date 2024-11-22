import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import "./LeaveRequests.css";

const LeaveRequests = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch leave requests
        const leaveRequestsSnapshot = await getDocs(
          collection(db, "leave_requests")
        );
        const leaveRequestsData = leaveRequestsSnapshot.docs.map((doc) => {
          const data = doc.data();
          const startDate = data?.dateRange?.startDate?.toDate
            ? data.dateRange.startDate.toDate()
            : null;
          const endDate = data?.dateRange?.endDate?.toDate
            ? data.dateRange.endDate.toDate()
            : null;

          return {
            ...data,
            id: doc.id,
            dateRange: {
              startDate,
              endDate,
            },
          };
        });
        setLeaveRequests(leaveRequestsData);

        // Fetch employees
        const employeesSnapshot = await getDocs(
          collection(db, "actual_employees")
        );
        const employeesData = await Promise.all(
          employeesSnapshot.docs.map(async (employeeDoc) => {
            const employeeData = employeeDoc.data();
            if (!employeeData.leaveBalance) {
              const employeeRef = doc(db, "actual_employees", employeeDoc.id);
              await updateDoc(employeeRef, { leaveBalance: 15 });
              return { ...employeeData, id: employeeDoc.id, leaveBalance: 15 };
            }
            return { ...employeeData, id: employeeDoc.id };
          })
        );
        setEmployees(employeesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const calculateLeaveDays = (startDate, endDate) => {
    const diffTime = Math.abs(endDate - startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Days difference
  };

  const approveLeave = async (leaveRequest) => {
    try {
      const employee = employees.find(
        (emp) => emp.id === leaveRequest.actual_employee_id
      );
      if (!employee) {
        alert("Employee not found!");
        return;
      }

      const leaveDays = calculateLeaveDays(
        leaveRequest.dateRange.startDate,
        leaveRequest.dateRange.endDate
      );

      const newLeaveBalance = employee.leaveBalance - leaveDays;

      if (newLeaveBalance < 0) {
        alert("Not enough leave balance!");
        return;
      }

      const employeeRef = doc(db, "actual_employees", employee.id);
      await updateDoc(employeeRef, { leaveBalance: newLeaveBalance });

      const leaveRequestRef = doc(db, "leave_requests", leaveRequest.id);
      await deleteDoc(leaveRequestRef);

      setLeaveRequests((prev) =>
        prev.filter((request) => request.id !== leaveRequest.id)
      );
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === employee.id
            ? { ...emp, leaveBalance: newLeaveBalance }
            : emp
        )
      );

      alert("Leave approved and balance updated!");
    } catch (error) {
      console.error("Error approving leave:", error);
      alert("Failed to approve leave.");
    }
  };

  const denyLeave = async (leaveRequest) => {
    try {
      const leaveRequestRef = doc(db, "leave_requests", leaveRequest.id);
      await deleteDoc(leaveRequestRef);

      setLeaveRequests((prev) =>
        prev.filter((request) => request.id !== leaveRequest.id)
      );

      alert("Leave denied and request removed!");
    } catch (error) {
      console.error("Error denying leave:", error);
      alert("Failed to deny leave.");
    }
  };

  return (
    <div className="leave-requests-page">
      <div className="header-buttons">
        <button
          className="back-button"
          onClick={() => (window.location.href = "/dashboard")}
        >
          &larr; Back to Dashboard
        </button>
      </div>
      <div className="leave-header">
        <h1>Leave Requests</h1>
      </div>
      <table className="leave-requests-table">
        <thead>
          <tr>
            <th>Employee Name</th>
            <th>Leave Start</th>
            <th>Leave End</th>
            <th>Reason</th>
            <th>Leave Balance</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {leaveRequests.length > 0 ? (
            leaveRequests.map((request) => {
              const employee = employees.find(
                (emp) => emp.id === request.actual_employee_id
              );
              return (
                <tr key={request.id}>
                  <td>{request.FullName || "Unknown"}</td>
                  <td>
                    {request.dateRange.startDate
                      ? request.dateRange.startDate.toDateString()
                      : "Invalid Date"}
                  </td>
                  <td>
                    {request.dateRange.endDate
                      ? request.dateRange.endDate.toDateString()
                      : "Invalid Date"}
                  </td>
                  <td>{request.reason || "No reason provided"}</td>
                  <td>{employee?.leaveBalance ?? "N/A"}</td>
                  <td>
                    <div className="actions-container">
                      <button
                        className="approve-button"
                        onClick={() => approveLeave(request)}
                      >
                        Approve
                      </button>
                      <button
                        className="deny-button"
                        onClick={() => denyLeave(request)}
                      >
                        Deny
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="6">No leave requests available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LeaveRequests;
