import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'seeker', company: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await API.post('/auth/register', form);
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950">
      <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6">Create Account</h2>
        {error && <p className="text-red-400 mb-4 text-sm">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white placeholder-gray-500"
            placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <input className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white placeholder-gray-500"
            type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          <input className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white placeholder-gray-500"
            type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          <select className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white"
            value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
            <option value="seeker">Job Seeker</option>
            <option value="employer">Employer</option>
          </select>
          {form.role === 'employer' && (
            <input className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white placeholder-gray-500"
              placeholder="Company Name" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} required />
          )}
          <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold">Register</button>
        </form>
        <p className="mt-4 text-sm text-center text-gray-400">Already have an account? <Link to="/login" className="text-blue-400 hover:underline">Login</Link></p>
      </div>
    </div>
  );
}
