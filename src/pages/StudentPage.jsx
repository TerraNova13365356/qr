import React, { useState, useRef, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import {
  ref,
  get,
  update,
  onValue,
  set,
} from "firebase/database";
import { db } from "../firebase/firebaseConfig";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const StudentAttendanceDashboard = () => {
  const [scanning, setScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState(null);
  const [lastScan, setLastScan] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const scannerRef = useRef(null);
  const scannerDivRef = useRef(null);

  const studentId =
    localStorage.getItem("studentId") ||
    sessionStorage.getItem("studentId") ||
    "S2023501";

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        const studentRef = ref(db, `students/${studentId}`);

        const unsubscribe = onValue(
          studentRef,
          (snapshot) => {
            if (snapshot.exists()) {
              setStudentData(snapshot.val());
            } else {
              toast.error("Student data not found");
            }
            setLoading(false);
          },
          (error) => {
            console.error("Error fetching student data:", error);
            toast.error("Failed to load student profile");
            setLoading(false);
          }
        );

        // Fetch attendance history
        const historyRef = ref(db, `students/${studentId}/attendance`);
        const historySnapshot = await get(historyRef);
        if (historySnapshot.exists()) {
          const history = historySnapshot.val();
          // Flatten all attendance records from different courses
          const historyArray = Object.entries(history)
            .flatMap(([course, sessions]) => 
              Object.entries(sessions).map(([sessionId, data]) => ({
                id: sessionId,
                course,
                ...data,
              }))
            )
            .sort((a, b) => new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date));

          setAttendanceHistory(historyArray);
          if (historyArray.length > 0) {
            const lastAttendance = historyArray[0];
            setLastScan(new Date(lastAttendance.timestamp || lastAttendance.date).toLocaleString());
          }
        }

        return () => unsubscribe();
      } catch (error) {
        console.error("Error in data fetching:", error);
        toast.error("Failed to connect to database");
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [studentId]);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Failed to clear scanner:", error);
        });
      }
    };
  }, []);

  useEffect(() => {
    if (scanning && !scannerRef.current) {
      const scannerElement = document.getElementById("qr-reader");
      if (scannerElement) {
        scannerElement.innerHTML = ""; // Clear previous content

        const newScanner = new Html5QrcodeScanner(
          "qr-reader",
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            rememberLastUsedCamera: true,
            showTorchButtonIfSupported: true,
          },
          false
        );

        newScanner.render(
          async (decodedText) => {
            setScanning(false);
            try {
              await newScanner.clear();
              scannerRef.current = null;
              await markAttendance(decodedText);
            } catch (error) {
              console.error("Error during scan handling:", error);
            }
          },
          (errorMessage) => {
            console.log("Scanning error:", errorMessage);
          }
        );

        scannerRef.current = newScanner;
      }
    }
  }, [scanning]);

  const markAttendance = async (decodedText) => {
    try {
      const qrref = ref(db, `qr/${decodedText}`);
      const qrSnapshot = await get(qrref);

      if (qrSnapshot.exists()) {
        const qrData = qrSnapshot.val();
        console.log(qrData);
        
        const attendanceRef = ref(
          db,
          `Teacher/${qrData.teacherId}/${qrData.class}/${qrData.period}/attendance/${qrData.sessionId}`
        );
        const attendanceSnapshot = await get(attendanceRef);
        console.log(attendanceSnapshot.val());
        
        if (attendanceSnapshot.exists()) {
          const attendanceData = attendanceSnapshot.val();
          const lastTime = qrData.time;
          const currentTime = new Date().toLocaleTimeString();

          const parseTimeStringToTimestamp = (timeStr) => {
            const [hours, minutes, seconds] = timeStr.split(":").map(Number);
            const now = new Date();
            now.setHours(hours, minutes, seconds, 0);
            return now.getTime();
          };

          const timestamp1 = parseTimeStringToTimestamp(lastTime);
          const timestamp2 = parseTimeStringToTimestamp(currentTime);

          const timeDifference = Math.abs(timestamp1 - timestamp2) / 60000;
          
          // Calculate time difference in minutes
           
          console.log((timeDifference));
          
          if (timeDifference > 5) {
            toast.info("QR code has expired (more than 5 minutes old)");
          } else {
            // Update teacher's attendance record
            await update(attendanceRef, {
              attendance_marked: (attendanceData.attendance_marked || 0) + 1,
            });

            // Update student's attendance record
            const studentAttendanceRef = ref(
              db,
              `students/${studentId}/attendance/${qrData.class}/${qrData.sessionId}`
            );

            await set(studentAttendanceRef, {
              timestamp: new Date().toISOString(),
              status: "present",
              class: qrData.class,
              period: qrData.period,
              teacherId: qrData.teacherId,
              sessionId: qrData.sessionId
            });

            toast.success("Attendance marked successfully!");
            setScannedResult(decodedText);
          }
        } else {
          toast.error("Attendance session not found");
        }
      } else {
        toast.error("Invalid QR Code");
      }
    } catch (error) {
      console.error("Error marking attendance:", error);
      toast.error("Failed to mark attendance");
    }
  };

  const cancelScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(error => {
        console.error("Failed to clear scanner:", error);
      });
      scannerRef.current = null;
    }
    setScanning(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full px-6 py-8 bg-white rounded-xl shadow-md">
        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-600">Loading student data...</p>
          </div>
        ) : (
          <>
            {studentData ? (
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                  {studentData.name}
                </h1>
                <p className="text-gray-500">
                  ID: {studentId} • {studentData.program}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {lastScan ? `Last attendance: ${lastScan}` : "No recent attendance recorded"}
                </p>
              </div>
            ) : (
              <p className="text-center text-red-500">
                Student profile not found. Please contact your administrator.
              </p>
            )}

            <div className="mt-6 flex flex-col items-center">
              {!scanning ? (
                <button
                  onClick={() => setScanning(true)}
                  className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-600"
                >
                  Scan QR Code
                </button>
              ) : (
                <div className="w-full flex flex-col items-center">
                  <div id="qr-reader" className="w-full max-w-sm"></div>
                  <button 
                    onClick={cancelScanning} 
                    className="mt-4 bg-gray-200 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {attendanceHistory.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Attendance History</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr>
                        <th className="py-2 px-4 border-b">Date</th>
                        <th className="py-2 px-4 border-b">Course</th>
                        <th className="py-2 px-4 border-b">Period</th>
                        <th className="py-2 px-4 border-b">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceHistory.slice(0, 5).map((record) => (
                        <tr key={record.id}>
                          <td className="py-2 px-4 border-b text-center">
                            {new Date(record.timestamp || record.date).toLocaleString()}
                          </td>
                          <td className="py-2 px-4 border-b text-center">{record.class || record.course}</td>
                          <td className="py-2 px-4 border-b text-center">{record.period}</td>
                          <td className="py-2 px-4 border-b text-center">{record.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <ToastContainer position="bottom-center" autoClose={3000} />
    </div>
  );
};

export default StudentAttendanceDashboard;