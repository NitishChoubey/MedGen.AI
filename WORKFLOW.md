# 🔄 MedGen.AI - Complete System Workflow

> **Step-by-step breakdown of how the entire system works from user input to results display**

---

## 🎯 High-Level Overview

```
User Browser (Next.js Frontend)
         ↓
    User Action
         ↓
    API Request (HTTP)
         ↓
FastAPI Backend (Python)
         ↓
    AI Processing
         ↓
    API Response (JSON)
         ↓
    Results Display
```

---

## 📋 Detailed Workflow (Step-by-Step)

### **PHASE 1: User Visits Website**

#### **Step 1: Landing Page Load**
```
Location: http://localhost:3000/

What Happens:
1. User opens browser and navigates to MedGen.AI
2. Next.js server sends the landing page HTML/CSS/JS
3. Browser renders the landing page with:
   - Hero section with project title
   - Problem statement explanation
   - "Get Started" button
   - Features overview
   - How it works section

Files Involved:
- apps/web/app/page.tsx (redirects to /landing)
- apps/web/app/landing/page.tsx (landing page UI)
- apps/web/app/globals.css (styles)

User Action: Clicks "Get Started" or "Upload Note" button
```

---

### **PHASE 2: Upload Page**

#### **Step 2: Navigate to Upload Page**
```
Location: http://localhost:3000/upload

What Happens:
1. Next.js router changes URL to /upload
2. Upload page component loads
3. Browser renders upload interface with:
   - File upload dropzone (for PDF files)
   - Text area (for copy-paste)
   - "Analyze Note" button
   - Sample notes for testing

Files Involved:
- apps/web/app/upload/page.tsx (upload page UI)

User Action: Either:
  Option A: Uploads a PDF file
  Option B: Pastes clinical note text
  Then clicks "Analyze Note"
```

#### **Step 3: User Input Validation (Frontend)**
```
Location: Still on /upload page

What Happens:
1. JavaScript checks if input is provided
2. If empty → Show error message "Please provide a clinical note"
3. If valid → Show loading state (spinner/progress)
4. Button becomes disabled during processing
5. Prepare to send data to backend

Code Location:
- apps/web/app/upload/page.tsx (handleSubmit function)

Next Step: Make API request
```

---

### **PHASE 3: API Request**

#### **Step 4: Send Data to Backend**
```
API Endpoint: POST http://127.0.0.1:8000/summarize-hypothesize

Request Format:
{
  "note": "Patient is a 65-year-old male presenting with..."
}

What Happens:
1. Frontend collects the clinical note text
2. If PDF was uploaded → Extract text from PDF first
3. Create JSON payload with note text
4. Send HTTP POST request using Axios/Fetch
5. Wait for response (typically 3-8 seconds)

Files Involved:
- apps/web/lib/api.ts (API functions)
- apps/web/app/upload/page.tsx (calls the API)

Code Example:
const response = await fetch('http://127.0.0.1:8000/summarize-hypothesize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ note: clinicalNoteText })
});
```

---

### **PHASE 4: Backend Processing**

#### **Step 5: FastAPI Receives Request**
```
Location: services/api/api/main.py

What Happens:
1. FastAPI receives POST request at /summarize-hypothesize endpoint
2. Pydantic validates the request body:
   - Checks if "note" field exists
   - Validates it's a string
   - Returns 422 error if invalid
3. Extracts the note text from request

Code Location:
- services/api/api/main.py (line ~400-478)
- @app.post("/summarize-hypothesize") endpoint

Request Object:
class SHReq(BaseModel):
    note: str
    top_k: int = 4  # Number of KB results to retrieve
```

#### **Step 6: Extract Clinical Findings**
```
Function: extract_clinical_findings(note)

What Happens:
1. Takes the raw clinical note text as input
2. Uses regex patterns to find:
   - Symptoms: "complains of", "reports", "presents with"
   - Vitals: "BP", "HR", "temp", "SpO2"
   - Physical Exam: "on examination", "exam reveals"
   - History: "history of", "past medical history"
   - Labs: "lab", "test results", "showed"
   - Diagnosis: "diagnosed with", "impression"

3. For each match found:
   - Stores the exact text (preserves original case)
   - Stores start position (character index in note)
   - Stores end position
   - Categorizes the finding type

4. If no regex matches → Fall back to medical terms search
5. Returns list of findings (max 10)

Example Output:
[
  {
    "category": "Symptoms",
    "text": "shortness of breath and leg swelling",
    "start": 127,
    "end": 163
  },
  {
    "category": "Vitals",
    "text": "BP 150/95, HR 98",
    "start": 245,
    "end": 261
  }
]

Code Location:
- services/api/api/main.py (lines 96-147)
```

#### **Step 7: Retrieve Knowledge Base Evidence**
```
Function: retrieve(note, k=4)

What Happens:
1. Loads the Sentence-BERT embedding model
   - Model: sentence-transformers/all-MiniLM-L6-v2
   - Creates 384-dimensional vectors

2. Encodes the clinical note into a vector:
   - Converts text → numerical representation
   - Normalizes the vector (for cosine similarity)

3. Searches FAISS index:
   - Compares query vector to all KB chunk vectors
   - Uses Inner Product search (fast similarity)
   - Retrieves top K most similar chunks (default K=4)

4. Returns results with metadata:
   - Rank (1-4, higher = more relevant)
   - Passage (the KB text chunk)
   - Source (which KB file it came from)

Example Output:
[
  {
    "rank": 1,
    "passage": "Heart failure is a condition where the heart cannot pump blood effectively...",
    "source": "heart_failure.txt"
  },
  {
    "rank": 2,
    "passage": "Pneumonia is an infection of the lungs...",
    "source": "pneumonia.txt"
  }
]

Code Location:
- services/api/api/main.py (lines 89-94)

Technical Details:
- FAISS Index Type: IndexFlatIP (Inner Product)
- Embedding Dimension: 384
- KB Chunks: 23 total (from 4 text files)
- Search Time: ~10-50ms
```

#### **Step 8: Match Findings to Knowledge Base**
```
Function: match_findings_to_kb(findings, kb_evidence)

What Happens:
1. Takes extracted findings from Step 6
2. Takes KB evidence from Step 7

3. For each KB evidence chunk:
   a. Encode the KB passage into a vector
   b. Encode all patient findings into vectors
   c. Calculate semantic similarity (dot product)
   d. Find top 3 findings that match this KB chunk
   e. Filter matches with relevance > 0.3 (30%)

4. Enhances each KB evidence with:
   - matching_findings: List of relevant patient symptoms
   - relevance: Score (0.0-1.0) for each match

Example Output:
[
  {
    "rank": 1,
    "passage": "Heart failure is characterized by...",
    "source": "heart_failure.txt",
    "matching_findings": [
      {
        "text": "shortness of breath",
        "category": "Symptoms",
        "relevance": 0.923  # 92.3% relevant
      },
      {
        "text": "bilateral edema",
        "category": "Physical Exam",
        "relevance": 0.881  # 88.1% relevant
      }
    ]
  }
]

Code Location:
- services/api/api/main.py (lines 149-182)

Technical Details:
- Similarity Metric: Cosine similarity (via normalized dot product)
- Threshold: 0.3 (filters low-relevance matches)
- Top K per evidence: 3 findings
```

#### **Step 9: Rank Differential Diagnoses**
```
Function: rank_differential_diagnoses(kb_evidence)

What Happens:
1. Takes KB evidence with matched findings

2. For each KB evidence chunk:
   a. Extract condition name from source file
      Example: "heart_failure.txt" → "Heart Failure"
   
   b. Calculate confidence score (0-100%):
      - Rank Score (40 points max):
        • Rank 1 = 40 pts, Rank 2 = 30 pts, etc.
      - Findings Score (35 points max):
        • Count matching findings
        • Each finding = 12 points (max 35)
      - Relevance Score (25 points max):
        • Average relevance of findings × 25
      - Severity Boost (up to +10 points):
        • "Critical" keywords → +10
        • "High" keywords → +5
   
   c. Determine severity level:
      - Scan for keywords:
        • "sepsis", "MI" → Critical
        • "pneumonia", "heart failure" → High
        • "chronic", "stable" → Medium
        • "mild", "benign" → Low
   
   d. Create diagnosis object with:
      - Condition name
      - Description (first 200 chars of KB passage)
      - Confidence percentage
      - Severity level
      - Supporting findings
      - Metrics breakdown

3. Sort diagnoses by confidence (highest first)
4. Return top 5 diagnoses

Example Output:
[
  {
    "condition": "Heart Failure",
    "description": "Heart failure is a condition where...",
    "confidence": 87.3,
    "severity": "High",
    "supporting_findings": [
      {
        "text": "shortness of breath",
        "category": "Symptoms",
        "relevance": 0.923
      }
    ],
    "metrics": {
      "confidence_breakdown": {
        "rank_score": 40,
        "findings_score": 24,
        "relevance_score": 23.3
      },
      "supporting_findings_count": 3,
      "average_relevance": 0.897
    },
    "kb_source": "heart_failure.txt"
  }
]

Code Location:
- services/api/api/main.py (lines 263-370)

Confidence Formula:
Total = Rank_Score + Findings_Score + Relevance_Score + Severity_Boost
      = (40-10×(rank-1)) + (min(35, count×12)) + (avg_rel×25) + boost
      = 0-100 points
```

#### **Step 10: Generate Summary**
```
Function: get_summarizer() → pipeline("summarization")

What Happens:
1. Load DistilBART-CNN-12-6 model (if not already loaded)
   - Size: 287 MB
   - Fast, efficient summarization model

2. Process the clinical note:
   - Input: Full clinical note text
   - Max length: 160 tokens (output)
   - Min length: 40 tokens
   - No sampling (deterministic output)

3. Generate concise summary highlighting:
   - Key symptoms
   - Important findings
   - Critical information

Example:
Input: "Patient is a 65-year-old male presenting with acute onset of shortness of breath and bilateral lower extremity edema for the past 2 weeks. He has a history of hypertension and type 2 diabetes. Physical examination reveals BP 150/95, HR 98, bilateral crackles on lung auscultation, and 2+ pitting edema. Lab results show elevated BNP at 450 pg/mL."

Output: "65-year-old male with dyspnea and bilateral edema for 2 weeks. History of hypertension and diabetes. Exam shows elevated BP, tachycardia, lung crackles, and pitting edema. Labs reveal elevated BNP (450 pg/mL)."

Code Location:
- services/api/api/main.py (lines 25-31, 79-82)

Technical Details:
- Model: facebook/bart-cnn (distilled version)
- Reduction: ~60% smaller than full BART
- Speed: 2-3 seconds for typical note
```

#### **Step 11: Prepare Response**
```
Function: Main endpoint logic

What Happens:
1. Combine all processed data:
   - Summary text
   - Ranked diagnoses (top 5)
   - Input findings (for traceability)
   - KB evidence used

2. Structure response as JSON:
{
  "summary": "Patient summary...",
  "differential_and_plan": "Long-form clinical summary",
  "ranked_diagnoses": [...],  // From Step 9
  "input_findings": [...],    // From Step 6
  "evidence_base": [...]      // From Step 7
}

3. Send HTTP 200 response with JSON body

Code Location:
- services/api/api/main.py (lines 400-478)
```

---

### **PHASE 5: Frontend Receives Response**

#### **Step 12: Process API Response**
```
Location: apps/web/app/upload/page.tsx

What Happens:
1. Axios/Fetch receives JSON response
2. Check HTTP status:
   - 200 = Success → Continue
   - 4xx/5xx = Error → Show error message

3. Parse JSON response body

4. Store response data in browser:
   - localStorage.setItem('analysisResult', JSON.stringify(response))
   - This persists data even if page refreshes

5. Navigate to results page:
   - router.push('/results')
   - This triggers page change

Code Example:
const response = await fetch('...');
const data = await response.json();
localStorage.setItem('analysisResult', JSON.stringify(data));
router.push('/results');
```

---

### **PHASE 6: Results Display**

#### **Step 13: Results Page Load**
```
Location: http://localhost:3000/results

What Happens:
1. Next.js loads results page component
2. Results page checks for data:
   - const stored = localStorage.getItem('analysisResult')
   - Parse the JSON string back to object

3. If no data found:
   - Show "No analysis data found"
   - Redirect back to upload page

4. If data exists:
   - Parse and display results

Files Involved:
- apps/web/app/results/page.tsx (409 lines)

Code Location:
- useEffect hook (runs on page load)
```

#### **Step 14: Render Summary Card**
```
Section: Clinical Summary

What Displays:
┌─────────────────────────────────────────┐
│ 📋 Clinical Summary                     │
├─────────────────────────────────────────┤
│ 65-year-old male with dyspnea and      │
│ bilateral edema for 2 weeks...         │
└─────────────────────────────────────────┘

Data Source:
- response.summary (from Step 10)

Visual Elements:
- Gradient header (blue → purple)
- Clipboard icon
- White text on dark background
- Rounded corners with border

Code Location:
- apps/web/app/results/page.tsx (lines ~100-140)
```

#### **Step 15: Render Ranked Diagnoses**
```
Section: Prioritized Differential Diagnoses

What Displays:
┌────────────────────────────────────────────────────┐
│ 🎯 Prioritized Differential Diagnoses (Top 5)     │
├────────────────────────────────────────────────────┤
│ #1 ❤️ Heart Failure                    87% 🔴 High │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 87%          │
│                                                     │
│ 📋 Supporting Findings (3)                         │
│ [Symptoms] "shortness of breath" 92.3%            │
│ [Physical] "bilateral edema" 88.1%                │
│ [Labs] "BNP elevation" 90.0%                      │
│                                                     │
│ ▶ Confidence Metrics Breakdown                     │
│   Rank Score: 40.0 pts                            │
│   Findings Match: 24.0 pts                        │
│   Relevance Score: 23.3 pts                       │
│   Total Findings: 3                               │
│                                                     │
├────────────────────────────────────────────────────┤
│ #2 🫁 Pneumonia                         45% 🟡 Med │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 45%          │
│ ...                                                │
└────────────────────────────────────────────────────┘

Data Source:
- response.ranked_diagnoses (from Step 9)

Visual Elements:
- Rank number (#1, #2, etc.)
- Emoji icons per condition type
- Confidence bar (color-coded):
  • Green (80-100%): High confidence
  • Yellow (50-79%): Medium confidence
  • Red (0-49%): Lower confidence
- Severity badge:
  • 🔴 Critical (red)
  • 🟠 High (orange)
  • 🟡 Medium (yellow)
  • 🟢 Low (green)
- Supporting findings with relevance %
- Collapsible metrics section

Interactivity:
- Click "▶ Confidence Metrics" to expand/collapse
- Shows calculation breakdown
- Hover effects on cards

Code Location:
- apps/web/app/results/page.tsx (lines ~145-270)
```

#### **Step 16: Render Input Findings Card**
```
Section: Key Findings from Patient Note

What Displays:
┌─────────────────────────────────────────┐
│ 📄 Key Findings from Patient Note       │
│ Traced evidence from your input text    │
├─────────────────────────────────────────┤
│ [Symptoms] "shortness of breath and     │
│            leg swelling"                │
│                                         │
│ [Vitals]   "BP 150/95, HR 98"          │
│                                         │
│ [Labs]     "BNP 450 pg/mL"             │
│                                         │
│ [History]  "history of hypertension"    │
└─────────────────────────────────────────┘

Data Source:
- response.input_findings (from Step 6)

Purpose:
- Shows traceability
- Exact quotes from input note
- Proves AI extracted real information

Visual Elements:
- 2-column grid (desktop)
- Category badges (purple)
- Quoted text (italic)
- Gradient borders

Code Location:
- apps/web/app/results/page.tsx (lines ~287-323)
```

---

## 🗂️ Data Flow Summary

### **Complete Journey of Data:**

```
1. USER INPUT
   ↓
   "Patient presents with shortness of breath..."
   
2. FRONTEND (Next.js)
   ↓
   Validates input → Sends HTTP POST
   
3. BACKEND RECEIVES
   ↓
   FastAPI endpoint: /summarize-hypothesize
   
4. EXTRACT FINDINGS
   ↓
   Regex patterns → ["shortness of breath", "BP 150/95", ...]
   
5. ENCODE TO VECTORS
   ↓
   Sentence-BERT → [0.123, -0.456, 0.789, ...]
   
6. SEARCH KB (FAISS)
   ↓
   Vector similarity → Top 4 KB chunks
   
7. MATCH FINDINGS TO KB
   ↓
   Semantic matching → Relevance scores (0-1)
   
8. CALCULATE CONFIDENCE
   ↓
   Multi-factor algorithm → 0-100% scores
   
9. RANK DIAGNOSES
   ↓
   Sort by confidence → Top 5 list
   
10. GENERATE SUMMARY
    ↓
    DistilBART → Concise summary text
    
11. RETURN JSON RESPONSE
    ↓
    {summary, ranked_diagnoses, findings, evidence}
    
12. FRONTEND RECEIVES
    ↓
    Parse JSON → Store in localStorage
    
13. NAVIGATE TO RESULTS
    ↓
    router.push('/results')
    
14. RENDER RESULTS PAGE
    ↓
    Beautiful UI with all components
    
15. USER VIEWS RESULTS
    ↓
    Can export, analyze again, or review evidence
```

---

## ⚙️ Technical Architecture

### **Frontend Stack:**
```
Browser
  ├─ Next.js 14 (React framework)
  │   ├─ App Router (/landing, /upload, /results)
  │   ├─ Server Components
  │   └─ Client Components (with 'use client')
  │
  ├─ React 18
  │   ├─ useState (for form state)
  │   ├─ useEffect (for data loading)
  │   └─ useRouter (for navigation)
  │
  ├─ TypeScript
  │   └─ Type definitions in lib/api.ts
  │
  ├─ Tailwind CSS
  │   └─ Utility classes for styling
  │
  └─ Axios
      └─ HTTP client for API calls
```

### **Backend Stack:**
```
FastAPI Server
  ├─ Python 3.12
  │   └─ Anaconda environment
  │
  ├─ FastAPI Framework
  │   ├─ Route handlers (@app.post)
  │   ├─ Pydantic models (validation)
  │   └─ CORS middleware
  │
  ├─ AI/ML Libraries
  │   ├─ Transformers (Hugging Face)
  │   │   ├─ DistilBART (summarization)
  │   │   └─ Sentence-BERT (embeddings)
  │   │
  │   ├─ FAISS
  │   │   └─ Vector similarity search
  │   │
  │   └─ PyTorch
  │       └─ Model inference
  │
  └─ Knowledge Base
      ├─ kb/heart_failure.txt
      ├─ kb/pneumonia.txt
      ├─ kb/anemia.txt
      └─ kb/tuberculosis.txt
```

---

## 🔄 Request/Response Cycle

### **Timing Breakdown:**

```
Total Time: 3-8 seconds

1. Frontend → Backend (HTTP POST)
   Time: 10-50 ms
   
2. Extract Clinical Findings (Regex)
   Time: 50-100 ms
   
3. Encode Query (Sentence-BERT)
   Time: 100-300 ms
   
4. FAISS Vector Search
   Time: 10-50 ms
   
5. Match Findings to KB
   Time: 200-500 ms
   
6. Rank Diagnoses (Algorithm)
   Time: 10-30 ms
   
7. Generate Summary (DistilBART)
   Time: 2-3 seconds ← Slowest part
   
8. Prepare Response (JSON)
   Time: 10-30 ms
   
9. Backend → Frontend (HTTP Response)
   Time: 10-50 ms
   
10. Render Results Page
    Time: 100-300 ms
```

---

## 🌐 Network Communication

### **API Endpoints:**

```
1. Health Check
   GET http://127.0.0.1:8000/health
   Response: {"ok": true, "kb_docs": 23}
   
2. Summarize Only
   POST http://127.0.0.1:8000/summarize
   Body: {"note": "..."}
   Response: {"summary": "..."}
   
3. Main Analysis (Used by frontend)
   POST http://127.0.0.1:8000/summarize-hypothesize
   Body: {"note": "...", "top_k": 4}
   Response: {
     "summary": "...",
     "differential_and_plan": "...",
     "ranked_diagnoses": [...],
     "input_findings": [...],
     "evidence_base": [...]
   }
```

---

## 📊 Data Structures

### **Request Format:**
```typescript
{
  note: string,      // Clinical note text
  top_k?: number     // Number of KB results (default: 4)
}
```

### **Response Format:**
```typescript
{
  summary: string,
  differential_and_plan: string,
  ranked_diagnoses: [
    {
      condition: string,
      description: string,
      confidence: number,        // 0-100
      severity: string,          // "Critical" | "High" | "Medium" | "Low"
      supporting_findings: [
        {
          text: string,
          category: string,
          relevance: number      // 0-1
        }
      ],
      metrics: {
        confidence_breakdown: {
          rank_score: number,
          findings_score: number,
          relevance_score: number
        },
        supporting_findings_count: number,
        average_relevance: number
      },
      kb_source: string
    }
  ],
  input_findings: [
    {
      category: string,
      text: string,
      start: number,
      end: number
    }
  ],
  evidence_base: [
    {
      rank: number,
      passage: string,
      source: string,
      matching_findings: [...]
    }
  ]
}
```

---

## 🎯 Key Points to Remember

1. **Frontend → Backend**: HTTP POST with clinical note
2. **Backend Processing**: Extract → Retrieve → Match → Rank → Summarize
3. **Backend → Frontend**: JSON response with all data
4. **Frontend Display**: Parse and render beautiful UI
5. **localStorage**: Persists data between page navigations
6. **Total Time**: 3-8 seconds (mostly summarization)

---

## 🚀 For Your Pitch

### **Explain the workflow in 30 seconds:**

> "When a doctor uploads a clinical note, our system extracts key findings using pattern recognition, converts them to semantic vectors, searches our medical knowledge base using FAISS, matches patient symptoms to known conditions, calculates multi-factor confidence scores, generates a summary with DistilBART, and returns ranked diagnoses with full evidence trails—all in 5 seconds."

### **Explain the workflow simply:**

> "Upload a patient note → Our AI reads and extracts symptoms → Searches medical database → Ranks possible diagnoses → Shows results with evidence → Doctor reviews in 5 seconds instead of 30 minutes."

---

**This is your complete system workflow from start to finish!** 🎉

*Last Updated: November 1, 2025*  
*Version: 1.0 - Complete System Workflow*
