# AGENTS.md — FrontendEdu

## Domain
Обучение фронтенд-разработке: HTML, CSS, JavaScript, TypeScript, React, фреймворки, инструменты, лучшие практики.

## Project Structure
```
FrontendEdu/
├── AGENTS.md          ← This file: schema, conventions, workflows
├── raw/               ← Immutable source documents (статьи, PDF, конспекты курсов)
├── wiki/              ← LLM-maintained markdown knowledge base
│   └── *.md           Страницы сущностей, конспекты, синтез
├── index.md           ← Каталог всех wiki-страниц
└── log.md             ← Хронологический журнал всех операций
```

## Conventions
- Все wiki-страницы в `wiki/` создаются и поддерживаются LLM
- Исходники в `raw/` никогда не модифицируются LLM — только чтение
- Каждая wiki-страница имеет YAML frontmatter: `title`, `date`, `tags`, `category`
- Перекрёстные ссылки через `[[wikilinks]]` для навигации в Obsidian
- index.md обновляется при каждом ingest
- log.md — только append
- Язык всех записей: русский

## Workflows

### Ingest a new source
1. Прочитать источник из `raw/`
2. Обсудить ключевые выводы с пользователем
3. Написать страницу-конспект в `wiki/` (именование: описательное, kebab-case или русское)
4. Обновить `index.md` — добавить запись со ссылкой и кратким описанием
5. Обновить связанные страницы в `wiki/`
6. Добавить запись в `log.md`: `## [YYYY-MM-DD] ingest | <Название источника>`

### Query
1. Сначала прочитать `index.md` для поиска релевантных страниц
2. Углубиться в конкретные wiki-страницы
3. Синтезировать ответ с цитированием (`[[page]]`)
4. Хорошие ответы → сохранить как новые страницы в `wiki/`

### Lint
1. Сканировать все wiki-страницы на противоречия
2. Проверить orphan-страницы (нет входящих ссылок)
3. Отметить устаревшие утверждения
4. Предложить недостающие страницы для важных концепций
5. Добавить отчёт в `log.md`

## Page Template
```markdown
---
title: "Название страницы"
date: YYYY-MM-DD
tags: [tag1, tag2]
category: entity|concept|summary|analysis|reference
source_count: N
---

# Название

Содержание...

## Связанное
- [[другая-страница]]
```

## Tools
- Obsidian для просмотра и графа связей
- Git для версионирования (все файлы — markdown)
- Dataview для динамических запросов (если заполнен YAML frontmatter)
