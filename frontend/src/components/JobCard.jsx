import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api';

export default function JobCard({ job, saved = false, onSaveToggle }) {
  const { user } = useAuth();

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;
    try {
      if (saved) {
        await API.delete(`/profile/saved/${job._id}`);
      } else {
        await API.post(`/profile/saved/${job._id}`);
      }
      onSaveToggle && onSaveToggle(job._id, !saved);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition bg-white">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-blue-700">{job.title}</h3>
          <p className="text-gray-600">{job.company} &bull; {job.location}</p>
          <div className="flex gap-2 mt-2 flex-wrap">
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">{job.type}</span>
            {job.salary && <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">{job.salary}</span>}
            {job.skills?.slice(0, 3).map(s => (
              <span key={s} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">{s}</span>
            ))}
          </div>
        </div>
        <div className="flex gap-2 items-center ml-3">
          {user?.role === 'seeker' && (
            <button onClick={handleSave} title={saved ? 'Unsave' : 'Save'}
              className={`text-xl transition ${saved ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'}`}>
              {saved ? '🔖' : '🔖'}
              <span className="sr-only">{saved ? 'Unsave' : 'Save'}</span>
            </button>
          )}
          <Link to={`/jobs/${job._id}`} className="bg-blue-700 text-white px-3 py-1 rounded text-sm hover:bg-blue-800">View</Link>
        </div>
      </div>
    </div>
  );
}
