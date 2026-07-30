#!/usr/bin/env python3
"""Генерация PDF статьи для Хабра с графиками."""

import base64
import re
from pathlib import Path

import markdown
from weasyprint import HTML

PROJECT = Path("/home/ai/DewWork/JobHunt")
MD_FILE = PROJECT / "wiki" / "habr-article-final.md"
CHARTS_DIR = PROJECT / "charts"
OUTPUT = PROJECT / "fullstack-backend-2026.pdf"

CHART_MAP = {
    "horiz_bar.png": "Вакансии по бэкенд-языкам",
    "fullstack_bar.png": "Fullstack-вакансии по бэкенд-языку",
    "react_combos.png": "React + бэкенд связки",
    "salaries.png": "Зарплаты по грейдам",
}


def markdown_to_html(md_text: str) -> str:
    """Convert markdown to HTML with embedded charts as base64."""
    # Replace chart placeholders with base64 images
    for filename, alt in CHART_MAP.items():
        chart_path = CHARTS_DIR / filename
        if chart_path.exists():
            b64 = base64.b64encode(chart_path.read_bytes()).decode()
            img_tag = (
                f'<figure style="text-align:center; margin:20px 0;">'
                f'<img src="data:image/png;base64,{b64}" '
                f'alt="{alt}" style="max-width:100%; border-radius:6px;">'
                f'<figcaption style="color:#666; font-size:9pt; margin-top:4px;">'
                f'{alt}</figcaption></figure>'
            )
            # Match the placeholder pattern
            pattern = rf'!\[.*?\]\(\*\*\* ВСТАВИТЬ: перетащить charts/{re.escape(filename)} \*\*\*\)'
            md_text = re.sub(pattern, img_tag, md_text)

    # Convert to HTML
    html_body = markdown.markdown(
        md_text,
        extensions=["fenced_code", "codehilite", "tables", "toc"],
    )
    return html_body


def build_html(html_body: str) -> str:
    """Wrap body in full HTML document with print CSS."""
    return f"""<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<title>Какой бэкенд учить фронтендеру в 2026? Честный анализ рынка</title>
<style>
@page {{
    size: A4 portrait;
    margin: 15mm 18mm;
    @top-center {{
        content: "Какой бэкенд учить фронтендеру в 2026?";
        font-size: 7pt;
        color: #999;
        font-family: 'DejaVu Sans', sans-serif;
    }}
    @bottom-center {{
        content: counter(page);
        font-size: 7pt;
        color: #999;
        font-family: 'DejaVu Sans', sans-serif;
    }}
}}
@page :first {{
    @top-center {{ content: none; }}
}}

body {{
    font-family: 'DejaVu Sans', Arial, sans-serif;
    font-size: 10pt;
    line-height: 1.6;
    color: #222;
}}

/* Title page */
h1 {{
    font-size: 18pt;
    font-weight: bold;
    text-align: center;
    margin: 30px 0 10px 0;
    page-break-before: avoid;
}}

h2 {{
    font-size: 13pt;
    margin: 24px 0 8px 0;
    border-bottom: 1px solid #ddd;
    padding-bottom: 4px;
    page-break-after: avoid;
}}

h3 {{
    font-size: 11pt;
    margin: 16px 0 6px 0;
}}

p {{
    margin: 0 0 8px 0;
    text-align: justify;
}}

/* Code blocks */
pre {{
    background: none;
    border: 0.5px solid #ccc;
    border-radius: 3px;
    padding: 8px 12px;
    font-size: 8pt;
    line-height: 1.35;
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-word;
    margin: 8px 0;
}}

code {{
    font-family: 'DejaVu Sans Mono', monospace;
    font-size: 8.5pt;
}}

/* Inline code */
p code, li code {{
    font-size: 8.5pt;
    background: none;
}}

/* Lists */
ul, ol {{
    margin: 4px 0 8px 0;
    padding-left: 20px;
}}
li {{
    margin-bottom: 3px;
}}

/* Tables */
table {{
    border-collapse: collapse;
    width: 100%;
    margin: 12px 0;
    font-size: 9pt;
}}
th {{
    background: #f0f0f0;
    font-weight: bold;
    padding: 5px 8px;
    border: 0.5px solid #ccc;
    text-align: left;
}}
td {{
    padding: 4px 8px;
    border-bottom: 1px dotted #ddd;
}}

/* Figures */
figure {{
    page-break-inside: avoid;
}}
figcaption {{
    font-style: italic;
}}

/* Blockquotes */
blockquote {{
    border-left: 3px solid #ccc;
    margin: 8px 0;
    padding: 4px 12px;
    color: #555;
    font-style: italic;
}}

/* Links */
a {{
    color: #2196f3;
    text-decoration: none;
}}

/* Horizontal rule */
hr {{
    border: none;
    border-top: 1px solid #ddd;
    margin: 16px 0;
}}

/* Keep with next */
h2, h3 {{
    page-break-after: avoid;
}}

/* Emphasis */
strong {{ font-weight: bold; }}
em {{ font-style: italic; }}
</style>
</head>
<body>
{html_body}
</body>
</html>"""


def main():
    md_text = MD_FILE.read_text(encoding="utf-8")
    html_body = markdown_to_html(md_text)
    html_full = build_html(html_body)

    # Write intermediate HTML for debugging
    html_path = PROJECT / "fullstack-backend-2026.html"
    html_path.write_text(html_full, encoding="utf-8")
    print(f"HTML: {html_path} ({len(html_full)} bytes)")

    # Generate PDF
    HTML(string=html_full).write_pdf(str(OUTPUT))
    size_kb = OUTPUT.stat().st_size / 1024
    print(f"PDF: {OUTPUT} ({size_kb:.0f} KB)")


if __name__ == "__main__":
    main()
