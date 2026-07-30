# KB Viewer — Knowledge Base Web Interface

> Современный веб-интерфейс для просмотра баз знаний, построенных по принципам LLM Wiki Андрея Карпати.

## Быстрый старт

```bash
# Установка
npm install --legacy-peer-deps

# Режим разработки
npm run dev

# Сборка
npm run build

# Превью собранного сайта
npm run preview
```

## Добавление базы знаний

1. Поместите папку с БЗ в `knowledge/` (или создайте symlink)
2. Добавьте запись в `src/config/kb.json`:

```json
[
  {
    "path": "my-project",
    "name": "Мой проект",
    "description": "Описание базы знаний."
  }
]
```

**Требования к структуре БЗ:**
- `AGENTS.md` — schema-файл (опционально, для описания)
- `wiki/` — директория с Markdown-файлами
- `wiki/index.md` — индекс (опционально)
- `wiki/log.md` — лог (опционально)

Файлы должны иметь YAML frontmatter с полями: `title`, `tags`, `updated`, `sources`.

## Деплой на Netlify

1. Подключите репозиторий к Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`

Сборка полностью статическая, никаких серверных функций не требуется.

## Возможности

- **Карточки баз знаний** — главная страница с мета-информацией
- **Дерево документов** — сворачиваемые папки, подсветка текущего файла
- **Просмотр Markdown** — рендеринг с wiki-ссылками [[...]], тегами, оглавлением
- **Граф знаний** — SVG-визуализация связей между страницами
- **Таймлайн** — хронология из log.md
- **Поиск** — Fuse.js по заголовкам, контенту и тегам (Ctrl+K)
- **Обратные ссылки** — какие страницы ссылаются на текущую
- **Избранное** — сохранение в localStorage
- **История навигации** — кнопки Вперёд/Назад
- **Хлебные крошки** — навигация по пути
- **Тёмная/светлая тема** — автоопределение + ручной переключатель
- **Горячие клавиши** — Ctrl+K (поиск), Ctrl+B (сайдбар)
- **Адаптивная ширина панели** — перетаскивание мышью

## Стек

- **Astro** — статическая генерация
- **React** — интерактивные компоненты
- **TypeScript** — типизация
- **TailwindCSS** — стилизация
- **Marked** — рендеринг Markdown
- **Fuse.js** — нечёткий поиск
- **Lucide React** — иконки

## Структура проекта

```
src/
├── components/       # React-компоненты
│   ├── HomePage.tsx
│   ├── KBViewer.tsx
│   ├── Sidebar.tsx
│   ├── ArticleView.tsx
│   ├── SearchDialog.tsx
│   ├── GraphView.tsx
│   ├── TimelineView.tsx
│   ├── Breadcrumbs.tsx
│   └── ThemeToggle.tsx
├── layouts/
│   └── BaseLayout.astro
├── pages/
│   ├── index.astro
│   └── kb/[kb].astro
├── lib/
│   └── kb-loader.ts     # Загрузка БЗ, парсинг, граф
├── types/
│   └── index.ts
├── styles/
│   └── globals.css
└── config/
    └── kb.json          # Список баз знаний
```

