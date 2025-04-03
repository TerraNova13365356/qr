import { useState, useEffect } from "react";
import { db } from "../firebase/firebaseConfig";
import { ref, set, get, push, onValue } from "firebase/database";
import QRCodeGenerator from "../components/teacher/GenerateQR";

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

  let teacherId = "DNFEFO23JND";


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
    const attendancePath = `Teacher/${teacherId}/${teacherClass}/${selectedPeriod}/attendance/${newSessionId}`;
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
        const data = parseAttendanceData(snapshot.val());
        setAttendanceDetails(data);
        setSortedData(sortAttendance(data, sortByCourse, sortByPeriod));
      }
    });

    return () => unsubscribe();
  }, [sessionId, teacherClass, selectedPeriod, sortByCourse, sortByPeriod]);

  const parseAttendanceData = (data) => {
    return Object.entries(data)
      .flatMap(([classKey, periods]) =>
        Object.entries(periods).flatMap(([periodKey, attendanceObj]) =>
          Object.entries(attendanceObj.attendance || {}).map(([id, record]) => ({
            course: record.course,
            period: parseInt(record.period),
            date: record.date,
            attendance_marked: record.attendance_marked,
            total_students: record.total_students,
          }))
        )
      );
  };

  const sortAttendance = (data, byCourse, byPeriod) => {
    return [...data].sort((a, b) => {
      if (byCourse && byPeriod) {
        if (a.course === b.course) return a.period - b.period;
        return a.course.localeCompare(b.course);
      }
      if (byCourse) return a.course.localeCompare(b.course);
      if (byPeriod) return a.period - b.period;
      return 0;
    });
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
        {sortedData.length > 0 && (
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
                {sortedData.map((record, index) => (
                  <tr key={index} className="text-center border">
                    <td className="py-2 px-4 border">{record.course}</td>
                    <td className="py-2 px-4 border">{record.period}</td>
                    <td className="py-2 px-4 border">{record.date}</td>
                    <td className="py-2 px-4 border">{record.attendance_marked}</td>
                    <td className="py-2 px-4 border">{record.total_students}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherPage;
