import { GoogleGenAI, Type } from '@google/genai';
import { AppError } from '../lib/appError';
import type { Paper, PaperDraft, PaperTier, ThemeAnalysis } from '../types';
import { buildSubQueries } from './literatureSearchService';

const MODEL_NAME = 'gemini-3-flash-preview';

let aiClient: GoogleGenAI | null = null;

function getApiKey(): string {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) {
    throw new AppError(
      'CONFIG_ERROR',
      '未检测到 Gemini API Key，请在 .env.local 中配置 VITE_GEMINI_API_KEY。',
      'Missing VITE_GEMINI_API_KEY in environment variables.',
    );
  }
  return key;
}

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: getApiKey() });
  }
  return aiClient;
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Invalid JSON payload';
    throw new AppError('AI_RESPONSE_INVALID', '模型返回格式异常，请重试。', detail);
  }
}

function ensureString(value: unknown, field: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new AppError('AI_RESPONSE_INVALID', `字段 ${field} 缺失或格式错误。`);
  }
  return value.trim();
}

function ensureNumber(value: unknown, field: string): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new AppError('AI_RESPONSE_INVALID', `字段 ${field} 缺失或格式错误。`);
  }
  return value;
}

function normalizeTier(value: unknown, fallback: PaperTier = 'Q2'): PaperTier {
  if (value === 'Q1' || value === 'Q2' || value === 'Q3' || value === 'Q4') {
    return value;
  }
  return fallback;
}

function ensureTags(value: unknown): string[] {
  if (!Array.isArray(value)) {
    throw new AppError('AI_RESPONSE_INVALID', '字段 tags 缺失或格式错误。');
  }

  const tags = value
    .filter((tag): tag is string => typeof tag === 'string')
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 5);

  if (tags.length === 0) {
    throw new AppError('AI_RESPONSE_INVALID', '字段 tags 内容为空。');
  }

  return tags;
}

function containsChinese(text: string): boolean {
  return /[\u3400-\u9fff]/.test(text);
}

function resolveBilingualAbstract(
  abstract: unknown,
  abstractZh: unknown,
  abstractEn: unknown,
): { abstract: string; abstractZh: string; abstractEn: string } {
  const legacy = typeof abstract === 'string' ? abstract.trim() : '';
  const zh = typeof abstractZh === 'string' ? abstractZh.trim() : '';
  const en = typeof abstractEn === 'string' ? abstractEn.trim() : '';

  if (zh && en) {
    return { abstract: zh, abstractZh: zh, abstractEn: en };
  }

  if (legacy) {
    if (containsChinese(legacy)) {
      return { abstract: legacy, abstractZh: legacy, abstractEn: en || 'N/A' };
    }
    return { abstract: legacy, abstractZh: zh || 'N/A', abstractEn: legacy };
  }

  throw new AppError('AI_RESPONSE_INVALID', '字段 abstract/abstractZh/abstractEn 缺失或格式错误。');
}

function parsePaperDraft(raw: unknown): PaperDraft {
  if (!raw || typeof raw !== 'object') {
    throw new AppError('AI_RESPONSE_INVALID', '文献数据格式错误。');
  }

  const paper = raw as Record<string, unknown>;
  const bilingualAbstract = resolveBilingualAbstract(
    paper.abstract,
    paper.abstractZh,
    paper.abstractEn,
  );

  return {
    title: ensureString(paper.title, 'title'),
    authors: ensureString(paper.authors, 'authors'),
    year: ensureNumber(paper.year, 'year'),
    journal: ensureString(paper.journal, 'journal'),
    tier: normalizeTier(paper.tier),
    doi: ensureString(paper.doi, 'doi'),
    abstract: bilingualAbstract.abstract,
    abstractZh: bilingualAbstract.abstractZh,
    abstractEn: bilingualAbstract.abstractEn,
    tags: ensureTags(paper.tags),
  };
}

function toPaperWithId(paper: PaperDraft, index: number): Paper {
  return {
    ...paper,
    id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
  };
}

function getResponseText(text: string | undefined): string {
  if (!text || !text.trim()) {
    throw new AppError('AI_RESPONSE_INVALID', '模型未返回有效内容，请重试。');
  }
  return text;
}

/**
 * Use Gemini to generate optimized English academic search queries for any topic,
 * including Chinese-language topics that would otherwise fail in English-only APIs.
 */
export async function buildSearchQueries(topic: string): Promise<string[]> {
  try {
    const response = await getAiClient().models.generateContent({
      model: MODEL_NAME,
      contents: `你是学术检索专家。针对研究主题「${topic}」，生成 5 个英文学术数据库搜索短语。
要求：
- 每个短语 3-6 个英文单词
- 分别覆盖：系统性综述、核心方法、最新进展、应用场景、研究挑战
- 适合在 Semantic Scholar 与 arXiv 使用
- 仅输出 JSON 字符串数组，不要解释`,
      config: { responseMimeType: 'application/json' },
    });
    const raw = JSON.parse(response.text ?? '[]');
    const queries = Array.isArray(raw) ? (raw as unknown[]).filter((q): q is string => typeof q === 'string') : [];
    if (queries.length >= 3) return queries.slice(0, 5);
  } catch {}
  return buildSubQueries(topic);
}

/**
 * Analyst role (DeerFlow): extract themes, methods, controversies from real papers.
 * Returns null silently on any failure — the Reporter can still write without it.
 */
export async function analyzeThemes(topic: string, papers: Paper[]): Promise<ThemeAnalysis | null> {
  try {
    const paperTitles = papers
      .map((p) => `- ${p.authors} (${p.year}): ${p.title} [${p.journal}]`)
      .join('\n');

    const response = await getAiClient().models.generateContent({
      model: MODEL_NAME,
      contents: `分析以下关于「${topic}」的 ${papers.length} 篇真实文献，识别跨文献的学术规律。

文献列表：
${paperTitles}

请输出 JSON，包含：
- themes: 3-5 个核心研究主题（英文短语）
- methods: 文献中使用的主要研究方法类型
- controversies: 学界存在的争议点或相互矛盾的发现
- gaps: 尚未解决的研究空白`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            themes: { type: Type.ARRAY, items: { type: Type.STRING } },
            methods: { type: Type.ARRAY, items: { type: Type.STRING } },
            controversies: { type: Type.ARRAY, items: { type: Type.STRING } },
            gaps: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
      },
    });

    const raw = JSON.parse(response.text ?? 'null') as Record<string, unknown> | null;
    if (!raw) return null;
    return {
      themes: Array.isArray(raw.themes) ? (raw.themes as string[]) : [],
      methods: Array.isArray(raw.methods) ? (raw.methods as string[]) : [],
      controversies: Array.isArray(raw.controversies) ? (raw.controversies as string[]) : [],
      gaps: Array.isArray(raw.gaps) ? (raw.gaps as string[]) : [],
    };
  } catch {
    return null;
  }
}

export async function generateApaReview(
  topic: string,
  papers: Paper[],
  analysis?: ThemeAnalysis | null,
): Promise<string> {
  const paperList = papers
    .map(
      (p, i) =>
        `[${i + 1}] ${p.authors} (${p.year}). ${p.title}. ${p.journal}.${p.doi !== 'N/A' ? ` https://doi.org/${p.doi}` : ''}\n摘要：${p.abstractEn || p.abstract}`,
    )
    .join('\n\n');

  const analysisSection = analysis
    ? `
**预分析结果（Analyst Agent 输出，请在综述中系统性覆盖这些主题）：**
- 核心研究主题：${analysis.themes.join('；')}
- 主要研究方法：${analysis.methods.join('；')}
- 争议与分歧：${analysis.controversies.join('；') || '暂无明显争议'}
- 研究空白：${analysis.gaps.join('；') || '待进一步分析'}
`
    : '';

  const response = await getAiClient().models.generateContent({
    model: MODEL_NAME,
    contents: `你是一位资深学术作者，专攻系统性文献综述写作。请基于下方 ${papers.length} 篇真实文献，撰写关于「${topic}」的高质量中文学术综述。
${analysisSection}
**写作要求：**
1. 语言：严谨、专业的学术中文，避免口语化。
2. 引用格式：严格遵循 APA 第七版，正文引用格式 (Author, Year) 或 (Author et al., Year)，所有文献必须至少引用一次。
3. 只能引用下方列表中的文献，禁止引用列表外的任何来源。
4. 综合而非罗列：跨文献比较、整合、提炼规律与分歧，体现批判性思维。
5. 字数：正文各章节合计不少于 1500 字。

**文章结构（严格按此 Markdown 标题格式输出）：**

# 文献综述：${topic}

## 1. 引言
阐述研究背景与现实意义，说明本综述的范围与方法。

## 2. 理论框架与核心概念
梳理关键理论、模型或概念体系，比较不同学者的定义与分类。

## 3. 研究现状与主题分析
跨文献综合分析：主要发现、学术共识、争议焦点、演进趋势（按主题分小节）。

## 4. 研究方法论评述
评价现有研究的数据来源、实验设计、评估指标的优势与局限。

## 5. 研究空白与未来方向
明确指出 3-5 个尚待解决的核心问题及未来优先方向。

## 6. 结论
简洁总结本领域进展、主要贡献与挑战。

## 参考文献
按 APA 第七版格式列出所有文献，有 DOI 的附完整 DOI 链接。

---
**可引用的文献列表（仅限此列表）：**
${paperList}`,
  });

  return getResponseText(response.text);
}

const METADATA_SCHEMA = {
  responseMimeType: 'application/json',
  responseSchema: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      authors: { type: Type.STRING },
      year: { type: Type.NUMBER },
      journal: { type: Type.STRING },
      tier: { type: Type.STRING },
      doi: { type: Type.STRING },
      abstract: { type: Type.STRING },
      abstractZh: { type: Type.STRING },
      abstractEn: { type: Type.STRING },
      tags: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
  },
} as const;

const METADATA_PROMPT = (fileName: string) =>
  `你是一个专业的文献元数据提取助手。请从提供的文献内容（文件名：${fileName}）中准确提取：
title（论文标题）、authors（作者，格式如 Zhang, Y.; Li, M.）、year（发表年份，整数）、
journal（期刊/会议名称）、tier（预测 JCR 分区 Q1-Q4）、
doi（仅填真实 DOI，不确定填 "N/A"）、
abstractZh（150-200字中文摘要，包含背景、方法、结论）、
abstractEn（120-180词英文摘要，与中文语义一致）、
tags（3-5个学术关键词数组）。
若原文只有单语，必须同时补全另一种语言的摘要。`;

async function runMetadataExtraction(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contents: any,
): Promise<PaperDraft> {
  const response = await getAiClient().models.generateContent({
    model: MODEL_NAME,
    contents,
    config: METADATA_SCHEMA,
  });
  const payload = parseJson(getResponseText(response.text));
  const paper = parsePaperDraft(payload);
  return { ...paper, tier: normalizeTier(paper.tier, 'Q4') };
}

export async function extractPaperMetadata(file: File): Promise<PaperDraft> {
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  const promptText = METADATA_PROMPT(file.name);

  if (isPdf) {
    // Send the full PDF as base64 inline data — Gemini can parse PDF natively
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    // Process in chunks to avoid call-stack overflow on large files
    const CHUNK = 8192;
    for (let i = 0; i < bytes.byteLength; i += CHUNK) {
      binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
    }
    const base64 = btoa(binary);

    return runMetadataExtraction([
      {
        parts: [
          { inlineData: { mimeType: 'application/pdf', data: base64 } },
          { text: promptText },
        ],
      },
    ]);
  }

  // Text / Markdown / DOCX (plain text extraction)
  let textContent = '';
  try {
    textContent = await file.text();
  } catch {
    textContent = '';
  }

  return runMetadataExtraction(
    `${promptText}\n\n文献正文（前 6000 字）：\n${textContent.substring(0, 6000)}`,
  );
}
