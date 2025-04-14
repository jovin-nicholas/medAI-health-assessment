from transformers import pipeline, BertTokenizerFast, BertForTokenClassification
import torch

def get_medical_ner_predictions(input_sentence):
    """
    Perform medical NER on the input sentence and return the extracted entities with their scores.

    Args:
        test_sentence (str): The input sentence to analyze.

    Returns:
        list: A list of tuples containing the entity, its category, and the confidence score.
    """
    device = "cuda" if torch.cuda.is_available() else "cpu"

    # Load the model and tokenizer
    model_name = "AventIQ-AI/bert-medical-entity-extraction"
    model = BertForTokenClassification.from_pretrained(model_name).to(device)
    tokenizer = BertTokenizerFast.from_pretrained(model_name)

    # Create the NER pipeline
    ner_pipeline = pipeline("ner", model=model, tokenizer=tokenizer, device=0 if device == "cuda" else -1)

    # Perform NER
    ner_results = ner_pipeline(input_sentence)

    # Define label mapping
    label_map = {
        "LABEL_0": "O",  # Outside (not an entity)
        "LABEL_1": "Drug",
        "LABEL_2": "Disease",
        "LABEL_3": "Symptom",
        "LABEL_4": "Treatment"
    }

    # Merge tokens into entities
    def merge_tokens(ner_results):
        merged_entities = []
        current_word = ""
        current_label = ""
        current_score = 0
        count = 0

        for entity in ner_results:
            word = entity["word"]
            label = entity["entity"]  # Model's output (e.g., LABEL_1, LABEL_2)
            score = entity["score"]

            # Merge subwords
            if word.startswith("##"):
                current_word += word[2:]  # Remove '##' and append
                current_score += score
                count += 1
            else:
                if current_word:  # Store the previous merged word
                    mapped_label = label_map.get(current_label, "Unknown")
                    merged_entities.append((current_word, mapped_label, current_score / count))
                current_word = word
                current_label = label
                current_score = score
                count = 1

        # Add the last word
        if current_word:
            mapped_label = label_map.get(current_label, "Unknown")
            merged_entities.append((current_word, mapped_label, current_score / count))

        return merged_entities

    # Process and return the merged entities
    merged_entities = merge_tokens(ner_results)
    return [(word, label, score) for word, label, score in merged_entities if label != "O"]

# Example usage
if __name__ == "__main__":
    test_sentence = "An overdose of Ibuprofen can lead to severe gastric issues."
    predictions = get_medical_ner_predictions(test_sentence)
    print("\n🩺 Medical NER Predictions:")
    for word, label, score in predictions:
        print(f"🔹 Entity: {word} | Category: {label} | Score: {score:.4f}")