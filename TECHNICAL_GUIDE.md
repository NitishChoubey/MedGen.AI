# 🔧 Technical Guide - MedGen.AI Deep Dive

## 📐 System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  Web Browser (React/Next.js)          Mobile App (Flutter)      │
│  - Landing Page                        - Native UI              │
│  - Upload Interface                    - Camera Integration     │
│  - Results Display                     - Offline Mode           │
└────────────────────┬────────────────────────────────────────────┘
                     │ HTTP/REST API
                     │ (Axios / HTTP Client)
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│  FastAPI Application (main.py)                                  │
│  - CORS Middleware                                              │
│  - Request Validation (Pydantic)                                │
│  - Error Handling                                               │
│  - Auto-generated OpenAPI Docs                                  │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BUSINESS LOGIC LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Clinical Findings Extraction                          │   │
│  │  - Regex-based pattern matching                        │   │
│  │  - Categories: Symptoms, History, Vitals, Labs         │   │
│  │  Function: extract_clinical_findings()                 │   │
│  └────────────────────┬───────────────────────────────────┘   │
│                       │                                          │
│                       ↓                                          │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Knowledge Base Matching                               │   │
│  │  - Semantic similarity search                          │   │
│  │  - Embedding comparison                                │   │
│  │  Function: match_findings_to_kb()                      │   │
│  └────────────────────┬───────────────────────────────────┘   │
│                       │                                          │
│                       ↓                                          │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Diagnosis Ranking Engine                              │   │
│  │  - Multi-factor confidence scoring                     │   │
│  │  - Severity detection                                  │   │
│  │  Function: rank_differential_diagnoses()               │   │
│  └────────────────────┬───────────────────────────────────┘   │
│                       │                                          │
│                       ↓                                          │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Summary Generation                                    │   │
│  │  - DistilBART transformer model                        │   │
│  │  - Text summarization                                  │   │
│  │  Function: get_summarizer()                            │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                  │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│                         AI/ML LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐                   │
│  │  Embedding Model │  │ Summarization    │                   │
│  │  all-MiniLM-L6-v2│  │ Model            │                   │
│  │  (384 dimensions)│  │ DistilBART-CNN   │                   │
│  │                  │  │ (287 MB)         │                   │
│  │  Converts text   │  │                  │                   │
│  │  to vectors      │  │  Generates       │                   │
│  │                  │  │  summaries       │                   │
│  └────────┬─────────┘  └──────────────────┘                   │
│           │                                                      │
│           ↓                                                      │
│  ┌────────────────────────────────────────────────────────┐   │
│  │         FAISS Vector Database                          │   │
│  │  - 23 indexed KB chunks                                │   │
│  │  - Cosine similarity search                            │   │
│  │  - Sub-millisecond retrieval                           │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                  │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│  Knowledge Base (File System)                                   │
│  - anemia.txt (5.2 KB, 6 chunks)                               │
│  - heart_failure.txt (4.8 KB, 6 chunks)                        │
│  - pneumonia.txt (5.0 KB, 6 chunks)                            │
│  - tuberculosis.txt (4.5 KB, 5 chunks)                         │
│                                                                  │
│  Sample Notes (File System)                                     │
│  - note1.txt, note2.txt                                        │
│                                                                  │
│  (Future: PostgreSQL, Redis, S3)                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Architecture

### Complete Request/Response Flow

```
1. USER INPUT
   ↓
[User uploads PDF or pastes text in browser]
   ↓
   Frontend (upload/page.tsx)
   - Validates input
   - If PDF: calls /extract-pdf endpoint first
   - Stores in React state
   
2. PDF EXTRACTION (if applicable)
   ↓
   POST /extract-pdf
   ↓
   PyPDF2 extracts text
   ↓
   Returns: { "text": "extracted content..." }
   
3. ANALYSIS TRIGGER
   ↓
   User clicks "Generate Analysis"
   ↓
   Frontend calls: POST /summarize-hypothesize
   ↓
   Request body: { "note": "clinical text..." }
   
4. BACKEND PROCESSING
   ↓
   a) TEXT PREPROCESSING
      - Truncate to 4000 chars (prevent memory issues)
      - Clean whitespace
      
   b) CLINICAL FINDINGS EXTRACTION
      - extract_clinical_findings(note)
      - Regex patterns for:
        * Symptoms: "(complains of|reports|presents with) ([^.]+)"
        * History: "(history of|past medical) ([^.]+)"
        * Physical Exam: "(on exam|physical exam) ([^.]+)"
        * Vitals: "BP|HR|RR|Temp|O2"
        * Labs: "WBC|Hgb|BNP|CRP"
      - Returns: List[Dict] with category, text, position
      
   c) KNOWLEDGE BASE RETRIEVAL
      - retrieve(note, k=6)
      - Encode note with embedding model
      - FAISS similarity search
      - Returns: Top 6 KB passages with scores
      
   d) FINDINGS MATCHING
      - match_findings_to_kb(findings, kb_evidence)
      - For each KB passage:
        * Calculate similarity to each finding
        * Keep matches > 0.3 threshold
        * Add matching_findings to evidence
      - Returns: Enhanced evidence with traceability
      
   e) DIAGNOSIS RANKING
      - rank_differential_diagnoses(findings, evidence)
      - For each of top 6 KB entries:
        * Extract condition name
        * Calculate confidence:
          - Rank score: 40-10 points
          - Findings score: up to 35 points
          - Relevance score: up to 25 points
        * Detect severity (Critical/High/Medium/Low)
        * Collect supporting findings
      - Sort by confidence
      - Returns: Top 5 ranked diagnoses
      
   f) SUMMARY GENERATION
      - get_summarizer().generate()
      - DistilBART model creates concise summary
      - Max length: 150 tokens
      - Returns: Summary text
      
   g) CLINICAL ASSESSMENT FORMATTING
      - format_clinical_assessment(diagnoses)
      - Creates structured text output
      - Returns: Formatted differential + plan
      
5. RESPONSE ASSEMBLY
   ↓
   JSON Response:
   {
     "summary": "...",
     "differential_and_plan": "...",
     "ranked_diagnoses": [...],
     "citations": [...],
     "input_findings": [...]
   }
   
6. FRONTEND RENDERING
   ↓
   - Stores in sessionStorage
   - Navigates to /results
   - Renders components:
     * Summary card
     * Ranked diagnoses with confidence bars
     * Findings table
     * Evidence citations
     
7. USER INTERACTION
   ↓
   - View results
   - Expand metrics breakdown
   - Print report
   - Analyze another document
```

---

## 🧠 AI/ML Deep Dive

### 1. RAG (Retrieval-Augmented Generation) Architecture

**What is RAG?**
RAG combines retrieval (searching knowledge base) with generation (AI text creation) to produce accurate, grounded responses.

**Why RAG vs Pure LLM?**
| Approach | Pros | Cons |
|----------|------|------|
| **Pure LLM** (GPT-4) | Natural language, creative | Hallucinations, no sources, requires internet, expensive |
| **RAG** (Our approach) | Grounded in KB, citable, offline, cost-effective | Limited to KB content, less creative |

**Our RAG Pipeline:**
```
Query (Medical Note)
    ↓
Embedding Model (all-MiniLM-L6-v2)
    ↓
384-dimensional vector
    ↓
FAISS Similarity Search
    ↓
Top K relevant KB passages
    ↓
Context for Summarization
    ↓
DistilBART generates summary
    ↓
Evidence-based output
```

---

### 2. Embedding Model: all-MiniLM-L6-v2

**Specifications:**
- **Architecture**: Sentence-BERT (Siamese network)
- **Dimensions**: 384 (smaller than standard 768, faster)
- **Training**: 1 billion sentence pairs
- **Size**: 80 MB
- **Speed**: ~500 sentences/second on CPU

**How Embeddings Work:**
```python
# Example embedding
text = "Patient has dyspnea and edema"
embedding = model.encode(text)
# Result: [0.123, -0.456, 0.789, ...] (384 numbers)

# Similar texts have similar vectors
text2 = "Shortness of breath with swelling"
embedding2 = model.encode(text2)

# Cosine similarity
similarity = cosine_similarity(embedding, embedding2)
# Result: 0.87 (high similarity!)
```

**Why This Model?**
- ✅ Trained on general text (works for medical)
- ✅ Fast on CPU (no GPU needed)
- ✅ Good balance: speed vs accuracy
- ✅ Small size (deployable)

**Future Improvement:**
- Use **Clinical-BERT** or **BioBERT** (medical-specific)
- Fine-tune on medical literature
- Expected +10-20% accuracy improvement

---

### 3. FAISS Vector Database

**What is FAISS?**
Facebook AI Similarity Search - ultra-fast vector similarity search library.

**How It Works:**
```python
# Index creation (startup)
import faiss
import numpy as np

# Get all KB embeddings
embeddings = np.array([emb1, emb2, ..., emb23])  # 23 x 384

# Create index
dimension = 384
index = faiss.IndexFlatL2(dimension)  # L2 = Euclidean distance
index.add(embeddings)

# Search (during analysis)
query_embedding = model.encode("patient note")
k = 6  # Top 6 results
distances, indices = index.search(query_embedding, k)

# Returns: indices of most similar KB chunks
```

**Current Implementation:**
- **Index Type**: `IndexFlatL2` (exact search, no approximation)
- **Size**: 23 vectors × 384 dimensions = 8,832 floats
- **Memory**: ~35 KB (tiny!)
- **Search Time**: <1ms

**Scaling Considerations:**
| KB Size | Index Type | Search Time | Memory |
|---------|------------|-------------|--------|
| 100 docs | IndexFlatL2 | <1ms | 150 KB |
| 10K docs | IndexIVFFlat | ~5ms | 15 MB |
| 1M docs | IndexIVFPQ | ~50ms | 500 MB |
| 100M docs | IndexIVFPQ + GPU | ~100ms | 10 GB |

**Future Scaling:**
When KB grows to 10K+ documents:
```python
# Switch to approximate search
quantizer = faiss.IndexFlatL2(dimension)
index = faiss.IndexIVFFlat(quantizer, dimension, 100)  # 100 clusters
index.train(embeddings)  # Clustering step
index.add(embeddings)
```

---

### 4. Summarization Model: DistilBART-CNN-12-6

**Specifications:**
- **Base**: BART (Bidirectional Auto-Regressive Transformer)
- **Distillation**: 6 layers (vs 12 in original BART)
- **Training**: CNN/Daily Mail dataset (news articles)
- **Size**: 287 MB
- **Speed**: ~2-5 seconds per note on CPU

**How BART Works:**
1. **Encoder**: Reads entire input note
2. **Decoder**: Generates summary token by token
3. **Attention**: Focuses on important parts

**Generation Parameters:**
```python
summary = summarizer(
    note,
    max_length=150,        # Summary length (tokens)
    min_length=40,         # Minimum length
    do_sample=False,       # Deterministic (no randomness)
    num_beams=4,           # Beam search width
    early_stopping=True    # Stop when done
)
```

**Why This Model?**
- ✅ Pre-trained on summarization (transfer learning)
- ✅ Smaller than full BART (faster inference)
- ✅ Good abstractive summaries (not just extractive)
- ✅ No API costs

**Limitations:**
- ❌ Not medical-specific (may miss clinical nuances)
- ❌ Max input: 1024 tokens (~800 words)
- ❌ Generic summarization style

**Future Improvement:**
- Fine-tune on **MIMIC-III** clinical notes
- Use **Clinical-T5** or **PubMedBERT**
- Expected better medical terminology handling

---

## 🎯 Confidence Scoring Algorithm

### Multi-Factor Scoring Explained

**Goal**: Calculate 0-100% confidence for each diagnosis based on evidence strength.

**Algorithm:**
```python
def calculate_diagnosis_confidence(condition, findings, evidence_rank):
    # Factor 1: Evidence Rank (40% weight)
    # Higher in search results = stronger evidence
    rank_score = max(0, 40 - (evidence_rank - 1) * 10)
    # Rank 1: 40 pts
    # Rank 2: 30 pts
    # Rank 3: 20 pts
    # Rank 4: 10 pts
    # Rank 5+: 0 pts
    
    # Factor 2: Matching Findings (35% weight)
    # More patient findings match = higher confidence
    matching_findings = condition['matching_findings']
    finding_count = len(matching_findings)
    finding_score = min(35, finding_count * 12)
    # 1 finding: 12 pts
    # 2 findings: 24 pts
    # 3+ findings: 35 pts (capped)
    
    # Factor 3: Semantic Relevance (25% weight)
    # How similar are the findings?
    relevance_scores = [f['relevance'] for f in matching_findings]
    avg_relevance = sum(relevance_scores) / len(relevance_scores)
    relevance_score = avg_relevance * 25
    # 0.8 similarity: 20 pts
    # 1.0 similarity: 25 pts
    
    # Total Confidence
    total_confidence = rank_score + finding_score + relevance_score
    
    # Boost for urgency keywords
    if any(keyword in description for keyword in ['emergency', 'acute', 'severe']):
        total_confidence = min(100, total_confidence + 10)
    
    return round(total_confidence, 1)  # 0-100%
```

**Example Calculation:**

**Case**: Patient with dyspnea, edema, elevated BNP

**Diagnosis 1: Heart Failure**
- Rank: 1st in search results → **40 points**
- Findings: Matches 3 findings (dyspnea, edema, BNP) → **35 points**
- Relevance: Average 0.85 → **21.25 points**
- **Total: 96.25% (High confidence!)**

**Diagnosis 2: Pneumonia**
- Rank: 3rd in search results → **20 points**
- Findings: Matches 1 finding (dyspnea) → **12 points**
- Relevance: Average 0.52 → **13 points**
- **Total: 45% (Medium confidence)**

---

### Severity Detection Algorithm

```python
def detect_severity(passage):
    # Keyword-based detection
    critical_keywords = ['emergency', 'life-threatening', 'acute', 'critical']
    high_keywords = ['urgent', 'severe', 'rapid progression', 'immediate']
    medium_keywords = ['chronic', 'moderate', 'subacute']
    low_keywords = ['mild', 'benign', 'self-limited']
    
    passage_lower = passage.lower()
    
    if any(kw in passage_lower for kw in critical_keywords):
        return 'Critical'
    elif any(kw in passage_lower for kw in high_keywords):
        return 'High'
    elif any(kw in passage_lower for kw in medium_keywords):
        return 'Medium'
    else:
        return 'Low'
```

**Future Enhancement:**
- Use ML classifier trained on labeled data
- Consider lab values (e.g., BNP >1000 = High)
- Factor in patient age, comorbidities
- Dynamic severity based on context

---

## 🔌 API Architecture

### Endpoint Design Philosophy

**RESTful Principles:**
- `/health` - GET (idempotent, no side effects)
- `/summarize-hypothesize` - POST (creates analysis, not idempotent)
- `/extract-pdf` - POST (file upload, creates resource)

**Request/Response Design:**

#### POST /summarize-hypothesize

**Request:**
```json
{
  "note": "string (max 4000 chars)"
}
```

**Response Schema:**
```typescript
{
  summary: string,                    // Concise summary
  differential_and_plan: string,      // Formatted text output
  ranked_diagnoses: [                 // NEW: Prioritized list
    {
      rank: number,                   // 1-5
      condition: string,              // "Heart Failure"
      confidence: number,             // 0-100
      severity: "Critical"|"High"|"Medium"|"Low",
      description: string,            // From KB
      source: string,                 // "heart_failure.txt"
      supporting_findings: [          // Evidence
        {
          text: string,
          category: string,
          relevance: number           // 0-1
        }
      ],
      metrics: {
        total_findings: number,
        avg_relevance: number,
        confidence_breakdown: {
          rank_score: number,
          findings_score: number,
          relevance_score: number
        }
      }
    }
  ],
  citations: [                        // KB evidence
    {
      rank: number,
      passage: string,
      source: string,
      matching_findings: [...]
    }
  ],
  input_findings: [                   // Extracted from note
    {
      category: string,
      text: string,
      start: number,
      end: number
    }
  ]
}
```

**Error Handling:**
```python
@app.exception_handler(ValueError)
async def value_error_handler(request, exc):
    return JSONResponse(
        status_code=400,
        content={"detail": str(exc)}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )
```

---

## 🎨 Frontend Architecture

### Component Hierarchy

```
app/
├── layout.tsx (Root Layout)
│   ├── Font Loading (Poppins, Inter, Space Grotesk)
│   ├── Metadata (title, description, icons)
│   └── Global CSS
│
├── page.tsx (Home - Redirect)
│   └── Redirects to /landing
│
├── landing/
│   └── page.tsx (Marketing Page)
│       ├── Hero Section
│       ├── Features Grid
│       ├── How It Works
│       ├── Animated Background Blobs
│       └── CTA Buttons
│
├── upload/
│   └── page.tsx (Input Page)
│       ├── useState: noteText, isLoading, error
│       ├── PDF Upload Handler
│       │   └── Calls /extract-pdf
│       ├── Sample Loader
│       ├── Generate Button
│       │   └── Calls /summarize-hypothesize
│       └── sessionStorage: stores results
│
└── results/
    └── page.tsx (Analysis Display)
        ├── useEffect: loads from sessionStorage
        ├── Summary Card
        ├── Ranked Diagnoses Section
        │   ├── For each diagnosis:
        │   │   ├── Rank Badge
        │   │   ├── Confidence Bar (dynamic color)
        │   │   ├── Severity Badge
        │   │   ├── Supporting Findings
        │   │   └── Metrics Breakdown (collapsible)
        ├── Input Findings Card
        └── Evidence Base Card
```

### State Management

**Current**: React useState + sessionStorage
```typescript
// Upload page
const [noteText, setNoteText] = useState("");
const [isLoading, setIsLoading] = useState(false);

// On analysis complete
sessionStorage.setItem('analysisResults', JSON.stringify(response));
router.push('/results');

// Results page
const data = sessionStorage.getItem('analysisResults');
const results = JSON.parse(data);
```

**Future**: Consider Redux/Zustand for:
- User authentication state
- Analysis history
- Multi-document comparison
- Global settings

---

### Styling Architecture

**Tailwind CSS + Custom CSS Variables**

**globals.css:**
```css
:root {
  /* Brand Colors */
  --primary: #6366f1;       /* Indigo */
  --secondary: #8b5cf6;     /* Purple */
  --accent: #ec4899;        /* Pink */
  
  /* Semantic Colors */
  --critical: #ef4444;      /* Red */
  --high: #f97316;          /* Orange */
  --medium: #eab308;        /* Yellow */
  --low: #22c55e;           /* Green */
  
  /* Backgrounds */
  --bg-dark: #0f172a;       /* Slate-900 */
  --bg-card: rgba(255, 255, 255, 0.1);  /* Glassmorphism */
}

/* Custom Animations */
@keyframes blob {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}

.animate-blob {
  animation: blob 7s infinite;
}
```

**Design System:**
- **Typography**: Font hierarchy (xl, 2xl, 3xl for headings)
- **Spacing**: 4px grid (p-4, p-6, p-8)
- **Colors**: Semantic (not just "red", but "critical")
- **Components**: Reusable patterns (cards, badges, bars)

---

## 🔒 Security Architecture

### Current Security Measures

1. **Input Validation**
```python
class SummarizeRequest(BaseModel):
    note: str
    
    @validator('note')
    def validate_note(cls, v):
        if not v or not v.strip():
            raise ValueError("Note cannot be empty")
        if len(v) > 4000:
            v = v[:4000]  # Truncate (DoS prevention)
        return v
```

2. **CORS Configuration**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Whitelist
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

3. **File Upload Limits**
```python
# Implicit in FastAPI/Starlette
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
```

---

### Security Roadmap (Production)

#### Phase 1: Authentication
```python
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer

security = HTTPBearer()

async def verify_token(credentials = Depends(security)):
    token = credentials.credentials
    # Verify JWT
    if not is_valid_token(token):
        raise HTTPException(status_code=401)
    return get_user_from_token(token)

@app.post("/summarize-hypothesize")
async def analyze(request: SummarizeRequest, user = Depends(verify_token)):
    # User authenticated
    pass
```

#### Phase 2: Rate Limiting
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/summarize-hypothesize")
@limiter.limit("10/minute")  # 10 requests per minute
async def analyze(request: SummarizeRequest):
    pass
```

#### Phase 3: Encryption
- **At Rest**: Encrypt KB files (AES-256)
- **In Transit**: HTTPS/TLS only
- **Secrets**: Use environment variables, not hardcoded

#### Phase 4: Audit Logging
```python
import logging

audit_logger = logging.getLogger("audit")

async def log_analysis(user_id, note_length, result):
    audit_logger.info(f"User {user_id} analyzed {note_length} chars")
```

---

## 📊 Performance Optimization

### Current Performance Profile

**Bottlenecks:**
1. **Model Loading**: 5-10 seconds (first request only)
2. **Summarization**: 2-5 seconds (per note)
3. **Embedding**: 100-500ms (per note)
4. **FAISS Search**: <10ms (negligible)

**Optimization Strategy:**

#### 1. Model Caching (Already Implemented)
```python
summarizer_model = None

def get_summarizer():
    global summarizer_model
    if summarizer_model is None:
        summarizer_model = load_model()  # Load once
    return summarizer_model
```

#### 2. Batch Processing (Future)
```python
# Instead of processing one note at a time
notes = ["note1", "note2", "note3"]
embeddings = model.encode(notes)  # Batch encoding (3x faster)
```

#### 3. Model Quantization (Future)
```python
# Reduce model size by 75% with minimal accuracy loss
from transformers import BitsAndBytesConfig

quantization_config = BitsAndBytesConfig(load_in_8bit=True)
model = AutoModel.from_pretrained(
    "model_name",
    quantization_config=quantization_config
)
```

#### 4. GPU Acceleration (Future)
```python
import torch

device = "cuda" if torch.cuda.is_available() else "cpu"
model.to(device)

# Expected speedup: 10-50x for summarization
```

#### 5. Caching Results (Future)
```python
from functools import lru_cache
import hashlib

@lru_cache(maxsize=100)
def analyze_cached(note_hash):
    # Cache results for identical notes
    return analyze(note)

# Usage
note_hash = hashlib.md5(note.encode()).hexdigest()
result = analyze_cached(note_hash)
```

---

## 🧪 Testing Strategy

### Unit Tests (Example)

```python
# tests/test_extraction.py
import pytest
from api.main import extract_clinical_findings

def test_symptom_extraction():
    note = "Patient complains of chest pain and dyspnea."
    findings = extract_clinical_findings(note)
    
    assert len(findings) > 0
    assert any(f['category'] == 'Symptoms' for f in findings)
    assert any('chest pain' in f['text'].lower() for f in findings)

def test_empty_note():
    findings = extract_clinical_findings("")
    assert len(findings) == 0

def test_long_note_truncation():
    long_note = "word " * 5000  # Very long
    result = process_note(long_note)
    assert len(result['note']) <= 4000
```

### Integration Tests

```python
# tests/test_api.py
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert "kb_docs" in response.json()

def test_summarize_endpoint():
    response = client.post(
        "/summarize-hypothesize",
        json={"note": "Patient with dyspnea and edema."}
    )
    assert response.status_code == 200
    data = response.json()
    assert "summary" in data
    assert "ranked_diagnoses" in data
    assert len(data["ranked_diagnoses"]) > 0
```

### Load Testing (Future)

```python
# locustfile.py
from locust import HttpUser, task

class MedGenUser(HttpUser):
    @task
    def analyze_note(self):
        self.client.post(
            "/summarize-hypothesize",
            json={"note": "Sample medical note..."}
        )

# Run: locust -f locustfile.py
# Simulates 100+ concurrent users
```

---

## 🚀 Deployment Architecture

### Development (Current)
```
Localhost:
  - Frontend: http://localhost:3000 (Next.js dev server)
  - Backend: http://127.0.0.1:8000 (Uvicorn dev mode)
  - No database, file-based KB
```

### Production (Recommended)

#### Option 1: Cloud Platform (Vercel + Railway)

**Frontend (Vercel):**
```bash
# Deploy Next.js
cd apps/web
vercel deploy --prod

# Environment variables
NEXT_PUBLIC_API_URL=https://api.medgen.ai
```

**Backend (Railway):**
```bash
# railway.json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pip install -r requirements.txt"
  },
  "deploy": {
    "startCommand": "uvicorn api.main:app --host 0.0.0.0 --port $PORT",
    "healthcheckPath": "/health"
  }
}
```

#### Option 2: Docker Containers

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  frontend:
    build: ./apps/web
    ports:
      - "3000:3000"
    environment:
      - API_URL=http://backend:8000
    depends_on:
      - backend

  backend:
    build: ./services/api
    ports:
      - "8000:8000"
    volumes:
      - ./kb:/app/kb
    environment:
      - MODEL_CACHE_DIR=/app/.cache
```

**Dockerfile (Backend):**
```dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Option 3: Kubernetes (Enterprise)

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: medgen-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: medgen-api
  template:
    metadata:
      labels:
        app: medgen-api
    spec:
      containers:
      - name: api
        image: medgen/api:latest
        ports:
        - containerPort: 8000
        resources:
          requests:
            memory: "2Gi"
            cpu: "1"
          limits:
            memory: "4Gi"
            cpu: "2"
```

---

## 📈 Monitoring & Observability

### Metrics to Track

**Application Metrics:**
- Request rate (requests/second)
- Response time (p50, p95, p99)
- Error rate (4xx, 5xx)
- Active users

**AI Metrics:**
- Model inference time
- Embedding generation time
- FAISS search latency
- Confidence score distribution

**Business Metrics:**
- Analyses per day
- User retention
- Average note length
- Most common diagnoses

### Monitoring Stack (Future)

```python
# Prometheus metrics
from prometheus_fastapi_instrumentator import Instrumentator

Instrumentator().instrument(app).expose(app)

# Custom metrics
from prometheus_client import Counter, Histogram

analysis_counter = Counter('analyses_total', 'Total analyses')
inference_time = Histogram('inference_seconds', 'Inference time')

@app.post("/summarize-hypothesize")
async def analyze(request: SummarizeRequest):
    with inference_time.time():
        result = process(request.note)
    analysis_counter.inc()
    return result
```

---

## 🔧 Debugging & Troubleshooting

### Debugging Tools

**FastAPI Debug Mode:**
```python
# api/main.py
app = FastAPI(debug=True)  # Detailed error messages

# Run with reload
uvicorn api.main:app --reload --log-level debug
```

**Logging:**
```python
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def extract_clinical_findings(note):
    logger.debug(f"Extracting from note of length {len(note)}")
    findings = regex_extract(note)
    logger.info(f"Found {len(findings)} findings")
    return findings
```

**Profiling:**
```python
import cProfile
import pstats

profiler = cProfile.Profile()
profiler.enable()

# Your code here
result = analyze_note(note)

profiler.disable()
stats = pstats.Stats(profiler)
stats.sort_stats('cumulative')
stats.print_stats(10)  # Top 10 slowest functions
```

---

## 📚 Code Organization Best Practices

### Current Structure (Single File)
```
services/api/api/main.py (478 lines)
  - All functions in one file
  - Works for MVP
  - Getting large...
```

### Recommended Refactoring (Future)

```
services/api/api/
├── main.py (150 lines)
│   - FastAPI app setup
│   - Endpoints only
│
├── models/
│   ├── request.py (Pydantic request models)
│   ├── response.py (Pydantic response models)
│   └── confidence.py (Confidence calculation)
│
├── services/
│   ├── extraction.py (extract_clinical_findings)
│   ├── matching.py (match_findings_to_kb)
│   ├── ranking.py (rank_differential_diagnoses)
│   ├── summarization.py (get_summarizer, summarize)
│   └── kb.py (FAISS management)
│
├── core/
│   ├── config.py (Settings, constants)
│   └── dependencies.py (get_db, get_current_user)
│
└── utils/
    ├── logging.py
    └── helpers.py
```

---

## 🎓 Advanced Topics

### 1. Active Learning Loop

Improve model over time with user feedback:

```python
# Collect feedback
@app.post("/feedback")
async def submit_feedback(
    analysis_id: str,
    correct_diagnosis: str,
    confidence: int
):
    # Store in database
    save_feedback(analysis_id, correct_diagnosis, confidence)

# Periodically retrain
def retrain_model():
    feedback_data = load_feedback()
    # Fine-tune model on corrections
    fine_tune(model, feedback_data)
```

### 2. Explainable AI

Make confidence scores more transparent:

```python
import shap

def explain_prediction(note, diagnosis):
    # SHAP values show which words contributed
    explainer = shap.Explainer(model)
    shap_values = explainer(note)
    
    # Return word importance
    return {
        "diagnosis": diagnosis,
        "important_words": get_top_words(shap_values)
    }
```

### 3. Multi-Modal Analysis

Combine text + images:

```python
from transformers import CLIPModel

def analyze_with_image(note: str, xray_image: bytes):
    # Text embedding
    text_emb = text_model.encode(note)
    
    # Image embedding
    image_emb = image_model.encode(xray_image)
    
    # Combined analysis
    combined = concat([text_emb, image_emb])
    diagnosis = classifier(combined)
    return diagnosis
```

---

## 🏆 Best Practices Summary

### Code Quality
✅ Type hints everywhere (Python + TypeScript)
✅ Docstrings for all functions
✅ Meaningful variable names
✅ DRY principle (Don't Repeat Yourself)
✅ Error handling with try/except
✅ Input validation with Pydantic

### Performance
✅ Lazy loading for models
✅ Caching where appropriate
✅ Async/await for I/O operations
✅ Batch processing when possible
✅ Profiling before optimizing

### Security
✅ Input validation
✅ CORS properly configured
✅ No secrets in code
✅ Rate limiting (future)
✅ HTTPS in production

### Maintainability
✅ Consistent code style
✅ Comments for complex logic
✅ Modular architecture
✅ Version control (Git)
✅ Documentation up-to-date

---

**Last Updated**: November 1, 2025  
**Version**: 1.0.0  
**Audience**: Developers, Architects  
**Difficulty**: Intermediate to Advanced
