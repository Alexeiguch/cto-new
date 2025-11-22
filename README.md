# Real Estate Workflow Platform

A modern, full-stack platform for real estate document processing and workflow automation. Built with Next.js 13+ App Router, TypeScript, and Tailwind CSS.

## 🚀 Stack Overview

### Frontend
- **Next.js 16.0.3** - React framework with App Router for optimal performance
- **React 19.2.0** - Latest React with concurrent features
- **TypeScript 5** - Full type safety across the codebase
- **Tailwind CSS 4** - Utility-first CSS framework for responsive design

### Backend & Services
- **Prisma 6.19.0** - Type-safe database ORM with migrations
- **OpenAI SDK** - Integration with OpenAI API for document understanding
- **PDF Processing**
  - `pdf-parse` - PDF text extraction
  - `pdfjs-dist` - Advanced PDF manipulation
- **Sharp** - High-performance image processing
- **ESLint** - Code quality enforcement with Next.js configuration

## 📋 Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+
- PostgreSQL 12+ (for Prisma database)

## 🛠️ Local Development Setup

### 1. Clone and Install Dependencies

```bash
# Install dependencies
npm install
```

### 2. Environment Configuration

```bash
# Copy the example environment file
cp .env.example .env.local
```

Then edit `.env.local` with your actual values:

```env
# API Keys
OPENAI_API_KEY=sk_xxxx...

# Database (PostgreSQL recommended)
DATABASE_URL=postgresql://user:password@localhost:5432/real_estate_db

# Optional: Cloud Storage
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET=your_bucket
AWS_REGION=us-east-1
```

### 3. Database Setup

```bash
# Install Prisma CLI (already in devDependencies)
npx prisma generate

# Create your database and run migrations
# (Create migrations as needed for your schema)
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to verify the stack is running.

## 📦 Available Scripts

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint to check code quality
npm run lint

# Format code (if prettier is configured)
npm run format
```

## 🏗️ Project Structure

```
/app
  /dashboard          - Dashboard layout and pages
  /layout.tsx        - Root layout with shared styles
  /page.tsx          - Landing page
  /globals.css       - Global styles and Tailwind imports

/components
  /layout            - Layout components (Header, Sidebar, etc.)
  /ui                - Reusable UI components

/lib                 - Utility functions and helpers

/prisma
  /schema.prisma    - Database schema

.env.example         - Environment variables template
.eslintrc.json      - ESLint configuration
next.config.ts      - Next.js configuration
tsconfig.json       - TypeScript configuration
postcss.config.mjs  - Tailwind CSS configuration
```

## 🔧 Configuration Files

### TypeScript (`tsconfig.json`)
- Target: ES2017
- Strict mode enabled
- Path alias: `@/*` for easier imports

### ESLint (`eslint.config.mjs`)
- Uses Next.js ESLint configuration
- Includes web vitals rules
- TypeScript support

### Tailwind CSS (`postcss.config.mjs`)
- Tailwind CSS 4 with PostCSS
- Configured for App Router

## 📚 Using the Stack

### Adding a New Page

```bash
# Create a new route
mkdir -p app/your-route
touch app/your-route/page.tsx
```

### Database Operations with Prisma

```typescript
// Example: Using Prisma in an API route
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  const records = await prisma.yourModel.findMany()
  return Response.json(records)
}
```

### Processing PDFs

```typescript
import pdfParse from 'pdf-parse'

async function extractPdfText(pdfBuffer: Buffer) {
  const data = await pdfParse(pdfBuffer)
  return data.text
}
```

### Processing Images

```typescript
import sharp from 'sharp'

async function processImage(inputPath: string) {
  await sharp(inputPath)
    .resize(800, 600)
    .jpeg({ quality: 80 })
    .toFile('output.jpg')
}
```

### Using OpenAI API

```typescript
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

async function analyzeDocument(text: string) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'user',
        content: `Analyze this document: ${text}`,
      },
    ],
  })
  return response.choices[0].message.content
}
```

## 🔍 Code Quality

### Linting

The project is configured with ESLint and Next.js linting rules. Run linting before committing:

```bash
npm run lint
```

This checks for:
- Code style consistency
- Unused variables
- TypeScript type errors
- Next.js best practices

### Building

Ensure the project builds successfully:

```bash
npm run build
```

This verifies:
- TypeScript compilation
- Next.js optimization
- All dependencies are properly imported

## 🚀 Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment for Production

Set these environment variables in your hosting platform:
- `OPENAI_API_KEY` - Your OpenAI API key
- `DATABASE_URL` - Your production database URL
- `NODE_ENV=production`

### Vercel Deployment

The simplest way to deploy is using [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in project settings
4. Deploy

### Docker Deployment

Create a `Dockerfile` for containerized deployments:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

## 🧪 Testing (Future Setup)

The project is ready for testing frameworks. To add:

```bash
# Install testing dependencies
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

Create `jest.config.js` for test configuration.

## 📖 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)

## 📄 License

This project is private and proprietary.

## 🤝 Contributing

Follow the established code style and ensure all tests pass before submitting changes.

### Pre-commit Checklist

- [ ] Code is TypeScript-valid (`npm run build`)
- [ ] ESLint passes (`npm run lint`)
- [ ] No unused variables or imports
- [ ] Commit message is descriptive
