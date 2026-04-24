import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../api';

export default function Applicants() {
  const { jobId } = useParams();
  const [applicants, setApplicants] = useState([]);
  const [job, setJob] = useState(null);

  useEffect(() => {
    API.get(`/jobs/${jobId}`).then(({ data }) => setJob(data)).catch(console.error);
    API.get(`/applications/job/${jobId}`).then(({ data }) => setApplicants(data)).catch(console.error);
  }, [jobId]);

  const updateStatus = async (appId, status) => {
    try {
      const { data } = await API.put(`/applications/${appId}`, { status });
      setApplicants(prev => prev.map(a => a._id === appId ? { ...a, status: data.status } : a));
    } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white pt-20">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold mb-2">Applicants</h2>
        {job && <p className="text-gray-400 mb-6">{job.title} &bull; {job.company}</p>}
        {applicants.length === 0 ? <p className="text-gray-500">No applicants yet.</p> : (
          <div className="space-y-4">
            {applicants.map(app => (
              <div key={app._id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-white">{app.applicant?.name}</p>
                    <p className="text-sm text-gray-400">{app.applicant?.email}</p>
                    {app.applicant?.skills?.length > 0 && (
                      <p className="text-sm text-gray-400 mt-1">Skills: {app.applicant.skills.join(', ')}</p>
                    )}
                    {app.applicant?.bio && <p className="text-sm text-gray-400 mt-1">{app.applicant.bio}</p>}
                    {app.applicant?.resume && (
                      <a href={`http://localhost:5000${app.applicant.resume}`} target="_blank" rel="noreferrer"
                        className="text-sm text-blue-400 underline mt-1 inline-block">
                        {app.applicant.resumeOriginalName || 'View Resume'}
                      </a>
                    )}
                    {app.coverLetter && <p className="text-sm text-gray-400 mt-2 italic">"{app.coverLetter}"</p>}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded font-medium ${
                    app.status === 'accepted' ? 'bg-green-900 text-green-400' :
                    app.status === 'rejected' ? 'bg-red-900 text-red-400' :
                    app.status === 'reviewed' ? 'bg-yellow-900 text-yellow-400' :
                    'bg-neutral-800 text-gray-400'}`}>{app.status}</span>
                </div>
                <div className="flex gap-2 mt-3">
                  {['reviewed', 'accepted', 'rejected'].map(s => (
                    <button key={s} onClick={() => updateStatus(app._id, s)}
                      className="text-xs border border-neutral-700 px-3 py-1 rounded hover:bg-neutral-800 capitalize text-gray-300">{s}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
