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

  if (!job) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-gray-500">Loading...</div>;

  return (
    <div className="min-h-screen bg-neutral-950 text-white pt-20">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-6">
          <h1 className="text-2xl font-bold text-white">{job.title}</h1>
          <p className="text-gray-400 mt-1">{job.company} &bull; {job.location}</p>
          <div className="flex gap-2 mt-3 flex-wrap">
            <span className="bg-blue-900 text-blue-300 text-xs px-2 py-1 rounded">{job.type}</span>
            {job.salary && <span className="bg-green-900 text-green-300 text-xs px-2 py-1 rounded">{job.salary}</span>}
            {job.expiresAt && <span className="bg-neutral-800 text-gray-400 text-xs px-2 py-1 rounded">Expires: {new Date(job.expiresAt).toLocaleDateString()}</span>}
          </div>
          <div className="mt-4">
            <h3 className="font-semibold mb-1 text-gray-300">Description</h3>
            <p className="text-gray-400 whitespace-pre-line">{job.description}</p>
          </div>
          {job.skills?.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2 text-gray-300">Required Skills</h3>
              <div className="flex gap-2 flex-wrap">
                {job.skills.map(s => <span key={s} className="bg-neutral-800 text-gray-300 text-sm px-2 py-1 rounded">{s}</span>)}
              </div>
            </div>
          )}
        </div>

        {user?.role === 'seeker' && !applied && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-3">Apply for this Job</h3>
            <form onSubmit={handleApply} className="space-y-3">
              <textarea className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 h-32 text-white placeholder-gray-500"
                placeholder="Cover letter (optional)" value={coverLetter} onChange={e => setCoverLetter(e.target.value)} />
              <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-semibold">Submit Application</button>
            </form>
          </div>
        )}
        {message && <p className={`mt-4 text-sm font-medium ${applied ? 'text-green-400' : 'text-red-400'}`}>{message}</p>}
        {!user && <p className="mt-4 text-sm text-gray-500">Please <a href="/login" className="text-blue-400 underline">login</a> to apply.</p>}
      </div>
    </div>
  );
}
