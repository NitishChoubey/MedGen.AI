from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import pipeline
from sentence_transformers import SentenceTransformer
import faiss, os, glob, re
from typing import List, Dict, Any
from io import BytesIO
from PyPDF2 import PdfReader

app = FastAPI(title="MediScribe.AI API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for lazy loading
summarizer = None
embedder = None

def get_summarizer():
    global summarizer
    if summarizer is None:
        print("Loading summarization model (this may take a minute)...")
        # Using smaller, faster model
        summarizer = pipeline("summarization", model="sshleifer/distilbart-cnn-12-6")
        print("Summarization model loaded!")
    return summarizer

def get_embedder():
    global embedder
    if embedder is None:
        print("Loading embedding model...")
        embedder = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
        print("Embedding model loaded!")
    return embedder

print("Initializing embedding model for KB...")
embedder = get_embedder()

# build KB index
KB_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "kb"))
print(f"Looking for KB documents in: {KB_DIR}")
docs, meta = [], []
for path in sorted(glob.glob(os.path.join(KB_DIR, "*.txt"))):
    text = open(path, "r", encoding="utf-8").read().strip()
    for i, chunk in enumerate([c.strip() for c in text.replace("\n"," ").split(". ") if c.strip()]):
        docs.append(chunk)
        meta.append({"file": os.path.basename(path), "chunk_idx": i})

print(f"Loaded {len(docs)} document chunks from {len(set(m['file'] for m in meta))} files")

# Only create index if we have documents
if docs:
    print("Creating FAISS index...")
    emb = embedder.encode(docs, normalize_embeddings=True)
    index = faiss.IndexFlatIP(emb.shape[1])
    index.add(emb)
    print("FAISS index created successfully!")
else:
    print(f"WARNING: No documents found in {KB_DIR}")
    index = None

class SummarizeReq(BaseModel):
    note: str
class SHReq(BaseModel):
    note: str
    top_k: int = 4

@app.get("/health")
def health():
    return {"ok": True, "kb_docs": len(docs)}

@app.post("/summarize")
def summarize(inp: SummarizeReq):
    model = get_summarizer()
    s = model(inp.note, max_length=160, min_length=40, do_sample=False)[0]["summary_text"]
    return {"summary": s}

def retrieve(note: str, k: int):
    if not docs or index is None:
        return []
    emb = get_embedder()
    q = emb.encode([note], normalize_embeddings=True)
    _, ids = index.search(q, min(k, len(docs)))
    return [{"rank": r+1, "passage": docs[i], "source": meta[i]["file"]} for r, i in enumerate(ids[0])]

def extract_clinical_findings(note: str) -> List[Dict[str, Any]]:
    """Extract key clinical findings from the input note for traceability."""
    findings = []
    
    # Medical finding patterns
    patterns = {
        "symptoms": r"(?:complains? of|reports?|presents? with|experiencing|symptoms? of|suffering from)\s+([^.;]+)",
        "vitals": r"(?:BP|blood pressure|HR|heart rate|temp|temperature|SpO2|oxygen saturation)[:\s]+([^.;,]+)",
        "physical_exam": r"(?:on examination|physical exam|exam reveals?|findings?)[:\s]+([^.;]+)",
        "history": r"(?:history of|previous|past medical history|PMH)[:\s]+([^.;]+)",
        "labs": r"(?:lab|laboratory|test|results?|showed?|revealed?)[:\s]+([^.;]+)",
        "diagnosis": r"(?:diagnosed with|diagnosis of|impression)[:\s]+([^.;]+)",
    }
    
    note_lower = note.lower()
    sentences = [s.strip() for s in re.split(r'[.;]', note) if s.strip()]
    
    for category, pattern in patterns.items():
        matches = re.finditer(pattern, note_lower, re.IGNORECASE)
        for match in matches:
            finding_text = match.group(1).strip()
            if len(finding_text) > 10:  # Filter out too short findings
                # Find the actual text in original note (preserve case)
                start_pos = match.start(1)
                end_pos = match.end(1)
                original_text = note[start_pos:end_pos].strip()
                
                findings.append({
                    "category": category.replace("_", " ").title(),
                    "text": original_text,
                    "start": start_pos,
                    "end": end_pos
                })
    
    # If no patterns matched, extract key sentences with medical terms
    if not findings:
        medical_terms = [
            "pain", "fever", "cough", "fatigue", "nausea", "vomiting", 
            "headache", "dizziness", "chest", "abdomen", "shortness of breath",
            "swelling", "weakness", "confusion", "hypertension", "diabetes",
            "elevated", "decreased", "abnormal", "positive", "negative"
        ]
        
        for i, sentence in enumerate(sentences[:5]):  # Check first 5 sentences
            sentence_lower = sentence.lower()
            if any(term in sentence_lower for term in medical_terms):
                findings.append({
                    "category": "Clinical Finding",
                    "text": sentence,
                    "start": note.find(sentence),
                    "end": note.find(sentence) + len(sentence)
                })
    
    return findings[:10]  # Limit to top 10 findings

def match_findings_to_kb(findings: List[Dict], kb_evidence: List[Dict]) -> List[Dict]:
    """Match input findings to KB evidence for better traceability."""
    emb = get_embedder()
    
    if not findings:
        return kb_evidence
    
    # Encode findings
    finding_texts = [f["text"] for f in findings]
    finding_embeddings = emb.encode(finding_texts, normalize_embeddings=True)
    
    # For each KB evidence, find most relevant findings
    enhanced_evidence = []
    for ev in kb_evidence:
        ev_embedding = emb.encode([ev["passage"]], normalize_embeddings=True)
        
        # Calculate similarity scores
        similarities = finding_embeddings @ ev_embedding.T
        similarities = similarities.flatten()
        
        # Find top matching findings
        top_indices = similarities.argsort()[-3:][::-1]  # Top 3 matches
        matching_findings = [
            {
                "text": findings[idx]["text"],
                "category": findings[idx]["category"],
                "relevance": float(similarities[idx])
            }
            for idx in top_indices if similarities[idx] > 0.3  # Threshold for relevance
        ]
        
        enhanced_evidence.append({
            **ev,
            "matching_findings": matching_findings
        })
    
    return enhanced_evidence

def calculate_diagnosis_confidence(condition: Dict, findings: List[Dict], evidence_rank: int) -> Dict:
    """
    Calculate comprehensive confidence score for a diagnosis.
    Returns confidence percentage, severity level, and supporting metrics.
    """
    
    # Base score from evidence rank (higher rank = higher base score)
    rank_score = max(0, 40 - (evidence_rank - 1) * 10)  # 40, 30, 20, 10 for ranks 1-4
    
    # Matching findings score (up to 35 points)
    matching_findings = condition.get('matching_findings', [])
    finding_count = len(matching_findings)
    finding_score = min(35, finding_count * 12)  # 12 points per matching finding, max 35
    
    # Relevance score from matching findings (up to 25 points)
    relevance_scores = [mf.get('relevance', 0) for mf in matching_findings]
    avg_relevance = sum(relevance_scores) / len(relevance_scores) if relevance_scores else 0
    relevance_score = avg_relevance * 25  # Convert to 0-25 scale
    
    # Calculate total confidence (0-100%)
    total_confidence = min(100, rank_score + finding_score + relevance_score)
    
    # Determine severity based on keywords and confidence
    condition_text = condition.get('passage', '').lower()
    severity = "Medium"
    urgency_keywords = {
        "Critical": ["sepsis", "myocardial infarction", "stroke", "aneurysm", "hemorrhage", "respiratory failure", "cardiac arrest"],
        "High": ["pneumonia", "heart failure", "tuberculosis", "acute", "severe", "emergency"],
        "Medium": ["chronic", "stable", "moderate", "infection"],
        "Low": ["mild", "benign", "uncomplicated", "simple"]
    }
    
    for severity_level, keywords in urgency_keywords.items():
        if any(keyword in condition_text for keyword in keywords):
            severity = severity_level
            break
    
    # Boost confidence for high severity conditions with good matches
    if severity in ["Critical", "High"] and finding_count >= 2:
        total_confidence = min(100, total_confidence + 10)
    
    return {
        "confidence": round(total_confidence, 1),
        "severity": severity,
        "supporting_findings_count": finding_count,
        "average_relevance": round(avg_relevance, 3),
        "rank_contribution": rank_score,
        "findings_contribution": finding_score,
        "relevance_contribution": round(relevance_score, 1)
    }

def extract_condition_name(passage: str, source: str) -> str:
    """Extract clean condition/disease name from passage and source."""
    # Try to get disease name from source file first
    source_name = source.replace('.txt', '').replace('_', ' ').title()
    
    # Common disease patterns in text
    disease_patterns = [
        r'([A-Z][a-z]+(?:\s+[a-z]+)*)\s+is\s+a',  # "Anemia is a..."
        r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+occurs',  # "Heart Failure occurs..."
        r'([A-Z][a-z]+(?:\s+[a-z]+)*)\s+presents',
        r'([A-Z][a-z]+(?:\s+[a-z]+)*)\s+characterized',
    ]
    
    for pattern in disease_patterns:
        match = re.search(pattern, passage)
        if match:
            return match.group(1).strip()
    
    # Fallback: use source name or first few words
    if source_name and len(source_name) < 50:
        return source_name
    
    # Last resort: first sentence
    first_sentence = passage.split('.')[0].strip()
    if len(first_sentence) < 80:
        return first_sentence
    
    return first_sentence[:75] + "..."

def rank_differential_diagnoses(findings: List[Dict], evidence: List[Dict]) -> List[Dict]:
    """
    Create ranked differential diagnoses with confidence scores and severity indicators.
    Returns list of structured diagnosis objects sorted by confidence.
    """
    
    diagnoses = []
    
    for idx, ev in enumerate(evidence[:6], 1):  # Consider top 6 evidence pieces
        passage = ev['passage']
        
        # Filter for actual medical conditions
        if any(keyword in passage.lower() for keyword in [
            'anemia', 'failure', 'pneumonia', 'tuberculosis', 'infection', 'disease',
            'syndrome', 'disorder', 'condition', 'diagnosis'
        ]):
            # Extract condition name
            condition_name = extract_condition_name(passage, ev['source'])
            
            # Calculate confidence and severity
            metrics = calculate_diagnosis_confidence({
                'passage': passage,
                'matching_findings': ev.get('matching_findings', [])
            }, findings, idx)
            
            # Get supporting findings
            supporting_findings = []
            for mf in ev.get('matching_findings', [])[:3]:  # Top 3 findings
                supporting_findings.append({
                    'text': mf['text'],
                    'category': mf.get('category', 'Clinical Finding'),
                    'relevance': round(mf.get('relevance', 0), 3)
                })
            
            diagnoses.append({
                'rank': idx,
                'condition': condition_name,
                'confidence': metrics['confidence'],
                'severity': metrics['severity'],
                'description': passage[:200] + '...' if len(passage) > 200 else passage,
                'source': ev['source'],
                'supporting_findings': supporting_findings,
                'metrics': {
                    'total_findings': metrics['supporting_findings_count'],
                    'avg_relevance': metrics['average_relevance'],
                    'confidence_breakdown': {
                        'rank_score': metrics['rank_contribution'],
                        'findings_score': metrics['findings_contribution'],
                        'relevance_score': metrics['relevance_contribution']
                    }
                }
            })
    
    # Sort by confidence score (descending)
    diagnoses.sort(key=lambda x: x['confidence'], reverse=True)
    
    # Update ranks after sorting
    for idx, dx in enumerate(diagnoses, 1):
        dx['rank'] = idx
    
    return diagnoses[:5]  # Return top 5

def compose_dx_prompt(summary: str, ev_list: List[dict]):
    """Create a structured prompt for generating clinical differential diagnosis."""
    # Extract key medical concepts from evidence
    ev_concepts = []
    for e in ev_list[:3]:  # Use top 3 most relevant pieces
        passage = e['passage']
        # Extract disease names, conditions (usually capitalized or after "of")
        if any(term in passage.lower() for term in ['diagnosis', 'condition', 'disease', 'syndrome']):
            ev_concepts.append(passage.split('.')[0])  # First sentence only
    
    ev_text = " ".join(ev_concepts) if ev_concepts else ""
    
    return (
        f"Patient Summary: {summary}\n\n"
        f"Medical Context: {ev_text}\n\n"
        "Generate a clinical assessment with:\n"
        "1. DIFFERENTIAL DIAGNOSES: List 3-4 conditions with likelihood (High/Moderate/Low) and key supporting findings\n"
        "2. RECOMMENDED WORKUP: List specific tests needed\n"
        "3. CLINICAL PLAN: Brief next steps\n\n"
        "Format each diagnosis as: [Condition] (Likelihood) - Key findings\n"
        "Be concise, clinical, and evidence-based."
    )

def format_clinical_assessment(raw_dx: str, findings: List[Dict], evidence: List[Dict]) -> str:
    """Format the differential diagnosis into a structured clinical assessment."""
    
    # Extract key symptoms from findings for context
    key_symptoms = []
    for f in findings[:3]:
        if f['category'] in ['Symptoms', 'Physical Exam', 'Clinical Finding']:
            key_symptoms.append(f['text'].lower())
    
    # Build structured assessment
    assessment = []
    
    # Add clinical impression header
    assessment.append("DIFFERENTIAL DIAGNOSES:\n")
    
    # Extract conditions from evidence and create structured list
    conditions = []
    for ev in evidence[:4]:  # Top 4 evidence pieces
        passage = ev['passage']
        # Try to extract condition/disease names
        if any(keyword in passage.lower() for keyword in ['anemia', 'failure', 'pneumonia', 'tuberculosis', 'infection', 'disease']):
            # Get the condition name (usually at start or after "is" or "of")
            sentences = passage.split('.')
            if sentences:
                condition_line = sentences[0].strip()
                if len(condition_line) > 10 and len(condition_line) < 150:
                    # Determine likelihood based on matching findings
                    matching_count = len(ev.get('matching_findings', []))
                    if matching_count >= 2:
                        likelihood = "High"
                    elif matching_count == 1:
                        likelihood = "Moderate"  
                    else:
                        likelihood = "Consider"
                    
                    conditions.append({
                        'name': condition_line,
                        'likelihood': likelihood,
                        'source': ev['source'].replace('.txt', '').title(),
                        'findings': ev.get('matching_findings', [])[:2]
                    })
    
    # Format conditions
    for i, cond in enumerate(conditions[:4], 1):
        assessment.append(f"{i}. {cond['name']} - {cond['likelihood']} likelihood")
        if cond['findings']:
            finding_texts = [f['text'][:60] + '...' if len(f['text']) > 60 else f['text'] for f in cond['findings']]
            assessment.append(f"   Supporting: {', '.join(finding_texts)}")
        assessment.append("")
    
    # Add recommended workup section
    assessment.append("\nRECOMMENDED WORKUP:")
    assessment.append("• Complete blood count (CBC) with differential")
    assessment.append("• Comprehensive metabolic panel (CMP)")
    assessment.append("• Chest X-ray if respiratory symptoms present")
    assessment.append("• Additional testing based on clinical suspicion")
    
    # Add clinical plan
    assessment.append("\nCLINICAL PLAN:")
    assessment.append("• Review all laboratory results")
    assessment.append("• Monitor vital signs and symptom progression")
    assessment.append("• Consider specialist consultation if indicated")
    assessment.append("• Follow up within 48-72 hours or sooner if symptoms worsen")
    
    return "\n".join(assessment)

@app.post("/summarize_hypothesize")
def summarize_hypothesize(inp: SHReq):
    model = get_summarizer()
    
    # Truncate input if too long (max 1024 tokens ≈ 800 words)
    note_text = inp.note[:4000] if len(inp.note) > 4000 else inp.note
    
    # Generate concise clinical summary
    summary_prompt = f"Summarize this medical note focusing on chief complaint, key findings, and vital signs:\n\n{note_text}"
    s = model(
        summary_prompt[:1000],  # Keep prompt focused
        max_length=120,  # Shorter, more focused summary
        min_length=30, 
        do_sample=False,
        truncation=True,
        max_new_tokens=None
    )[0]["summary_text"]
    
    # Extract clinical findings from input for traceability
    findings = extract_clinical_findings(note_text)
    
    # Retrieve KB evidence
    ev = retrieve(note_text, inp.top_k)
    
    # Match findings to KB evidence
    enhanced_ev = match_findings_to_kb(findings, ev)
    
    # Generate prioritized differential diagnoses with confidence scoring
    ranked_diagnoses = rank_differential_diagnoses(findings, enhanced_ev)
    
    # Compose prompt with evidence (truncate if needed)
    prompt = compose_dx_prompt(s, enhanced_ev)
    prompt_truncated = prompt[:2500] if len(prompt) > 2500 else prompt
    
    # Generate differential diagnosis with truncation
    dx_raw = model(
        prompt_truncated, 
        max_length=200, 
        min_length=80, 
        do_sample=False,
        truncation=True,
        max_new_tokens=None
    )[0]["summary_text"]
    
    # Format into structured clinical assessment
    dx = format_clinical_assessment(dx_raw, findings, enhanced_ev)
    
    return {
        "summary": s,
        "differential_and_plan": dx,
        "ranked_diagnoses": ranked_diagnoses,  # NEW: Prioritized diagnoses with confidence scores
        "citations": enhanced_ev[:3],  # Limit to top 3 most relevant citations
        "input_findings": findings[:8]  # Limit to top 8 findings for cleaner display
    }

@app.post("/extract_pdf")
async def extract_pdf(file: UploadFile = File(...)):
    content = await file.read()
    pdf = PdfReader(BytesIO(content))
    text = "\n".join([p.extract_text() or "" for p in pdf.pages])
    return {"text": text.strip()}
