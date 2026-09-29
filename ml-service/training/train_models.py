import pandas as pd
import numpy as np
import json
import joblib
from pathlib import Path
from datetime import datetime
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

def train():
    # Robust Pathing
    base_dir = Path(__file__).resolve().parent
    datasets_dir = base_dir / 'datasets'
    models_dir = base_dir.parent / 'app' / 'models'
    
    models_dir.mkdir(parents=True, exist_ok=True)
    metadata = {}
    
    print("WARNING: Training on explicitly labeled SYNTHETIC demo data.")
    print("These evaluation metrics apply ONLY to this prototype dataset.\n")
    
    # ---------------------------------------------------------
    # 1. Mastery Prediction Model (Logistic Regression)
    # ---------------------------------------------------------
    print("Training Mastery Prediction Model...")
    mastery_df = pd.read_csv(datasets_dir / 'synthetic_mastery_data.csv')
    X_m = mastery_df[['current_proficiency', 'previous_attempts', 'learning_time_mins', 'consistency_score']]
    y_m = mastery_df['will_master']
    
    # Strict Train/Test Split to prevent data leakage
    X_train_m, X_test_m, y_train_m, y_test_m = train_test_split(X_m, y_m, test_size=0.2, random_state=42)
    
    clf = LogisticRegression()
    clf.fit(X_train_m, y_train_m)
    
    # Evaluation
    y_pred_m = clf.predict(X_test_m)
    metrics_m = {
        'accuracy': round(float(accuracy_score(y_test_m, y_pred_m)), 4),
        'precision': round(float(precision_score(y_test_m, y_pred_m)), 4),
        'recall': round(float(recall_score(y_test_m, y_pred_m)), 4),
        'f1_score': round(float(f1_score(y_test_m, y_pred_m)), 4)
    }
    
    mastery_model_path = models_dir / 'mastery_model.joblib'
    joblib.dump(clf, mastery_model_path)
    metadata['mastery_model'] = {
        'name': 'Logistic Regression (Skill Mastery)',
        'version': '1.0.0',
        'training_date': datetime.now().isoformat(),
        'features': list(X_m.columns),
        'evaluation_metrics': metrics_m,
        'dataset_type': 'synthetic_prototype_only'
    }
    
    print(f"Mastery Model Metrics: {metrics_m}\n")
    
    # ---------------------------------------------------------
    # 2. Performance Trend Model (Random Forest)
    # ---------------------------------------------------------
    print("Training Performance Trend Model...")
    perf_df = pd.read_csv(datasets_dir / 'synthetic_performance_data.csv')
    X_p = perf_df[['score_1', 'score_2', 'score_3', 'days_since_last']]
    y_p = perf_df['next_score']
    
    # Strict Train/Test Split
    X_train_p, X_test_p, y_train_p, y_test_p = train_test_split(X_p, y_p, test_size=0.2, random_state=42)
    
    regr = RandomForestRegressor(n_estimators=50, random_state=42)
    regr.fit(X_train_p, y_train_p)
    
    # Evaluation
    y_pred_p = regr.predict(X_test_p)
    metrics_p = {
        'mae': round(float(mean_absolute_error(y_test_p, y_pred_p)), 4),
        'rmse': round(float(np.sqrt(mean_squared_error(y_test_p, y_pred_p))), 4),
        'r2': round(float(r2_score(y_test_p, y_pred_p)), 4)
    }
    
    perf_model_path = models_dir / 'performance_model.joblib'
    joblib.dump(regr, perf_model_path)
    metadata['performance_model'] = {
        'name': 'Random Forest Regressor (Performance Trend)',
        'version': '1.0.0',
        'training_date': datetime.now().isoformat(),
        'features': list(X_p.columns),
        'evaluation_metrics': metrics_p,
        'dataset_type': 'synthetic_prototype_only'
    }
    
    print(f"Performance Model Metrics: {metrics_p}\n")
    
    # ---------------------------------------------------------
    # Save Metadata
    # ---------------------------------------------------------
    metadata_path = models_dir / 'metadata.json'
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=4)
        
    print(f"Models and metadata successfully saved to {models_dir}")

    # ---------------------------------------------------------
    # 3. Model Loading & Prediction Verification Test
    # ---------------------------------------------------------
    print("\n--- Verifying Model Reload and Inference ---")
    
    if not mastery_model_path.exists():
        raise FileNotFoundError(f"Mastery model file not found at {mastery_model_path}")
        
    if not perf_model_path.exists():
        raise FileNotFoundError(f"Performance model file not found at {perf_model_path}")

    try:
        loaded_clf = joblib.load(mastery_model_path)
        sample_mastery_req = pd.DataFrame(
            [[50.0, 2, 120.0, 0.8]], 
            columns=['current_proficiency', 'previous_attempts', 'learning_time_mins', 'consistency_score']
        )
        prob = loaded_clf.predict_proba(sample_mastery_req)[0][1]
        print(f"Verified Mastery Model reload. Test Prob: {prob:.4f}")
        
        loaded_regr = joblib.load(perf_model_path)
        sample_perf_req = pd.DataFrame(
            [[60.0, 65.0, 70.0, 2]], 
            columns=['score_1', 'score_2', 'score_3', 'days_since_last']
        )
        pred = loaded_regr.predict(sample_perf_req)[0]
        print(f"Verified Performance Model reload. Test Pred: {pred:.2f}")
        
        print("Model verification successful. Pipeline robust.")
    except Exception as e:
        print(f"FAILED model verification test: {e}")
        raise

if __name__ == '__main__':
    train()
