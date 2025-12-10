# StudyPilot - AI-Powered Smart Campus Assistant 🎓

An intelligent study companion that helps students upload PDFs, get instant summaries, ask questions, generate quizzes, and create personalized study plans using AI.

## 🚀 Features

- **📄 PDF Upload & Processing**: Upload study materials and extract text automatically
- **💬 AI Chat**: Ask questions and get context-aware answers from your documents
- **📝 Smart Summaries**: Generate concise, detailed, or bullet-point summaries
- **📊 Quiz Generator**: Create practice quizzes with MCQs, fill-in-the-blanks, and short answers
- **📅 Study Plans**: Get personalized study schedules based on your syllabus and timeline
- **🔍 RAG Pipeline**: Retrieval-Augmented Generation for accurate, source-backed answers

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLite** - Lightweight relational database
- **NumPy** - Pure Python vector store with cosine similarity
- **Sentence Transformers** - Text embeddings (all-MiniLM-L6-v2)
- **Google Gemini** - LLM for text generation
- **PyPDF2** - PDF text extraction

### Frontend
- **React.js** - UI framework
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **Axios** - HTTP client
- **React Router** - Navigation

## 📁 Project Structure

```
studypilot/
├── backend/
│   ├── app/
│   │   ├── api/           # API routes
│   │   │   ├── chat.py
│   │   │   ├── documents.py
│   │   │   ├── quiz.py
│   │   │   ├── summary.py
│   │   │   └── study_plan.py
│   │   ├── core/          # Core configuration
│   │   │   ├── config.py
│   │   │   └── database.py
│   │   ├── models/        # Database models
│   │   │   ├── user.py
│   │   │   ├── document.py
│   │   │   └── study_plan.py
│   │   ├── services/      # Business logic
│   │   │   ├── document_service.py
│   │   │   ├── llm_service.py
│   │   │   ├── rag_pipeline.py
│   │   │   └── vector_store.py
│   │   ├── utils/         # Utilities
│   │   │   └── pdf_processor.py
│   │   └── main.py        # FastAPI app
│   ├── uploads/           # Uploaded files
│   ├── chroma_db/         # Vector database
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/    # React components
    │   │   ├── Layout.jsx
    │   │   └── FileUpload.jsx
    │   ├── pages/         # Page components
    │   │   ├── Home.jsx
    │   │   ├── Documents.jsx
    │   │   ├── Chat.jsx
    │   │   ├── Summary.jsx
    │   │   ├── Quiz.jsx
    │   │   └── StudyPlan.jsx
    │   ├── services/      # API client
    │   │   └── api.js
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    └── vite.config.js
```

## ⚙️ Installation & Setup

### Prerequisites
- Python 3.9+
- Node.js 18+
- Git

### Backend Setup

1. **Navigate to backend directory:**
   ```powershell
   cd d:\studypilot\backend
   ```

2. **Create virtual environment:**
   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```

3. **Install dependencies:**
   ```powershell
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   ```powershell
   cp .env.example .env
   ```
   
   Edit `.env` file with your credentials:
   ```env
   DATABASE_URL=sqlite:///./studypilot.db
   GOOGLE_API_KEY=your_gemini_api_key_here
   DEFAULT_LLM=gemini
   EMBEDDING_MODEL=all-MiniLM-L6-v2
   ```

5. **Run the backend:**
   ```powershell
   python -m app.main
   ```
   
   Backend will be available at: http://localhost:8000
   API Docs: http://localhost:8000/docs

### Frontend Setup

1. **Navigate to frontend directory:**
   ```powershell
   cd d:\studypilot\frontend
   ```

2. **Install dependencies:**
   ```powershell
   npm install
   ```

3. **Run development server:**
   ```powershell
   npm run dev
   ```
   
   Frontend will be available at: http://localhost:3000

## 🎯 Usage

### 1. Upload a PDF
- Navigate to "Documents" page
- Drag & drop or click to upload a PDF
- Wait for processing (text extraction + embeddings)

### 2. Chat with Your Document
- Click "Chat" button on any document
- Ask questions about the content
- Get AI-powered answers with source citations

### 3. Generate Summaries
- Click "Summary" button
- Choose summary type (concise/detailed/bullet points)
- Optionally select specific page
- Generate summary

### 4. Create Quizzes
- Click "Quiz" button
- Configure number of questions and difficulty
- Get MCQs, fill-in-the-blanks, and short answers
- Submit and review answers with explanations

### 5. Build Study Plans
- Go to "Study Plan" page
- Enter syllabus, dates, and preferences
- Get AI-generated daily and weekly breakdown

## 🔌 API Endpoints

### Documents
- `POST /api/documents/upload` - Upload PDF
- `GET /api/documents/` - List all documents
- `GET /api/documents/{id}` - Get specific document
- `DELETE /api/documents/{id}` - Delete document

### Chat
- `POST /api/chat/` - Ask question about document

### Summary
- `POST /api/summary/` - Generate summary

### Quiz
- `POST /api/quiz/` - Generate quiz

### Study Plan
- `POST /api/study-plan/` - Create study plan
- `GET /api/study-plan/` - List study plans
- `GET /api/study-plan/{id}` - Get specific plan
- `DELETE /api/study-plan/{id}` - Delete plan

## 🧪 Development

### Backend Development
```powershell
# Run with auto-reload
cd backend
python -m app.main
```

### Frontend Development
```powershell
# Run with hot reload
cd frontend
npm run dev
```

### Database Migrations
```powershell
# Install Alembic (already in requirements.txt)
cd backend
alembic init alembic
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

## 🔒 Environment Variables

### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/studypilot

# LLM API Keys
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=AI...

# Settings
DEFAULT_LLM=gemini  # or openai
EMBEDDING_MODEL=all-MiniLM-L6-v2
CHROMA_DB_PATH=./chroma_db
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
DEBUG=True
```

## 📦 Building for Production

### Backend
```powershell
cd backend
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Frontend
```powershell
cd frontend
npm run build
```

## 🐛 Troubleshooting

### Common Issues

1. **ChromaDB errors:**
   - Delete `chroma_db` folder and restart backend

2. **PostgreSQL connection errors:**
   - Verify PostgreSQL is running
   - Check DATABASE_URL in .env

3. **LLM API errors:**
   - Verify API keys in .env
   - Check API quotas and limits

4. **CORS errors:**
   - Ensure frontend URL is in ALLOWED_ORIGINS

## 🚧 Future Enhancements

- [ ] User authentication & authorization
- [ ] Multi-user support with user profiles
- [ ] Document sharing between users
- [ ] Audio summaries with TTS
- [ ] Mobile app (React Native)
- [ ] Progress tracking and analytics
- [ ] Flashcard generator
- [ ] Spaced repetition system
- [ ] Export study plans to calendar
- [ ] Support for more file formats (DOCX, TXT, etc.)

## 📄 License

MIT License - Feel free to use this project for learning and development.

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## 📧 Support

For issues or questions, please open a GitHub issue.

---

**Built with ❤️ for students everywhere**
