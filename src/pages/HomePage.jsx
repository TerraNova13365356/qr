import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-gray-800 p-6">
      <div className="max-w-3xl text-center">
        <h1 className="text-4xl font-bold text-green-600">QR Attendance System</h1>
        <p className="mt-4 text-lg">
          A smart and secure way to manage attendance using QR codes and GPS verification.
        </p>
        <div className="mt-6 flex gap-4 justify-center">
          <Link to="/Auth" className="px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition">
            Login/SignIn
          </Link>
           
        </div>
      </div>
    </div>
  );
};

export default HomePage;
