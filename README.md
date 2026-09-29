# SkillPath AI 🚀

An AI-Powered Personalized Learning & Career Skill-Gap Prediction Platform.

## 🌟 Overview
SkillPath AI bridges the gap between university education and industry requirements. By analyzing a student's current skill set, extracting skills via NLP from their resume, and evaluating them against real-time industry roles, the platform generates a dynamic, hyper-personalized learning curriculum and predicts career readiness.

## 🏗️ Architecture
This is a modern **MERN Stack + Python ML** Monorepo:
* **Frontend:** React, Vite, Tailwind CSS v4, Recharts, Lucide Icons.
* **Backend:** Node.js, Express, MongoDB (Mongoose), JWT Auth.
* **ML Service:** Python, FastAPI, Scikit-learn (Random Forest / Logistic Regression).

## ✨ Core Features
1. **Resume NLP Parser:** Upload a PDF resume, and the system automatically extracts and verifies technical skills using regex heuristics.
2. **AI Skill-Gap Analysis:** Select a "Target Role" and the engine will instantly calculate your missing skills, classifying them as Critical, Major, or Minor gaps.
3. **Personalized Learning Paths:** Dynamically generates a custom curriculum targeting your exact weaknesses.
4. **Adaptive Assessments:** Take quizzes that adjust difficulty based on your performance.
5. **Alumni Mentorship Network:** Browse and request 1-on-1 mentorship from university alumni currently working at your target companies.
6. **University Admin Dashboard:** An aggregated view for college administrators to see the overarching career readiness across the entire student batch.

---

## 🚀 Quick Start (How to Run Locally)

### Prerequisites
* Node.js v18+
* Python 3.9+
* MongoDB Atlas Cluster URI

### 1. Backend Setup
Open a terminal and run:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=super_secret_jwt_key
NODE_ENV=development
```

Start the backend server:
```bash
npm run dev
# OR: node node_modules/tsx/dist/cli.mjs watch src/server.ts
```

### 2. Frontend Setup
Open a **new** terminal and run:
```bash
cd frontend
npm install
```

Start the frontend UI:
```bash
npm run dev
# OR: node node_modules/vite/bin/vite.js
```
The application will be running at `http://localhost:5173`.

### 3. ML Service Setup (Optional)
```bash
cd ml-service
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

## 🧪 Demo Mode
To quickly test without creating manual profiles:
1. Ensure your MongoDB Atlas URI is configured.
2. Run the seeder script from the backend folder:
   ```bash
   node node_modules/tsx/dist/cli.mjs src/scripts/seedAaravDemo.ts
   ```
3. Go to the Login page (`http://localhost:5173/login`) and click the **"Load DEMO MODE (Student)"** button.
