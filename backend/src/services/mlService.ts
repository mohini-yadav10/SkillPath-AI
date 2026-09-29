export const getMLPrediction = async (endpoint: string, payload: any) => {
  try {
    const mlUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
    
    const response = await fetch(`${mlUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`ML Service Error: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('ML Service Error Fallback:', error);
    return null; // Return null so the controller can fallback
  }
};
