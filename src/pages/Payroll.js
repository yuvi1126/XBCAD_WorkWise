import React, { useState, useEffect } from "react";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import "./Payroll.css";

const PayrollPage = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [monthlyHours, setMonthlyHours] = useState(0);
  const [overtimeHours, setOvertimeHours] = useState(0);
  const [calculatedSalary, setCalculatedSalary] = useState(null);

  // Fetch all employees
  useEffect(() => {
    const fetchEmployees = async () => {
      const querySnapshot = await getDocs(collection(db, "actual_employees"));
      setEmployees(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    };
    fetchEmployees();
  }, []);

  // Salary calculation logic
  const calculateSalary = () => {
    if (!selectedEmployee || !monthlyHours) {
      alert("Please select an employee and enter monthly hours.");
      return;
    }

    const employee = employees.find((emp) => emp.id === selectedEmployee);
    if (!employee) {
      alert("Employee not found.");
      return;
    }

    // Base hourly rates by role
    const hourlyRates = {
      Junior: 350,
      Senior: 850,
      Executive: 1500,
    };

    // Department-specific adjustment factor (customizable)
    const departmentAdjustments = {
      IT: 1.1, // 10% bonus for IT
      HR: 1.05, // 5% bonus for HR
      Finance: 1.15, // 15% bonus for Finance
      Marketing: 1, // No adjustment for Marketing
      Sales: 1.2, // 20% bonus for Sales
    };

    const baseRate = hourlyRates[employee.Role] || 0;
    const departmentAdjustment =
      departmentAdjustments[employee.Department] || 1;

    const monthlyPay = baseRate * monthlyHours * departmentAdjustment;
    const overtimePay = baseRate * 2 * overtimeHours * departmentAdjustment;
    const totalPay = monthlyPay + overtimePay;

    setCalculatedSalary({
      employeeName: employee.FullName,
      basePay: monthlyPay.toFixed(2),
      overtimePay: overtimePay.toFixed(2),
      totalPay: totalPay.toFixed(2),
    });

    // Send proof of payment to Firebase
    const saveProofOfPayment = async () => {
      try {
        await addDoc(collection(db, "employee_salaries"), {
          employee_id: employee.id,
          month: new Date().toISOString().slice(0, 7), // YYYY-MM format
          monthly_hours: monthlyHours,
          overtime_hours: overtimeHours,
          total_payment: totalPay.toFixed(2),
          timestamp: Date.now(),
        });
        alert("Proof of payment sent successfully!");
      } catch (error) {
        console.error("Error saving proof of payment:", error);
        alert("Failed to save proof of payment.");
      }
    };

    saveProofOfPayment();
  };

  return (
    <div className="payroll-page">
      <header className="payroll-header">
        <h1>Payroll & Compensation</h1>
        <p>Submit hours, calculate salaries, and send proofs of payment.</p>
      </header>

      <div className="payroll-container">
        <div className="employee-selection">
          <h2>Select Employee</h2>
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
          >
            <option value="">-- Select Employee --</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.FullName} ({employee.Role}, {employee.Department})
              </option>
            ))}
          </select>
        </div>

        <div className="hours-input">
          <h2>Submit Hours</h2>
          <input
            type="number"
            placeholder="Monthly Hours"
            value={monthlyHours}
            onChange={(e) => setMonthlyHours(Number(e.target.value))}
          />
          <input
            type="number"
            placeholder="Overtime Hours"
            value={overtimeHours}
            onChange={(e) => setOvertimeHours(Number(e.target.value))}
          />
          <button onClick={calculateSalary}>Calculate Salary</button>
        </div>
      </div>

      {calculatedSalary && (
        <div className="salary-details">
          <h2>Calculated Salary</h2>
          <p>
            <strong>Employee:</strong> {calculatedSalary.employeeName}
          </p>
          <p>
            <strong>Base Pay:</strong> R{calculatedSalary.basePay}
          </p>
          <p>
            <strong>Overtime Pay:</strong> R{calculatedSalary.overtimePay}
          </p>
          <p>
            <strong>Total Pay:</strong> R{calculatedSalary.totalPay}
          </p>
        </div>
      )}
    </div>
  );
};

export default PayrollPage;
