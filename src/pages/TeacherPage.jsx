import { useState, useEffect } from "react";
import { db } from "../firebase/firebaseConfig";
import { ref, set, get, push, onValue } from "firebase/database";
import QRCodeGenerator from "../components/teacher/GenerateQR";
import { data } from "react-router-dom";

const TeacherPage = () => {
  const [teacherClass, setTeacherClass] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [attendanceDetails, setAttendanceDetails] = useState([]);
  const [sortedData, setSortedData] = useState([]);
  const [qrId, setQrId] = useState("");
  const [sortByCourse, setSortByCourse] = useState(false);
  const [sortByPeriod, setSortByPeriod] = useState(false);
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    error: null
  });
  const [markedAttendance, setMarkedAttendance] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  let teacherId = localStorage.getItem("userid");


  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            error: null
          });
        },
        (error) => {
          setLocation(prev => ({
            ...prev,
            error: error.message
          }));
        }
      );
    } else {
      setLocation(prev => ({
        ...prev,
        error: "Geolocation is not supported by this browser"
      }));
    }
  }, []);

  const courseOptions = {
    CS: ["CS101", "CS102", "CS103"],
    EEE: ["EEE201", "EEE202", "EEE203"],
    EC: ["EC301", "EC302", "EC303"],
  };

  const generateQRCode = async () => {
    if (!teacherClass || !selectedPeriod || !selectedCourse) {
      alert("Please select class, period, and course code.");
      return;
    }

    const newSessionId = `${teacherClass}-${selectedPeriod}-${Date.now()}`;
    setSessionId(newSessionId);

    const attendanceRef = ref(db, `college/class/${teacherClass}`);
    const snapshot = await get(attendanceRef);

    if (snapshot.exists()) {
      const totalStudents = snapshot.val();
      const qrRef = ref(db, `qr/`);
      const qrSnapshot = await push(qrRef, {
        sessionId: newSessionId,
        teacherId,
        class: teacherClass,
        period: selectedPeriod,
        course: selectedCourse,
        total_students: totalStudents,
        time: new Date().toLocaleTimeString(),
        location:location
      });

      setQrId(qrSnapshot.key);
      storeAttendance(newSessionId, totalStudents);
    } else {
      alert("Class not found in database.");
    }
  };

  const storeAttendance = async (newSessionId, totalStudents) => {
    const attendancePath = `Teacher/${teacherId}/${teacherClass}/${selectedPeriod}/attendance/${newSessionId}/details`;
    const currentDate = new Date().toISOString().split("T")[0];

    await set(ref(db, attendancePath), {
      total_students: totalStudents,
      attendance_marked: 0,
      period: selectedPeriod,
      course: selectedCourse,
      date: currentDate,
    });
  };

  useEffect(() => {
    const attendancePath = `Teacher/${teacherId}`;
    const attendanceRef = ref(db, attendancePath);

    const unsubscribe = onValue(attendanceRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setAttendanceDetails(parseAttendanceData(data));
        setMarkedAttendance(parseMarkedStudents(data));
      }
    });

    return () => unsubscribe();
  }, []);

  const parseAttendanceData = (data) => {
    return Object.entries(data).flatMap(([classKey, periods]) =>
      Object.entries(periods).flatMap(([periodKey, attendanceObj]) => {
        if (!attendanceObj.attendance) return [];
        return Object.entries(attendanceObj.attendance).map(([sessionId, attendance]) => ({
          sessionId,
          course: attendance.details.course || "Unknown",
          period: parseInt(attendance.details.period, 10) || 0,
          date: attendance.details.date || "N/A",
          attendance_marked: attendance.details.attendance_marked || 0,
          total_students: attendance.details.total_students || 0,
        }));
      })
    );
  };

  const parseMarkedStudents = (data) => {
    let markedData = {};

    Object.entries(data).forEach(([classKey, periods]) => {
      Object.entries(periods).forEach(([periodKey, attendanceObj]) => {
        if (!attendanceObj.attendance) return;
        Object.entries(attendanceObj.attendance).forEach(([sessionId, attendance]) => {
          if (!attendance.marked_students) return;
          markedData[sessionId] = Object.entries(attendance.marked_students).map(([studentId, record]) => ({
            studentId:studentId,
            status: record.status || "Present",
          }));
        });
      });
    });
    console.log(markedData);
    
    
    return markedData;
  };

  const openModal = (sessionId) => {
    setSelectedSession(sessionId);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedSession(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-green-600 text-center">Teacher Dashboard</h2>

        {/* Class Selection */}
        <div className="p-4">
          <label className="block mb-2">Select Class:</label>
          <select
            className="w-full p-2 border rounded mb-4"
            value={teacherClass}
            onChange={(e) => {
              setTeacherClass(e.target.value);
              setSelectedCourse("");
            }}
          >
            <option value="">Select Class</option>
            {Object.keys(courseOptions).map((cls) => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>

          <label className="block mb-2">Select Period:</label>
          <select
            className="w-full p-2 border rounded mb-4"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="">Select Period</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((period) => (
              <option key={period} value={period}>{period} Period</option>
            ))}
          </select>

          <label className="block mb-2">Select Course Code:</label>
          <select
            className="w-full p-2 border rounded mb-4"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            disabled={!teacherClass}
          >
            <option value="">Select Course Code</option>
            {teacherClass && courseOptions[teacherClass].map((code) => (
              <option key={code} value={code}>{code}</option>
            ))}
          </select>
        </div>

        <button
          onClick={generateQRCode}
          className="w-full mt-4 bg-green-600 text-white p-2 rounded hover:bg-green-700 transition"
        >
          Generate QR Code
        </button>

        {qrId && (
          <div className="mt-6 text-center">
            <QRCodeGenerator sessionId={qrId} />
          </div>
        )}

        {/* Sorting Options */}
        {sortedData.length > 0 && (
          <div className="mt-4">
            <label className="block text-lg font-semibold mb-2">Sort by:</label>
            <div className="flex gap-4">
              <label>
                <input type="checkbox" checked={sortByCourse} onChange={() => setSortByCourse(!sortByCourse)} /> Course
              </label>
              <label>
                <input type="checkbox" checked={sortByPeriod} onChange={() => setSortByPeriod(!sortByPeriod)} /> Period
              </label>
            </div>
          </div>
        )}

        {/* Attendance Table */}
        {attendanceDetails.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-bold text-center">Attendance Records</h3>
            <table className="min-w-full bg-white border border-gray-300 shadow-md rounded-lg">
              <thead>
                <tr className="bg-gray-200">
                  <th className="py-2 px-4 border">Course</th>
                  <th className="py-2 px-4 border">Period</th>
                  <th className="py-2 px-4 border">Date</th>
                  <th className="py-2 px-4 border">Marked</th>
                  <th className="py-2 px-4 border">Total</th>
                </tr>
              </thead>
              <tbody>
                {attendanceDetails.map((record, index) => (
                  <tr key={index} className="text-center border">
                    <td className="py-2 px-4 border">{record.course}</td>
                    <td className="py-2 px-4 border">{record.period}</td>
                    <td className="py-2 px-4 border">{record.date}</td>

                    {/* Button to Open Popup */}
                    <td className="py-2 px-4 border">
                      <button
                        onClick={() => openModal(record.sessionId)}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-700"
                      >
                        {record.attendance_marked}
                      </button>
                    </td>

                    <td className="py-2 px-4 border">{record.total_students}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal (Popup) Window */}
      {modalOpen && selectedSession && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Marked Attendance</h2>

            {markedAttendance[selectedSession]?.length > 0 ? (
              <ul className="max-h-60 overflow-y-auto">
                {markedAttendance[selectedSession].map((student, idx) => (
                  
                  <li key={idx} className="p-2 border-b">
                    {student.studentId} - {student.status}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No students marked</p>
            )}

            <button
              onClick={closeModal}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
      
       
    </div>
  );
};

export default TeacherPage;
