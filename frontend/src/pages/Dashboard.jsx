import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [profile, setProfile] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [jobForm, setJobForm] = useState({ title: '', description: '', company: user?.company || '', location: '', type: 'full-time', salary: '', skills: '' });
  const [showJobForm, setShowJobForm] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (user?.role === 'employer') {
      API.get('/jobs/employer/myjobs').then(({ data }) => setData(data)).catch(console.error);
    } else {
      API.get('/applications/my').then(({ data }) => setData(data)).catch(console.error);
    }
    API.get('/profile').then(({ data }) => { setProfile(data); }).catch(console.error);
    if (user?.role === 'seeker') {
      API.get('/profile/saved').then(({ data }) => setSavedJobs(data)).catch(console.error);
    }
  }, [user]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      await API.put('/profile', profile);
      setEditMode(false);
      setMsg('Profile updated!');
    } catch { setMsg('Failed to update profile'); }
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...jobForm, skills: jobForm.skills.split(',').map(s => s.trim()).filter(Boolean) };
      const { data: newJob } = await API.post('/jobs', payload);
      setData(prev => [newJob, ...prev]);
      setShowJobForm(false);
      setJobForm({ title: '', description: '', company: user?.company || '', location: '', type: 'full-time', salary: '', skills: '' });
      setMsg('Job posted!');
    } catch (err) { setMsg(err.response?.data?.message || 'Failed to post job'); }
  };

  const handleDeleteJob = async (id) => {
    if (!window.confirm('Delete this job?')) return;
    try {
      await API.delete(`/jobs/${id}`);
      setData(prev => prev.filter(j => j._id !== id));
    } catch { setMsg('Failed to delete job'); }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h2 className="text-2xl font-bold text-blue-700 mb-6">Dashboard — {user?.role === 'employer' ? 'Employer' : 'Job Seeker'}</h2>
      {msg && <p className="mb-4 text-sm text-green-600">{msg}</p>}

      {/* Profile Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-lg">My Profile</h3>
          <button onClick={() => setEditMode(!editMode)} className="text-blue-700 text-sm hover:underline">{editMode ? 'Cancel' : 'Edit'}</button>
        </div>
        {editMode ? (
          <form onSubmit={handleProfileSave} className="space-y-3">
            <input className="w-full border rounded px-3 py-2" placeholder="Name" value={profile.name || ''} onChange={e => setProfile({ ...profile, name: e.target.value })} />
            {user?.role === 'seeker' && (
              <>
                <textarea className="w-full border rounded px-3 py-2" placeholder="Bio" value={profile.bio || ''} onChange={e => setProfile({ ...profile, bio: e.target.value })} />
                <input className="w-full border rounded px-3 py-2" placeholder="Skills (comma separated)" value={profile.skills?.join(', ') || ''} onChange={e => setProfile({ ...profile, skills: e.target.value.split(',').map(s => s.trim()) })} />
                <input className="w-full border rounded px-3 py-2" placeholder="Resume URL" value={profile.resume || ''} onChange={e => setProfile({ ...profile, resume: e.target.value })} />
              </>
            )}
            {user?.role === 'employer' && (
              <>
                <input className="w-full border rounded px-3 py-2" placeholder="Company" value={profile.company || ''} onChange={e => setProfile({ ...profile, company: e.target.value })} />
                <input className="w-full border rounded px-3 py-2" placeholder="Website" value={profile.website || ''} onChange={e => setProfile({ ...profile, website: e.target.value })} />
              </>
            )}
            <button className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800">Save</button>
          </form>
        ) : (
          <div className="text-gray-700 space-y-1 text-sm">
            <p><span className="font-medium">Name:</span> {profile.name}</p>
            <p><span className="font-medium">Email:</span> {profile.email}</p>
            {user?.role === 'seeker' && <>
              {profile.bio && <p><span className="font-medium">Bio:</span> {profile.bio}</p>}
              {profile.skills?.length > 0 && <p><span className="font-medium">Skills:</span> {profile.skills.join(', ')}</p>}
              {profile.resume && <p><span className="font-medium">Resume:</span> <a href={profile.resume} className="text-blue-600 underline" target="_blank" rel="noreferrer">View</a></p>}
            </>}
            {user?.role === 'employer' && <>
              {profile.company && <p><span className="font-medium">Company:</span> {profile.company}</p>}
              {profile.website && <p><span className="font-medium">Website:</span> <a href={profile.website} className="text-blue-600 underline" target="_blank" rel="noreferrer">{profile.website}</a></p>}
            </>}
          </div>
        )}
      </div>

      {/* Employer: Post Jobs */}
      {user?.role === 'employer' && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-lg">My Job Listings</h3>
            <button onClick={() => setShowJobForm(!showJobForm)} className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 text-sm">
              {showJobForm ? 'Cancel' : '+ Post Job'}
            </button>
          </div>
          {showJobForm && (
            <form onSubmit={handlePostJob} className="bg-white rounded-xl shadow-sm p-6 mb-4 space-y-3">
              <input className="w-full border rounded px-3 py-2" placeholder="Job Title" value={jobForm.title} onChange={e => setJobForm({ ...jobForm, title: e.target.value })} required />
              <textarea className="w-full border rounded px-3 py-2 h-28" placeholder="Job Description" value={jobForm.description} onChange={e => setJobForm({ ...jobForm, description: e.target.value })} required />
              <input className="w-full border rounded px-3 py-2" placeholder="Company" value={jobForm.company} onChange={e => setJobForm({ ...jobForm, company: e.target.value })} required />
              <input className="w-full border rounded px-3 py-2" placeholder="Location" value={jobForm.location} onChange={e => setJobForm({ ...jobForm, location: e.target.value })} required />
              <div className="flex gap-3">
                <select className="border rounded px-3 py-2 flex-1" value={jobForm.type} onChange={e => setJobForm({ ...jobForm, type: e.target.value })}>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="remote">Remote</option>
                  <option value="contract">Contract</option>
                </select>
                <input className="border rounded px-3 py-2 flex-1" placeholder="Salary (e.g. $80k)" value={jobForm.salary} onChange={e => setJobForm({ ...jobForm, salary: e.target.value })} />
              </div>
              <input className="w-full border rounded px-3 py-2" placeholder="Skills (comma separated)" value={jobForm.skills} onChange={e => setJobForm({ ...jobForm, skills: e.target.value })} />
              <button className="bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800 font-semibold">Post Job</button>
            </form>
          )}
          <div className="space-y-3">
            {data.length === 0 ? <p className="text-gray-500 text-sm">No jobs posted yet.</p> :
              data.map(job => (
                <div key={job._id} className="bg-white rounded-lg border p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-blue-700">{job.title}</p>
                    <p className="text-sm text-gray-500">{job.location} &bull; {job.type}</p>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/jobs/${job._id}/applicants`} className="text-sm text-blue-700 hover:underline">Applicants</Link>
                    <button onClick={() => handleDeleteJob(job._id)} className="text-sm text-red-500 hover:underline">Delete</button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Seeker: Saved Jobs */}
      {user?.role === 'seeker' && savedJobs.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-3">🔖 Saved Jobs</h3>
          <div className="space-y-3">
            {savedJobs.map(job => (
              <div key={job._id} className="bg-white rounded-lg border p-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-blue-700">{job.title}</p>
                  <p className="text-sm text-gray-500">{job.company} &bull; {job.location} &bull; {job.type}</p>
                </div>
                <div className="flex gap-3 items-center">
                  <Link to={`/jobs/${job._id}`} className="text-sm text-blue-700 hover:underline">View</Link>
                  <button onClick={async () => {
                    await API.delete(`/profile/saved/${job._id}`);
                    setSavedJobs(prev => prev.filter(j => j._id !== job._id));
                  }} className="text-sm text-red-500 hover:underline">Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Seeker: My Applications */}
      {user?.role === 'seeker' && (
        <div>
          <h3 className="font-semibold text-lg mb-3">My Applications</h3>
          <div className="space-y-3">
            {data.length === 0 ? <p className="text-gray-500 text-sm">No applications yet. <Link to="/jobs" className="text-blue-700 underline">Browse jobs</Link></p> :
              data.map(app => (
                <div key={app._id} className="bg-white rounded-lg border p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-blue-700">{app.job?.title}</p>
                    <p className="text-sm text-gray-500">{app.job?.company} &bull; {app.job?.location}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded font-medium ${
                    app.status === 'accepted' ? 'bg-green-100 text-green-700' :
                    app.status === 'rejected' ? 'bg-red-100 text-red-600' :
                    app.status === 'reviewed' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-600'}`}>{app.status}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
