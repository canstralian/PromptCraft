
# PromptCraft 🚀

An AI-powered prompt management system built with React, Express, and TypeScript. PromptCraft helps you create, organize, and enhance AI prompts using Gemini and OpenAI.

## Features

- 🎨 Modern, responsive UI with Tailwind CSS
- 🤖 AI-powered prompt enhancement
- 📁 Organized prompt categories
- 🔄 Real-time updates with React Query
- 🎯 TypeScript for type safety
- 🛡️ Express backend with session management

## Getting Started

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://0.0.0.0:5000`

## Project Structure

```
├── client/          # React frontend
├── server/          # Express backend
└── shared/          # Shared TypeScript types
```

## API Routes

- `GET /api/prompts` - Fetch all prompts
- `GET /api/categories` - Fetch all categories
- `POST /api/prompts` - Create new prompt
- `POST /api/ai/enhance` - Get AI suggestions

## Tech Stack

- Frontend: React, TailwindCSS, Radix UI
- Backend: Express, TypeScript
- Database: PostgreSQL with Drizzle ORM
- AI: Google Gemini, OpenAI

## License

MIT
