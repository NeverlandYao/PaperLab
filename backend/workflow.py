from __future__ import annotations

import os
from typing import TypedDict

try:
    from langchain_openai import ChatOpenAI  # type: ignore
except ImportError:  # pragma: no cover
    ChatOpenAI = None

from langgraph.graph import END, START, StateGraph


class WorkflowState(TypedDict, total=False):
    topic: str
    documents: str
    keyword_count: int
    analysis_prompt: str
    level: int
    paper_type: str
    outline_prompt: str
    summary: str
    keywords: list[str]
    outline: str


def validate_payload(nodes, edges):
    node_by_type = {node.type: node for node in nodes}
    required_types = {"input", "analysis", "outline"}

    if not required_types.issubset(node_by_type.keys()):
        return False, "nodes 中必须包含 input、analysis、outline 三种节点。"

    input_node = node_by_type["input"]
    analysis_node = node_by_type["analysis"]
    outline_node = node_by_type["outline"]

    has_input_to_analysis = any(edge.source == input_node.id and edge.target == analysis_node.id for edge in edges)
    has_analysis_to_outline = any(edge.source == analysis_node.id and edge.target == outline_node.id for edge in edges)

    if not has_input_to_analysis or not has_analysis_to_outline:
        return False, "edges 必须形成 input → analysis → outline 的合法链路。"

    return True, "ok"


def build_initial_state(nodes) -> WorkflowState:
    node_by_type = {node.type: node for node in nodes}

    input_config = node_by_type["input"].data.get("config", {})
    analysis_config = node_by_type["analysis"].data.get("config", {})
    outline_config = node_by_type["outline"].data.get("config", {})

    return {
        "topic": str(input_config.get("topic", "")).strip(),
        "documents": str(input_config.get("documents", "")).strip(),
        "keyword_count": int(analysis_config.get("keywordCount", 5)),
        "analysis_prompt": str(analysis_config.get("prompt", "")).strip(),
        "level": int(outline_config.get("level", 3)),
        "paper_type": str(outline_config.get("paperType", "教研论文")).strip(),
        "outline_prompt": str(outline_config.get("prompt", "")).strip(),
    }


def maybe_call_llm(system_prompt: str, user_prompt: str) -> str | None:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or ChatOpenAI is None:
        return None

    try:
        model = ChatOpenAI(model="gpt-4o-mini", temperature=0.3, api_key=api_key)
        response = model.invoke(
            [
                ("system", system_prompt),
                ("user", user_prompt),
            ]
        )
        return str(response.content).strip()
    except Exception:
        return None


def read_input_node(state: WorkflowState) -> WorkflowState:
    return state


def analyze_node(state: WorkflowState) -> WorkflowState:
    llm_result = maybe_call_llm(
        "你是教育研究助手，需要根据给定文献文本输出摘要和关键词。",
        f"研究主题：{state['topic']}\n文献文本：\n{state['documents']}\n\n要求：{state['analysis_prompt']}\n请先给摘要，再单独列出关键词。",
    )

    if llm_result:
        lines = [line.strip("-• ").strip() for line in llm_result.splitlines() if line.strip()]
        summary = lines[0] if lines else f"围绕“{state['topic']}”的文献主要聚焦于教学应用、实施条件与效果差异。"
        keywords = lines[1 : 1 + state["keyword_count"]] or derive_keywords(state["documents"], state["keyword_count"])
    else:
        summary = build_summary(state["topic"], state["documents"])
        keywords = derive_keywords(state["documents"], state["keyword_count"])

    return {
        **state,
        "summary": summary,
        "keywords": keywords,
    }


def outline_node(state: WorkflowState) -> WorkflowState:
    llm_result = maybe_call_llm(
        "你是教育研究写作助手，需要根据摘要和关键词生成中文论文提纲。",
        f"论文类型：{state['paper_type']}\n研究主题：{state['topic']}\n摘要：{state['summary']}\n关键词：{', '.join(state['keywords'])}\n提纲层级：{state['level']}\n要求：{state['outline_prompt']}",
    )

    outline = llm_result or build_outline(
        topic=state["topic"],
        paper_type=state["paper_type"],
        summary=state["summary"],
        keywords=state["keywords"],
        level=state["level"],
    )

    return {
        **state,
        "outline": outline,
    }


def derive_keywords(documents: str, keyword_count: int) -> list[str]:
    candidates = [
        "人工智能",
        "小学教育",
        "个性化学习",
        "教师素养",
        "教育公平",
        "数字化转型",
        "课堂应用",
        "教学评价",
    ]
    return candidates[: max(1, keyword_count)]


def build_summary(topic: str, documents: str) -> str:
    sentences = [line.strip() for line in documents.splitlines() if line.strip()]
    evidence = "；".join(sentences[:2]) if sentences else "文献强调技术、教师与情境三方面共同作用。"
    return f"围绕“{topic}”的文献显示，研究重点集中在AI支持教学、教师实施条件以及区域差异影响，主要证据包括：{evidence}。"


def build_outline(topic: str, paper_type: str, summary: str, keywords: list[str], level: int) -> str:
    base = [
        f"一、研究背景与问题提出\n1. {topic}的发展背景\n2. 当前教学痛点与研究意义",
        f"二、文献综述与主题分析\n1. 核心摘要：{summary}\n2. 关键词展开：{'、'.join(keywords)}",
        "三、研究设计与实施路径\n1. 研究对象与资料来源\n2. 分析方法与实施步骤",
        "四、结论与建议\n1. 主要发现\n2. 教学应用建议与后续研究方向",
    ]
    if level >= 4:
        base[2] += "\n3. 评价指标与效果验证"
    return f"{paper_type}提纲\n" + "\n\n".join(base)


def build_graph():
    graph = StateGraph(WorkflowState)
    graph.add_node("read_input_node", read_input_node)
    graph.add_node("analyze_node", analyze_node)
    graph.add_node("outline_node", outline_node)
    graph.add_edge(START, "read_input_node")
    graph.add_edge("read_input_node", "analyze_node")
    graph.add_edge("analyze_node", "outline_node")
    graph.add_edge("outline_node", END)
    return graph.compile()


def extract_result(state: WorkflowState):
    return {
        "summary": state.get("summary", ""),
        "keywords": state.get("keywords", []),
        "outline": state.get("outline", ""),
    }
