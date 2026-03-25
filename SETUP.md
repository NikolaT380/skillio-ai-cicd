# Skillio AI: Project Setup Guide

This guide explains how to get the AI Recruitment System up and running on your local machine. This setup uses Docker to ensure everyone on the team has the exact same database and infrastructure.

---

##  1. Prerequisites

Before you begin, ensure you have the following installed on your computer:
1.  **Docker & Docker Compose**: [Download Docker Desktop](https://www.docker.com/products/docker-desktop)
2.  **Conda (Miniconda/Anaconda)**: For managing your local Python environment.
3.  **Node.js (v18+)**: For running the React frontend.

---

##  2. Environment Configuration

You must configure your local environment variables before starting the project.

1.  Navigate to the `backend` folder:
    ```bash
    cd backend
    ```
2.  Copy the example environment file to create your own local `.env`:
    ```bash
    cp .env.example .env
    ```
3.  Open the newly created `.env` file and **add your OpenAI API Key**:
    ```env
    OPENAI_API_KEY=your_actual_key_here
    ```
    *(Note: Leave the PostgreSQL credentials as they are, Docker is configured to match them).*

---

## 3. Start the Infrastructure (Docker)

We use Docker to run the PostgreSQL database (with `pgvector`) and the complete backend/frontend stack.

1.  Go back to the root of the project:
    ```bash
    cd ..
    ```
2.  Build and start the containers in detached mode:
    ```bash
    docker-compose up -d --build
    ```
3.  **Verify the Services:**
    *   Backend API Swagger Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
    *   React Frontend: [http://localhost:3000](http://localhost:3000)

**Database Note:** 
The first time you run `docker-compose up`, Docker will automatically run `database/init.sql` (to build the tables) and `database/seed.sql` (to insert dummy jobs and an Admin user: `admin@gov.local` / `admin123`).

---

## 4. Set Up Your Local IDE (For Development)

Even though the app runs in Docker, you need a local Python environment so your IDE (PyCharm/VS Code) can provide autocomplete and catch errors.

1.  Create the Conda environment:
    ```bash
    conda create -n skillio-ai python=3.11 -y
    conda activate skillio-ai
    ```
2.  Install the backend dependencies:
    ```bash
    cd backend
    pip install -r requirements.txt
    ```

###  Critical PyCharm Configuration
If you are using PyCharm, you must do these two things to prevent "Cannot find reference" errors:
1.  **Mark Sources Root**: Right-click the `backend/` folder in the Project Explorer -> **Mark Directory as** -> **Sources Root**.
2.  **Set Interpreter**: Go to Settings -> Python Interpreter -> Add Local Interpreter -> Conda Environment -> Select `skillio-ai`.

---

## 📂 5. Managing Persistent Data

*   **Database**: The Postgres data is saved in a local Docker volume (`postgres_data`). If you restart your computer, the data will still be there.
*   **CV Files**: Uploaded CVs are permanently saved in the `storage/` folder at the root of the project.
*   **Resetting the DB**: If you mess up your local data and want to start fresh (wipe everything and re-run the seed script), run:
    ```bash
    docker-compose down -v
    docker-compose up -d
    ```

## 🗄️ 6. Connecting to the Database (PyCharm)

To see your `users`, `jobs`, and `candidates` in real-time, you should connect PyCharm's built-in database tool to the Docker container:

1.  Open the **Database** tool window (on the far right of PyCharm).
2.  Click **`+`** -> **Data Source** -> **PostgreSQL**.
3.  Enter these connection details:
    *   **Host**: `localhost`
    *   **Port**: `5432`
    *   **User**: `postgres`
    *   **Password**: `postgres`
    *   **Database**: `ai_recruitment`
4.  If PyCharm asks to "Download missing driver files," click **Download**.
5.  Click **Test Connection** to ensure you see a green checkmark.
6.  **View Your Data**: Expand `ai_recruitment` -> `public` -> `tables`. Right-click any table and select **Edit Data** to see the rows (including the sample seed data).

