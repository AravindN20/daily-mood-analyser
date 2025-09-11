# ai_service.py
from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

# Create the FastAPI app
app = FastAPI()

# --- Load Model and Tokenizer (This happens only once, on startup) ---
model_id = "AravindN/sentiment-analysis-bert"
print(f"Loading model: {model_id}")
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForSequenceClassification.from_pretrained(model_id)
print("✅ Model and Tokenizer loaded successfully.")
# -------------------------------------------------------------------

# Define the structure of the incoming request data
class AnalyzeRequest(BaseModel):
    text: str

# Define the prediction endpoint
@app.post("/analyze")
def analyze_text(request: AnalyzeRequest):
    # Tokenize the input text
    inputs = tokenizer(request.text, return_tensors="pt", truncation=True, padding=True)
    
    # Get model prediction (logits)
    with torch.no_grad():
        logits = model(**inputs).logits
    
    # Get the predicted class ID (0, 1, or 2)
    predicted_class_id = logits.argmax().item()
    
    # Get the label name (e.g., "LABEL_0") from the model's config
    predicted_label = model.config.id2label[predicted_class_id]
    
    # Return the prediction as JSON
    return {"prediction": predicted_label}