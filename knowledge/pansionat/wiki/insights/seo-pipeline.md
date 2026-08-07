---
tags: [seo, pipeline, ai, agents, methodology]
updated: 2026-08-06
sources: [HERMES_MASTER_PROMPT.md, pansionat-seo-ai]
---

# SEO AI Pipeline: как строился Blueprint

> 13 агентов, последовательный пайплайн, 16 артефактов на выходе.

## Архитектура пайплайна

```
Collector → Parser → Competitor Analyst → Keyword Clusterizer
    → Intent Analyst → Gap Finder → Site Architect
    → Content Planner → Internal Linker → Backlink Analyst
    → CRO Agent → Visual Mapper → Specification Builder
```

## 13 шагов

| # | Агент | Вход | Выход |
|---|-------|------|-------|
| 1 | Collector | 176 CSV Keys.so | competitor-index.json |
| 2 | Parser | competitor-index.json | normalized-data.json (485 MB) |
| 3 | Competitor Analyst | normalized-data.json | competitor-report.md |
| 4 | Keyword Clusterizer | normalized-data.json | keyword-clusters.json (15 кластеров) |
| 5 | Intent Analyst | keyword-clusters.json | search-intents.json |
| 6 | Gap Finder | competitor-report + БЗ | content-gaps.json |
| 7 | Site Architect | всё выше | site-map.json (21 страница) |
| 8 | Content Planner | site-map.json | content-plan.json |
| 9 | Internal Linker | site-map + content-plan | internal-links.json |
| 10 | Backlink Analyst | backlinks.csv (47K ссылок) | link-strategy.md |
| 11 | CRO Agent | content-plan + БЗ | cro-plan.md |
| 12 | Visual Mapper | site-map + internal-links | site-tree.mmd/.dot/.md |
| 13 | Specification Builder | всё выше | SEO_BLUEPRINT.md + site-spec.json |

## Технические детали

- **Язык:** Python (pandas для парсинга CSV, regex для кластеризации)
- **Данные:** 10 федеральных сайтов, 602 368 ключей, 47 206 бэклинков
- **Формат CSV:** `;` разделитель, заголовки на русском, кодировка UTF-8-sig
- **Кластеризация:** regex + rule-based (15 кластеров, 58% покрытие)
- **Оставшиеся 4 180 ключей:** грамматические формы и бренды — не несут семантической ценности

## Питфолы (из реального запуска)

- **CSV-парсинг:** разделитель `;`, не `,`. Заголовки на русском — нужен mapping.
- **Кластеризация:** 180K уникальных ключей → regex даёт ~8K unmatched. Широкие паттерны (`r"деменци"`) лучше узких.
- **485 MB JSON:** для больших данных лучше промежуточные файлы, не держать всё в памяти.
- **Backlink-парсинг:** 63% ссылок архивные, 55% nofollow. Это норма для ниши.

## Связанные страницы

- [[insights/seo-blueprint]] — результат работы пайплайна
- [[insights/blue-ocean]] — 124K ключей без конкуренции
- [[insights/seo-strategy]] — оригинальная стратегия
