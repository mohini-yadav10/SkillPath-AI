# Architecture: SkillPath AI

## 1. System Overview
SkillPath AI uses a microservices-inspired monorepo architecture consisting of a React Frontend, a Node.js Backend, and a Python FastAPI ML Service, all backed by MongoDB.

## 2. Directory Structure
```
skillpath-ai/
├── frontend/          # React, Vite, Tailwind CSS, TypeScript
├── backend/           # Node.js, Express, TypeScript, Mongoose
├── ml-service/        # Python, FastAPI, scikit-learn, joblib
├── shared/            # Shared TypeScript types
├── docs/              # Documentation
├── .agents/rules/     # AI Assistant rules and planning docs
├── docker-compose.yml
└── README.md
```

## 3. Component Details

### Frontend (Client Tier)
- **Framework:** React 18+ with TypeScript, built via Vite.
- **Routing:** React Router DOM.
- **State & Data Fetching:** React Context / Custom Hooks + Axios.
- **Styling:** Tailwind CSS + Framer Motion (animations) + Lucide React (icons).
- **Visualization:** Recharts for skill radars, progress lines, and gap bar charts.

### Backend (API Tier)
- **Framework:** Node.js with Express.js and TypeScript.
- **Authentication:** JWT stored securely, passwords hashed with bcrypt.
- **Validation:** Zod for runtime schema validation.
- **AI Integration:** Abstraction layer for Gemini API (with deterministic fallback templates).
- **Communication:** Serves REST APIs to Frontend; communicates internally with ML Service via HTTP.

### ML Service (Intelligence Tier)
- **Framework:** Python 3.10+ with FastAPI.
- **Data Science Stack:** pandas, numpy, scikit-learn, joblib.
- **NLP:** spaCy (for resume parsing/skill extraction).
- **Role:** Handles heavy computational ML tasks: mastery prediction, learning dropout probability, and content-based recommendation.

### Database (Data Tier)
- **Database:** MongoDB (via Mongoose in Node.js).
- **Usage:** Stores all persistent data: users, profiles, skills, roles, assessments, and learning paths.

## 4. Communication Flow
1. **User Action:** User interacts with the React frontend.
2. **API Request:** Frontend calls Node.js REST API.
3. **Data Processing:** Node.js processes the request, reading/writing to MongoDB.
4. **ML Inference (if needed):** Node.js forwards specific data (e.g., student performance metrics) to Python FastAPI for prediction.
5. **AI Explanation (if needed):** Node.js calls Gemini API for natural language insights.
6. **Response:** Node.js aggregates data, formats it, and returns JSON to the Frontend.

## 5. Deployment
- **Containerization:** Docker & docker-compose wrap the Frontend, Backend, ML Service, and MongoDB into a cohesive unit for easy deployment and local development.
