const AttendanceTable = ({ attendanceData }) => {
    if (!attendanceData || Object.keys(attendanceData).length === 0) {
      return <p className="text-gray-500 text-center mt-4">No attendance records available.</p>;
    }
  
    const attendanceArray = Object.values(attendanceData).flatMap((periodData) =>
      Object.values(periodData.attendance || {}).map((record) => ({
        course: record.course,
        period: record.period,
        date: record.date,
        attendance_marked: record.attendance_marked,
        total_students: record.total_students,
      }))
    );
  console.log(attendanceArray)
    return (
      <div className="mt-6">
        <h3 className="text-lg font-bold text-center">Attendance Records</h3>
        <div className="overflow-x-auto">
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
              {attendanceArray.map((record, index) => (
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
      </div>
    );
  };
  
  export default AttendanceTable;
  