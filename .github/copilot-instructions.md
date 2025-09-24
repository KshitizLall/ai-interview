# InterviewBot - Copilot Instructions

## Project Overview
This is an AI-powered interview preparation application with a Next.js frontend and placeholder backend. The app helps users generate interview questions from resumes and job descriptions, practice answers, and export results.

## Architecture & Key Components

### Frontend Structure (`/frontend`)
- **Next.js 14** with TypeScript, App Router, and server components
- **Styling**: Tailwind CSS v4 with shadcn/ui components and custom CSS animations
- **State Management**: React hooks with local state (no global state library)
- **Key Layout**: Split-pane desktop UI, mobile-first responsive tabs

### Core Components & Patterns

#### Component Organization
```
components/
├── ui/           # shadcn/ui components with CVA variants
├── answers-editor.tsx      # Rich text editor for practicing answers
├── file-upload-zone.tsx    # Drag & drop + manual text input
├── generation-controls.tsx # AI question generation with progress
├── questions-list.tsx      # Collapsible questions with inline AI answer generation
└── saved-questions.tsx     # Bookmarked questions management
```

#### State Architecture Pattern
The app uses **prop drilling** with state management centralized in `page.tsx`. Key state objects:
- `questions`: Generated questions array with metadata
- `answers`: Record<string, string> mapping question IDs to answers  
- `savedQuestions`: User bookmarked questions
- `resumeText`/`jobDescription`: Parsed input content

#### Data Flow Pattern
1. **File Upload** → `file-parser.ts` → extracted text content
2. **Text + Options** → `question-generator.ts` → structured questions with relevance scores
3. **Questions & Answers** → Combined collapsible UI for seamless Q&A workflow
4. **Auto-save** → Answers saved automatically with visual feedback
5. **Export** → `pdf-exporter.tsx` (future implementation)

### Critical Implementation Details

#### File Processing (`lib/file-parser.ts`)
- Supports PDF, DOCX, TXT with **mock parsing** (real parsing placeholder)
- Returns structured `ParsedFile` with content + metadata
- Uses async FileReader API with proper error handling

#### Question Generation (`lib/question-generator.ts`)
Core types: `Question`, `GenerationOptions`, `QuestionDifficulty`
- **Generation modes**: "jd", "resume", "combined" 
- **Scoring system**: relevanceScore (0-1) for ranking questions
- **Categorization**: Technical, behavioral, experience-based questions
- **Mock AI simulation** with progress callbacks

#### UI Component Patterns
- **CVA variants**: Use `class-variance-authority` for component variants (see `ui/button.tsx`)
- **Compound components**: Complex components use internal sub-components (e.g., `InputsPane`, `OutputsPane`)
- **Collapsible Q&A**: Questions expand inline to show answer editors with auto-save
- **Responsive design**: `lg:` breakpoints for desktop split-pane, mobile tabs below
- **Loading states**: Progress indicators with step-by-step feedback and save status indicators

#### Theme & Styling System
- **CSS custom properties** with dark/light theme switching
- **Tailwind merge pattern**: `cn()` utility combines `clsx` + `twMerge`
- **Animation classes**: Custom Tailwind animations (`animate-fade-in-up`)
- **Theme persistence**: localStorage + system preference detection

### Development Workflows

#### Commands
```bash
cd frontend
pnpm dev          # Development server on :3000
pnpm build        # Production build
pnpm lint         # ESLint check
```

#### File Creation Patterns
- **New UI components**: Extend shadcn/ui pattern with CVA variants
- **New features**: Add to main `page.tsx` with prop drilling to sub-components
- **New utilities**: Add to `lib/` directory with proper TypeScript types

#### AI Integration & Mock Implementation
- **OpenAI Integration**: Server-side API route (`/api/generate-answer`) provides AI-powered answer generation using GPT-4o-mini
- **Client Service**: `openai-service.ts` handles frontend calls to the AI API
- **Mock implementations** that need backend integration:
  - `question-generator.ts`: Uses template-based generation with simulated AI
  - `file-parser.ts`: PDF/DOCX parsing returns mock resume content
  - `pdf-exporter.tsx`: Not yet implemented

### Integration Points & Dependencies

#### External Services (Planned)
- **AI Question Generation**: Backend API for real AI processing
- **File Processing**: Server-side PDF/DOCX parsing libraries
- **PDF Export**: Client-side PDF generation or server-side rendering

#### Key Dependencies
- **UI**: `@radix-ui/*` components with `class-variance-authority`
- **Styling**: `tailwindcss` v4, `tailwind-merge`, `clsx`
- **Forms**: `react-hook-form` + `@hookform/resolvers` + `zod`
- **Icons**: `lucide-react`
- **Utilities**: `date-fns`, `next-themes`

### Project-Specific Conventions

#### TypeScript Patterns
- **Strict typing**: All functions/components have explicit return types
- **Interface segregation**: Separate interfaces for different concerns (e.g., `Question`, `GenerationOptions`)
- **Utility types**: Custom types like `QuestionType`, `QuestionDifficulty`

#### Component Conventions
- **"use client"** directive for interactive components
- **Compound pattern**: Large components split into internal sub-components
- **Props interface naming**: `ComponentNameProps` pattern
- **State updates**: Functional updates preferred (`setData(prev => ...)`)

#### File Naming
- **kebab-case**: Component files use kebab-case (`file-upload-zone.tsx`)
- **Utility functions**: camelCase exports from kebab-case files
- **Type exports**: Co-located with implementation

When working on this codebase:
1. **Maintain prop drilling pattern** - don't introduce complex state management
2. **Follow shadcn/ui patterns** for new components with CVA variants
3. **Use collapsible components** - Questions expand to show answers inline for better UX
4. **Implement real backend** when replacing mock services
5. **Preserve responsive design** - desktop split-pane, mobile tabs
6. **Auto-save pattern** - Use debounced saves with visual feedback for user inputs
7. **Use TypeScript interfaces** for all data structures and API contracts