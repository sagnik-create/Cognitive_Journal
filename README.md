# Cognitive Mirror

A polished AI journaling prototype that analyzes journal entries, stores memory through Cognee, and generates a long-term Thought Review with Gemini.

## Backend

Use Python 3.10-3.13 for the smoothest Cognee install path.

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Set `GEMINI_API_KEY` in `backend/.env` to enable real Gemini analysis. Without it, the app uses deterministic demo responses so the prototype remains clickable.

## Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173`.

## Environment

Backend:
- `GEMINI_API_KEY`: Google Gemini API key.
- `GEMINI_MODEL`: Gemini model name, defaults to `gemini-1.5-flash`.
- `COGNEE_DATASET`: Cognee dataset for improve/forget calls.
- `FRONTEND_ORIGIN`: Allowed browser origin for CORS.
- `LOCAL_MEMORY_PATH`: local JSON fallback used by the demo and sidebar.

Frontend:
- `VITE_API_BASE_URL`: FastAPI base URL, defaults to `http://localhost:8000/api`.
