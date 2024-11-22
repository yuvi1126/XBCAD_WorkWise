import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import "./Recruitment.css";

const Recruitment = () => {
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [newJob, setNewJob] = useState({
    title: "",
    description: "",
    department: "",
    requirements: "",
    location: "",
  });
  const [currentSection, setCurrentSection] = useState("create");
  const [statusUpdate, setStatusUpdate] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      const jobsSnapshot = await getDocs(collection(db, "job_postings"));
      setJobs(jobsSnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };

    const fetchApplicants = async () => {
      const applicantsSnapshot = await getDocs(collection(db, "applicants"));
      setApplicants(
        applicantsSnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
      );
    };

    fetchJobs();
    fetchApplicants();
  }, []);

  const handleAddJob = async () => {
    if (!newJob.title || !newJob.description || !newJob.department) {
      alert("Please fill out all required fields.");
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "job_postings"), newJob);
      setJobs([...jobs, { ...newJob, id: docRef.id }]);
      setNewJob({
        title: "",
        description: "",
        department: "",
        requirements: "",
        location: "",
      });
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
      const applicantRef = doc(db, "applicants", applicantId);
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
              <div className="recruitment-container">
                <div className="form-wrapper">
                  <h2>Create New Job</h2>
                  <form>
                    <input
                      type="text"
                      placeholder="Job Title"
                      value={newJob.title}
                      onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                    />
                    <textarea
                      placeholder="Job Description"
                      value={newJob.description}
                      onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                    />
                    <input
                      type="text"
                      placeholder="Department"
                      value={newJob.department}
                      onChange={(e) => setNewJob({ ...newJob, department: e.target.value })}
                    />
                    <input
                      type="text"
                      placeholder="Requirements"
                      value={newJob.requirements}
                      onChange={(e) => setNewJob({ ...newJob, requirements: e.target.value })}
                    />
                    <input
                      type="text"
                      placeholder="Location"
                      value={newJob.location}
                      onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                    />
                    <button type="button" onClick={handleAddJob}>
                      Post Job
                    </button>
                  </form>
                </div>
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
                  <small>{job.department} | {job.location}</small>
                </li>
              ))}
            </ul>
          </div>
        );
      case "view-applicants":
        return (
          <div className="applicants-list">
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
                {applicants.map((applicant) => (
                  <tr key={applicant.id}>
                    <td>{applicant.name}</td>
                    <td>{applicant.email}</td>
                    <td>{jobs.find((job) => job.id === applicant.jobId)?.title}</td>
                    <td>{applicant.status}</td>
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
                        onClick={() => handleUpdateApplicantStatus(applicant.id)}
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
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
        </ul>
      </div>
      <div className="main-content">{renderSection()}</div>
    </div>

    
  );
};

export default Recruitment;
