from transformers import AutoModelForSequenceClassification, AutoTokenizer
import torch
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

model = AutoModelForSequenceClassification.from_pretrained("AventIQ-AI/distilbert-disease-specialist-recommendation")
tokenizer = AutoTokenizer.from_pretrained("AventIQ-AI/distilbert-disease-specialist-recommendation")

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

def encode_text(text):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding="max_length").to(device)
    with torch.no_grad():
        outputs = model(**inputs, output_hidden_states=True)
    embedding = outputs.hidden_states[-1].mean(dim=1).squeeze(0).cpu().numpy()
    return embedding

candidate_labels = ["Cardiology", "Neurology", "Orthopedics", "Dermatology"]
candidate_embeddings = np.array([encode_text(label) for label in candidate_labels])

def zero_shot_classification_batch(texts):
    text_embeddings = np.array([encode_text(text) for text in texts])
    similarities = cosine_similarity(text_embeddings, candidate_embeddings)
    ranked_results = [
        sorted(zip(candidate_labels, similarity), key=lambda x: x[1], reverse=True)
        for similarity in similarities
    ]
    return ranked_results

# print(zero_shot_classification_batch(["Suffering from High Fever and body Itching"]))
# EXPECTED OUTPUT : [[('Dermatology', 0.55948263), ('Orthopedics', 0.29858905), ('Cardiology', 0.25098807), ('Neurology', 0.17517035)]]
