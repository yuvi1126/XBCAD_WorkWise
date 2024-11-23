import React, { useEffect, useState } from "react";
import "./TimeandAttendancePage.css";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

const TimeandAttendancePage = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [searchDepartment, setSearchDepartment] = useState("");
  const [currentDateTime, setCurrentDateTime] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");

  // Update current date and time
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
      const date = now.toLocaleDateString(undefined, options);
      const time = now.toLocaleTimeString();
      setCurrentDateTime(`${date}, ${time}`);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch attendance and employee data
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const employeesSnapshot = await getDocs(collection(db, "actual_employees"));
        const attendanceSnapshot = await getDocs(collection(db, "attendance"));

        const attendanceMap = {};
        attendanceSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.date && data.employeeId) {
            const clockInDate = new Date(data.date.seconds * 1000); // Firestore Timestamp
            const clockOutDate = data.clockOut
              ? new Date(data.clockOut.seconds * 1000)
              : null;

            attendanceMap[data.employeeId] = {
              date: clockInDate,
              clockOut: clockOutDate,
            };
          }
        });

        const employees = [];
        employeesSnapshot.forEach((doc) => {
          const employee = doc.data();
          const attendance = attendanceMap[doc.id] || { date: null, clockOut: null };

          // Determine attendance status
          let attendanceStatus = "Absent";
          if (attendance.date && !attendance.clockOut) {
            attendanceStatus = "Present";
          } else if (attendance.date && attendance.clockOut) {
            attendanceStatus = "Logged Off";
          }

          employees.push({
            id: doc.id,
            name: employee.FullName || "Unknown",
            department: employee.Department || "Not Assigned",
            status: attendanceStatus,
            timeClockedIn: attendance.date ? attendance.date.toLocaleString() : "Not Clocked In",
            timeClockedOut: attendance.clockOut ? attendance.clockOut.toLocaleString() : "Not Clocked Out",
          });
        });

        setAttendanceData(employees);
        setFilteredData(employees);
      } catch (error) {
        console.error("Error fetching attendance data:", error);
      }
    };

    fetchAttendance();
  }, []);

  // Filter attendance data
  useEffect(() => {
    const filterByTime = (data) => {
      const now = new Date();
      if (timeFilter === "weekly") {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        return data.filter((record) => {
          const recordDate = new Date(record.timeClockedIn);
          return recordDate >= oneWeekAgo && recordDate <= now;
        });
      } else if (timeFilter === "monthly") {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(now.getMonth() - 1);
        return data.filter((record) => {
          const recordDate = new Date(record.timeClockedIn);
          return recordDate >= oneMonthAgo && recordDate <= now;
        });
      }
      return data; // Default: All
    };

    const filtered = filterByTime(attendanceData).filter((record) => {
      const matchesName = record.name.toLowerCase().includes(searchName.toLowerCase());
      const matchesDepartment = record.department.toLowerCase().includes(searchDepartment.toLowerCase());
      return matchesName && matchesDepartment;
    });

    setFilteredData(filtered);
  }, [searchName, searchDepartment, attendanceData, timeFilter]);

  return (
    <div className="time-attendance-page-container">
      <div className="date-time-container">
        <h2>Current Date and Time</h2>
        <p>{currentDateTime}</p>
      </div>

      <h1>Employee Attendance</h1>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search by Name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Search by Department"
          value={searchDepartment}
          onChange={(e) => setSearchDepartment(e.target.value)}
        />
        <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="weekly">Last 7 Days</option>
          <option value="monthly">Last 30 Days</option>
        </select>
      </div>

      <table className="attendance-table">
        <thead>
          <tr>
            <th>Employee Name</th>
            <th>Department</th>
            <th>Attendance Status</th>
            <th>Clock-In Time</th>
            <th>Clock-Out Time</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.length > 0 ? (
            filteredData.map((record, index) => (
              <tr key={index}>
                <td>{record.name}</td>
                <td>{record.department}</td>
                <td>{record.status}</td>
                <td>{record.timeClockedIn}</td>
                <td>{record.timeClockedOut}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No records found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TimeandAttendancePage;
