# 🚀 Getting Started with MedGen.AI

## 📖 What is MedGen.AI?

**MedGen.AI** is an AI-powered medical note analysis system that helps healthcare professionals quickly understand complex clinical documentation and generate evidence-based differential diagnoses.

### 🎯 The Problem

Medical professionals face several challenges:
- **Information Overload**: Clinical notes can be lengthy and unstructured
- **Time Constraints**: Reading and analyzing notes takes valuable time
- **Knowledge Gaps**: Keeping up with all medical conditions is challenging
- **Documentation Quality**: Important findings may be buried in text
- **Decision Support**: Need quick, evidence-based diagnostic suggestions

### ✨ The Solution

MedGen.AI automatically:
1. **Extracts Key Findings**: Identifies symptoms, history, vitals from unstructured text
2. **Summarizes Notes**: Creates concise, clinical summaries
3. **Generates Differential Diagnoses**: Provides ranked, evidence-based diagnostic possibilities
4. **Shows Confidence Scores**: Transparent 0-100% confidence with scoring breakdown
5. **Traces Evidence**: Links findings to medical knowledge base for verification
6. **Ranks by Severity**: Critical, High, Medium, Low urgency indicators

---

## 🎬 Quick Demo

### Input (Sample Clinical Note):
```
67-year-old male presents with progressive dyspnea over 3 months.
Reports orthopnea, paroxysmal nocturnal dyspnea, and bilateral pedal edema.
History of hypertension and diabetes. On physical exam: elevated JVP,
bilateral crackles, S3 gallop. Labs show elevated BNP.
```

### Output (In Seconds):
- ✅ **Summary**: "67M with progressive dyspnea, orthopnea, PND, edema..."
- ✅ **Ranked Diagnoses**:
  1. Heart Failure (87% confidence, High severity)
  2. Pneumonia (45% confidence, Medium severity)
  3. Anemia (32% confidence, Low severity)
- ✅ **Evidence**: Citations from medical knowledge base
- ✅ **Traceability**: Shows which findings support each diagnosis

---

## 🏗️ How It Works (Simple Version)

```
Your Medical Note
        ↓
   [PDF/Text Input]
        ↓
   Extract Findings (AI) ← "dyspnea", "edema", "elevated BNP"
        ↓
   Search Knowledge Base (FAISS Vector Search)
        ↓
   Find Relevant Conditions ← Heart Failure, Pneumonia, etc.
        ↓
   Calculate Confidence Scores (Multi-factor Algorithm)
        ↓
   Rank by Confidence + Severity
        ↓
   Generate Summary (DistilBART AI)
        ↓
   Display Results with Citations
```

---

## 🎯 Who Is This For?

### Primary Users:
- **Medical Students**: Learning differential diagnosis
- **Residents**: Quick reference during rounds
- **Attending Physicians**: Second opinion verification
- **Clinical Researchers**: Analyzing case studies
- **Medical Educators**: Teaching diagnostic reasoning

### Use Cases:
1. **Emergency Department**: Quick triage and differential generation
2. **Outpatient Clinics**: Pre-visit note review
3. **Medical Education**: Case-based learning
4. **Research**: Retrospective chart review
5. **Quality Assurance**: Documentation review

---

## 🔧 System Requirements

### Minimum Requirements:
- **OS**: Windows 10/11, macOS 10.15+, Ubuntu 20.04+
- **RAM**: 4GB minimum (8GB recommended)
- **CPU**: Dual-core processor (Quad-core recommended)
- **Disk Space**: 2GB for models + dependencies
- **Internet**: Only for initial setup (offline after installation)

### Software Prerequisites:
- **Python**: 3.11 or 3.12 (Anaconda recommended)
- **Node.js**: 18.x or 20.x LTS
- **Git**: Latest version (for cloning repository)
- **Text Editor**: VS Code recommended (with extensions)

### Recommended VS Code Extensions:
- Python (Microsoft)
- Pylance
- ESLint
- Tailwind CSS IntelliSense
- Prettier

---

## 📦 Installation Guide

### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/MedGen.AI.git
cd MedGen.AI
```

### Step 2: Setup Backend (Python API)

#### Option A: Using Anaconda (Recommended)
```bash
# Navigate to API directory
cd services/api

# Create conda environment
conda create -n medgen python=3.12 -y
conda activate medgen

# Install dependencies
pip install -r requirements.txt

# Verify installation
python -c "import transformers; print('✅ Transformers installed')"
python -c "import faiss; print('✅ FAISS installed')"
```

#### Option B: Using venv
```bash
cd services/api

# Create virtual environment
python -m venv venv

# Activate (Windows)
.\venv\Scripts\Activate.ps1

# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Step 3: Setup Frontend (Next.js Web App)
```bash
# Navigate to web directory
cd ../../apps/web

# Install dependencies
npm install

# Verify installation
npm run build
```

### Step 4: Verify Knowledge Base
```bash
# Check KB files exist
ls ../../kb/

# Should see:
# - anemia.txt
# - heart_failure.txt
# - pneumonia.txt
# - tuberculosis.txt
```

---

## 🚀 Running the Application

### Terminal 1: Start Backend API
```bash
# Navigate to services directory
cd d:\MedGen.AI\services

# Set Python path (Windows PowerShell)
$env:PYTHONPATH="d:\MedGen.AI\services\api"

# Start server
python -m uvicorn api.main:app --reload --host 127.0.0.1 --port 8000
```

**Expected Output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
Initializing embedding model for KB...
Embedding model loaded!
Loaded 23 document chunks from 4 files
FAISS index created successfully!
INFO:     Application startup complete.
```

✅ **Backend is ready!** API available at: http://127.0.0.1:8000

### Terminal 2: Start Frontend Web App
```bash
# Navigate to web directory
cd d:\MedGen.AI\apps\web

# Start development server
npm run dev
```

**Expected Output:**
```
▲ Next.js 14.2.15
- Local:        http://localhost:3000

✓ Ready in 2s
```

✅ **Frontend is ready!** Open browser to: http://localhost:3000

---

## 🎮 Using the Application

### Step 1: Access Landing Page
1. Open browser to `http://localhost:3000`
2. You'll see the beautiful landing page with animated effects
3. Click **"Get Started"** or **"Try Demo"**

### Step 2: Upload Medical Note
1. **Option A - Upload PDF**:
   - Click "Upload PDF"
   - Select a medical document
   - Text will be auto-extracted

2. **Option B - Paste Text**:
   - Click in the text area
   - Paste your clinical note
   - Or click "Load Sample" for example notes

3. **Option C - Try Sample**:
   - Click "Load Sample: Heart Failure"
   - Pre-filled note appears

### Step 3: Generate Analysis
1. Click **"Generate Analysis"** button
2. Wait 3-8 seconds for AI processing
3. Automatically redirects to Results page

### Step 4: Review Results

#### 📝 Clinical Summary
- Concise, factual summary of the note
- Key findings highlighted
- Easy to scan format

#### 🎯 Prioritized Differential Diagnoses
For each diagnosis, you'll see:
- **Rank**: #1, #2, #3, etc.
- **Condition Name**: e.g., "Heart Failure"
- **Confidence Bar**: Visual 0-100% indicator
  - 🟢 Green (75-100%): High confidence
  - 🟡 Yellow (50-74%): Medium confidence
  - 🔴 Red (0-49%): Low confidence
- **Severity Badge**: Critical/High/Medium/Low
- **Description**: Brief explanation from KB
- **Supporting Findings**: Which symptoms match (with % relevance)
- **Metrics Breakdown**: How confidence was calculated

#### 🔍 Key Findings from Patient Note
- Extracted symptoms, history, vitals
- Categorized (Symptoms, History, Physical Exam, etc.)
- Traceable back to original text

#### 📚 Evidence Base
- Top 6 most relevant KB passages
- Citations with source files
- Matching findings with relevance scores

### Step 5: Actions
- **Print Report**: Generate PDF for records
- **Analyze Another Document**: Return to upload page
- **Copy Results**: Select text to copy

---

## 📊 Understanding the Results

### Confidence Scores Explained

Confidence is calculated using **three factors**:

#### 1. Rank Score (40% weight)
- Based on position in search results
- Higher relevance = higher score
- Formula: `40 - (rank - 1) × 10`
- Example: Rank 1 = 40 pts, Rank 2 = 30 pts

#### 2. Findings Match Score (35% weight)
- Number of patient findings that match condition
- More matches = higher confidence
- Formula: `min(35, finding_count × 12)`
- Example: 3 findings = 36 pts (capped at 35)

#### 3. Relevance Score (25% weight)
- Semantic similarity strength
- Based on embedding cosine similarity
- Formula: `avg_relevance × 25`
- Example: 0.8 similarity = 20 pts

**Total Confidence = Rank + Findings + Relevance (max 100%)**

### Severity Levels

| Level | Meaning | Examples | Color |
|-------|---------|----------|-------|
| **Critical** | Life-threatening, immediate attention | Sepsis, MI, PE | 🔴 Red |
| **High** | Urgent, needs prompt evaluation | Pneumonia, Stroke | 🟠 Orange |
| **Medium** | Important, schedule soon | Anemia, UTI | 🟡 Yellow |
| **Low** | Non-urgent, routine follow-up | Mild conditions | 🟢 Green |

Detected by keywords in knowledge base:
- Critical: "emergency", "acute", "life-threatening"
- High: "urgent", "severe", "rapid"
- Medium: "chronic", "moderate"
- Low: "mild", "benign"

### Relevance Percentages

Shows how well a finding matches KB evidence:
- **80-100%**: Excellent match
- **60-79%**: Good match
- **40-59%**: Moderate match
- **20-39%**: Weak match
- **<20%**: Poor match (filtered out)

---

## 🧪 Testing with Sample Data

### Sample Medical Notes

The `/samples` folder contains test cases:

#### Sample 1: Heart Failure Case
```bash
# Load sample in UI, or use API directly:
curl -X POST http://127.0.0.1:8000/summarize-hypothesize \
  -H "Content-Type: application/json" \
  -d @samples/note1.txt
```

**Expected Top Diagnosis**: Heart Failure (70-90% confidence)

#### Sample 2: Tuberculosis Case
Similar pattern for TB-like presentation.

### Creating Your Own Test Cases

1. Create `.txt` file in `/samples`
2. Include clinical findings:
   - Chief complaint
   - History (HPI, PMH)
   - Physical exam findings
   - Lab/imaging results
3. Save and test through UI or API

---

## 🔍 API Endpoints Reference

### Health Check
```bash
GET http://127.0.0.1:8000/health
```

**Response:**
```json
{
  "status": "healthy",
  "kb_docs": 4,
  "kb_chunks": 23
}
```

### Main Analysis Endpoint
```bash
POST http://127.0.0.1:8000/summarize-hypothesize
Content-Type: application/json

{
  "note": "67M with progressive dyspnea..."
}
```

**Response:**
```json
{
  "summary": "67-year-old male presents with...",
  "differential_and_plan": "DIFFERENTIAL DIAGNOSIS:\n1. Heart Failure...",
  "ranked_diagnoses": [
    {
      "rank": 1,
      "condition": "Heart Failure",
      "confidence": 87.5,
      "severity": "High",
      "description": "Heart failure is a chronic...",
      "source": "heart_failure.txt",
      "supporting_findings": [...],
      "metrics": {...}
    }
  ],
  "citations": [...],
  "input_findings": [...]
}
```

### PDF Text Extraction
```bash
POST http://127.0.0.1:8000/extract-pdf
Content-Type: multipart/form-data

file: [PDF binary]
```

**Response:**
```json
{
  "text": "Extracted text from PDF...",
  "page_count": 3
}
```

---

## ❓ Frequently Asked Questions

### Q: Is this ready for clinical use?
**A**: No. MedGen.AI is a **research/educational tool** only. It should NOT be used for actual patient diagnosis. Always consult qualified medical professionals.

### Q: Does it need internet after setup?
**A**: No! After downloading models during first run, everything runs **offline** on your local machine.

### Q: Can I add more medical conditions?
**A**: Yes! Simply add `.txt` files to the `/kb` folder with medical information. Restart the API to rebuild the index.

### Q: What languages are supported?
**A**: Currently **English only**. The AI models are trained on English medical text.

### Q: How accurate is it?
**A**: Accuracy depends on:
- Quality of knowledge base content
- Completeness of input notes
- Similarity to training data

Always verify results against medical literature and clinical judgment.

### Q: Can I customize the confidence algorithm?
**A**: Yes! Edit `calculate_diagnosis_confidence()` in `services/api/api/main.py` to adjust weights and factors.

### Q: What's the maximum note length?
**A**: Currently **4000 characters**. Longer notes are truncated. This can be adjusted in the code.

### Q: Does it store patient data?
**A**: No. All processing is done in-memory. No data is saved to disk unless you explicitly export results.

### Q: Can I deploy this to production?
**A**: Yes, but you'll need:
- Proper authentication
- HIPAA compliance measures
- Database for audit logs
- SSL/TLS encryption
- Legal review and disclaimers

### Q: How can I improve accuracy?
1. Add more KB documents (10-50 per condition)
2. Use domain-specific embedding models
3. Fine-tune the summarization model
4. Collect user feedback for model retraining
5. Adjust confidence thresholds

---

## 🐛 Troubleshooting

### Issue: "ModuleNotFoundError: No module named 'api'"
**Solution:**
```bash
# Set PYTHONPATH correctly
$env:PYTHONPATH="d:\MedGen.AI\services\api"
```

### Issue: "Port 8000 already in use"
**Solution:**
```bash
# Find and kill process using port 8000 (Windows)
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Or use different port
uvicorn api.main:app --port 8001
```

### Issue: Models downloading slowly
**Solution:**
- Models download on first run (takes 5-10 minutes)
- Total size: ~370MB (DistilBART 287MB + MiniLM 80MB)
- Use faster internet or download manually from Hugging Face

### Issue: "FAISS index creation failed"
**Solution:**
- Ensure `/kb` folder has `.txt` files
- Check file encoding (should be UTF-8)
- Verify files have actual content (not empty)

### Issue: Frontend shows "Network Error"
**Solution:**
- Verify backend is running on port 8000
- Check CORS settings in `main.py`
- Ensure no firewall blocking localhost

### Issue: Low confidence scores for obvious diagnosis
**Solution:**
- KB may lack detailed information on that condition
- Add more comprehensive medical text to KB
- Check if findings are being extracted correctly
- Review `extract_clinical_findings()` regex patterns

---

## 🎓 Learning Resources

### To Understand the AI:
- **RAG Explained**: https://arxiv.org/abs/2005.11401
- **FAISS Tutorial**: https://www.pinecone.io/learn/faiss/
- **Transformers Course**: https://huggingface.co/course

### To Improve the Code:
- **FastAPI Docs**: https://fastapi.tiangolo.com
- **Next.js Learn**: https://nextjs.org/learn
- **Medical NLP**: https://github.com/EmilyAlsentzer/clinicalBERT

### Medical Knowledge:
- **UpToDate**: Clinical decision support
- **PubMed**: Medical literature
- **StatPearls**: Free medical textbook

---

## 🎯 Next Steps

Now that you're up and running:

1. **✅ Test with Sample Notes**: Try the provided examples
2. **✅ Customize Knowledge Base**: Add your own medical content
3. **✅ Experiment with Confidence**: Adjust scoring algorithm
4. **✅ Improve UI**: Modify Tailwind styles to your liking
5. **✅ Add Authentication**: Implement user accounts (NextAuth.js)
6. **✅ Deploy**: Host on cloud provider (see TECHNICAL_GUIDE.md)

---

## 📞 Getting Help

If you encounter issues:

1. **Check Logs**: Terminal output shows detailed errors
2. **API Docs**: Visit http://127.0.0.1:8000/docs for Swagger UI
3. **GitHub Issues**: [Repository URL]
4. **Documentation**: Read TECHNICAL_GUIDE.md for deep dives
5. **Community**: [Discord/Slack link if available]

---

## ⚠️ Important Disclaimers

### Medical Disclaimer
> MedGen.AI is an **educational and research tool** only. It is NOT:
> - FDA approved for clinical use
> - A substitute for professional medical advice
> - Validated for patient diagnosis
> - Intended for treatment decisions
>
> **Always consult qualified healthcare professionals for medical decisions.**

### Liability
The developers assume no liability for:
- Medical decisions made using this tool
- Inaccuracies in generated diagnoses
- Data privacy breaches (user's responsibility in deployment)
- Any harm resulting from use or misuse

### Privacy
- All processing is local by default
- No data sent to external APIs
- Users responsible for HIPAA compliance in production
- Consider de-identifying notes before analysis

---

## 🎉 You're Ready!

Congratulations! You now have a working AI medical analysis system. 

**Happy analyzing!** 🚀🏥

---

**Last Updated**: November 1, 2025  
**Version**: 1.0.0  
**Difficulty**: Beginner-Friendly  
**Estimated Setup Time**: 30-45 minutes
