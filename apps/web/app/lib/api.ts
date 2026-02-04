import axios from "axios";

// Get API URL from environment variable
// In production, this must be set to your deployed backend URL
const API = process.env.NEXT_PUBLIC_API_URL || "";

// Check if API URL is configured
if (!API && typeof window !== "undefined") {
  console.error(
    "NEXT_PUBLIC_API_URL is not configured. " +
    "Please set it in your environment variables to your deployed backend URL."
  );
}

export type InputFinding = { 
  category: string; 
  text: string; 
  start: number; 
  end: number;
};

export type MatchingFinding = {
  text: string;
  category: string;
  relevance: number;
};

export type Citation = { 
  rank: number; 
  passage: string; 
  source: string;
  matching_findings?: MatchingFinding[];
};

export type SupportingFinding = {
  text: string;
  category: string;
  relevance: number;
};

export type ConfidenceBreakdown = {
  rank_score: number;
  findings_score: number;
  relevance_score: number;
};

export type DiagnosisMetrics = {
  total_findings: number;
  avg_relevance: number;
  confidence_breakdown: ConfidenceBreakdown;
};

export type RankedDiagnosis = {
  rank: number;
  condition: string;
  confidence: number;
  severity: "Critical" | "High" | "Medium" | "Low";
  description: string;
  source: string;
  supporting_findings: SupportingFinding[];
  metrics: DiagnosisMetrics;
};

export type SummarizeResp = {
  summary: string;
  differential_and_plan: string;
  ranked_diagnoses?: RankedDiagnosis[];
  citations: Citation[];
  input_findings?: InputFinding[];
};

export async function health() {
  if (!API) {
    throw new Error("Backend API is not configured. Please set NEXT_PUBLIC_API_URL environment variable.");
  }
  const { data } = await axios.get(`${API}/health`, { timeout: 15000 });
  return data as { ok: boolean; kb_docs?: number };
}

export async function summarize(note: string) {
  if (!API) {
    throw new Error("Backend API is not configured. Please set NEXT_PUBLIC_API_URL environment variable.");
  }
  const { data } = await axios.post(`${API}/summarize`, { note }, { timeout: 120000 });
  return data as { summary: string };
}

export async function summarizeHypothesize(note: string, topK = 4) {
  if (!API) {
    throw new Error("Backend API is not configured. Please set NEXT_PUBLIC_API_URL environment variable.");
  }
  const { data } = await axios.post(
    `${API}/summarize_hypothesize`,
    { note, top_k: topK },
    { timeout: 120000 }
  );
  return data as SummarizeResp;
}

export async function extractPdf(file: File) {
  if (!API) {
    throw new Error("Backend API is not configured. Please set NEXT_PUBLIC_API_URL environment variable.");
  }
  const form = new FormData();
  form.append("file", file);
  const { data } = await axios.post(`${API}/extract_pdf`, form, {
    timeout: 120000,
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data as { text: string };
}

