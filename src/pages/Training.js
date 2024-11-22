import React, { useState, useEffect } from "react";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import "./Training.css";

const Training = () => {
  const [courses, setCourses] = useState([]);
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    videoLink: "",
    attachedFile: null,
  });

  useEffect(() => {
    const fetchCourses = async () => {
      const querySnapshot = await getDocs(collection(db, "ActualCourses"));
      setCourses(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    fetchCourses();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCourse((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setNewCourse((prev) => ({ ...prev, attachedFile: e.target.files[0] }));
  };

  const handleAddCourse = async () => {
    if (!newCourse.title) {
      alert("Title is required.");
      return;
    }

    try {
      await addDoc(collection(db, "ActualCourses"), {
        title: newCourse.title,
        description: newCourse.description,
        videoLink: newCourse.videoLink || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      alert("Course added successfully!");
      setNewCourse({
        title: "",
        description: "",
        videoLink: "",
        attachedFile: null,
      });
      const querySnapshot = await getDocs(collection(db, "ActualCourses"));
      setCourses(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error adding course: ", error);
    }
  };

  const handleViewEnrolled = (courseId) => {
    alert(`View Enrolled functionality for course ID: ${courseId}`);
    // Implement logic for fetching and displaying employees enrolled in a specific course.
  };

  return (
    <div className="training-page">
      <button
        className="back-button"
        onClick={() => (window.location.href = "/dashboard")}
      >
        &larr; Back to Dashboard
      </button>

      <header className="training-header">
        <h1>Learning and Development</h1>
        <p>Schedule and track training programs for employees.</p>
      </header>

      <section className="training-form">
        <h2>Add New Course</h2>
        <form>
          <input
            type="text"
            name="title"
            placeholder="Course Title (required)"
            value={newCourse.title}
            onChange={handleInputChange}
            className="animated-input"
          />
          <textarea
            name="description"
            placeholder="Course Description"
            value={newCourse.description}
            onChange={handleInputChange}
            className="animated-textarea"
          />
          <input
            type="url"
            name="videoLink"
            placeholder="Video Link (optional)"
            value={newCourse.videoLink}
            onChange={handleInputChange}
            className="animated-input"
          />
          <input
            type="file"
            onChange={handleFileChange}
            className="animated-file-input"
          />
          <button type="button" onClick={handleAddCourse} className="add-course-button">
            Add Course
          </button>
        </form>
      </section>

      <section className="course-list">
        <h2>Existing Courses</h2>
        <div className="course-grid">
          {courses.length > 0 ? (
            courses.map((course) => (
              <div key={course.id} className="course-card">
                <h3>{course.title}</h3>
                <p>{course.description}</p>
                {course.videoLink && (
                  <a
                    href={course.videoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="watch-video-link"
                  >
                    Watch Video
                  </a>
                )}
                <button
                  className="enrolled-button"
                  onClick={() => handleViewEnrolled(course.id)}
                >
                  View Enrolled
                </button>
              </div>
            ))
          ) : (
            <p className="no-courses">No courses available.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Training;
