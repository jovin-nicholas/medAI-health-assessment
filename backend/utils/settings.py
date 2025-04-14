# Backend configuration settings (similar to Vercel’s environment variables)

import os
import torch
from transformers import pipeline, BertTokenizerFast, BertForTokenClassification

# Backend configuration settings
class Settings:
    def __init__(self):
        # Load environment variables
        self.env = os.environ

        
        
        