import { useEffect, useState } from 'react';
import API from '../api';
import JobCard from '../components/JobCard';
import { useAuth } from '../context/AuthContext';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [savedIds, setSavedIds] = useState([]);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (location) params.location = location;
      if (type) params.type = type;
      const { data } = await API.get('/jobs', { params });
      setJobs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    if (user?.role === 'seeker') {
      API.get('/profile/saved').then(({ data }) => setSavedIds(data.map(j => j._id))).catch(console.error);
    }
  }, []);

  const handleSaveToggle = (jobId, isSaved) => {
    setSavedIds(prev => isSaved ? [...prev, jobId] : prev.filter(id => id !== jobId));
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h2 className="text-2xl font-bold text-blue-700 mb-6">Browse Jobs</h2>
      <div className="flex gap-3 mb-6 flex-wrap">
        <input className="border rounded px-3 py-2 flex-1 min-w-[180px]" placeholder="Search title, skills..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <input className="border rounded px-3 py-2 w-40" placeholder="Location"
          value={location} onChange={e => setLocation(e.target.value)} />
        <select className="border rounded px-3 py-2 w-36" value={type} onChange={e => setType(e.target.value)}>
          <option value="">All Types</option>
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="remote">Remote</option>
          <option value="contract">Contract</option>
        </select>
        <button onClick={fetchJobs} className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800">Search</button>
      </div>
      {loading ? <p className="text-gray-500">Loading...</p> : (
        <div className="space-y-4">
          {jobs.length === 0 ? <p className="text-gray-500">No jobs found.</p> :
            jobs.map(job => (
              <JobCard key={job._id} job={job}
                saved={savedIds.includes(job._id)}
                onSaveToggle={handleSaveToggle} />
            ))}
        </div>
      )}
    </div>
  );
}
