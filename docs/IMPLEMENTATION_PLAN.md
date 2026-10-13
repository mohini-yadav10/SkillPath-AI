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
*Status: COMPLETED*
1.  **Career Twin (Data Layer):** Enhanced `StudentProfile` and analytical controllers (`/api/analysis/career-twin`) acting as a unified digital replica aggregating skills, projects, cognitive 4-factor matrix, learning velocity, and AI diagnosis.
2.  **Advanced Skill Graph (UI):** Built the interactive visual dependency tree component (`SkillGraph.tsx`) with level columns (Foundational, Intermediate, Advanced), prerequisite bezier curves, interactive status pills (Mastered, Developing, Gap, Locked), zoom/filter controls, and inspection drawer.
3.  **Skill Gap Engine:** Refined `SkillGapAnalysis` generation to calculate exact numeric gaps vs target role, assigning HIGH/MEDIUM/LOW priorities with individualized AI actionable recommendations and estimated hours to close.

## PHASE C: Adaptive AI Learning Engine
*Status: COMPLETED*
1.  **Adaptive Roadmap:** Tied the Skill Gap Engine directly to the Learning Path generation, ordering curriculum by prerequisite dependency and gap priority, generating targeted course, project, and challenge modules.
2.  **Feedback Loop:** Implemented adaptive feedback loop in `assessmentController.ts` via `injectRemediationItem()` — scores below 60% automatically inject a prioritized targeted reinforcement lab directly into the student's active roadmap.

## PHASE D: AI Learning Assistant (RAG) & Mentor
*Status: COMPLETED*
1.  **Document Upload & Extraction:** Implemented PDF/TXT syllabus & notes parsing with overlapping semantic chunking and metadata keyword extraction (`StudentDocument` model & `/api/mentor/documents`).
2.  **AI Mentor Chat UI:** Built full-fidelity, persistent AI Career Mentor chat (`AIMentor.tsx` & `/api/mentor/chat`) combining RAG document snippet citations with real-time Career Twin grounding.

## PHASE E: Advanced AI Interviewer & Assessment Engine + Source-Attributed Company Question Bank
*Status: COMPLETED*
1.  **Source & Provenance Registry:** Implemented `InterviewSource` model with SSRF protection, tracking source metadata, verification status (`VERIFIED`, `SOURCE_REVIEWED`, `UNVERIFIED`), reuse permissions, and content hashes. Sourced candidate-reported TCS MERN interview experiences with accurate attribution.
2.  **Extended Question Model & Canonical Taxonomy:** Upgraded `InterviewQuestion` with `sourceType`, `interviewRound`, `codeTestCase`, `selectionReason`, `rubricCriteria`, and canonical MERN skill taxonomy (`SkillTaxonomyService`) with Java vs JavaScript disambiguation.
3.  **Adaptive Interview Session Engine:** Implemented multi-mode interview sessions (`COMPANY_PRACTICE`, `SKILL_GAP_PRACTICE`, `ADAPTIVE_MOCK`, `TOPIC_PRACTICE`), deterministic rubric scoring, and dynamic follow-up question generation targeting detected answer weaknesses.
4.  **Feedback Loop & Career Twin Telemetry:** Synchronized interview performance into `StudentProfile.interviewStats`, recalibrated proficiencies, recalculated `SkillGapAnalysis` and `CareerTwin`, and injected prerequisite-ordered remediation labs into `LearningPath` with deduplication and clear recommendation explanations.
5.  **Question Bank & UI Upgrades:** Built `QuestionBankLibrary.tsx` with multi-dimensional filtering, upgraded `InterviewSetup.tsx`, `InterviewActive.tsx`, `InterviewResult.tsx`, and `InterviewDashboard.tsx` in strict Forest-Green/Sage/Gold design system.
6.  **Comprehensive Automated Tests:** 33 backend tests passing across 6 test suites, verifying provenance, ingestion dry-run, question library filtering, adaptive follow-ups, Career Twin updates, roadmap prerequisite ordering, and attempt ownership security. Frontend Vite production build passing cleanly.

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
