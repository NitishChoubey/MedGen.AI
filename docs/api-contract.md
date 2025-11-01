# MedGen.AI API Contract

## Base URL

**Development**: `http://localhost:8000`  
**Production**: `https://api.medgen.ai` (or your deployed URL)

## Authentication

Currently, the API is open for development. Future versions will require:
- API key in header: `X-API-Key: your_api_key`
- JWT tokens for user-specific operations

---

## Endpoints

### 1. Health Check

**Endpoint**: `GET /health`

**Description**: Check if the API is running and healthy.

**Request**: None

**Response**:
```json
{
  "status": "healthy"
}
```

**Status Codes**:
- `200 OK`: Service is healthy
- `503 Service Unavailable`: Service is down

---

### 2. Summarize Medical Note

**Endpoint**: `POST /summarize`

**Description**: Summarize a medical note using AI.

**Request Body**:
```json
{
  "note": "string (required, min length 10 chars)"
}
```

**Example Request**:
```json
{
  "note": "Patient: Jane Doe, 45-year-old female. Chief Complaint: Persistent cough and fever for 5 days. History of Present Illness: Patient presents with a productive cough that started 5 days ago. The cough produces yellow-green sputum. She reports fever up to 101.5°F, chills, and shortness of breath with exertion..."
}
```

**Response**:
```json
{
  "summary": "string"
}
```

**Example Response**:
```json
{
  "summary": "45-year-old female with 5-day history of productive cough with yellow-green sputum, fever (101.5°F), chills, and dyspnea on exertion. Right-sided pleuritic chest pain present. PMH includes hypertension and diabetes. Physical exam shows fever, tachypnea, decreased O2 sat (93%), and right lower lobe crackles. Assessment: likely community-acquired pneumonia."
}
```

**Status Codes**:
- `200 OK`: Successfully summarized
- `400 Bad Request`: Invalid input (empty note, too short, etc.)
- `500 Internal Server Error`: Server error during processing

---

### 3. Summarize and Generate Hypotheses

**Endpoint**: `POST /summarize_hypothesize`

**Description**: Summarize a medical note and generate diagnostic hypotheses using RAG.

**Request Body**:
```json
{
  "note": "string (required, min length 10 chars)"
}
```

**Example Request**:
```json
{
  "note": "Patient: John Smith, 68-year-old male. Chief Complaint: Increasing shortness of breath and leg swelling. History of Present Illness: Patient reports progressive dyspnea over the past 3 weeks, now occurring at rest. He has difficulty sleeping flat and needs 3 pillows..."
}
```

**Response**:
```json
{
  "summary": "string",
  "hypotheses": "string"
}
```

**Example Response**:
```json
{
  "summary": "68-year-old male with progressive dyspnea, orthopnea (3-pillow), bilateral lower extremity edema, and 8-pound weight gain over one week. PMH significant for CAD s/p MI, HTN, and medication non-compliance. Exam reveals elevated JVP, bibasilar crackles, S3 gallop, and 3+ pitting edema. Assessment: decompensated heart failure.",
  "hypotheses": "Differential Diagnoses:\n\n1. Acute Decompensated Heart Failure (Most Likely)\n   - Evidence: Progressive dyspnea, orthopnea, peripheral edema, weight gain, S3 gallop, elevated JVP, bibasilar crackles\n   - Risk factors: History of CAD and MI, medication non-compliance\n   - Recommendation: BNP, echocardiogram, chest X-ray, IV diuresis\n\n2. Acute Coronary Syndrome\n   - Evidence: History of CAD, dyspnea (anginal equivalent)\n   - Consider: Troponin levels, ECG\n\n3. Pulmonary Edema\n   - Evidence: Bibasilar crackles, dyspnea, orthopnea\n   - Related to heart failure but may need specific intervention"
}
```

**Status Codes**:
- `200 OK`: Successfully processed
- `400 Bad Request`: Invalid input
- `500 Internal Server Error`: Server error during processing

---

## Error Response Format

All error responses follow this format:

```json
{
  "detail": "string describing the error"
}
```

**Example Error Responses**:

```json
// 400 Bad Request
{
  "detail": "Note cannot be empty"
}

// 500 Internal Server Error
{
  "detail": "An error occurred while processing the note"
}
```

---

## Rate Limiting (Future)

Future versions will implement rate limiting:
- **Free tier**: 100 requests per day
- **Pro tier**: 1000 requests per day
- **Enterprise**: Custom limits

Rate limit headers will be included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1635724800
```

---

## Data Privacy & Security

### Current Implementation
- No data is stored
- All processing is stateless
- CORS enabled for development

### Future Implementation
- End-to-end encryption
- HIPAA compliance
- Audit logging
- Data retention policies
- User consent management

---

## Versioning

API versioning will be introduced in future releases:
- **Current**: No version (v1 implied)
- **Future**: `/v2/summarize`, `/v3/summarize`, etc.

---

## Client Libraries

### JavaScript/TypeScript (Web)
```typescript
import axios from 'axios'

const API_URL = 'http://localhost:8000'

const summarize = async (note: string) => {
  const response = await axios.post(`${API_URL}/summarize`, { note })
  return response.data
}
```

### Dart (Flutter Mobile)
```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

Future<Map<String, dynamic>> summarize(String note) async {
  final response = await http.post(
    Uri.parse('http://localhost:8000/summarize'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({'note': note}),
  );
  return jsonDecode(response.body);
}
```

### Python
```python
import requests

API_URL = "http://localhost:8000"

def summarize(note: str):
    response = requests.post(f"{API_URL}/summarize", json={"note": note})
    return response.json()
```

---

## Testing

Use the provided sample notes in `samples/` directory for testing:
- `note1.txt`: Pneumonia case
- `note2.txt`: Heart failure case

---

## Support

For API questions or issues:
- GitHub Issues: [Your Repo URL]
- Email: support@medgen.ai
- Documentation: [Your Docs URL]
