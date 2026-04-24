import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api';

export default function JobCard({ job, saved = false, onSaveToggle }) {
  const { user } = useAuth();

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;
    try {
      if (saved) await API.delete(`/profile/saved/${job._id}`);
      else await API.post(`/profile/saved/${job._id}`);
      onSaveToggle && onSaveToggle(job._id, !saved);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 hover:border-blue-600 transition">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-blue-400">{job.title}</h3>
          <p className="text-gray-400">{job.company} &bull; {job.location}</p>
          <div className="flex gap-2 mt-2 flex-wrap">
            <span className="bg-blue-900 text-blue-300 text-xs px-2 py-1 rounded">{job.type}</span>
            {job.salary && <span className="bg-green-900 text-green-300 text-xs px-2 py-1 rounded">{job.salary}</span>}
            {job.skills?.slice(0, 3).map(s => (
              <span key={s} className="bg-neutral-800 text-gray-400 text-xs px-2 py-1 rounded">{s}</span>
            ))}
          </div>
        </div>
        <div className="flex gap-2 items-center ml-3">
          {user?.role === 'seeker' && (
            <button onClick={handleSave} title={saved ? 'Unsave' : 'Save'}
              className={`text-xl transition ${saved ? 'text-yellow-400' : 'text-neutral-600 hover:text-yellow-400'}`}>
              🔖
            </button>
          )}
          <Link to={`/jobs/${job._id}`} className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">View</Link>
        </div>
      </div>
    </div>
  );
}
