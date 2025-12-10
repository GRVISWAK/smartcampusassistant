# Quick Start Guide

## Option 1: Using PowerShell (Windows)

### Backend Setup
```powershell
# 1. Navigate to backend
cd d:\studypilot\backend

# 2. Create virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# 3. Install dependencies
pip install -r requirements.txt

# 4. Setup environment
cp .env.example .env
# Edit .env with your database URL and API keys

# 5. Create database
createdb studypilot

# 6. Run backend
python -m app.main
```

### Frontend Setup
```powershell
# 1. Navigate to frontend
cd d:\studypilot\frontend

# 2. Install dependencies
npm install

# 3. Run development server
npm run dev
```

## Option 2: Quick Test (Without Database)

For testing without PostgreSQL:

1. Modify `backend/app/core/config.py` to use SQLite:
   ```python
   DATABASE_URL: str = "sqlite:///./studypilot.db"
   ```

2. Run backend and frontend as shown above

## Getting API Keys

### Google Gemini (Free)
1. Go to https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy key to `.env` as `GOOGLE_API_KEY`

### OpenAI (Optional)
1. Go to https://platform.openai.com/api-keys
2. Create new API key
3. Copy to `.env` as `OPENAI_API_KEY`

## Testing the Application

1. Open browser: http://localhost:3000
2. Upload a PDF document
3. Try Chat, Summary, Quiz features
4. Create a study plan

## Next Steps

- Read full README.md for detailed documentation
- Explore API docs at http://localhost:8000/docs
- Customize configuration in `.env` files
