
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const API_URL = "http://localhost:5000";

function ClassStudents() {
  const { id } = useParams();

  const [classInfo, setClassInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          `${API_URL}/api/classes/${id}/students`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load students");
        }

        // Adjust these fields if your API uses a different response shape.
        setClassInfo(data.class || null);
        setStudents(Array.isArray(data.students) ? data.students : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [id]);

  return (
    <div className="students-page">
      <header className="students-header">
        <Link to="/teacher-dashboard" className="back-link">
          ← Back to Dashboard
        </Link>

        <h1>Class Students</h1>
        <p>View students enrolled in this class.</p>
      </header>

      {loading ? (
        <p>Loading students...</p>
      ) : error ? (
        <div className="message error">{error}</div>
      ) : (
        <>
          <section className="students-class-card">
            <div>
              <span>CLASS DETAILS</span>
              <h2>{classInfo?.class_name || "Class Details"}</h2>
              {classInfo?.class_code && (
                <p>Class Code: <strong>{classInfo.class_code}</strong></p>
              )}
            </div>

            <div className="students-total">
              <span>Total Students</span>
              <strong>{students.length}</strong>
            </div>
          </section>

          <section className="students-list-section">
            <h2>Enrolled Students</h2>
            <p>Students who have joined this class.</p>

            {students.length === 0 ? (
              <div className="empty-state">
                <span>👨‍🎓</span>
                <h3>No students enrolled yet</h3>
                <p>Students will appear here after joining with the class code.</p>
              </div>
            ) : (
              <div className="students-table-wrapper">
                <table className="students-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Student Name</th>
                      <th>Email Address</th>
                      <th>Joined At</th>
                    </tr>
                  </thead>

                  <tbody>
                    {students.map((student, index) => (
                      <tr key={student.id}>
                        <td>{index + 1}</td>
                        <td>
                          <div className="student-name">
                            <span className="student-avatar">
                              {student.name?.charAt(0).toUpperCase()}
                            </span>
                            {student.name}
                          </div>
                        </td>
                        <td>{student.email}</td>
                        <td>
                          {student.joined_at
                            ? new Date(student.joined_at).toLocaleDateString()
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default ClassStudents;
