#!/usr/bin/env python3
import argparse
import html
import re
import subprocess
import tempfile
from html.parser import HTMLParser
from pathlib import Path
from typing import Dict, List, Optional, Union


STYLE_RE = re.compile(r"p\.(\w+)\s*\{([^}]*)\}")
FONT_RE = re.compile(r"font:\s*([0-9.]+)px")
ALIGN_RE = re.compile(r"text-align:\s*([a-z]+)")


def normalize_ws(text: str) -> str:
    text = html.unescape(text).replace("\xa0", " ")
    text = re.sub(r"[ \t]+", " ", text)
    return text.strip()


def parse_styles(style_text: str) -> Dict[str, Dict[str, Union[str, float]]]:
    styles: Dict[str, Dict[str, Union[str, float]]] = {}
    for cls, body in STYLE_RE.findall(style_text):
        info: Dict[str, Union[str, float]] = {}
        font_match = FONT_RE.search(body)
        if font_match:
            info["font_size"] = float(font_match.group(1))
        align_match = ALIGN_RE.search(body)
        if align_match:
            info["align"] = align_match.group(1)
        styles[cls] = info
    return styles


class HtmlToMarkdownParser(HTMLParser):
    def __init__(self, styles: Dict[str, Dict[str, Union[str, float]]]):
        super().__init__(convert_charrefs=False)
        self.styles = styles
        self.blocks: List[dict] = []
        self.in_style = False
        self.style_chunks: List[str] = []
        self.tag_stack: List[str] = []
        self.current_paragraph: Optional[dict] = None
        self.current_table: Optional[List[List[str]]] = None
        self.current_row: Optional[List[str]] = None
        self.current_cell: Optional[List[str]] = None

    def handle_starttag(self, tag: str, attrs):
        attrs_dict = dict(attrs)
        self.tag_stack.append(tag)
        if tag == "style":
            self.in_style = True
            return
        if tag == "p":
            self.current_paragraph = {
                "class": attrs_dict.get("class", ""),
                "text": [],
            }
            return
        if tag == "br":
            self._append_text("\n")
            return
        if tag in {"b", "strong"}:
            self._append_text("**")
            return
        if tag in {"i", "em"}:
            self._append_text("*")
            return
        if tag == "table":
            self.current_table = []
            return
        if tag == "tr":
            self.current_row = []
            return
        if tag in {"td", "th"}:
            self.current_cell = []

    def handle_endtag(self, tag: str):
        if self.tag_stack and self.tag_stack[-1] == tag:
            self.tag_stack.pop()
        if tag == "style":
            self.in_style = False
            return
        if tag == "p" and self.current_paragraph is not None:
            raw = "".join(self.current_paragraph["text"])
            text = normalize_ws(raw.replace("\n", " "))
            if text:
                self.blocks.append(
                    {
                        "type": "p",
                        "class": self.current_paragraph["class"],
                        "text": text,
                    }
                )
            self.current_paragraph = None
            return
        if tag in {"b", "strong"}:
            self._append_text("**")
            return
        if tag in {"i", "em"}:
            self._append_text("*")
            return
        if tag in {"td", "th"} and self.current_cell is not None and self.current_row is not None:
            cell_text = normalize_ws("".join(self.current_cell).replace("\n", " "))
            self.current_row.append(cell_text)
            self.current_cell = None
            return
        if tag == "tr" and self.current_row is not None and self.current_table is not None:
            if any(cell for cell in self.current_row):
                self.current_table.append(self.current_row)
            self.current_row = None
            return
        if tag == "table" and self.current_table is not None:
            if self.current_table:
                self.blocks.append({"type": "table", "rows": self.current_table})
            self.current_table = None

    def handle_data(self, data: str):
        if self.in_style:
            self.style_chunks.append(data)
            return
        self._append_text(data)

    def _append_text(self, text: str):
        if self.current_cell is not None:
            self.current_cell.append(text)
        elif self.current_paragraph is not None:
            self.current_paragraph["text"].append(text)


def paragraph_to_md(text: str, cls_name: str, styles: Dict[str, Dict[str, Union[str, float]]]) -> str:
    style = styles.get(cls_name, {})
    font_size = float(style.get("font_size", 12.0))
    align = style.get("align", "")

    if font_size >= 22:
        return f"# {text}"
    if font_size >= 17:
        return f"## {text}"
    if font_size >= 14:
        return f"### {text}"

    if align == "center" and len(text) <= 80:
        return f"**{text}**"
    return text


def table_to_md(rows: List[List[str]]) -> str:
    width = max(len(row) for row in rows)
    padded = [row + [""] * (width - len(row)) for row in rows]
    header = padded[0]
    sep = ["---"] * width
    lines = [
        "| " + " | ".join(header) + " |",
        "| " + " | ".join(sep) + " |",
    ]
    for row in padded[1:]:
        lines.append("| " + " | ".join(row) + " |")
    return "\n".join(lines)


def html_to_markdown(html_text: str) -> str:
    initial_styles = parse_styles(re.search(r"<style[^>]*>(.*?)</style>", html_text, re.S).group(1))
    parser = HtmlToMarkdownParser(initial_styles)
    parser.feed(html_text)
    styles = initial_styles

    output: List[str] = []
    for block in parser.blocks:
        if block["type"] == "p":
            output.append(paragraph_to_md(block["text"], block["class"], styles))
        elif block["type"] == "table":
            output.append(table_to_md(block["rows"]))

    text = "\n\n".join(part for part in output if part.strip())
    text = re.sub(r"\*\*\s*(.*?)\s*\*\*", r"**\1**", text)
    text = re.sub(r"^(#{1,6}) \*\*(.*?)\*\*$", r"\1 \2", text, flags=re.M)
    text = re.sub(r"\n{3,}", "\n\n", text).strip()
    return text + "\n"


def convert_docx(docx_path: Path, output_path: Optional[Path] = None):
    if output_path is None:
        output_path = docx_path.with_suffix(".md")

    with tempfile.TemporaryDirectory() as tmpdir:
        html_path = Path(tmpdir) / f"{docx_path.stem}.html"
        subprocess.run(
            ["textutil", "-convert", "html", str(docx_path), "-output", str(html_path)],
            check=True,
        )
        html_text = html_path.read_text(encoding="utf-8")
        markdown = html_to_markdown(html_text)
        output_path.write_text(markdown, encoding="utf-8")


def main():
    parser = argparse.ArgumentParser(description="Convert docx files to markdown.")
    parser.add_argument("paths", nargs="*", help="docx files or directories")
    args = parser.parse_args()

    raw_paths = [Path(p) for p in args.paths] if args.paths else [Path.cwd()]
    docx_files: List[Path] = []
    for path in raw_paths:
        if path.is_dir():
            docx_files.extend(sorted(path.glob("*.docx")))
        elif path.suffix.lower() == ".docx":
            docx_files.append(path)

    if not docx_files:
        raise SystemExit("No .docx files found.")

    for docx_file in docx_files:
        convert_docx(docx_file.resolve())
        print(f"Converted: {docx_file} -> {docx_file.with_suffix('.md')}")


if __name__ == "__main__":
    main()
