# Welcome to MedPal health assessment chatbot.

Engage with a smart, multi-lingual medical chatbot that understands your symptoms, provides tailored assessments, and connects you to the right healthcare professional.

<p align="center">
  An Open-Source AI Chatbot Built With Next.js and the AI SDK by Vercel.
</p>

## Model Providers

This project ships with Google `Gemini 1.5 Flash` as the default. However, with the [AI SDK](https://sdk.vercel.ai/docs), you can switch LLM providers to [OpenAI](https://openai.com), [Anthropic](https://anthropic.com), [Cohere](https://cohere.com/), and [many more](https://sdk.vercel.ai/providers/ai-sdk-providers) with just a few lines of code.

## Running locally

You will need to use the environment variables [defined in `.env.example`](.env.example) to run Next.js AI Chatbot. It's recommended you use [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables) for this, but a `.env` file is all that is necessary.

> Note: You should not commit your `.env` file or it will expose secrets that will allow others to control access to your various OpenAI and authentication provider accounts.

1. Install Vercel CLI: `npm i -g vercel`
2. Link local instance with Vercel and GitHub accounts (creates `.vercel` directory): `vercel link`
3. Download your environment variables: `vercel env pull`

### Frontend 
```bash
pnpm install
pnpm dev
```

### Backend 
```
pip install -r requirements.txt

python server.py
```

Your app should now be running on [localhost:3000](http://localhost:3000/).
