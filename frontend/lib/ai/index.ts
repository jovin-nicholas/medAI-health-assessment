import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
// import { groq } from '@ai-sdk/groq';

import { LanguageModel, experimental_wrapLanguageModel as wrapLanguageModel } from 'ai';

import { customMiddleware } from './custom-middleware';

export const customModel = (apiIdentifier: string) => {
  return wrapLanguageModel({
    model: google(apiIdentifier) as LanguageModel,
    middleware: customMiddleware,
  });
};

export const imageGenerationModel = openai.image('dall-e-3');
