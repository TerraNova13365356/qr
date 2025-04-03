import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { logout } from "../../services/authService";

const Navbar = () => {
  const { user } = useAuth();

  return (
    <nav className="bg-green-700 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">Attendance System</Link>
        <div className="flex gap-4">
          {user ? (
            <>
              <Link to={user.role === "teacher" ? "/teacher" : "/student"} className="hover:underline">
                Dashboard
              </Link>
              <button onClick={logout} className="bg-red-500 px-4 py-2 rounded hover:bg-red-600">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:underline">Login</Link>
              <Link to="/signup" className="hover:underline">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
