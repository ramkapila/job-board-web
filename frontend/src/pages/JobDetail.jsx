import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [message, setMessage] = useState('');
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    API.get(`/jobs/${id}`).then(({ data }) => setJob(data)).catch(console.error);
  }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    try {
      await API.post('/applications', { job: id, coverLetter });
      setApplied(true);
      setMessage('Application submitted successfully!');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to apply');
    }
  };

  if (!job) return <div className="text-center py-20 text-gray-500">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h1 className="text-2xl font-bold text-blue-700">{job.title}</h1>
        <p className="text-gray-600 mt-1">{job.company} &bull; {job.location}</p>
        <div className="flex gap-2 mt-3 flex-wrap">
          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">{job.type}</span>
          {job.salary && <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">{job.salary}</span>}
        </div>
        <div className="mt-4">
          <h3 className="font-semibold mb-1">Description</h3>
          <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
        </div>
        {job.skills?.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Required Skills</h3>
            <div className="flex gap-2 flex-wrap">
              {job.skills.map(s => <span key={s} className="bg-gray-100 text-gray-600 text-sm px-2 py-1 rounded">{s}</span>)}
            </div>
          </div>
        )}
      </div>

      {user?.role === 'seeker' && !applied && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-lg mb-3">Apply for this Job</h3>
          <form onSubmit={handleApply} className="space-y-3">
            <textarea className="w-full border rounded px-3 py-2 h-32" placeholder="Cover letter (optional)"
              value={coverLetter} onChange={e => setCoverLetter(e.target.value)} />
            <button className="bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800 font-semibold">Submit Application</button>
          </form>
        </div>
      )}
      {message && <p className={`mt-4 text-sm font-medium ${applied ? 'text-green-600' : 'text-red-500'}`}>{message}</p>}
      {!user && <p className="mt-4 text-sm text-gray-500">Please <a href="/login" className="text-blue-700 underline">login</a> to apply.</p>}
    </div>
  );
}
