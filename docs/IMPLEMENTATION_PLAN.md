# SkillPath AI — Master Implementation Plan

**Goal:** Transform the existing SkillPath AI into an advanced, production-grade AI career intelligence and personalized learning platform.

## PHASE 0: Project Audit 
*Status: COMPLETED*
* **Frontend:** React/Vite with Tailwind. Existing pages verified (`Dashboard`, `CareerDiscovery`, `LearningPath`, `InterviewDashboard`, `AssessmentList`, `ResumeAnalysis`, `ProctoredAssessment`, etc.).
* **Backend:** Express/Node.js MVC architecture confirmed (`controllers/`, `routes/`, `models/`).
* **Database:** MongoDB models identified (`User`, `StudentProfile`, `SkillGapAnalysis`, `AssessmentAttempt`, `LearningPath`, etc.).
* **ML Service:** FastAPI app (`ml-service/app/main.py`) identified.
* **Architecture:** Modular, with existing AI functionalities for gap analysis, interviews, and proctoring.

## PHASE A: Global Design System & UI Consistency
*Status: COMPLETED*
* **Design Tokens:** Established cohesive design system (Primary Forest: `#123F36`, Sage: `#8FB8AA`, Warm Gold: `#E3B341`, Cream: `#F7F6F1`).
* **Sidebar:** Cleaned up `AppLayout.tsx`. Implemented dynamic routing, removed the large 'Student/Logout' block, and mapped only active existing routes (Dashboard, Target Role, Learning Path, Interviews, Assessments, Resume, Profile).
* **Top Navbar:** Standardized the top nav with breadcrumbs, search, notifications, and a sleek Profile/Logout dropdown.
* **Consistency:** Removed stray purple/blue components across all legacy pages.

## PHASE B: Career Twin & Skill Graph
*Status: NEXT UP*
1.  **Career Twin (Data Layer):** Enhance `StudentProfile` and analytical controllers to act as a unified data source (aggregating skills, gap progress, interview performance, projects).
2.  **Advanced Skill Graph (UI):** Build an interactive visual dependency graph on the frontend showing prereqs and gaps (e.g., JavaScript -> React -> Next.js).
3.  **Skill Gap Engine:** Refine `SkillGapAnalysis` generation to calculate precise numeric gaps vs target role, assigning HIGH/MEDIUM/LOW priorities with clear explanations.

## PHASE C: Adaptive AI Learning Engine
1.  **Adaptive Roadmap:** Tie the Skill Gap Engine directly to the Learning Path generation.
2.  **Feedback Loop:** Implement logic so that poor performance in an assessment automatically shifts learning priorities and injects targeted resources.

## PHASE D: AI Learning Assistant (RAG) & Mentor
1.  **Document Upload & Extraction:** Allow PDF syllabus/notes upload. Implement chunking and vector storage (likely expanding `ml-service`).
2.  **AI Mentor Chat UI:** Provide a persistent assistant that uses the unified Career Twin data to provide contextual answers.

## PHASE E: Advanced AI Interviewer & Assessment
1.  **Dynamic Interviews:** Upgrade existing interview controllers to analyze weaknesses mid-session and generate adaptive follow-up questions.
2.  **Assessment Data Feed:** Ensure assessment performance routes explicitly feed back into the Career Twin and Adaptive Roadmap engines.

## PHASE F: Career Readiness ML Engine
1.  **ML Pipeline:** Shift the readiness score from heuristic-based to feature-based using the Python ML service.
2.  **Explainability:** Surface the positive/negative factors contributing to the score in the UI.

## PHASE G: Resume Analyzer & Project Recommendation
1.  **Resume Comparison:** Expand `ResumeAnalysis.tsx` to explicitly map extracted skills against the active Target Role.
2.  **Project Engine:** Recommend specific full-stack/portfolio projects based on the detected skill gaps.

## PHASE H: Simulator, Gamification & Analytics
1.  **What-if Career Simulator:** Allow users to simulate hypothetical skill improvements and see projected readiness.
2.  **Gamification:** Add clean, professional progress streaks and milestones.
3.  **Analytics Dashboard:** Implement historical performance charts.

## PHASE I: Final Polish
* Security, performance (lazy loading/caching), extensive testing, and final responsive UI polish.
