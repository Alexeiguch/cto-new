# Project Structure

## Directory Layout

```
/
├── app/
│   ├── layout.tsx              # Root layout with shared styles and metadata
│   ├── page.tsx                # Landing page with feature showcase
│   ├── globals.css             # Global styles and Tailwind imports
│   ├── dashboard/
│   │   ├── layout.tsx          # Dashboard layout
│   │   └── page.tsx            # Dashboard placeholder page
│   └── favicon.ico
├── components/
│   ├── layout/
│   │   └── header.tsx          # Reusable header component
│   └── ui/                     # UI components (ready for expansion)
├── lib/
│   ├── pdf-utils.ts            # PDF processing utilities
│   ├── image-utils.ts          # Image processing with sharp
│   └── openai-utils.ts         # OpenAI API integration
├── prisma/
│   └── schema.prisma           # Database schema (PostgreSQL)
├── public/                     # Static assets
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignore rules
├── eslint.config.mjs           # ESLint configuration
├── next.config.ts              # Next.js configuration
├── postcss.config.mjs          # PostCSS/Tailwind configuration
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies and scripts
├── package-lock.json           # Locked dependency versions
└── README.md                   # Project documentation
```

## Configuration Files

### ESLint (`eslint.config.mjs`)
- Uses modern ESLint flat config
- Next.js configuration with core-web-vitals
- TypeScript support enabled

### TypeScript (`tsconfig.json`)
- Target: ES2017
- Strict mode enabled
- Path alias `@/*` for imports
- Incremental compilation

### Tailwind CSS (`postcss.config.mjs`)
- Tailwind CSS 4 with PostCSS
- Configured for App Router

### Next.js (`next.config.ts`)
- Ready for production build
- Configured for optimization

## Key Features

- ✅ Next.js 16.0.3 with App Router
- ✅ TypeScript 5 with strict mode
- ✅ Tailwind CSS 4 styling
- ✅ ESLint for code quality
- ✅ PDF processing capabilities
- ✅ Image optimization with sharp
- ✅ OpenAI integration ready
- ✅ Prisma ORM configured
- ✅ Responsive design
- ✅ Dark mode support
