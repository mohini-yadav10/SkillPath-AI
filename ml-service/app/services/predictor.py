import os
import joblib
import json
import numpy as np
import pandas as pd
from app.schemas import (
    MasteryRequest, MasteryResponse, 
    PerformanceRequest, PerformanceResponse,
    RecommendationRequest, RecommendationResponse, RecommendedSkill,
    ResourceRequest, ResourceResponse, Resource
)

class PredictorService:
    def __init__(self):
        self.models_dir = os.path.join(os.path.dirname(__file__), '..', 'models')
        self.mastery_model = None
        self.performance_model = None
        self.metadata = {}
        self._load_models()

    def _load_models(self):
        try:
            metadata_path = os.path.join(self.models_dir, 'metadata.json')
            if os.path.exists(metadata_path):
                with open(metadata_path, 'r') as f:
                    self.metadata = json.load(f)
            
            mastery_path = os.path.join(self.models_dir, 'mastery_model.joblib')
            if os.path.exists(mastery_path):
                self.mastery_model = joblib.load(mastery_path)
                
            perf_path = os.path.join(self.models_dir, 'performance_model.joblib')
            if os.path.exists(perf_path):
                self.performance_model = joblib.load(perf_path)
                
        except Exception as e:
            print(f"Error loading models: {e}")

    def predict_mastery(self, req: MasteryRequest) -> MasteryResponse:
        if self.mastery_model:
            features = pd.DataFrame(
                [[req.current_proficiency, req.previous_attempts, req.learning_time_mins, req.consistency_score]],
                columns=['current_proficiency', 'previous_attempts', 'learning_time_mins', 'consistency_score']
            )
            prob = self.mastery_model.predict_proba(features)[0][1]
            return MasteryResponse(
                probability=round(float(prob), 4),
                model_used=self.metadata.get('mastery_model', {}).get('name', 'Logistic Regression'),
                is_fallback=False
            )
        else:
            # Deterministic Fallback
            prob = min(0.99, (req.current_proficiency / 100) + 0.1)
            return MasteryResponse(probability=round(prob, 4), model_used="Rule-based Fallback", is_fallback=True)

    def predict_performance(self, req: PerformanceRequest) -> PerformanceResponse:
        if self.performance_model:
            features = pd.DataFrame(
                [[req.score_1, req.score_2, req.score_3, req.days_since_last]],
                columns=['score_1', 'score_2', 'score_3', 'days_since_last']
            )
            pred = self.performance_model.predict(features)[0]
            return PerformanceResponse(
                next_score_prediction=round(float(np.clip(pred, 0, 100)), 2),
                model_used=self.metadata.get('performance_model', {}).get('name', 'Random Forest'),
                is_fallback=False
            )
        else:
            # Deterministic Fallback
            trend = (req.score_3 - req.score_1) / 2
            pred = req.score_3 + trend
            return PerformanceResponse(
                next_score_prediction=round(float(np.clip(pred, 0, 100)), 2),
                model_used="Rule-based Fallback",
                is_fallback=True
            )

    def recommend_next_skills(self, req: RecommendationRequest) -> RecommendationResponse:
        importance_weights = {'CRITICAL': 3.0, 'IMPORTANT': 2.0, 'MEDIUM': 1.0, 'OPTIONAL': 0.5}
        recommendations = []
        
        for gap in req.gaps:
            gap_size = max(0, gap.required_proficiency - gap.current_proficiency)
            if gap_size == 0:
                continue
                
            weight = importance_weights.get(gap.importance.upper(), 1.0)
            priority_score = gap_size * weight
            
            reason = f"Required by target role. Current proficiency is {gap.current_proficiency}%, needing {gap.required_proficiency}%."
            
            recommendations.append(RecommendedSkill(
                skill_id=gap.skill_id,
                skill_name=gap.skill_name,
                priority_score=round(priority_score, 2),
                reason=reason
            ))
            
        recommendations.sort(key=lambda x: x.priority_score, reverse=True)
        return RecommendationResponse(recommendations=recommendations)

    def recommend_resources(self, req: ResourceRequest) -> ResourceResponse:
        # Fallback dictionary-based recommendations
        level = "BEGINNER" if req.current_proficiency < 40 else "INTERMEDIATE" if req.current_proficiency < 75 else "ADVANCED"
        
        resources = [
            Resource(
                title=f"{req.skill_name} {level.capitalize()} Guide",
                url=f"https://example.com/learn/{req.skill_name.lower()}",
                type="COURSE",
                difficulty=level
            ),
            Resource(
                title=f"Practice {req.skill_name} Problems",
                url=f"https://example.com/practice/{req.skill_name.lower()}",
                type="PRACTICE",
                difficulty=level
            )
        ]
        return ResourceResponse(resources=resources)

predictor_service = PredictorService()
