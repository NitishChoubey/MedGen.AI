# 🏥 MedGen.AI

AI-powered medical note analysis system with **Retrieval Augmented Generation (RAG)** for accurate differential diagnosis generation with full traceability.

## 🎯 Key Features

- ✅ **RAG Architecture** - FAISS vector database for accurate medical knowledge retrieval
- ✅ **Traceability** - Every diagnosis references specific parts of input text with relevance scores
- ✅ **Multi-Factor Confidence Scoring** - 0-100% confidence based on rank, findings, and relevance
- ✅ **Severity Indicators** - Critical/High/Medium/Low urgency classification
- ✅ **Full-Stack System** - Next.js web app + FastAPI backend + Flutter mobile (planned)
- ✅ **12 Medical Conditions** - Expandable knowledge base covering major disease categories

## 📁 Project Structure

- **apps/web** - Next.js 14.2 web application (TypeScript + Tailwind CSS)
- **apps/mobile** - Flutter mobile application (planned for Round 2)
- **services/api** - FastAPI backend with HuggingFace models and FAISS vector search
- **kb/** - Medical knowledge base (12 conditions: cardiovascular, respiratory, metabolic, etc.)
- **samples/** - Sample synthetic medical notes for testing
- **docs/** - Complete API documentation and architecture guides

## 🚀 Quick Start

### Prerequisites
- Python 3.12+
- Node.js 18+
- Anaconda (recommended)

### 1. Clone Repository
```bash
git clone https://github.com/NitishChoubey/MedGen.AI.git
cd MedGen.AI
```

### 2. Setup Backend (FastAPI)
```bash
cd services/api
pip install -r requirements.txt

# Copy environment template (optional - models download automatically)
cp .env.example .env

# Start API server
python -m uvicorn api.main:app --reload --host 127.0.0.1 --port 8000
```

### 3. Setup Frontend (Next.js)
```bash
cd apps/web
npm install

# Start web application
npm run dev
```

### 4. Access Application
- **Web App**: http://localhost:3000
- **API Docs**: http://127.0.0.1:8000/docs
- **API Health**: http://127.0.0.1:8000/health

## 🔐 Environment Variables

**Important**: Never commit `.env` files! Only `.env.example` is safe to commit.

### Backend (Optional)
Create `services/api/.env`:
```env
# Optional: HuggingFace token for gated models
HF_TOKEN=your_token_here

# Optional: Custom model paths
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
SUMMARIZATION_MODEL=sshleifer/distilbart-cnn-12-6
```

### Frontend (Optional)
Create `apps/web/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

## 📚 Documentation

- **[Getting Started Guide](GETTING_STARTED.md)** - Complete beginner setup (8,000+ words)
- **[Technical Guide](TECHNICAL_GUIDE.md)** - Deep-dive for developers (10,000+ words)
- **[Project Overview](PROJECT_OVERVIEW.md)** - Non-technical explanation
- **[Workflow](WORKFLOW.md)** - 18-step system flow
- **[Tech Stack](TECH_STACK.md)** - 35+ technologies breakdown
- **[API Documentation](docs/api-contract.md)** - Complete API reference
- **[Architecture](docs/architecture.md)** - System design
- **[Hackathon Strategy](HACKATHON.md)** - Demo script & Round 2 roadmap
- **[Pitch Deck](PITCH_DECK.md)** - 20 slides with full content

## 🛠️ Tech Stack

### Frontend
- Next.js 14.2, React 18.3, TypeScript 5, Tailwind CSS 3.4

### Backend
- FastAPI 0.115, Uvicorn 0.30, Python 3.12, Pydantic 2.9

### AI/ML
- HuggingFace Transformers, Sentence-BERT, DistilBART, FAISS-CPU

### Mobile (Planned)
- Flutter 3.x, Dart 3.x, Material Design

## 🧪 Testing

### Test with Sample Notes
```bash
# Sample notes are in samples/ directory
# Upload note1.txt or note2.txt through the web interface
```

### Expected Output
- **Summary**: Concise clinical summary
- **Key Findings**: Extracted symptoms, vital signs, labs
- **Ranked Diagnoses**: Top 5 with confidence scores
- **Supporting Evidence**: Specific text snippets with relevance %
- **Severity**: Critical/High/Medium/Low classification

## 📈 Scalability

The system easily scales by adding medical text files to `kb/` directory:
- **Current**: 12 conditions, 173 document chunks
- **Expandable**: Add any medical condition as `.txt` file
- **No code changes needed**: Knowledge base auto-loads on startup

## 🔒 Security

- ✅ `.gitignore` configured to protect secrets
- ✅ No environment files committed (only `.env.example`)
- ✅ No API keys in code
- ✅ Models downloaded at runtime (not in repo)
- ✅ Virtual environments excluded
- ✅ See [Security Checklist](.github-security-checklist.md)

## 🤝 Contributing

This is a hackathon project for Round 1 screening. Round 2 will include:
- Flutter mobile app completion
- User authentication
- Cloud deployment (AWS/GCP)
- Database integration (PostgreSQL)
- Real-time collaboration
- Extended knowledge base
- See [HACKATHON.md](HACKATHON.md) for roadmap

## 📄 License

[Add your license here]

## 👥 Team

- **[Nitish Choubey](https://github.com/NitishChoubey)** — Project lead & backend
- **[Gopal Yadav](https://github.com/gopal5587)** — Full-stack development & deployment

## 📧 Contact

[Add contact information]

---

**Built with ❤️ for improving healthcare through AI**
