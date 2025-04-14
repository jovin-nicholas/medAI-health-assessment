from transformers import pipeline, AutoModel

# Load the model
model = AutoModel.from_pretrained("Zabihin/Symptom_to_Diagnosis", from_tf=True)
classifier = pipeline("text-classification", model=model, tokenizer="Zabihin/Symptom_to_Diagnosis")
# Example input text
input_text = "I've been having headaches and migraines, and I can't sleep. My whole body shakes and twitches. Sometimes I feel lightheaded."

# Get the predicted label
result = classifier(input_text)

# Print the predicted label
predicted_label = result[0]['label']
print("Predicted Label:", predicted_label)

# Predicted Label: drug reaction
