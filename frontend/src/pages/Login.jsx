import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await API.post('/auth/login', form);
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-blue-700 mb-6">Login</h2>
        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="w-full border rounded px-3 py-2" type="email" placeholder="Email"
            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          <input className="w-full border rounded px-3 py-2" type="password" placeholder="Password"
            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          <button className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800 font-semibold">Login</button>
        </form>
        <p className="mt-4 text-sm text-center">Don't have an account? <Link to="/register" className="text-blue-700 hover:underline">Register</Link></p>
      </div>
    </div>
  );
}
