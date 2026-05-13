# Skillio AI - Project Instructions

Welcome to the Skillio AI project. This file serves as the primary entry point for project conventions, architecture, and workflows.

## Documentation Map

- [.gemini/STRUCTURE.md](.gemini/STRUCTURE.md): High-level overview of the project's directory structure.
- [.gemini/BACKEND.md](.gemini/BACKEND.md): Detailed backend architecture and conventions (FastAPI).
- [.gemini/FRONTEND.md](.gemini/FRONTEND.md): Detailed frontend architecture and conventions (React).

## Core Tech Stack

### Backend
- **Framework:** FastAPI
- **Database:** PostgreSQL with `pgvector` extension
- **ORM:** SQLAlchemy
- **AI/NLP:** OpenAI API for embeddings and parsing
- **Authentication:** JWT (python-jose, passlib)

### Frontend
- **Framework:** React 19 (TypeScript)
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **State/Routing:** React Router Dom, Axios for API calls
- **UI Components:** Lucide React, Framer Motion, Recharts

## Development Workflows

### Setup
See [SETUP.md](SETUP.md) for detailed environment setup instructions.

### Coding Standards
- **Backend:** Follow PEP 8. Use Pydantic for request/response validation.
- **Frontend:** Use functional components and hooks. Prefer TypeScript interfaces over types for public APIs.
- **General:** Ensure all new features are accompanied by tests.

### Git Practices
Refer to [GIT_PRACTICES.md](GIT_PRACTICES.md) for commit naming and branching strategies.
