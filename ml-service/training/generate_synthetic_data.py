import pandas as pd
import numpy as np
from pathlib import Path

def generate_data():
    base_dir = Path(__file__).resolve().parent
    datasets_dir = base_dir / 'datasets'
    datasets_dir.mkdir(parents=True, exist_ok=True)
    
    np.random.seed(42)
    n_samples = 1000
    
    # 1. Mastery Data (Classification)
    current_proficiency = np.random.randint(20, 95, n_samples)
    previous_attempts = np.random.randint(1, 5, n_samples)
    learning_time_mins = np.random.randint(30, 500, n_samples)
    consistency_score = np.random.uniform(0.1, 1.0, n_samples)
    
    logit = -5.0 + 0.05 * current_proficiency + 0.01 * learning_time_mins + 2.0 * consistency_score
    prob = 1 / (1 + np.exp(-logit))
    will_master = (np.random.rand(n_samples) < prob).astype(int)
    
    mastery_df = pd.DataFrame({
        'current_proficiency': current_proficiency,
        'previous_attempts': previous_attempts,
        'learning_time_mins': learning_time_mins,
        'consistency_score': consistency_score,
        'will_master': will_master
    })
    
    mastery_path = datasets_dir / 'synthetic_mastery_data.csv'
    mastery_df.to_csv(mastery_path, index=False)
    print(f"Generated synthetic dataset: {mastery_path}")

    # 2. Performance Data (Regression)
    score_1 = np.random.randint(30, 80, n_samples)
    score_2 = score_1 + np.random.randint(-5, 10, n_samples)
    score_3 = score_2 + np.random.randint(-2, 12, n_samples)
    score_3 = np.clip(score_3, 0, 100)
    days_since_last = np.random.randint(1, 30, n_samples)
    
    trend = (score_3 - score_1) / 2
    next_score = score_3 + trend - (days_since_last * 0.2) + np.random.normal(0, 3, n_samples)
    next_score = np.clip(np.round(next_score), 0, 100)
    
    perf_df = pd.DataFrame({
        'score_1': score_1,
        'score_2': score_2,
        'score_3': score_3,
        'days_since_last': days_since_last,
        'next_score': next_score
    })
    
    perf_path = datasets_dir / 'synthetic_performance_data.csv'
    perf_df.to_csv(perf_path, index=False)
    print(f"Generated synthetic dataset: {perf_path}")

if __name__ == '__main__':
    generate_data()
