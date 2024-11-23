import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import "./Payroll.css";

const Payroll = () => {
  const [employees, setEmployees] = useState([]);
  const [monthlyHours, setMonthlyHours] = useState([]);
  const [bonusAmount, setBonusAmount] = useState(0);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const db = getFirestore();

  // Fetch all employees and their monthly hours
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch employee data
        const employeesSnapshot = await getDocs(collection(db, "actual_employees"));
        const employeeData = employeesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Fetch monthly hours data
        const hoursSnapshot = await getDocs(collection(db, "monthly_hours"));
        const hoursData = hoursSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setEmployees(employeeData);
        setMonthlyHours(hoursData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [db]);

  // Calculate pay based on role and hours
  const calculatePay = (role, monthlyHours, overtimeHours) => {
    let hourlyRate = 0;
    switch (role.toLowerCase()) {
      case "junior":
        hourlyRate = 500;
        break;
      case "senior":
        hourlyRate = 1000;
        break;
      case "executive":
        hourlyRate = 2000;
        break;
      default:
        hourlyRate = 0;
    }
    const overtimeRate = 350;
    return monthlyHours * hourlyRate + overtimeHours * overtimeRate;
  };

  // Pay employee and remove them from the table
  const payEmployee = async (employeeId, role, monthlyHours, overtimeHours, hoursDocId) => {
    const totalPay = calculatePay(role, monthlyHours, overtimeHours);
    const currentMonth = new Date().toISOString().slice(0, 7); // Format as yyyy-MM

    try {
      // Save the payroll data in Firestore
      await addDoc(collection(db, "employee_payslips"), {
        actual_employee_id: employeeId,
        month: currentMonth,
        total_pay: totalPay,
        monthly_hours: monthlyHours,
        overtime_hours: overtimeHours,
        paid_at: new Date(),
      });

      // Remove the employee's hours record from Firestore
      if (hoursDocId) {
        await deleteDoc(doc(db, "monthly_hours", hoursDocId));
      }

      // Update the UI to remove the employee
      setMonthlyHours((prev) => prev.filter((item) => item.id !== hoursDocId));

      alert(`Employee paid successfully! Total Pay: R${totalPay}`);
    } catch (error) {
      console.error("Error paying employee:", error);
      alert("Failed to pay employee. Please try again.");
    }
  };

  // Handle bonus payment
  const handlePayBonus = async () => {
    if (!selectedEmployee || bonusAmount <= 0) {
      alert("Please select an employee and enter a valid bonus amount.");
      return;
    }

    try {
      // Save the bonus data in Firestore
      await addDoc(collection(db, "employee_bonuses"), {
        actual_employee_id: selectedEmployee.id,
        bonus_amount: bonusAmount,
        paid_at: new Date(),
      });

      alert(`Bonus of R${bonusAmount} paid to ${selectedEmployee.FullName}`);
      setSelectedEmployee(null);
      setBonusAmount(0);
    } catch (error) {
      console.error("Error paying bonus:", error);
      alert("Failed to pay bonus. Please try again.");
    }
  };

  return (
    <div className="payroll-page">
      <h1>Payroll Management</h1>

      <table className="payroll-table">
        <thead>
          <tr>
            <th>Employee Name</th>
            <th>Role</th>
            <th>Monthly Hours</th>
            <th>Overtime Hours</th>
            <th>Total Pay</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => {
            const hoursData = monthlyHours.find(
              (hours) => hours.actual_employee_id === employee.id
            );
            const monthlyHoursWorked = hoursData ? hoursData.monthly_hours : 0;
            const overtimeHoursWorked = hoursData ? hoursData.overtime_hours : 0;

            return (
              <tr key={employee.id}>
                <td>{employee.FullName || "Unknown"}</td>
                <td>{employee.Role || "Unknown"}</td>
                <td>{monthlyHoursWorked}</td>
                <td>{overtimeHoursWorked}</td>
                <td>
                  R
                  {calculatePay(
                    employee.Role,
                    monthlyHoursWorked,
                    overtimeHoursWorked
                  )}
                </td>
                <td>
                  <button
                    onClick={() =>
                      payEmployee(
                        employee.id,
                        employee.Role,
                        monthlyHoursWorked,
                        overtimeHoursWorked,
                        hoursData ? hoursData.id : null
                      )
                    }
                    disabled={!hoursData} // Disable if no hours data available
                  >
                    Pay Employee
                  </button>
                  <button
                    onClick={() => setSelectedEmployee(employee)}
                    style={{ marginLeft: "8px" }}
                  >
                    Pay Bonus
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {selectedEmployee && (
        <div className="bonus-modal">
          <h3>Pay Bonus to {selectedEmployee.FullName}</h3>
          <input
            type="number"
            placeholder="Enter bonus amount"
            value={bonusAmount}
            onChange={(e) => setBonusAmount(Number(e.target.value))}
          />
          <button onClick={handlePayBonus}>Pay Bonus</button>
          <button onClick={() => setSelectedEmployee(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default Payroll;
