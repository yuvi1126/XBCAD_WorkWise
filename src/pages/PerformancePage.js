import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  deleteDoc,
  setDoc,
  doc,
} from "firebase/firestore";
import "./PerformancePage.css";

const PerformancePage = () => {
  const [performanceData, setPerformanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [editStates, setEditStates] = useState({}); // Track feedback and score for each row
  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);

  const db = getFirestore();

  useEffect(() => {
    const fetchPerformanceData = async () => {
      const goalsRef = collection(db, "goals");
      const employeesRef = collection(db, "actual_employees");

      try {
        // Fetch goals and employees
        const [goalsSnapshot, employeesSnapshot] = await Promise.all([
          getDocs(goalsRef),
          getDocs(employeesRef),
        ]);

        // Create a map of actual_employee_id to their full names
        const employeesMap = employeesSnapshot.docs.reduce((map, doc) => {
          map[doc.id] = doc.data().FullName || "Unknown";
          return map;
        }, {});

        // Map goals to include the employee name from the map
        const data = goalsSnapshot.docs.map((doc) => {
          const goalData = doc.data();
          const employeeName =
            employeesMap[goalData.actual_employee_id] || "Unknown";

          return {
            id: doc.id,
            employeeId: goalData.actual_employee_id, // Use actual_employee_id
            employeeName,
            description: goalData.description,
            start_date: goalData.start_date,
            end_date: goalData.end_date,
          };
        });

        setPerformanceData(data);
        setFilteredData(data);
      } catch (error) {
        console.error("Error fetching performance data:", error);
        alert("Failed to load performance data. Please try again.");
      }
    };

    fetchPerformanceData();
  }, [db]);

  // Handle filtering by employee name
  useEffect(() => {
    let data = [...performanceData];
    if (searchName) {
      data = data.filter((item) =>
        item.employeeName.toLowerCase().includes(searchName.toLowerCase())
      );
    }
    setFilteredData(data);
  }, [searchName, performanceData]);

  // Handle feedback and score changes
  const handleInputChange = (id, field, value) => {
    setEditStates((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  // Save feedback and score, move to goals_feedback, and remove from goals
  const saveFeedbackAndScore = async (id) => {
    const { feedback = "", score = "" } = editStates[id] || {};

    if (!feedback || !score) {
      alert("Please provide both feedback and a score.");
      return;
    }

    try {
      const parsedScore = parseFloat(score);
      if (isNaN(parsedScore)) {
        alert("Score must be a valid number.");
        return;
      }

      const recordRef = doc(db, "goals", id);
      const goalSnapshot = await getDoc(recordRef); // Use getDoc to fetch a single document

      if (!goalSnapshot.exists()) {
        alert("Goal not found.");
        return;
      }

      const goalData = goalSnapshot.data();

      // Create a new entry in `goals_feedback`
      const feedbackRef = doc(collection(db, "goals_feedback"), id); // Use the same ID as the goal
      await setDoc(feedbackRef, {
        actual_employee_id: goalData.actual_employee_id,
        goal_id: id,
        description: goalData.description,
        start_date: goalData.start_date,
        end_date: goalData.end_date,
        feedback,
        score: parsedScore, // Save score as a number
        updated_at: new Date(),
      });

      // Remove the goal from the `goals` collection
      await deleteDoc(recordRef);

      // Update local state
      setPerformanceData((prev) => prev.filter((item) => item.id !== id));
      setFilteredData((prev) => prev.filter((item) => item.id !== id));

      alert("Feedback and score saved successfully!");
      setEditStates((prev) => ({ ...prev, [id]: {} })); // Clear state for this row
    } catch (error) {
      console.error("Error saving feedback and score:", error);
      alert("Failed to save feedback and score. Please try again.");
    }
  };

  // Paginated Data
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="recruitment-page">
      <div className="side-panel">
        <h2>Performance</h2>
        <ul>
          <li onClick={() => (window.location.href = "/dashboard")}>Back</li>
        </ul>
      </div>
      <div className="main-content-recruitment">
        <div className="">
          <h1>Performance Management</h1>

          {/* Filters */}
          <div className="filters">
            <input
              type="text"
              className="base-small-input"
              placeholder="Search by Employee Name"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
          </div>

          {/* Performance Table */}
          <div className="base-table">
            <table>
              <thead>
                <tr>
                  <th>Employee Name</th>
                  <th>Goal Description</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Score</th>
                  <th>Feedback</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item) => {
                  const currentEditState = editStates[item.id] || {};
                  return (
                    <tr key={item.id}>
                      <td>{item.employeeName}</td>
                      <td>{item.description}</td>
                      <td>
                        {item.start_date
                          ? new Date(
                              item.start_date.seconds * 1000
                            ).toLocaleDateString()
                          : "Invalid Date"}
                      </td>
                      <td>
                        {item.end_date
                          ? new Date(
                              item.end_date.seconds * 1000
                            ).toLocaleDateString()
                          : "Invalid Date"}
                      </td>
                      <td>
                        <input
                          type="number"
                          value={currentEditState.score || ""}
                          onChange={(e) =>
                            handleInputChange(item.id, "score", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <textarea
                          value={currentEditState.feedback || ""}
                          onChange={(e) =>
                            handleInputChange(
                              item.id,
                              "feedback",
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td>
                        <button onClick={() => saveFeedbackAndScore(item.id)}>
                          Submit Feedback
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="pagination">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>Page {currentPage}</span>
            <button
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(
                    prev + 1,
                    Math.ceil(filteredData.length / itemsPerPage)
                  )
                )
              }
              disabled={
                currentPage === Math.ceil(filteredData.length / itemsPerPage)
              }
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformancePage;
