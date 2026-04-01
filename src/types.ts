export type ViewType = 'literature' | 'library';

export type PaperTier = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export interface Paper {
  id: string;
  title: string;
  authors: string;
  year: number;
  journal: string;
  tier: PaperTier;
  doi: string;
  sourceUrl?: string;
  fullTextUrl?: string;
  abstract: string;
  abstractZh?: string;
  abstractEn?: string;
  tags: string[];
}

export type PaperDraft = Omit<Paper, 'id'>;

export type LibrarySource = 'search' | 'upload';

export interface LibraryPaper extends Paper {
  source: LibrarySource;
  savedAt: string;
}

/** DeerFlow-style 5-stage pipeline */
export type ResearchStepId = 'coordinate' | 'plan' | 'research' | 'analyze' | 'report';

export interface ResearchStep {
  id: ResearchStepId;
  status: 'pending' | 'running' | 'completed' | 'error';
  label: string;
  description: string;
}

export interface ThemeAnalysis {
  themes: string[];
  methods: string[];
  controversies: string[];
  gaps: string[];
}

export type PipelineEvent =
  | { type: 'step_start'; stepId: ResearchStepId; message: string }
  | { type: 'step_done'; stepId: ResearchStepId }
  | { type: 'step_error'; stepId: ResearchStepId; message: string }
  | { type: 'log'; message: string }
  | { type: 'plan_ready'; queries: string[] }
  | { type: 'paper_found'; paper: Paper }
  | { type: 'source_done'; source: string; count: number }
  | { type: 'analysis_ready'; analysis: ThemeAnalysis }
  | { type: 'review_ready'; review: string }
  | { type: 'pipeline_done' };

export type PipelineEventHandler = (event: PipelineEvent) => void;

export interface LiteratureReviewResult {
  content: string;
  references: Paper[];
}

export type AppErrorCode = 'CONFIG_ERROR' | 'AI_RESPONSE_INVALID' | 'UNKNOWN_ERROR';

export interface AppErrorShape {
  code: AppErrorCode;
  userMessage: string;
  details?: string;
}
