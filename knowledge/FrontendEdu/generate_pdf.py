#!/usr/bin/env python3
"""FrontendEdu PDF generator — A5 portrait, Kindle 6\" optimized (base 10pt)."""
import re, hashlib, markdown
from weasyprint import HTML

WIKI = "/home/ai/DewWork/FrontendEdu/wiki"
OUTPUT = "/home/ai/DewWork/FrontendEdu/FrontendEdu.pdf"

PAGES = [
    ("План обучения React Middle+", "План обучения React Middle.md"),
    ("TypeScript продвинутый", "TypeScript продвинутый.md"),
    ("Event Loop: макротаски и микротаски", "Event Loop макротаски микротаски.md"),
    ("Алгоритмические задачи", "Алгоритмические задачи.md"),
    ("Браузер и HTTP", "Браузер и HTTP.md"),
    ("Web API", "Web API.md"),
    ("CSS и стилизация", "CSS и стилизация.md"),
    ("HTML и Accessibility (a11y)", "HTML и Accessibility (a11y).md"),
    ("React: рендеринг и производительность", "React рендеринг и производительность.md"),
    ("Управление состоянием", "Управление состоянием.md"),
    ("Архитектура React компонентов", "Архитектура React компонентов.md"),
    ("Архитектурные паттерны", "Архитектурные паттерны.md"),
    ("Тестирование React", "Тестирование React.md"),
    ("Сборщики и инструменты", "Сборщики и инструменты.md"),
    ("Безопасность фронтенда", "Безопасность фронтенда.md"),
    ("DevOps для фронтендера", "DevOps для фронтендера.md"),
    ("Micro Frontends и Module Federation", "Micro Frontends и Module Federation.md"),
    ("Feature-sliced design и Atomic Design", "Feature-sliced design и Atomic Design.md"),
    ("Виртуализация рендеринга", "Виртуализация рендеринга.md"),
    ("Интернационализация и локализация i18n", "Интернационализация и локализация i18n.md"),
    ("Практика написания хуков и usehooks-ts", "Практика написания хуков и usehooks-ts.md"),
    ("Soft skills собеседование", "Soft skills собеседование.md"),
    ("Вопросы на собеседовании FullStack", "Вопросы на собеседовании FullStack.md"),
]

def slugify(text):
    text = text.lower().strip()
    h = hashlib.md5(text.encode()).hexdigest()[:6]
    clean = re.sub(r'[^a-zа-яё0-9]+', '-', text).strip('-')
    return f"{clean}-{h}" if clean else f"section-{h}"

def strip_frontmatter(text):
    if text.startswith("---"):
        parts = text.split("---", 2)
        return parts[2].strip() if len(parts) >= 3 else text
    return text

def extract_h2_headings(md_text):
    return [(slugify(m.group(1)), m.group(1).strip()) for m in re.finditer(r'^##\s+(.+)$', md_text, re.M)]

def md_to_html(md_text):
    md_text = re.sub(r"\[\[([^\]]+)\]\]", r"\1", md_text)
    html = markdown.markdown(md_text, extensions=["fenced_code", "tables", "codehilite", "nl2br"])
    return re.sub(r'<h2>([^<]+)</h2>', lambda m: f'<h2 id="{slugify(m.group(1))}">{m.group(1)}</h2>', html)

def build_toc():
    lines = []
    for chap_title, filename in PAGES:
        with open(f"{WIKI}/{filename}") as f:
            raw = f.read()
        headings = extract_h2_headings(strip_frontmatter(raw))
        lines.append(f'<li class="toc-chapter">{chap_title}')
        if headings:
            lines.append('<ol class="toc-sections">')
            for sid, text in headings[:8]:
                lines.append(f'<li><a href="#{sid}">{text}</a></li>')
            lines.append('</ol>')
        lines.append('</li>')
    return f'<ol class="toc-top">{"".join(lines)}</ol>'

def css():
    return """
@page { size: A5 portrait; margin: 2mm 3mm; }
body { font-family: 'DejaVu Sans', Arial, sans-serif; font-size: 10pt; color: #222; line-height: 1.45; }
.cover { text-align: center; padding-top: 25mm; page-break-after: always; }
.cover h1 { font-size: 18pt; margin-bottom: 3mm; }
.cover .subtitle { font-size: 11pt; margin: 2mm 0; color: #555; }
.cover .meta { font-size: 8pt; color: #888; margin-top: 12mm; }
.toc-page { page-break-after: always; }
.toc-page h2 { font-size: 12pt; margin-bottom: 2mm; }
.toc-top { font-size: 9pt; line-height: 1.7; padding-left: 0; list-style: none; }
.toc-chapter { font-weight: bold; margin-top: 2mm; font-size: 9.5pt; }
.toc-sections { font-weight: normal; font-size: 8pt; line-height: 1.6; padding-left: 4mm; list-style: disc; margin: 0.5mm 0 1mm 0; }
.toc-sections a { color: #222; text-decoration: none; }
.chapter-title { font-size: 11pt; margin: 2mm 0 1.5mm 0; padding-bottom: 0.5mm; border-bottom: 0.5px solid #999; page-break-after: avoid; }
h1 { font-size: 13pt; margin: 2mm 0 1.5mm 0; page-break-after: avoid; }
h2 { font-size: 10.5pt; margin: 2mm 0 1mm 0; page-break-after: avoid; }
h3 { font-size: 10pt; margin: 1.5mm 0 1mm 0; page-break-after: avoid; }
h4 { font-size: 9pt; margin: 1mm 0 0.5mm 0; }
p { margin: 1mm 0; }
pre { background: none; border: 0.3px solid #ccc; border-left: 1.5px solid #999; padding: 1mm 2mm; font-family: 'DejaVu Sans Mono', monospace; font-size: 8.5pt; line-height: 1.35; white-space: pre-wrap; word-break: break-all; margin: 1mm 0; page-break-inside: avoid; }
code { font-family: 'DejaVu Sans Mono', monospace; font-size: 8.5pt; background: none; padding: 0; }
table { width: 100%; border-collapse: collapse; font-size: 8.5pt; margin: 1.5mm 0; page-break-inside: avoid; }
th { background: #f0f0f0; text-align: left; padding: 1mm 1.5mm; border-bottom: 0.5px solid #999; font-size: 8.5pt; }
td { padding: 0.8mm 1.5mm; border-bottom: 0.3px solid #ddd; vertical-align: top; }
ul, ol { margin: 1mm 0; padding-left: 4mm; }
li { margin: 0.3mm 0; }
hr { border: none; border-top: 0.3px solid #ddd; margin: 2mm 0; }
blockquote { border-left: 1.5px solid #bbb; margin: 1mm 0; padding: 0.5mm 2mm; color: #555; font-style: italic; page-break-inside: avoid; }
"""

def main():
    sections = []
    for chap_title, filename in PAGES:
        with open(f"{WIKI}/{filename}") as f:
            raw = f.read()
        sections.append(f'<section class="chapter"><h2 class="chapter-title">{chap_title}</h2>{md_to_html(strip_frontmatter(raw))}</section>')

    html = f"""<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><style>{css()}</style></head><body>
<div class="cover"><h1>FrontendEdu</h1><p class="subtitle">База знаний фронтенд-разработчика</p><p class="subtitle">React Middle+</p><p class="meta">Составил: Sergei Krk &amp; Hermes AI</p><p class="meta">Дата сборки: 2026-07-23</p></div>
<div class="toc-page"><h2>Содержание</h2>{build_toc()}</div>
{"".join(sections)}
</body></html>"""

    html_path = "/tmp/frontendedu.html"
    with open(html_path, "w") as f:
        f.write(html)
    print(f"HTML: {html_path} ({len(html)} chars)")
    HTML(filename=html_path).write_pdf(OUTPUT)
    print(f"PDF: {OUTPUT}")

if __name__ == "__main__":
    main()
