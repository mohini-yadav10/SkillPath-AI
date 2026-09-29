from pydantic import BaseModel, Field
from typing import List, Dict, Optional

class MasteryRequest(BaseModel):
    current_proficiency: float = Field(..., ge=0, le=100)
    previous_attempts: int = Field(default=0, ge=0)
    learning_time_mins: float = Field(default=0.0, ge=0.0)
    consistency_score: float = Field(default=0.5, ge=0.0, le=1.0)

class MasteryResponse(BaseModel):
    probability: float
    model_used: str
    is_fallback: bool

class PerformanceRequest(BaseModel):
    score_1: float
    score_2: float
    score_3: float
    days_since_last: int = Field(default=1)

class PerformanceResponse(BaseModel):
    next_score_prediction: float
    model_used: str
    is_fallback: bool

class GapSkill(BaseModel):
    skill_id: str
    skill_name: str
    current_proficiency: float
    required_proficiency: float
    importance: str

class RecommendationRequest(BaseModel):
    gaps: List[GapSkill]

class RecommendedSkill(BaseModel):
    skill_id: str
    skill_name: str
    priority_score: float
    reason: str

class RecommendationResponse(BaseModel):
    recommendations: List[RecommendedSkill]

class ResourceRequest(BaseModel):
    skill_name: str
    current_proficiency: float

class Resource(BaseModel):
    title: str
    url: str
    type: str
    difficulty: str

class ResourceResponse(BaseModel):
    resources: List[Resource]
