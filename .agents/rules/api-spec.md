# API Specification: SkillPath AI

## Node.js Backend (REST APIs)

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Authenticate and return JWT
- `POST /api/auth/logout` - Clear auth cookie/token
- `GET /api/auth/me` - Get current user profile

### Profile
- `GET /api/profile` - Get student/alumni profile
- `PUT /api/profile` - Update profile details
- `POST /api/profile/skills` - Add a skill to student
- `PUT /api/profile/skills/:id` - Update student skill proficiency
- `DELETE /api/profile/skills/:id` - Remove skill

### Resume
- `POST /api/resume/upload` - Upload resume PDF
- `POST /api/resume/:id/analyze` - Extract skills from uploaded resume

### Career & Targeting
- `GET /api/companies` - List all companies
- `GET /api/roles` - List roles (optionally by company)
- `POST /api/career/target` - Set target company and role
- `GET /api/career/target` - Get current target

### Analysis
- `POST /api/analysis/skill-gap` - Trigger skill gap calculation
- `GET /api/analysis/skill-gap/latest` - Fetch latest skill gap results
- `GET /api/analysis/readiness` - Get career readiness score and breakdown
- `POST /api/analysis/recalculate` - Force recalculation of readiness

### Learning
- `POST /api/learning/generate` - Generate personalized learning path
- `GET /api/learning/path` - Fetch current learning path
- `PUT /api/learning/progress/:id` - Mark resource as completed/progressed

### Assessments
- `GET /api/assessments` - List available assessments based on gaps
- `POST /api/assessments/start` - Start an adaptive assessment
- `POST /api/assessments/:id/submit` - Submit answers and calculate score
- `GET /api/assessments/:id/result` - View results and proficiency changes

### Alumni
- `GET /api/alumni` - Discover and filter alumni
- `POST /api/alumni/requests` - Send mentorship request
- `GET /api/alumni/requests` - View incoming/outgoing requests
- `PUT /api/alumni/requests/:id` - Accept/Reject request

---

## Python ML Service (FastAPI)

- `GET /health` - Service health check
- `POST /predict/mastery` - Predict likelihood to master a skill (Input: current proficiency, history; Output: probability)
- `POST /predict/completion` - Predict module completion likelihood
- `POST /predict/performance` - Predict future trend based on assessments
- `POST /recommend/next-skill` - Recommend best skill to learn next based on gaps and prerequisites
- `POST /resume/extract-skills` - NLP endpoint to extract skills from text
