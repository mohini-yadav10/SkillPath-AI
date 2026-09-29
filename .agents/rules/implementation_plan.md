# Implementation Plan: SkillPath AI

## Phase 1: Project Scaffolding & Foundation
- Setup monorepo structure (frontend, backend, ml-service, shared).
- Initialize Node.js backend with Express, TypeScript, Zod, and Mongoose.
- Initialize React frontend with Vite, TypeScript, Tailwind CSS, and React Router.
- Initialize Python FastAPI service for ML.
- Configure Docker and docker-compose.
- Implement user authentication (JWT, bcrypt) and basic user models.
- Build basic UI shell (Navbar, Sidebar, routing skeleton).

## Phase 2: Core Data & Profiles
- Build Student Profile and Alumni Profile models.
- Build Company, JobRole, and Skill models.
- Implement API endpoints for CRUD operations on profiles, companies, roles, and skills.
- Frontend views for Profile creation, Target Company/Role selection.
- Seed demo data for companies, roles, and basic skills.

## Phase 3: Skill Gap Engine & Dashboard
- Implement Skill Gap calculation algorithm in backend.
- Create Career Readiness scoring logic.
- Build the Student Dashboard UI (charts, cards, radar charts).
- Connect Dashboard to Skill Gap API.

## Phase 4: ML Service & Predictions
- Set up `ml-service` with FastAPI and basic scikit-learn scaffolding.
- Create synthetic datasets for training if real data is absent.
- Build the training pipeline (data cleaning, feature engineering, model training).
- Implement Mastery Prediction and Performance Trend Prediction models.
- Connect backend Node API to ML FastAPI service for inference.

## Phase 5: Personalized Learning Path
- Build LearningResource and LearningPath models.
- Implement recommendation engine (rule-based fallback + ML based).
- Generate personalized learning paths based on skill gaps.
- UI for Learning Path timeline and Resource cards.

## Phase 6: Adaptive Assessments
- Build Question and Assessment models.
- Implement adaptive quiz logic (difficulty scaling based on performance).
- API to submit assessments and update student skill proficiency.
- UI for taking quizzes and viewing results.

## Phase 7: Resume Analysis
- Integrate PDF parsing (e.g., pdf-parse or similar).
- Extract skills using NLP (spaCy) or heuristics.
- Match extracted skills against database skills.
- UI for resume upload and extracted skill review.

## Phase 8: Alumni Matching & Mentorship
- Implement MentorshipRequest model.
- Build matching algorithm based on target company/role and skills.
- UI for Alumni directory, filtering, and request management (student & alumni views).

## Phase 9: Admin Dashboard & Explanable AI
- Build Admin UI to manage users, companies, roles, and skills.
- Integrate Gemini API for personalized explanations of skill gaps and learning strategies.
- Implement deterministic fallback for AI explanations.

## Phase 10: Testing, Security & Polish
- Write unit, integration, and API tests.
- Finalize security (Helmet, rate limiting, validation).
- Review and refine UI/UX (responsive design, animations).
- Update documentation and README.
- Final end-to-end verification.
