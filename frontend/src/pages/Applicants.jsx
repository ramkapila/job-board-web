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
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h2 className="text-2xl font-bold text-blue-700 mb-2">Applicants</h2>
      {job && <p className="text-gray-500 mb-6">{job.title} &bull; {job.company}</p>}
      {applicants.length === 0 ? <p className="text-gray-500">No applicants yet.</p> : (
        <div className="space-y-4">
          {applicants.map(app => (
            <div key={app._id} className="bg-white rounded-xl border p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{app.applicant?.name}</p>
                  <p className="text-sm text-gray-500">{app.applicant?.email}</p>
                  {app.applicant?.skills?.length > 0 && (
                    <p className="text-sm text-gray-600 mt-1">Skills: {app.applicant.skills.join(', ')}</p>
                  )}
                  {app.applicant?.bio && <p className="text-sm text-gray-600 mt-1">{app.applicant.bio}</p>}
                  {app.coverLetter && <p className="text-sm text-gray-700 mt-2 italic">"{app.coverLetter}"</p>}
                </div>
                <span className={`text-xs px-2 py-1 rounded font-medium ${
                  app.status === 'accepted' ? 'bg-green-100 text-green-700' :
                  app.status === 'rejected' ? 'bg-red-100 text-red-600' :
                  app.status === 'reviewed' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-600'}`}>{app.status}</span>
              </div>
              <div className="flex gap-2 mt-3">
                {['reviewed', 'accepted', 'rejected'].map(s => (
                  <button key={s} onClick={() => updateStatus(app._id, s)}
                    className="text-xs border px-3 py-1 rounded hover:bg-gray-50 capitalize">{s}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
