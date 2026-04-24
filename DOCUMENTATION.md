# Job Board Application — Project Documentation Report

## 1. Project Overview

**Project Title:** Job Board Application  
**Developer:** Ram Kapilavai  
**Tech Stack:** React, Node.js, Express, MongoDB Atlas, JWT  
**GitHub Repository:** https://github.com/ramkapila/job-board-web  

A full-stack job board platform where employers can post job listings and job seekers can create profiles, search for jobs, apply, and save listings.

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (Mongoose ODM) |
| Authentication | JWT (JSON Web Tokens) |
| File Upload | Multer (PDF resume upload) |
| 3D/Shader | Three.js, @react-three/fiber |
| Security | express-rate-limit, bcryptjs |
| Scheduling | node-cron |

---

## 3. Project Structure

```
job-board-app/
├── backend/
│   ├── models/
│   │   ├── User.js           # User schema (seeker, employer, admin)
│   │   ├── Job.js            # Job schema with expiry
│   │   └── Application.js    # Application schema
│   ├── routes/
│   │   ├── auth.js           # Register, Login
│   │   ├── jobs.js           # CRUD for jobs
│   │   ├── applications.js   # Apply, track, update status
│   │   ├── profile.js        # Profile, resume upload, saved jobs
│   │   └── analytics.js      # Employer analytics
│   ├── middleware/
│   │   ├── auth.js           # JWT verification middleware
│   │   └── upload.js         # Multer PDF upload middleware
│   ├── uploads/              # Uploaded resume PDFs
│   ├── server.js             # Express app entry point
│   ├── makeAdmin.js          # Script to set admin role
│   ├── resetDB.js            # Script to reset database
│   └── .env.example          # Environment variable template
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx         # Navigation bar
    │   │   ├── JobCard.jsx        # Job listing card
    │   │   └── ui/
    │   │       ├── Dither.jsx     # WebGL dither shader
    │   │       └── Dither.css
    │   ├── context/
    │   │   └── AuthContext.jsx    # Global auth state
    │   ├── pages/
    │   │   ├── Home.jsx           # Landing page with dither hero
    │   │   ├── Login.jsx          # Login page
    │   │   ├── Register.jsx       # Register page
    │   │   ├── Jobs.jsx           # Browse & search jobs
    │   │   ├── JobDetail.jsx      # Job detail & apply
    │   │   ├── Dashboard.jsx      # User dashboard
    │   │   └── Applicants.jsx     # Employer applicant management
    │   ├── api.js                 # Axios instance with JWT interceptor
    │   └── main.jsx               # React entry point
    └── package.json
```

---

## 4. Features

### Authentication
- JWT-based authentication with 7-day token expiry
- Password hashing with bcryptjs (salt rounds: 10)
- Role-based access control: `seeker`, `employer`, `admin`
- Rate limiting on auth routes: 20 requests per 15 minutes

### Employer Features
- Register with company name
- Post job listings with title, description, location, type, salary, skills
- Set job expiry (7, 14, 30, or 60 days)
- View and manage own job listings
- View all applicants per job with cover letters and resumes
- Update application status (pending → reviewed → accepted/rejected)
- Analytics dashboard: total jobs, active/expired, total applicants, accepted/rejected/pending counts

### Job Seeker Features
- Register and build profile (bio, skills, resume)
- Upload PDF resume (max 5MB)
- Browse and search jobs by title, skills, location, type
- View full job details
- Apply with optional cover letter
- Track application statuses
- Bookmark/save jobs
- View saved jobs in dashboard

### Admin Features
- Admin role assigned via `makeAdmin.js` script
- Role stored in MongoDB, verified via JWT

### Job Expiry
- Jobs have an `expiresAt` date set at creation
- `node-cron` runs daily at midnight to mark expired jobs
- Expired jobs are hidden from public listings

### UI/UX
- Animated WebGL dither shader hero on home page (Three.js)
- Full dark mode across all pages
- Responsive layout with Tailwind CSS
- Frosted glass navbar with backdrop blur

---

## 5. Database Schema

### User
```json
{
  "name": "String",
  "email": "String (unique)",
  "password": "String (hashed)",
  "role": "seeker | employer | admin",
  "skills": ["String"],
  "bio": "String",
  "resume": "String (file path)",
  "resumeOriginalName": "String",
  "company": "String",
  "website": "String",
  "savedJobs": ["ObjectId (ref: Job)"]
}
```

### Job
```json
{
  "title": "String",
  "description": "String",
  "company": "String",
  "location": "String",
  "type": "full-time | part-time | remote | contract",
  "salary": "String",
  "skills": ["String"],
  "employer": "ObjectId (ref: User)",
  "expiresAt": "Date",
  "expired": "Boolean"
}
```

### Application
```json
{
  "job": "ObjectId (ref: Job)",
  "applicant": "ObjectId (ref: User)",
  "coverLetter": "String",
  "status": "pending | reviewed | accepted | rejected"
}
```

---

## 6. API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |

### Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/jobs | Get all active jobs (with search/filter) |
| GET | /api/jobs/:id | Get single job |
| POST | /api/jobs | Post new job (employer) |
| PUT | /api/jobs/:id | Update job (employer) |
| DELETE | /api/jobs/:id | Delete job (employer) |
| GET | /api/jobs/employer/myjobs | Get employer's own jobs |

### Applications
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/applications | Apply for a job (seeker) |
| GET | /api/applications/my | Get seeker's applications |
| GET | /api/applications/job/:jobId | Get applicants for a job (employer) |
| PUT | /api/applications/:id | Update application status (employer) |

### Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/profile | Get own profile |
| PUT | /api/profile | Update profile |
| POST | /api/profile/resume | Upload PDF resume |
| POST | /api/profile/saved/:jobId | Save a job |
| DELETE | /api/profile/saved/:jobId | Unsave a job |
| GET | /api/profile/saved | Get saved jobs |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/analytics | Get employer analytics |

---

## 7. Security Measures

- Passwords hashed with bcryptjs before storing
- JWT tokens verified on every protected route
- Rate limiting on auth routes (20 req / 15 min)
- `.env` file excluded from GitHub via `.gitignore`
- File uploads restricted to PDF only, max 5MB
- Role-based route protection (employer/seeker/admin)

---

## 8. Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB Atlas account

### Backend Setup
```bash
cd backend
npm install
# Create .env file with your credentials (see .env.example)
node server.js
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables (backend/.env)
```
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
ADMIN_EMAIL=your_admin_email@example.com
```

### Make yourself Admin
```bash
node makeAdmin.js
```

---

## 9. Screenshots

> Add screenshots of the following pages:
> - Home page (dither shader hero)
> - Browse Jobs page
> - Job Detail & Apply page
> - Employer Dashboard (analytics + job listings)
> - Seeker Dashboard (applications + saved jobs)
> - Applicants management page

---

## 10. Future Improvements

- Email notifications for application status changes
- Public shareable seeker profile page
- Job alerts based on seeker skills
- Pagination on job listings
- Deploy to Render (backend) + Vercel (frontend)

---

*Documentation prepared for task submission.*
