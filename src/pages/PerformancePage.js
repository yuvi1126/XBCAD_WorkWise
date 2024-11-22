import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import './PerformancePage.css'; // Ensure you have the necessary CSS file.

const PerformancePage = () => {
  const [performanceData, setPerformanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [searchMonth, setSearchMonth] = useState('');
  const [searchYear, setSearchYear] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);

  const db = getFirestore();

  // Fetch data from Firestore
  useEffect(() => {
    const fetchPerformanceData = async () => {
      const dataRef = collection(db, 'performance_data');
      const snapshot = await getDocs(dataRef);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPerformanceData(data);
      setFilteredData(data); // Initialize filtered data
    };

    fetchPerformanceData();
  }, [db]);

  // Handle filtering
  useEffect(() => {
    let data = [...performanceData];
    if (searchName) {
      data = data.filter((item) =>
        item.employeeName.toLowerCase().includes(searchName.toLowerCase())
      );
    }
    if (searchMonth) {
      data = data.filter((item) => item.month.toLowerCase() === searchMonth.toLowerCase());
    }
    if (searchYear) {
      data = data.filter((item) => item.year === searchYear);
    }
    setFilteredData(data);
  }, [searchName, searchMonth, searchYear, performanceData]);

  // Handle inline editing
  const handleEdit = (id, field, value) => {
    setEditData({ ...editData, [field]: value });
    setEditingId(id);
  };

  const saveEdit = async (id) => {
    const recordRef = doc(db, 'performance_data', id);
    await updateDoc(recordRef, editData);
    setPerformanceData(
      performanceData.map((item) => (item.id === id ? { ...item, ...editData } : item))
    );
    setEditingId(null);
    setEditData({});
  };

  // Paginated Data
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="performance-page">
      <h1>Performance Management</h1>

      {/* Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search by Employee Name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter by Month (e.g., October)"
          value={searchMonth}
          onChange={(e) => setSearchMonth(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter by Year (e.g., 2024)"
          value={searchYear}
          onChange={(e) => setSearchYear(e.target.value)}
        />
      </div>

      {/* Performance Table */}
      <table className="performance-table">
        <thead>
          <tr>
            <th>Employee Name</th>
            <th>Month</th>
            <th>Review</th>
            <th>Year</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((item) => (
            <tr key={item.id}>
              <td>
                {editingId === item.id ? (
                  <input
                    type="text"
                    defaultValue={item.employeeName}
                    onChange={(e) => handleEdit(item.id, 'employeeName', e.target.value)}
                  />
                ) : (
                  item.employeeName
                )}
              </td>
              <td>
                {editingId === item.id ? (
                  <input
                    type="text"
                    defaultValue={item.month}
                    onChange={(e) => handleEdit(item.id, 'month', e.target.value)}
                  />
                ) : (
                  item.month
                )}
              </td>
              <td>{item.review}</td>
              <td>
                {editingId === item.id ? (
                  <input
                    type="text"
                    defaultValue={item.year}
                    onChange={(e) => handleEdit(item.id, 'year', e.target.value)}
                  />
                ) : (
                  item.year
                )}
              </td>
              <td>
                {editingId === item.id ? (
                  <button onClick={() => saveEdit(item.id)}>Save</button>
                ) : (
                  <button onClick={() => setEditingId(item.id)}>Edit</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
              Math.min(prev + 1, Math.ceil(filteredData.length / itemsPerPage))
            )
          }
          disabled={currentPage === Math.ceil(filteredData.length / itemsPerPage)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PerformancePage;
