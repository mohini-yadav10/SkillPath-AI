# ML Design: SkillPath AI

## Overview
The ML service powers the predictive and recommendation intelligence of the platform. It is built with Python, FastAPI, and scikit-learn.

## Models

### 1. Skill Mastery Prediction
- **Task:** Binary Classification / Probability Estimation.
- **Model:** Logistic Regression or Random Forest.
- **Features:** 
  - `current_proficiency`
  - `previous_assessment_scores`
  - `recent_trend` (slope of last N assessments)
  - `number_of_attempts`
  - `learning_time_spent`
  - `prerequisite_completion_ratio`
- **Output:** `mastery_probability` (0.0 to 1.0).

### 2. Next Best Skill Recommendation
- **Task:** Ranking / Content-Based Filtering.
- **Approach:**
  - Calculate `priority_score` for all missing skills.
  - Formula: `gap_size * role_importance * prerequisite_weight * predicted_mastery_likelihood`.
  - Sort skills by priority score.
- **Output:** Ordered list of skills with rationales.

### 3. Performance Trend Prediction
- **Task:** Regression (Time-series simplification).
- **Model:** Simple Linear Regression (or Gradient Boosting for complex non-linear patterns).
- **Features:** Historical assessment scores, time gaps between learning.
- **Output:** Expected score on next assessment.

### 4. Resume Skill Extraction (NLP)
- **Task:** Named Entity Recognition (NER) / Keyword Matching.
- **Model:** spaCy with custom rule-based Matcher / PhraseMatcher.
- **Dictionary:** Predefined set of tech and soft skills mapped to canonical names (e.g., "ReactJS" -> "React").

## Training Pipeline (`ml-service/training/`)
1. **Data Ingestion:** Load from `.csv` (synthetic datasets for demo).
2. **Preprocessing:** Handling missing values, standardizing numerical features, encoding categories.
3. **Training:** Scikit-learn `fit()` on training split.
4. **Evaluation:**
   - **Logistic Regression (Mastery):** Accuracy: 80%, F1 Score: 0.87
   - **Random Forest (Performance):** MAE: 2.66, R2: 0.96
5. **Persistence:** Export best models using `joblib` into `ml-service/app/models/`.

## Execution & Fallback
- The FastAPI service loads `.joblib` models into memory on startup.
- If models fail or inputs are outside expected bounds, the service gracefully falls back to sensible deterministic defaults (e.g., flat probability based on current proficiency).
