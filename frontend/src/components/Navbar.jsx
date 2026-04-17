import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-neutral-800 px-6 py-3 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold text-white tracking-tight">JobBoard</Link>
      <div className="flex gap-4 items-center">
        <Link to="/jobs" className="text-gray-300 hover:text-white text-sm transition">Browse Jobs</Link>
        {!user ? (
          <>
            <Link to="/login" className="text-gray-300 hover:text-white text-sm transition">Login</Link>
            <Link to="/register" className="bg-white text-black px-3 py-1.5 rounded text-sm font-semibold hover:bg-gray-200 transition">Register</Link>
          </>
        ) : (
          <>
            <Link to="/dashboard" className="text-gray-300 hover:text-white text-sm transition">Dashboard</Link>
            <span className="text-gray-500 text-sm">{user.name}</span>
            <button onClick={handleLogout} className="bg-white text-black px-3 py-1.5 rounded text-sm font-semibold hover:bg-gray-200 transition">Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}
