import React, { useState } from "react";
import { getDatabase, ref, set } from "firebase/database";
import app from "./firebaseConfig";

const StudentForm = () => {
  const [student, setStudent] = useState({
    name: "",
    id: "",
    program: "",
    subjects: [{ name: "", attended: 0, total: 0 }],
  });

  const handleChange = (e) => {
    setStudent({ ...student, [e.target.name]: e.target.value });
  };

  const handleSubjectChange = (index, e) => {
    const updatedSubjects = [...student.subjects];
    updatedSubjects[index][e.target.name] = e.target.value;
    setStudent({ ...student, subjects: updatedSubjects });
  };

  const addSubject = () => {
    setStudent({
      ...student,
      subjects: [...student.subjects, { name: "", attended: 0, total: 0 }],
    });
  };

  const saveStudent = () => {
    const db = getDatabase(app);
    set(ref(db, "students/" + student.id), student)
      .then(() => alert("Student added successfully!"))
      .catch((error) => alert("Error: " + error.message));
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 shadow rounded">
      <h2 className="text-xl font-bold mb-4">Add Student</h2>
      <input
        type="text"
        name="course-code"
        placeholder="course-code"
        value={student.name}
        onChange={handleChange}
        className="w-full p-2 border rounded mb-2"
      />
      <input
        type="text"
        name="id"
        placeholder="ID"
        value={student.id}
        onChange={handleChange}
        className="w-full p-2 border rounded mb-2"
      />
      <input
        type="text"
        name="program"
        placeholder="Program"
        value={student.program}
        onChange={handleChange}
        className="w-full p-2 border rounded mb-2"
      />
      <h3 className="text-lg font-semibold mt-4">Subjects</h3>
      {student.subjects.map((subject, index) => (
        <div key={index} className="mb-2">
          <input
            type="text"
            name="name"
            placeholder="Subject Name"
            value={subject.name}
            onChange={(e) => handleSubjectChange(index, e)}
            className="w-full p-2 border rounded mb-1"
          />
          <input
            type="number"
            name="attended"
            placeholder="Attended"
            value={subject.attended}
            onChange={(e) => handleSubjectChange(index, e)}
            className="w-full p-2 border rounded mb-1"
          />
          <input
            type="number"
            name="total"
            placeholder="Total"
            value={subject.total}
            onChange={(e) => handleSubjectChange(index, e)}
            className="w-full p-2 border rounded mb-1"
          />
        </div>
      ))}
      <button
        onClick={addSubject}
        className="bg-green-500 text-white px-4 py-2 rounded mb-4"
      >
        Add Subject
      </button>
      <button
        onClick={saveStudent}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Save Student
      </button>
    </div>
  );
};

export default StudentForm;