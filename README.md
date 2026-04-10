# Skillio AI: Recruitment System for Public Administration

##  Project Overview
A web application designed to help public institutions analyze and select candidates efficiently through automatic processing and evaluation of CV documents using Artificial Intelligence. This system aims to reduce bias, speed up the hiring process, and identify the best-fit candidates for public sector roles using advanced semantic matching.

## ️ Tech Stack
- **Frontend**: React (TypeScript) + Vite - For a dynamic, type-safe, and interactive user interface.
- **Backend**: Python (FastAPI) - For high-performance API endpoints and seamless integration with OpenAI.
- **Database**: PostgreSQL - For reliable, structured storage of candidate profiles, job postings, and HR Admin users.
- **Vector Store**: pgvector (PostgreSQL extension) - For storing 1536-dimensional text embeddings to perform fast semantic similarity searches directly in the database.
- **Document Storage**: 
  - Local Storage mapped via Docker volumes (Prototype Phase).
  - **MinIO (S3-Compatible)**: Recommended for Public Administration to ensure data sovereignty (on-premise cloud storage).
- **AI/ML Processing (OpenAI)**:
  - **Text Extraction**: `PyMuPDF` (fitz) and `python-docx` for extracting raw text from uploaded files.
  - **LLM Data Extraction (NER)**: `gpt-4o-mini` to extract structured JSON data (skills, total months of experience, education) from unstructured CV text.
  - **Embedding Model**: `text-embedding-3-small` for generating dense vector representations of both Job Descriptions and Candidate CVs.
- **Security**: JWT (JSON Web Tokens) with bcrypt password hashing and a server-side Token Blacklist for secure HR Admin sessions.

##  Application Flow & Candidate Ranking

1. **Secure Access**: HR Administrators authenticate via JWT to access the system.
2. **Job Creation**: An HR Admin creates a job posting (Title, Description, Requirements). The system generates a rich embedding vector representing the semantic meaning of the role and stores it in PostgreSQL.
3. **CV Submission**: Candidates upload their CVs (PDF/DOCX).
4. **AI Parsing & Embedding**: The backend extracts raw text, uses `gpt-4o-mini` to parse structured information, and generates a candidate embedding using `text-embedding-3-small`. The physical file is moved to persistent storage.
5. **Similarity Search & Scoring**: When an Admin views the applicants, the system uses `pgvector` (`<=>` cosine similarity operator) to calculate a **Match Score** on-the-fly by comparing the Job's vector to all Candidate vectors.
6. **Threshold Filtering**: Candidates are dynamically flagged as **"recommended"** (score > 0.40) or **"rejected"**.
7. **Dashboard Review**: HR administrators view the ranked list of candidates and can delete records (which automatically cleans up orphaned PDF files).

##  Getting Started (Docker Environment)

We use Docker to ensure a consistent, reproducible environment for the entire team.

### Prerequisites
- Docker & Docker Compose
- An OpenAI API Key

### Quick Start
1. **Configure Environment:**
   Navigate to the `backend/` folder and create your `.env` file from the example:
   ```bash
   cp .env.example .env
   # Edit .env and add your OPENAI_API_KEY and a secure SECRET_KEY
   ```
2. **Start the Infrastructure:**
   From the root directory, build and start all containers:
   ```bash
   docker-compose up -d --build
   ```
3. **Access the Services:**
   - **Backend API (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)
   - **Frontend UI**: [http://localhost:3000](http://localhost:3000)
   - **Database**: `localhost:5432` (User: `postgres`, Pass: `postgres`, DB: `ai_recruitment`)

*Note: On the first startup, `init.sql` automatically configures the tables and `pgvector` extension.*

## Repository Structure

```text
skillio-ai/
├── backend/                  # Python FastAPI Application
│   ├── app/
│   │   ├── api/              # Routers, Endpoints, Dependencies (deps.py)
│   │   │   └── models/orm/   # SQLAlchemy Database Models
│   │   ├── core/             # Security (JWT, bcrypt) and Config settings
│   │   ├── schemas/          # Pydantic validation models
│   │   └── services/         # AI Processing (OpenAI) and CV Parsing
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                 # React (TypeScript) Application
│   ├── src/
│   └── Dockerfile
├── database/                 # PostgreSQL initialization scripts (init.sql)
├── storage/                  # Persistent Docker volume for uploaded CVs
├── docker-compose.yml        # Multi-container orchestration
├── SETUP.md                  # Detailed local development guide
```

## System Architecture Diagram

![System Architecture](frontend/src/assets/skillio-diagram.png)
