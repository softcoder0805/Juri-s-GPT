export interface CaseResult {
  id: string;
  title: string;
  citation: string;
  court: string;
  date: string;
  topics: string[];
  summary: string;
  relevanceScore: number;
}

export interface SearchFiltersType {
  jurisdictions: string[];
  dateRange: string | null;
  topics: string[];
}
