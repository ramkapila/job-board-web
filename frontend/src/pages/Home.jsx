import { Link } from 'react-router-dom';
import Dither from '../components/ui/Dither';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">

      {/* Hero with Dither background */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Dither canvas fills the background */}
        <div className="absolute inset-0 z-0">
          <Dither
            waveColor={[0.2, 0.4, 1.0]}
            waveSpeed={0.04}
            waveFrequency={3}
            waveAmplitude={0.3}
            colorNum={4}
            pixelSize={3}
            enableMouseInteraction={true}
            mouseRadius={1.2}
          />
        </div>

        {/* Hero content on top */}
        <div className="relative z-10 text-center px-6">
          <h1 className="text-6xl font-bold tracking-tight mb-4 text-white drop-shadow-lg">
            Find Your Dream Job
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-xl mx-auto">
            Connect employers and job seekers on one platform.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/jobs" className="bg-white text-black px-6 py-3 rounded-lg text-lg font-semibold hover:bg-gray-200 transition">
              Browse Jobs
            </Link>
            <Link to="/register" className="border border-white text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-white hover:text-black transition">
              Get Started
            </Link>
          </div>
        </div>
      </div>

      {/* Features section */}
      <div className="bg-neutral-950 py-20 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          {[
            ['🏢', 'Post Jobs', 'Employers post listings in minutes'],
            ['🔍', 'Search & Filter', 'Find jobs by title, location, or type'],
            ['📄', 'Easy Apply', 'Apply with your profile and cover letter'],
          ].map(([icon, title, desc]) => (
            <div key={title} className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 hover:border-blue-500 transition">
              <div className="text-4xl mb-3">{icon}</div>
              <h3 className="font-semibold text-lg text-white">{title}</h3>
              <p className="text-gray-400 text-sm mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
