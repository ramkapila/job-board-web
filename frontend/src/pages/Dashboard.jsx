import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [profile, setProfile] = useState({});
  const [analytics, setAnalytics] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [jobForm, setJobForm] = useState({ title: '', description: '', company: user?.company || '', location: '', type: 'full-time', salary: '', skills: '', expiryDays: 30 });
  const [showJobForm, setShowJobForm] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (user?.role === 'employer') {
      API.get('/jobs/employer/myjobs').then(({ data }) => setData(data)).catch(console.error);
      API.get('/analytics').then(({ data }) => setAnalytics(data)).catch(console.error);
    } else {
      API.get('/applications/my').then(({ data }) => setData(data)).catch(console.error);
      API.get('/profile/saved').then(({ data }) => setSavedJobs(data)).catch(console.error);
    }
    API.get('/profile').then(({ data }) => setProfile(data)).catch(console.error);
  }, [user]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      await API.put('/profile', profile);
      setEditMode(false);
      setMsg('Profile updated!');
    } catch { setMsg('Failed to update profile'); }
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!resumeFile) return;
    const formData = new FormData();
    formData.append('resume', resumeFile);
    try {
      const { data } = await API.post('/profile/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfile(prev => ({ ...prev, resume: data.resume, resumeOriginalName: data.resumeOriginalName }));
      setResumeFile(null);
      setMsg('Resume uploaded!');
    } catch (err) { setMsg(err.response?.data?.message || 'Upload failed'); }
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + Number(jobForm.expiryDays));
      const payload = {
        ...jobForm,
        skills: jobForm.skills.split(',').map(s => s.trim()).filter(Boolean),
        expiresAt
      };
      const { data: newJob } = await API.post('/jobs', payload);
      setData(prev => [newJob, ...prev]);
      setShowJobForm(false);
      setJobForm({ title: '', description: '', company: user?.company || '', location: '', type: 'full-time', salary: '', skills: '', expiryDays: 30 });
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
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="max-w-4xl mx-auto px-6 py-8 pt-20">
        <h2 className="text-2xl font-bold text-white mb-6">Dashboard — {user?.role === 'employer' ? 'Employer' : 'Job Seeker'}</h2>
        {msg && <p className="mb-4 text-sm text-green-400">{msg}</p>}

        {/* Analytics — Employer only */}
        {user?.role === 'employer' && analytics && (
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-3">📊 Analytics</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {[
                ['Total Jobs', analytics.totalJobs],
                ['Active Jobs', analytics.activeJobs],
                ['Total Applicants', analytics.totalApplications],
                ['Accepted', analytics.accepted],
              ].map(([label, value]) => (
                <div key={label} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-blue-400">{value}</p>
                  <p className="text-xs text-gray-400 mt-1">{label}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                ['Pending', analytics.pending, 'text-yellow-400'],
                ['Reviewed', analytics.reviewed, 'text-blue-400'],
                ['Rejected', analytics.rejected, 'text-red-400'],
              ].map(([label, value, color]) => (
                <div key={label} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-center">
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-gray-400 mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Profile Section */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-lg">My Profile</h3>
            <button onClick={() => setEditMode(!editMode)} className="text-blue-400 text-sm hover:underline">{editMode ? 'Cancel' : 'Edit'}</button>
          </div>
          {editMode ? (
            <form onSubmit={handleProfileSave} className="space-y-3">
              <input className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white" placeholder="Name" value={profile.name || ''} onChange={e => setProfile({ ...profile, name: e.target.value })} />
              {user?.role === 'seeker' && (
                <>
                  <textarea className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white" placeholder="Bio" value={profile.bio || ''} onChange={e => setProfile({ ...profile, bio: e.target.value })} />
                  <input className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white" placeholder="Skills (comma separated)" value={profile.skills?.join(', ') || ''} onChange={e => setProfile({ ...profile, skills: e.target.value.split(',').map(s => s.trim()) })} />
                </>
              )}
              {user?.role === 'employer' && (
                <>
                  <input className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white" placeholder="Company" value={profile.company || ''} onChange={e => setProfile({ ...profile, company: e.target.value })} />
                  <input className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white" placeholder="Website" value={profile.website || ''} onChange={e => setProfile({ ...profile, website: e.target.value })} />
                </>
              )}
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save</button>
            </form>
          ) : (
            <div className="text-gray-300 space-y-1 text-sm">
              <p><span className="text-gray-500">Name:</span> {profile.name}</p>
              <p><span className="text-gray-500">Email:</span> {profile.email}</p>
              {user?.role === 'seeker' && <>
                {profile.bio && <p><span className="text-gray-500">Bio:</span> {profile.bio}</p>}
                {profile.skills?.length > 0 && <p><span className="text-gray-500">Skills:</span> {profile.skills.join(', ')}</p>}
                {profile.resume && <p><span className="text-gray-500">Resume:</span> <a href={`http://localhost:5000${profile.resume}`} className="text-blue-400 underline" target="_blank" rel="noreferrer">{profile.resumeOriginalName || 'View PDF'}</a></p>}
              </>}
              {user?.role === 'employer' && <>
                {profile.company && <p><span className="text-gray-500">Company:</span> {profile.company}</p>}
                {profile.website && <p><span className="text-gray-500">Website:</span> <a href={profile.website} className="text-blue-400 underline" target="_blank" rel="noreferrer">{profile.website}</a></p>}
              </>}
            </div>
          )}

          {/* Resume Upload — Seeker only */}
          {user?.role === 'seeker' && (
            <form onSubmit={handleResumeUpload} className="mt-4 flex gap-3 items-center">
              <input type="file" accept=".pdf" onChange={e => setResumeFile(e.target.files[0])}
                className="text-sm text-gray-400 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-blue-600 file:text-white file:cursor-pointer" />
              <button className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700">Upload PDF</button>
            </form>
          )}
        </div>

        {/* Employer: Post Jobs */}
        {user?.role === 'employer' && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-lg">My Job Listings</h3>
              <button onClick={() => setShowJobForm(!showJobForm)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">
                {showJobForm ? 'Cancel' : '+ Post Job'}
              </button>
            </div>
            {showJobForm && (
              <form onSubmit={handlePostJob} className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-4 space-y-3">
                <input className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white" placeholder="Job Title" value={jobForm.title} onChange={e => setJobForm({ ...jobForm, title: e.target.value })} required />
                <textarea className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white h-28" placeholder="Job Description" value={jobForm.description} onChange={e => setJobForm({ ...jobForm, description: e.target.value })} required />
                <input className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white" placeholder="Company" value={jobForm.company} onChange={e => setJobForm({ ...jobForm, company: e.target.value })} required />
                <input className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white" placeholder="Location" value={jobForm.location} onChange={e => setJobForm({ ...jobForm, location: e.target.value })} required />
                <div className="flex gap-3">
                  <select className="bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white flex-1" value={jobForm.type} onChange={e => setJobForm({ ...jobForm, type: e.target.value })}>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="remote">Remote</option>
                    <option value="contract">Contract</option>
                  </select>
                  <input className="bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white flex-1" placeholder="Salary (e.g. $80k)" value={jobForm.salary} onChange={e => setJobForm({ ...jobForm, salary: e.target.value })} />
                </div>
                <input className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white" placeholder="Skills (comma separated)" value={jobForm.skills} onChange={e => setJobForm({ ...jobForm, skills: e.target.value })} />
                <div className="flex items-center gap-3">
                  <label className="text-sm text-gray-400">Expires in</label>
                  <select className="bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white" value={jobForm.expiryDays} onChange={e => setJobForm({ ...jobForm, expiryDays: e.target.value })}>
                    <option value={7}>7 days</option>
                    <option value={14}>14 days</option>
                    <option value={30}>30 days</option>
                    <option value={60}>60 days</option>
                  </select>
                </div>
                <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-semibold">Post Job</button>
              </form>
            )}
            <div className="space-y-3">
              {data.length === 0 ? <p className="text-gray-500 text-sm">No jobs posted yet.</p> :
                data.map(job => (
                  <div key={job._id} className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-blue-400">{job.title}</p>
                      <p className="text-sm text-gray-500">{job.location} &bull; {job.type}</p>
                      <p className="text-xs text-gray-600 mt-1">Expires: {new Date(job.expiresAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-3">
                      <Link to={`/jobs/${job._id}/applicants`} className="text-sm text-blue-400 hover:underline">Applicants</Link>
                      <button onClick={() => handleDeleteJob(job._id)} className="text-sm text-red-400 hover:underline">Delete</button>
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
                <div key={job._id} className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-blue-400">{job.title}</p>
                    <p className="text-sm text-gray-500">{job.company} &bull; {job.location}</p>
                  </div>
                  <div className="flex gap-3 items-center">
                    <Link to={`/jobs/${job._id}`} className="text-sm text-blue-400 hover:underline">View</Link>
                    <button onClick={async () => {
                      await API.delete(`/profile/saved/${job._id}`);
                      setSavedJobs(prev => prev.filter(j => j._id !== job._id));
                    }} className="text-sm text-red-400 hover:underline">Remove</button>
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
              {data.length === 0 ? <p className="text-gray-500 text-sm">No applications yet. <Link to="/jobs" className="text-blue-400 underline">Browse jobs</Link></p> :
                data.map(app => (
                  <div key={app._id} className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-blue-400">{app.job?.title}</p>
                      <p className="text-sm text-gray-500">{app.job?.company} &bull; {app.job?.location}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded font-medium ${
                      app.status === 'accepted' ? 'bg-green-900 text-green-400' :
                      app.status === 'rejected' ? 'bg-red-900 text-red-400' :
                      app.status === 'reviewed' ? 'bg-yellow-900 text-yellow-400' :
                      'bg-neutral-800 text-gray-400'}`}>{app.status}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
