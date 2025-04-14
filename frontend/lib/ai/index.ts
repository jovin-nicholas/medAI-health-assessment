import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
// import { groq } from '@ai-sdk/groq';

import { experimental_wrapLanguageModel as wrapLanguageModel } from 'ai';

import { customMiddleware } from './custom-middleware';

export const customModel = (apiIdentifier: string) => {
  return wrapLanguageModel({
    // model: openai(apiIdentifier),
    model: google(apiIdentifier),
    middleware: customMiddleware,
  });
};

export const imageGenerationModel = openai.image('dall-e-3');
