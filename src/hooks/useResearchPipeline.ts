import { useCallback, useEffect, useRef, useState } from 'react';
import type { Paper, PipelineEvent, ResearchStep, ResearchStepId } from '../types';
import { runResearchPipeline } from '../services/researchPipeline';

// ─── localStorage persistence ────────────────────────────────────────────────

const STORAGE_PAPERS = 'deepresearch.papers.v1';
const STORAGE_REVIEW = 'deepresearch.review.v1';

function loadPapers(): Paper[] {
  try {
    const raw = localStorage.getItem(STORAGE_PAPERS);
    return raw ? (JSON.parse(raw) as Paper[]) : [];
  } catch {
    return [];
  }
}

function savePapers(papers: Paper[]) {
  try { localStorage.setItem(STORAGE_PAPERS, JSON.stringify(papers)); } catch {}
}

function saveReview(review: string | null) {
  try {
    if (review) localStorage.setItem(STORAGE_REVIEW, review);
    else localStorage.removeItem(STORAGE_REVIEW);
  } catch {}
}

// ─── initial steps ───────────────────────────────────────────────────────────

const INITIAL_STEPS: ResearchStep[] = [
  {
    id: 'coordinate',
    status: 'pending',
    label: '任务解析',
    description: '验证研究主题，检查 API 配置。',
  },
  {
    id: 'plan',
    status: 'pending',
    label: '检索规划',
    description: '生成覆盖多子方向的英文学术搜索词。',
  },
  {
    id: 'research',
    status: 'pending',
    label: '文献检索',
    description: '在 Semantic Scholar、arXiv、Google Scholar 中逐源检索真实文献。',
  },
  {
    id: 'analyze',
    status: 'pending',
    label: '深度分析',
    description: '提取跨文献的主题、方法论与研究争议。',
  },
  {
    id: 'report',
    status: 'pending',
    label: '综述撰写',
    description: '基于真实文献按 APA 第七版撰写学术综述。',
  },
];

function resetSteps(): ResearchStep[] {
  return INITIAL_STEPS.map((s) => ({ ...s, status: 'pending' }));
}

// ─── hook ────────────────────────────────────────────────────────────────────

export interface UseResearchPipelineReturn {
  papers: Paper[];
  review: string | null;
  steps: ResearchStep[];
  logs: string[];
  queries: string[];
  isRunning: boolean;
  startResearch: (topic: string) => void;
  addPaper: (paper: Paper) => void;
}

export function useResearchPipeline(): UseResearchPipelineReturn {
  const [papers, setPapers] = useState<Paper[]>(() => loadPapers());
  const [review, setReview] = useState<string | null>(
    () => localStorage.getItem(STORAGE_REVIEW),
  );
  const [steps, setSteps] = useState<ResearchStep[]>(INITIAL_STEPS);
  const [logs, setLogs] = useState<string[]>([]);
  const [queries, setQueries] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Persist papers & review
  useEffect(() => { savePapers(papers); }, [papers]);
  useEffect(() => { saveReview(review); }, [review]);

  const updateStep = useCallback((id: ResearchStepId, status: ResearchStep['status']) => {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
  }, []);

  const addLog = useCallback((msg: string) => {
    const ts = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${ts}] ${msg}`]);
  }, []);

  const handleEvent = useCallback(
    (event: PipelineEvent) => {
      switch (event.type) {
        case 'step_start':
          updateStep(event.stepId, 'running');
          addLog(event.message);
          break;
        case 'step_done':
          updateStep(event.stepId, 'completed');
          break;
        case 'step_error':
          updateStep(event.stepId, 'error');
          addLog(`⚠ ${event.message}`);
          break;
        case 'log':
          addLog(event.message);
          break;
        case 'plan_ready':
          setQueries(event.queries);
          break;
        case 'paper_found':
          setPapers((prev) => [...prev, event.paper]);
          break;
        case 'analysis_ready':
          addLog(`分析完成：${event.analysis.themes.slice(0, 3).join('、')}`);
          break;
        case 'review_ready':
          setReview(event.review);
          break;
        case 'source_done':
          // already logged inside pipeline
          break;
        case 'pipeline_done':
          setIsRunning(false);
          break;
      }
    },
    [updateStep, addLog],
  );

  // Use a ref to hold handleEvent so startResearch closure is stable
  const handleEventRef = useRef(handleEvent);
  handleEventRef.current = handleEvent;

  const startResearch = useCallback((topic: string) => {
    // Reset state for new search
    setPapers([]);
    setReview(null);
    setLogs([]);
    setQueries([]);
    setSteps(resetSteps());
    setIsRunning(true);

    runResearchPipeline(topic, (e) => handleEventRef.current(e)).finally(() => {
      setIsRunning(false);
    });
  }, []);

  const addPaper = useCallback((paper: Paper) => {
    setPapers((prev) => {
      const exists = prev.some((p) => p.id === paper.id || p.title === paper.title);
      return exists ? prev : [paper, ...prev];
    });
  }, []);

  return { papers, review, steps, logs, queries, isRunning, startResearch, addPaper };
}
