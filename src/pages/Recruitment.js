import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  addDoc, // Added missing import for addDoc
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import "./Recruitment.css";
import { useNavigate } from "react-router-dom";

const Recruitment = () => {
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [employees, setEmployees] = useState([]);
  const navigate = useNavigate();
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    department: '',
    requirements: '',
    location: '',
  });
  const [currentSection, setCurrentSection] = useState("create");
  const [statusUpdate, setStatusUpdate] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewJob(prevJob => ({
      ...prevJob,
      [name]: value,
    }));
  };

  useEffect(() => {
    const fetchJobs = async () => {
      const jobsSnapshot = await getDocs(collection(db, "job_postings"));
      setJobs(jobsSnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };

    const fetchApplicants = async () => {
      const applicantsSnapshot = await getDocs(collection(db, "job_applicants"));
      setApplicants(
        applicantsSnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
      );
    };

    const fetchEmployees = async () => {
      const employeesSnapshot = await getDocs(collection(db, "actual_employees"));
      setEmployees(
        employeesSnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
      );
    };

    fetchJobs();
    fetchApplicants();
    fetchEmployees();
  }, []);

  const handleAddJob = async () => {
    if (!newJob.title || !newJob.description || !newJob.department) {
      alert("Please fill out all required fields.");
      return;
    }

    try {
      await addDoc(collection(db, "job_postings"), newJob);
      alert("Job posted successfully!");
    } catch (error) {
      console.error("Error adding job:", error);
      alert("Failed to create job posting.");
    }
  };

  const handleUpdateApplicantStatus = async (applicantId) => {
    if (!statusUpdate) {
      alert("Please select a status.");
      return;
    }

    try {
      const applicantRef = doc(db, "job_applicants", applicantId);
      await updateDoc(applicantRef, { status: statusUpdate });
      setApplicants((prev) =>
        prev.map((applicant) =>
          applicant.id === applicantId
            ? { ...applicant, status: statusUpdate }
            : applicant
        )
      );
      alert("Applicant status updated!");
      setStatusUpdate("");
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update applicant status.");
    }
  };

  const renderSection = () => {
    switch (currentSection) {
      case "create":
        return (
          <div className="job-creation-form">
          <h2>Create New Job</h2>
          <form onSubmit={handleAddJob}>
            <div className="form-group">
              <label htmlFor="title">Job Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={newJob.title}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Job Description</label>
              <textarea
                id="description"
                name="description"
                value={newJob.description}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="department">Department</label>
              <input
                type="text"
                id="department"
                name="department"
                value={newJob.department}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="requirements">Requirements</label>
              <input
                type="text"
                id="requirements"
                name="requirements"
                value={newJob.requirements}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={newJob.location}
                onChange={handleInputChange}
                required
              />
            </div>
            <button type="submit">Post Job</button>
          </form>
        </div>
        );
      case "view-jobs":
        return (
          <div className="jobs-list">
            <h3>View Existing Jobs</h3>
            <ul>
              {jobs.map((job) => (
                <li key={job.id}>
                  <h4>{job.title}</h4>
                  <p>{job.description}</p>
                  <small>
                    {job.department} | {job.location}
                  </small>
                </li>
              ))}
            </ul>
          </div>
        );
      case "view-applicants":
        return (
          <div className="base-table">
            <h3>View Applicants</h3>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Job</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applicants.map((applicant) => {
                  const employee = employees.find(
                    (emp) => emp.id === applicant.actual_employee_id
                  );
                  const job = jobs.find((job) => job.id === applicant.job_id);

                  return (
                    <tr key={applicant.id}>
                      <td>{employee?.FullName || "Unknown"}</td>
                      <td>{employee?.Email || "Unknown"}</td>
                      <td>{job?.title || "Unknown"}</td>
                      <td>{applicant.status || "Applied"}</td>
                      <td>
                        <select
                          value={statusUpdate}
                          onChange={(e) => setStatusUpdate(e.target.value)}
                        >
                          <option value="">Update Status</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Shortlisted">Shortlisted</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                        <button
                          onClick={() =>
                            handleUpdateApplicantStatus(applicant.id)
                          }
                        >
                          Update
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="recruitment-page">
      <div className="side-panel">
        <h2>Recruitment</h2>
        <ul>
          <li onClick={() => setCurrentSection("create")}>Create New Job</li>
          <li onClick={() => setCurrentSection("view-jobs")}>
            View Existing Jobs
          </li>
          <li onClick={() => setCurrentSection("view-applicants")}>
            View Applicants
          </li>
          <li onClick={() =>navigate("/dashboard")}>
            Back
          </li>
        </ul>
      </div>
      <div className="main-content-recruitment">{renderSection()}</div>
    </div>
  );
};

export default Recruitment;
