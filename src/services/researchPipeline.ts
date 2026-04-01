/**
 * DeerFlow-style research pipeline for academic literature review.
 *
 * Pipeline stages:
 *   Coordinator → Planner → Researcher → Analyst → Reporter
 *
 * Design rules:
 *   - NEVER emits fake papers or fake URLs
 *   - NEVER throws to the caller; all errors surface via step_error events
 *   - Papers stream in source-by-source for real-time UX
 */

import type { Paper, PipelineEvent, PipelineEventHandler, ResearchStepId, ThemeAnalysis } from '../types';
import {
  searchSemanticScholar,
  searchArxiv,
  searchSerperScholar,
  dedupeAndRank,
  hasResolvableSource,
  buildSubQueries,
  type SearchCandidate,
} from './literatureSearchService';
import { buildSearchQueries, analyzeThemes, generateApaReview } from './geminiService';

// ─── helpers ────────────────────────────────────────────────────────────────

function paperKey(p: Pick<SearchCandidate, 'doi' | 'title' | 'year'>): string {
  return p.doi && p.doi !== 'N/A'
    ? `doi:${p.doi.trim().toLowerCase()}`
    : `title:${p.title.trim().toLowerCase()}:${p.year}`;
}

function assignId(paper: Omit<Paper, 'id'>, index: number): Paper {
  return { ...paper, id: `pipeline-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}` };
}

// ─── pipeline ───────────────────────────────────────────────────────────────

export async function runResearchPipeline(
  topic: string,
  emit: PipelineEventHandler,
): Promise<void> {
  const step = (stepId: ResearchStepId, msg: string) =>
    emit({ type: 'step_start', stepId, message: msg });
  const done = (stepId: ResearchStepId) => emit({ type: 'step_done', stepId });
  const fail = (stepId: ResearchStepId, msg: string) =>
    emit({ type: 'step_error', stepId, message: msg });
  const log = (msg: string) => emit({ type: 'log', message: msg });

  // ── Coordinator: validate input & config ─────────────────────────────────
  step('coordinate', '正在解析研究主题…');

  const trimmedTopic = topic.trim();
  if (!trimmedTopic) {
    fail('coordinate', '请输入研究主题后再开始。');
    return;
  }
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    fail('coordinate', '未检测到 Gemini API Key，请在 .env.local 中配置 VITE_GEMINI_API_KEY。');
    return;
  }

  done('coordinate');

  // ── Planner: generate optimized English search queries ───────────────────
  step('plan', '正在规划检索策略…');

  let queries: string[];
  try {
    queries = await buildSearchQueries(trimmedTopic);
    log(`检索计划：${queries.join(' | ')}`);
    emit({ type: 'plan_ready', queries });
  } catch {
    // Degrade silently to template queries — never block the user
    queries = buildSubQueries(trimmedTopic);
    log(`检索计划（模板）：${queries.join(' | ')}`);
    emit({ type: 'plan_ready', queries });
  }

  done('plan');

  // ── Researcher: hit real APIs source by source ───────────────────────────
  step('research', `正在检索 Semantic Scholar、arXiv…（${queries.length} 组查询词）`);

  const allCandidates: SearchCandidate[] = [];
  const emittedKeys = new Set<string>();
  let paperIndex = 0;

  async function searchSource(
    sourceName: string,
    fetcher: (q: string) => Promise<SearchCandidate[]>,
  ) {
    const tasks = queries.map((q) => fetcher(q));
    const settled = await Promise.allSettled(tasks);
    const newCandidates: SearchCandidate[] = settled
      .filter((r): r is PromiseFulfilledResult<SearchCandidate[]> => r.status === 'fulfilled')
      .flatMap((r) => r.value);

    allCandidates.push(...newCandidates);

    // Deduplicate across all collected candidates so far, then emit NEW papers
    const ranked = dedupeAndRank(allCandidates).filter(hasResolvableSource);
    let newCount = 0;
    for (const candidate of ranked) {
      const key = paperKey(candidate);
      if (!emittedKeys.has(key)) {
        emittedKeys.add(key);
        const { citationCount: _c, ...draft } = candidate;
        const paper = assignId(draft, paperIndex++);
        emit({ type: 'paper_found', paper });
        newCount++;
      }
    }

    log(
      newCount > 0
        ? `${sourceName}：新增 ${newCount} 篇文献（累计 ${emittedKeys.size} 篇）`
        : `${sourceName}：未找到新增文献`,
    );
    emit({ type: 'source_done', source: sourceName, count: newCount });
  }

  await searchSource('Semantic Scholar', (q) => searchSemanticScholar(trimmedTopic, q, 5));
  await searchSource('arXiv', (q) => searchArxiv(trimmedTopic, q, 5));
  await searchSource('Google Scholar', (q) => searchSerperScholar(trimmedTopic, q, 4));

  if (emittedKeys.size === 0) {
    fail(
      'research',
      `在学术数据库中未找到与「${trimmedTopic}」相关的文献，请尝试更换主题或使用更具体的关键词。`,
    );
    return;
  }

  done('research');

  // Reconstruct final paper list in ranked order for the next stages
  const finalPapers: Paper[] = dedupeAndRank(allCandidates)
    .filter(hasResolvableSource)
    .slice(0, 10)
    .map(({ citationCount: _c, ...draft }, i) => assignId(draft, i));

  // ── Analyst: extract themes, methods, controversies ──────────────────────
  step('analyze', `正在分析 ${finalPapers.length} 篇文献的主题与方法论…`);

  let analysis: ThemeAnalysis | null = null;
  try {
    analysis = await analyzeThemes(trimmedTopic, finalPapers);
    if (analysis) {
      log(`主题分析：${analysis.themes.slice(0, 3).join('、')}`);
      emit({ type: 'analysis_ready', analysis });
    }
  } catch {
    // Silent degradation — Reporter writes without pre-analysis
  }

  done('analyze');

  // ── Reporter: write APA review using ONLY the found papers ───────────────
  step('report', `基于 ${finalPapers.length} 篇真实文献，正在撰写 APA 综述…`);

  let review: string;
  try {
    review = await generateApaReview(trimmedTopic, finalPapers, analysis);
  } catch (err) {
    const msg = err instanceof Error ? err.message : '综述生成失败，请稍后重试。';
    fail('report', msg);
    // Papers are already emitted — user can still see them in the panel
    return;
  }

  emit({ type: 'review_ready', review });
  done('report');
  emit({ type: 'pipeline_done' });
}
