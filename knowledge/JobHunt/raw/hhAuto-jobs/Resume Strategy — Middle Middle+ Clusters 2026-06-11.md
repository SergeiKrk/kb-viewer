# Resume Strategy — Middle / Middle+ (2026-06-11)

_На основе: [[Market Analysis 2026-06-11]] и анализа требований 5 ключевых вакансий_
_Базовое резюме: [[Resume v1 — Middle+ React]]_

---

## Методология

Проанализированы требования из вакансий Middle (1-3 года) и Middle+ (3-6 лет) — всего ~70 релевантных позиций. Изучены описания 5 репрезентативных вакансий для выявления паттернов требований. Вакансии сгруппированы в 4 кластера по домену и технологическому стеку. Под каждый кластер — одна модификация Resume v1.

---

## Сводка требований по кластерам

| Кластер | Ключевые технологии | Уникальные требования | Кол-во вакансий |
|---|---|---|---|
| **Enterprise** | React, TS, Redux, Jest, CI/CD, Docker | Тесты, code review, Git Flow, Agile | ~20 |
| **Product/SaaS** | React, TS, MUI/Ant, Zustand, FSD, Storybook | Дизайн-система, UI-kit, рефакторинг | ~25 |
| **AI-Frontend** | React, TS, AI-инструменты, иногда Python | Cursor/Claude, ML-интеграции, NLP | ~10 |
| **Fintech** | React, TS, Redux, Docker, ООП, Webpack | Банковский опыт, безопасность, паттерны | ~8 |

---

## Кластер 1: Enterprise React (Middle+)

**Суть:** Крупные компании, строгие процессы, фокус на качестве и тестировании.

**Компании:** Бизнес Технологии, ЦРТ, АЙ-ТЕКО, Bell Integrator, Росгосстрах, МТС Банк IT, Тензор, Газпром нефть ИТ

**Общие требования:**
- React + TypeScript (профессиональный уровень)
- Unit-тесты (Jest, Testing Library)
- CI/CD, Git (GitLab/GitHub/Bitbucket)
- Code review — обязательный процесс
- SPA-архитектура, REST API
- Иногда Docker, Java-backend окружение, микросервисы

**Пример требований (Бизнес Технологии, 150-200k):**
- HTML/CSS/JS уверенно
- React/Vue/Angular на проф. уровне
- SPA принципы, внешние API
- Тесты frontend
- CI/CD, code review, ретроспективы
- Миграция GWT → TypeScript/React

### Модификации Resume v1 → Enterprise

| Параметр | Значение |
|---|---|
| **Заголовок** | Frontend-разработчик React / TypeScript (Middle+) |
| **Зарплата** | 220 000 ₽ на руки |
| **Фокус описания** | Качество кода, тестирование, CI/CD, процессы |

**Изменения в опыте работы:**

**AWX Solutions:**
```
— Разработка UI для финтех-продукта на React 18 + TypeScript, Redux Toolkit
— Написание unit-тестов (Jest, React Testing Library), покрытие >80%
— Настройка CI/CD (GitHub Actions): автопроверки, линтинг, деплой
— Участие в code review (ежедневно), поддержание стандартов кода (ESLint, Prettier)
— Интеграция REST API: типизация ответов, обработка ошибок, retry-логика
— Оптимизация производительности: lazy loading, code splitting, bundle-size анализ
— Работа в Agile-команде: daily, planning, retro, demo
```

**ИП Гершович:**
```
— Разработал интерактивный 2D-редактор на React + TypeScript + Konva.js
— Проектирование UI-архитектуры с учётом расширяемости и переиспользования
— Покрытие критической бизнес-логики unit-тестами
```

**Навыки (добавить/поднять):**
```
Jest, React Testing Library, Docker (базовый), CI/CD, Agile/Scrum,
Git Flow, Code Review, Webpack (глубоко)
```

**О себе (заменить):**
```
Frontend-разработчик с 5+ годами коммерческого опыта на React + TypeScript.
Работал в Enterprise-окружении с formal code review, CI/CD пайплайнами
и покрытием unit-тестами. Понимаю важность качества кода и процессов.
Ценю инженерную культуру и открытую обратную связь.
```

---

## Кластер 2: Product/SaaS React (Middle+)

**Суть:** Продуктовые компании, фокус на UI/UX, дизайн-системах, быстрой доставке фич.

**Компании:** IMOT.IO, 0xGuard, Iconicompany, StudyWorld, ИП Королева, ЯМКЕТ, Data World, 100балльный репетитор, JT marketing, EFSOL

**Общие требования:**
- React + TypeScript
- MUI / Ant Design / кастомная дизайн-система
- SCSS / CSS Modules / Styled Components
- Zustand или Redux Toolkit
- FSD (Feature-Sliced Design) — набирает популярность
- Storybook для документирования компонентов
- Работа с таблицами больших данных (MUI DataGrid, TanStack Table)
- Рефакторинг, миграция легаси

**Пример требований (IMOT.IO, до 220k):**
- React 17+ (хуки, контекст, понимание отличий 17/18/19)
- MUI + SCSS (кастомизация через классы)
- MUI X DataGrid Pro v7
- Redux / Redux Toolkit
- Рефакторинг без регрессий
- Git, code review

**Пример требований (0xGuard, 150-250k):**
- React от 3 лет, TypeScript advanced (generics, type guards)
- FSD (Feature-Sliced Design)
- Zustand, TanStack Table
- Ant Design, дизайн-система
- Визуализация данных: графы, тепловые карты
- Code review, менторство

### Модификации Resume v1 → Product

| Параметр | Значение |
|---|---|
| **Заголовок** | Frontend-разработчик React / TypeScript (Product) |
| **Зарплата** | 200 000 ₽ на руки |
| **Фокус описания** | Дизайн-системы, UI-компоненты, продуктовое мышление, FSD |

**Изменения в опыте работы:**

**AWX Solutions:**
```
— Разработка UI для AI-first продукта на React 18 + TypeScript
— Создание и развитие внутренней дизайн-системы на Material UI (MUI): 30+ переиспользуемых компонентов
— Внедрение Feature-Sliced Design (FSD): разделение на слои, модульная архитектура
— Управление состоянием: Redux Toolkit + Zustand
— Построение сложных UI: DataGrid, аналитические дашборды, визуализация данных
— Рефакторинг легаси-кода без регрессий: миграция компонентов, устранение дублирования
— Документирование компонентов (аналог Storybook), code review
```

**Собственные проекты:**
```
— 5 production-приложений: полный цикл от дизайна до продакшена
— Pixel-perfect вёрстка по Figma-макетам, адаптивность mobile→4K
— Анимации, интерактивные формы, сложные UI-компоненты
— Оптимизация Core Web Vitals: LCP < 2.5s, CLS < 0.1
```

**ИП Гершович:**
```
— Интерактивный 2D-редактор гардеробных (SaaS): drag & drop, zoom/pan, undo/redo
— Каталог 100+ параметризованных UI-компонентов
— Продуктовое мышление: UX-исследование → прототип → A/B-тест → итерация
```

**Навыки (добавить/поднять):**
```
Material UI (MUI), Ant Design, SCSS, Styled Components, CSS Modules,
Zustand, TanStack Query, FSD (Feature-Sliced Design), Storybook,
Figma, Pixel Perfect, Адаптивная вёрстка, Дизайн-системы
```

**О себе (заменить):**
```
Frontend-разработчик с 5+ годами на React + TypeScript в продуктовых командах.
Сильная сторона — создание дизайн-систем и переиспользуемых UI-компонентов.
Работал с MUI и Ant Design. Применяю FSD для масштабируемой архитектуры.
Понимаю продуктовый цикл: от UX-исследования до A/B-тестирования.
Люблю сложные интерфейсы: дашборды, редакторы, визуализация данных.
```

---

## Кластер 3: AI-Frontend React (Middle)

**Суть:** AI-first компании и стартапы, где frontend интегрируется с ML/AI.

**Компании:** СОФИ И ПАРТНЕРЫ, Phygital+, Sprouter Technologies, Signal, MPBoost, SkillCampVR

**Общие требования:**
- React + TypeScript
- AI-инструменты в разработке (Cursor, Claude, Copilot)
- Иногда Python (базовый)
- Интерес к AI/NLP/ML
- Next.js (часто для AI-продуктов)
- REST API, асинхронные запросы
- Docker, CI/CD (плюс)

**Пример требований (СОФИ, 120k, 1-3 года):**
- Frontend от 1.5 лет
- JS ES6+, TypeScript
- React (хуки, состояние)
- REST API
- HTML5, CSS3, адаптив
- Git
- Плюс: Next.js, стейт-менеджеры, Docker, CI/CD, AI/NLP интерес

### Модификации Resume v1 → AI-Frontend

| Параметр | Значение |
|---|---|
| **Заголовок** | Frontend-разработчик React / TypeScript (AI) |
| **Зарплата** | 180 000 ₽ на руки |
| **Фокус описания** | AI-инструменты, AI-интеграции на фронте, быстрая разработка |

**Изменения в опыте работы:**

**AWX Solutions:**
```
— Разработка UI для AI-first финтех-продукта на React 18 + TypeScript
— Интеграция frontend с AI/ML-сервисами через REST API
— AI-инструменты в ежедневной работе: Cursor, Claude — ускорение в 2-3x
— Промпт-инжиниринг и критическая оценка AI-сгенерированного кода
— Next.js + TypeScript: SSR, API routes, server components
— Управление состоянием: Redux Toolkit, Zustand
— Быстрое прототипирование фич с помощью AI
```

**Собственные проекты:**
```
— 5 production-приложений: от идеи до продакшена
— Astro.build + React + TailwindCSS — современный JAMstack
— Интеграция сторонних API и сервисов
— Оптимизация производительности и SEO
```

**ИП Гершович:**
```
— Full-cycle разработка SaaS-конструктора на React + TypeScript
— Интеграция с backend для расчёта стоимости в реальном времени
— Самостоятельное проектирование архитектуры и принятие технических решений
```

**Навыки (добавить/поднять):**
```
Cursor, Claude AI, Copilot, Prompt Engineering,
Next.js (app router, server components),
Python (базовый), Docker (базовый), CI/CD
```

**О себе (заменить):**
```
Frontend-разработчик с 5+ годами на React + TypeScript.
Активно использую AI-инструменты (Cursor, Claude) в разработке —
умею эффективно формулировать запросы и критически оценивать результат.
Есть опыт интеграции frontend с AI/ML-сервисами. Интересуюсь AI и NLP,
хочу развиваться на стыке frontend и искусственного интеллекта.
Быстро осваиваю новые технологии — самостоятельный и проактивный.
```

---

## Кластер 4: Fintech React (Middle+/Senior)

**Суть:** Банки и финтех-компании, высокие требования к надёжности и безопасности.

**Компании:** Сателл ИТ, ООО Холдинг Финанс, Decart IT-production, Альфа-Банк, ОТП Банк

**Общие требования:**
- React 5+ лет, TypeScript 3+ года
- Redux (обязательно)
- Webpack / Vite (глубоко)
- Unit-тесты (обязательно)
- Docker
- ООП, паттерны проектирования
- CI/CD (Jenkins, GitLab CI)
- Банковский опыт (плюс или обязательно)
- Безопасность, шифрование (понимание)

**Пример требований (Сателл ИТ, от 300k, требует senior):**
- React от 5 лет
- TypeScript от 3 лет (generics, utility types)
- REST API, Redux
- Webpack/Vite
- Unit-тесты от 3 лет
- UI-kit разработка от 3 лет
- Docker
- Git (Bitbucket, Jenkins, Jira)
- ООП, шаблоны проектирования
- Банковские ИТ-решения

### Модификации Resume v1 → Fintech

| Параметр | Значение |
|---|---|
| **Заголовок** | Frontend-разработчик React / TypeScript (Fintech) |
| **Зарплата** | 280 000 ₽ на руки |
| **Фокус описания** | Архитектура, безопасность, сложные системы, enterprise-паттерны |

**Изменения в опыте работы:**

**AWX Solutions (Fintech опыт!):**
```
— Разработка UI для финтех-продукта (AI-first платформа) на React 18 + TypeScript
— Проектирование архитектуры клиентской части: модульная структура, разделение слоёв
— State management: Redux Toolkit с нормализацией данных и мемоизацией селекторов
— Интеграция защищённых REST API: OAuth, JWT, обработка ошибок, retry-логика
— Unit-тесты (Jest, React Testing Library) + E2E (Playwright) — покрытие критического функционала
— Оптимизация производительности: code splitting, lazy loading, виртуализация списков
— CI/CD (GitHub Actions): автотесты, линтинг, деплой
— Code review, поддержание стандартов, менторство junior-разработчиков
— Контейнеризация (Docker) для локальной разработки и тестирования
```

**Собственные проекты:**
```
— Разработка 5 production-приложений полного цикла
— Архитектура SPA, оптимизация бандла (Webpack/Vite)
— Сложная бизнес-логика, работа с большими объёмами данных на клиенте
```

**ИП Гершович:**
```
— Проектирование и разработка SaaS-конструктора на React + TypeScript (6+ лет)
— Сложная бизнес-логика: drag & drop canvas, undo/redo, real-time расчёты
— Применение ООП и паттернов проектирования в архитектуре frontend-приложения
— Интеграция с backend: расчёт стоимости, генерация спецификаций, экспорт PDF
```

**Навыки (добавить/поднять):**
```
Redux Toolkit (advanced: нормализация, селекторы, middleware),
Docker, Webpack (deep: code splitting, tree shaking, bundle analysis),
Jest, React Testing Library, Playwright, CI/CD (Jenkins, GitHub Actions),
ООП, Design Patterns (GoF), Безопасность (JWT, OAuth, XSS, CORS),
REST API (advanced), Git Flow, Jira, Confluence
```

**О себе (заменить):**
```
Frontend-разработчик с 5+ годами коммерческого опыта на React + TypeScript.
Последние 1.5 года работал в финтех-команде над AI-first платформой —
проектировал архитектуру, писал unit/e2e тесты, настраивал CI/CD.
Применяю ООП и паттерны проектирования для построения масштабируемых
и поддерживаемых frontend-приложений. Понимаю важность безопасности
и надёжности в финансовых продуктах. Умею работать в регулируемой среде
с формальными процессами (code review, CI/CD, документирование).
```

---

## Сводная матрица: что меняется в каждом кластере

| Элемент резюме | Enterprise | Product | AI-Frontend | Fintech |
|---|---|---|---|---|
| **Заголовок** | Frontend-разработчик React / TS (Middle+) | Frontend-разработчик React / TS (Product) | Frontend-разработчик React / TS (AI) | Frontend-разработчик React / TS (Fintech) |
| **Зарплата** | 220 000 ₽ | 200 000 ₽ | 180 000 ₽ | 280 000 ₽ |
| **AWX — акцент** | Тесты, CI/CD, процессы | Дизайн-система, FSD, компоненты | AI-инструменты, Next.js | Архитектура, безопасность, Docker |
| **Проекты — акцент** | Продакшен-качество | UI/UX, pixel-perfect | AI-прототипирование | Сложная бизнес-логика |
| **ИП — акцент** | Архитектура UI | Компоненты, продукт | Full-cycle | ООП, паттерны |
| **Навыки (ключевое)** | Jest, CI/CD, Agile | MUI, FSD, Storybook, Zustand | Cursor, Claude, Next.js | Docker, Webpack, ООП, Security |
| **О себе — tone** | Инженерная культура | Продуктовое мышление | AI-энтузиаст | Надёжность, архитектура |

---

## План действий

1. **Применить модификации Enterprise** → отклик на Бизнес Технологии, ЦРТ, АЙ-ТЕКО, Bell Integrator
2. **Применить модификации Product** → отклик на IMOT.IO, 0xGuard, ЯМКЕТ, Data World, Iconicompany
3. **Применить модификации AI-Frontend** → отклик на СОФИ, Phygital+, Signal
4. **Применить модификации Fintech** → отклик на Сателл ИТ, Холдинг Финанс, Decart, Альфа-Банк

Каждый вариант резюме должен быть создан как отдельное резюме на hh.ru через алгоритм из [[Instructions/Создание tailored резюме]].

### Важное ограничение

**Опыт работы (experience) — общий для всех резюме на hh.ru.** Нельзя сделать разные описания одного места работы для разных резюме. Поэтому:
- **Меняем через API только:** title, salary, keySkills, workFormats, employmentForms
- **НЕ трогаем experience через API** — это создаст дубликаты во всех резюме
- Описания опыта редактируются **вручную через UI** и применяются глобально
- Кластерные описания опыта в этом документе — справочные, для ручного редактирования или cover letter

---

## Созданные резюме (реестр)

_Дата создания: 2026-06-11_

| Кластер | hh.ru ID | Заголовок | З/п | Ключевые навыки |
|---|---|---|---|---|
| **Product** | `eb4d7b5cff10a0bae20039ed1f35474138594f` | Frontend-разработчик \| React + TypeScript (Product) | 200 000 ₽ | MUI, Ant Design, FSD, Storybook, Zustand, TanStack Query, Jest, RTL |
| **Product (старое)** | `fb9848e4ff10a0b60c0039ed1f6b4443753367` | Frontend-разработчик React / TypeScript (Product) | 200 000 ₽ | Аналогично Product, создано первым (AWX был задвоен, дубль удалён вручную) |
| **Enterprise** | `6f87ee3dff10a11ad70039ed1f48354c39514e` | Frontend-разработчик \| React / TS (Enterprise) | 220 000 ₽ | Jest, RTL, Docker, CI/CD, Jenkins, GitHub Actions, Agile, Scrum |
| **AI-Frontend** | `904a47f1ff10a11baa0039ed1f52754751644c` | Frontend-разработчик \| React / TS (AI) | 180 000 ₽ | Next.js, Cursor, Claude AI, Prompt Engineering, AI Integration, Python |
| **Fintech** | `e160b4d4ff10a11c320039ed1f645a73715876` | Frontend-разработчик \| React / TS (Fintech) | 280 000 ₽ | Docker, Playwright, Jest, ООП, Design Patterns, JWT, OAuth, Jenkins |

**Общие параметры для всех:** профессия «Программист 1С» (role=96), удалённо, полная занятость, без командировок. Опыт работы — общий пул (отредактирован вручную).
