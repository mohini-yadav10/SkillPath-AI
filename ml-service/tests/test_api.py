from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_predict_mastery():
    response = client.post("/predict/mastery", json={
        "current_proficiency": 50.0,
        "previous_attempts": 2,
        "learning_time_mins": 120.0,
        "consistency_score": 0.8
    })
    assert response.status_code == 200
    data = response.json()
    assert "probability" in data
    assert 0.0 <= data["probability"] <= 1.0
    assert "model_used" in data

def test_predict_performance():
    response = client.post("/predict/performance", json={
        "score_1": 60.0,
        "score_2": 65.0,
        "score_3": 70.0,
        "days_since_last": 2
    })
    assert response.status_code == 200
    data = response.json()
    assert "next_score_prediction" in data
    assert "model_used" in data

def test_recommend_next_skill():
    response = client.post("/recommend/next-skill", json={
        "gaps": [
            {
                "skill_id": "test-skill-1",
                "skill_name": "Python",
                "current_proficiency": 20.0,
                "required_proficiency": 80.0,
                "importance": "CRITICAL"
            },
            {
                "skill_id": "test-skill-2",
                "skill_name": "Docker",
                "current_proficiency": 50.0,
                "required_proficiency": 60.0,
                "importance": "OPTIONAL"
            }
        ]
    })
    assert response.status_code == 200
    data = response.json()
    assert "recommendations" in data
    assert len(data["recommendations"]) == 2
    assert data["recommendations"][0]["skill_name"] == "Python" # Higher priority
