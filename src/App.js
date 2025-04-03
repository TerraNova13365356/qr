import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AuthPage from './pages/LoginPage';
import TeacherPage from './pages/TeacherPage';
import StudentPage from './pages/StudentPage';
import StudentDashboard from './pages/StudentPage';
 


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/Auth" element={<AuthPage/>} />
        <Route path="/Faculty" element={<TeacherPage/>} />
        <Route path="/Student" element={<StudentDashboard/>} />
      </Routes>
    </Router>
  );
}

export default App;
