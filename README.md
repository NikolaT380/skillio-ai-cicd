# AI Recruitment System for Public Administration

## Project Overview

A web application designed to help public institutions analyze and select candidates efficiently through automatic processing and evaluation of CV documents using Artificial Intelligence. This system aims to reduce bias, speed up the hiring process, and identify the best-fit candidates for public sector roles.

## Tech Stack

- **Frontend**: React (TypeScript) - For a dynamic, type-safe, and interactive user interface.
- **Backend**: Python (FastAPI) - For high-performance API endpoints and seamless integration with AI/NLP libraries.
- **Database**: PostgreSQL - For reliable, structured storage of candidate profiles, job postings, and parsed CV data.
- **Vector Store**: pgvector (PostgreSQL extension) - For storing text embeddings to perform fast semantic similarity searches.
- **Document Storage**: 
    - **MinIO (S3-Compatible)**: Recommended for Public Administration to ensure data sovereignty (on-premise cloud storage).
    - **Local Storage**: Used in the prototype phase (mapped via Docker volumes).
- **AI/ML Processing**:
  - **OCR/Text Extraction**: PyMuPDF or Tesseract OCR for extracting text from PDF/DOCX files.
  - **LLM / Embedding Model**: SentenceTransformers (e.g., `all-MiniLM-L6-v2`) or OpenAI `text-embedding-ada-002` for generating dense vector representations of text.
  - **Information Extraction (NER)**: spaCy or a lightweight LLM prompt to extract structured data (skills, years of experience, education levels).


## Application Flow & Candidate Ranking

1. **Job Creation**: An HR Administrator creates a job posting with specific requirements, responsibilities, and mandatory criteria. The system generates an embedding vector for the job description and stores it in the Vector Database.
2. **CV Submission**: Candidates upload their CVs (PDF/DOCX) via the applicant portal.
3. **Data Extraction**: The backend extracts raw text and uses AI (NER) to parse out structured information such as skills, education, and years of experience.
4. **Embedding Generation**: The parsed CV text (or specific sections like experience and skills) is converted into a dense vector representation using the embedding model.
5. **Similarity Search & Scoring**:
   - **Semantic Similarity**: The system performs a vector similarity search (using Cosine Similarity) between the job description embedding and the candidate's CV embedding. This generates a baseline **Similarity Score**.
   - **Keyword & Rule-Based Matching**: A secondary evaluation checks for exact keyword matches and mandatory public administration requirements (e.g., specific certifications, degrees, or language proficiencies).
   - **Composite Score**: The final ranking score is a weighted combination (e.g., 80% Semantic Similarity + 20% Mandatory Keyword/Criteria Match).
6. **Threshold & Shortlisting**: The public institution defines an **Interview Threshold** (e.g., candidates scoring > 75%). Candidates who meet or exceed this threshold are automatically flagged as "Recommended for Interview."
7. **Dashboard Review**: HR administrators view the ranked list of candidates on the dashboard. They can filter by the threshold and review AI-generated summaries explaining why a candidate matched the role.

## Proposed Directory Structure

```text
ai-recruitment-public-admin/
├── frontend/                 # React (TypeScript) Application
│   ├── public/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page views
│   │   ├── services/         # API integration
│   │   ├── types/            # TypeScript interfaces
│   │   └── App.tsx
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                  # Python FastAPI Application
│   ├── app/
│   │   ├── api/              # API Route controllers
│   │   ├── core/             # Configuration and security settings
│   │   ├── models/           # SQLAlchemy Database Models
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── services/         # AI Processing, Scoring, and Embeddings
│   │   └── main.py           # FastAPI entry point
│   ├── requirements.txt
│   └── .env                  # Environment variables
│
├── database/                 # PostgreSQL & pgvector initialization scripts
│   └── init.sql
│
├── docker-compose.yml        # Docker configuration
└── README.md
```

## Getting Started (Prototype Phase)

### Prerequisites

- Node.js (v18+)
- Python 3.10+
- PostgreSQL (with pgvector extension enabled)

### 1. Database Setup

Ensure PostgreSQL is running and create a database named `ai_recruitment`. Enable the `pgvector` extension by running `CREATE EXTENSION vector;` in your database.

### 2. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

## System Architecture Diagram

![System Architecture](frontend/src/assets/skillio-diagram.png)                                                        