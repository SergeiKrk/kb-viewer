# Лог операций — FrontendEdu

## [2026-07-23] update | TypeScript: добавлены «Как читать»-врезки
- Generics: подраздел «Как читать дженерики (не бойся синтаксиса)» — мнемоника `<ТипСюдаВставишь>`, пример Box<T>
- Discriminated Unions: врезка «читай | как ЛИБО»
- Conditional Types: врезка «читай ? : как тернарный оператор типов»
- `infer`: врезка «читай как: вытащи тип и назови»
- Mapped Types: врезка «читай как цикл for...in на уровне типов»
- Подход: каждая сложная конструкция TypeScript снабжена «буквальным» прочтением — как перевести синтаксис на человеческий язык

## [2026-07-23] update | Масштабное добавление «Как читать»-врезок (18 страниц, 51 врезка)
- Event Loop: .then(), await, process.nextTick()
- React рендеринг: Fiber, useMemo, startTransition
- Web API: Service Worker, Intersection Observer, AbortController
- CSS: grid-template-areas, clamp(), @container
- Архитектура React: Compound Components, render-props, 'use client'
- Архитектурные паттерны: Redux reducer, Singleton guard, IIFE
- Сборщики: Webpack defineConfig, HMR accept, React.lazy + chunkName
- Тестирование: renderHook, MSW-обработчики
- Управление состоянием: Zustand create, useInfiniteQuery, optimistic update
- Безопасность: CSP-заголовок, DOMPurify.sanitize
- Браузер и HTTP: CORS preflight, Cache-Control
- Алгоритмические задачи: fn.apply, Promise.race, hasOwnProperty
- FSD: цепочка импорта, Public API, Atomic Design иерархия
- Micro Frontends: exposes, remotes, React.lazy, shared singleton
- HTML/a11y: Accessibility Tree, aria-live, combobox ARIA
- Виртуализация: render-prop, translateY + absolute
- i18n: ICU plural/select, i18next interval
- DevOps: многоэтапный Dockerfile, GitHub Actions YAML, nginx try_files

## [2026-07-19] audit & fix | Системный аудит и исправления
- 🔴 Срочные багфиксы (5 шт.): битые ссылки ×2 → исправлены, опечатка myeventplatforn, китайский 覆盖率, дубликат ссылки, пропущенный import useState
- 🟡 Орфаны: добавлены обратные ссылки к Soft skills (+2), i18n (+3), Event Loop (+2)
- 🟢 Новые страницы: «CSS и стилизация» (37KB), «HTML и Accessibility (a11y)» (28KB)
- 🔵 React 19: добавлена секция React Compiler + новые хуки в «React рендеринг и производительность»
- 🟣 Redux: смягчена формулировка «устарел» в «Управление состоянием» и «Архитектурные паттерны»
- ⬆️ Web API: добавлен раздел AbortController, Fetch Streaming, IndexedDB
- 🕸️ Граф связей: обновлён index.md, 99 ссылок, 0 битых, 1 сирота (системная)

## [2026-06-19] init | Создание базы знаний
- Создана структура: AGENTS.md, raw/, wiki/, index.md, log.md
- Домен: фронтенд-разработка (HTML, CSS, JS, TS, React, инструменты)
- Шаблон: LLM Wiki Карпатого, язык — русский

## [2026-06-19] ingest | План обучения React Middle+
- Создан [[План обучения React Middle]] — роадмап на 10 недель
- Добавлены концепции: [[TypeScript продвинутый]], [[React рендеринг и производительность]], [[Управление состоянием]], [[Тестирование React]], [[Архитектура React компонентов]]
- Обновлён index.md с каталогом всех страниц

## [2026-07-07] update | TypeScript продвинутый — полная версия
- Страница расширена с 2.5KБ до 19.6KБ (x8)
- Добавлены подробные пояснения «зачем» и «когда» к каждому разделу
- **Generics:** constraints, несколько параметров, хуки, компоненты
- **Utility Types:** таблица + примеры композиции
- **Discriminated Unions:** type narrowing, exhaustive check, useQuery-паттерн
- **Conditional Types:** infer (3 практических применения), DeepPartial
- **Template Literal Types:** роутинг, CSS-in-JS, ExtractId
- **Mapped Types:** key remapping, Getters-паттерн
- **Новые разделы:** as const + satisfies, React-паттерны (useReducer, useContext, события)
- **Практические задания** на 2 недели + вопросы для самопроверки
- **Шпаргалка** по самым частым utility types
- **Добавлено после проверки (07.07.2026):**
  - Type Guards (is + asserts), unknown vs any, keyof/typeof
  - Branded Types (типобезопасные ID), Function Overloads
  - const Type Parameters (TS 5.0), Enums vs as const, Module Augmentation
  - Итого: 17 разделов, ~31KБ

## [2026-07-07] ingest | Вопросы на собеседовании FullStack
- Создана страница [[Вопросы на собеседовании FullStack]] — 22KБ
- **Вопрос 1:** Самый сложный фуллстэк-проект — ответ по STAR, пример event-платформы, обоснование каждого выбора технологий
- **Вопрос 2:** Оптимизация при наплыве — БД (индексы, репликация, Redis), бэкенд (масштабирование, очереди), фронтенд (code splitting, виртуализация)
- **Вопрос 3:** Архитектура БД — полная схема (users, events, ticket_types, bookings, favorites, reviews), денормализация, JSONB vs EAV
- **Вопрос 4:** Безопасность — 4 уровня: аутентификация (JWT httpOnly), валидация (Zod), CORS/CSP/HTTPS, защита от CSRF/SQL Injection/IDOR
- **Вопрос 5:** Отладка клиентских багов — Sentry/session replay, кастомный логгер, ErrorBoundary, типичные причины и решения, чек-лист

## [2026-07-07] export | PDF проекта
- Собран `FrontendEdu.pdf` (A5, 255 КБ) из всех 8 страниц базы
- Титульная страница + содержание + все wiki-страницы
- Оформление: тёмные блоки кода, таблицы, нумерация страниц

## [2026-07-16] update | Пополнение базы по чек-листу вакансии 5426 (Senior Frontend)

- **Новые страницы (5):**
  - [[Micro Frontends и Module Federation]] — Module Federation 1 и 2, конфигурация Webpack/Rspack, shared-зависимости, роутинг, коммуникация, деплой, антипаттерны
  - [[Feature-sliced design и Atomic Design]] — слои FSD, Public API, структура слайса. Atomic Design: атомы/молекулы/организмы. Совмещение подходов
  - [[Виртуализация рендеринга]] — react-window (фикс./динам. высота, Grid), TanStack Virtual, бесконечный скролл + виртуализация, подводные камни
  - [[Интернационализация и локализация i18n]] — react-intl (ICU MessageFormat), i18next, плюрализация, RTL, загрузка переводов (бандл/ленивая/namespace)
  - [[Event Loop макротаски микротаски]] — Call Stack, MacroTask/MicroTask, Promise vs setTimeout, async/await, Node.js фазы, requestAnimationFrame, типичные вопросы
- Обновлён index.md — добавлены 5 новых страниц

## [2026-07-16] ingest | usehooks-ts и план практики хуков
- Создана страница [[Практика написания хуков и usehooks-ts]] — методика тренировки написания хуков руками
- **Контекст:** результат собеседования 16.07.2026 — завалил тех.часть, рекомендация писать код руками
- **Содержание:** полный список 33 хуков из usehooks-ts, очерёдность по сложности на 4 недели, формат ежедневной практики, разбор типичных ошибок (cleanup, stale closure, SSR-безопасность, дженерики)
- Обновлены системные заметки: добавлен результат собеседования
- Обновлён index.md

## [2026-07-19] ingest | CSS и стилизация

- Создана страница [[CSS и стилизация]] — 36KБ, 4 уровня объяснения
- **Ребёнок:** метафора дома (HTML=скелет, CSS=отделка)
- **Junior:** специфичность, каскад, наследование, box model, единицы измерения, display/position
- **Middle:** Flexbox, Grid, адаптивность (mobile-first, clamp(), Container Queries, dvh), Sass/PostCSS, CSS Modules, анимации (transitions, keyframes, Framer Motion)
- **Senior:** @layer, :has(), стратегия стилизации (Tailwind, styled-components, Vanilla Extract, Panda CSS — сравнение), производительность (reflow/paint/composite, will-change, content-visibility), CSS-переменные, Logical Properties, CSS Nesting, Style Queries, итоговая матрица выбора подхода
- Обновлён index.md, связанные страницы: [[Архитектура React компонентов]], [[Сборщики и инструменты]], [[Браузер и HTTP]]


