# MedGen.AI Architecture

## Overview

MedGen.AI is a medical note processing system that uses AI to summarize clinical notes and generate diagnostic hypotheses using Retrieval Augmented Generation (RAG).

## System Components

### 1. Frontend Applications

#### Web Application (Next.js)
- **Technology**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Purpose**: Web interface for medical professionals
- **Features**:
  - Input medical notes via textarea
  - Display summarized notes
  - Show diagnostic hypotheses
  - Responsive design for desktop and tablet use

#### Mobile Application (Flutter)
- **Technology**: Flutter/Dart
- **Purpose**: Mobile interface for on-the-go access
- **Features**:
  - Same functionality as web app
  - Native iOS and Android support
  - Offline capability (future feature)

### 2. Backend API (FastAPI)

- **Technology**: Python FastAPI
- **Purpose**: Core processing engine
- **Endpoints**:
  - `GET /health` - Health check
  - `POST /summarize` - Summarize medical note
  - `POST /summarize_hypothesize` - Summarize and generate hypotheses

### 3. AI/ML Components

#### Summarization
- **Model**: HuggingFace transformer models (e.g., BART, T5)
- **Purpose**: Extract key information from lengthy medical notes
- **Input**: Raw medical note text
- **Output**: Concise summary

#### RAG (Retrieval Augmented Generation)
- **Embedding Model**: Sentence Transformers
- **Vector Store**: FAISS
- **Knowledge Base**: Medical condition descriptions (kb/ folder)
- **Purpose**: Generate diagnostic hypotheses based on symptoms

### 4. Knowledge Base

- **Format**: Plain text files
- **Content**: Medical condition descriptions including:
  - Symptoms
  - Risk factors
  - Diagnostic criteria
  - Treatment approaches
- **Examples**: Pneumonia, TB, heart failure, anemia

## Data Flow

```
User Input (Medical Note)
        ↓
Frontend (Web/Mobile)
        ↓
    API Request
        ↓
FastAPI Backend
        ↓
   Summarization Model
        ↓
    [Summary Generated]
        ↓
  (Optional) RAG Pipeline
        ↓
  Embedding Generation
        ↓
   FAISS Vector Search
        ↓
 Retrieve Relevant KB Entries
        ↓
   Generate Hypotheses
        ↓
    Response to Frontend
        ↓
Display to User
```

## Technology Stack

### Frontend
- **Web**: Next.js, React, TypeScript, Tailwind CSS, Axios
- **Mobile**: Flutter, Dart, HTTP package

### Backend
- **API**: FastAPI, Python 3.11+
- **ML**: Transformers, PyTorch, Sentence-Transformers
- **Vector DB**: FAISS

### Infrastructure
- **Development**: Local development servers
- **Production**: Cloud deployment (Render, Railway, or similar)
- **API Gateway**: CORS-enabled for cross-origin requests

## Security Considerations

- HTTPS in production
- CORS configuration
- Input validation and sanitization
- Rate limiting (future)
- Authentication/Authorization (future)
- HIPAA compliance considerations (future)

## Scalability

- Stateless API design
- Horizontal scaling capability
- Model caching
- Vector store optimization
- CDN for frontend assets

## Future Enhancements

1. User authentication and authorization
2. Medical note history and storage
3. Multi-language support
4. Voice input for mobile
5. Integration with EHR systems
6. Advanced diagnostic reasoning
7. Personalized model fine-tuning
8. Audit logging and compliance features
