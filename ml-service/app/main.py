from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.schemas import (
    MasteryRequest, MasteryResponse, 
    PerformanceRequest, PerformanceResponse,
    RecommendationRequest, RecommendationResponse,
    ResourceRequest, ResourceResponse
)
from app.services.predictor import predictor_service

app = FastAPI(title="SkillPath ML Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "SkillPath ML Service"}

@app.get("/metadata")
def get_metadata():
    return {"metadata": predictor_service.metadata}

@app.post("/predict/mastery", response_model=MasteryResponse)
def predict_mastery(req: MasteryRequest):
    return predictor_service.predict_mastery(req)

@app.post("/predict/performance", response_model=PerformanceResponse)
def predict_performance(req: PerformanceRequest):
    return predictor_service.predict_performance(req)

@app.post("/recommend/next-skill", response_model=RecommendationResponse)
def recommend_next_skill(req: RecommendationRequest):
    return predictor_service.recommend_next_skills(req)

@app.post("/recommend/resources", response_model=ResourceResponse)
def recommend_resources(req: ResourceRequest):
    return predictor_service.recommend_resources(req)
