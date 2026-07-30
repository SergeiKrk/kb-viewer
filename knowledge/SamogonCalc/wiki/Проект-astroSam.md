# Проект astroSam — связь с базой знаний

**Путь:** /home/ai/DevWebApps/astroSam
**Репозиторий:** github.com/SergeiKrk/astroSam (ветка **master**)
**Сайт:** samogoncalc.ru
**Фреймворк:** Astro 4.9 + React 18 + MDX + Tailwind + DaisyUI
**Архитектура:** Astro Content Collections (calcs, blog, calcPages)
**Дата обновления:** 23.06.2026

## ⚠️ Статус

**Ветка master загружена и работает локально.** Предыдущая версия (main) была неактуальной.

**Удалено для локального запуска:** tinacms, sharp (требуют нативной сборки, не критичны для разработки).
**Search.astro** — поиск через pagefind работает в dev и production. Для dev-режима индекс копируется в `public/pagefind/` через postbuild.
**Исправлен H1** в Hero.astro: `<span>` → `<h1>`.

## Состав master-ветки

- **12 калькуляторов** в `content/calcs/` (MDX): абс. спирт, дробная перегонка, отбор голов, разбавление, брага, себестоимость, смешивание, спирт от температуры, водка из спирта, замена сахара, примерная стоимость, разбавление после 1-й перегонки
- **30 статей-рецептов** в `content/blog/` (MDX): настойки и наливки
- **3 SEO-лендинга** в `content/calcPages/` (MD): home, about, napitki
- **Netlify-деплой**: папка `netlify/`, `netlify.toml`
- **86 HTML-страниц** в продакшн-сборке
- **Сборка:** 12.5 сек (против 19 сек в старой версии)

---

## Связь с идеями

| Файл в IdeaResearch | Что описывает | Статус |
|---|---|---|
| [[Связка-1-2-5]] | Архитектура экосистемы: трафик → Telegram → гайд | План готов |
| [[Анализ-samogoncalc]] | Проблемы сайта и план улучшений (5 фаз) | Проблемы найдены |
| [[Годовой-прогноз]] | Финансовая модель на 12 месяцев | Посчитано |
| [[Анализ-Дзен]] | Дзен как канал трафика | Проанализирован |
| [[Контент-план-Дзен]] | 24 статьи на 3 месяца | Готов |
| [[Анализ-Пикабу]] | Пикабу как канал | Проанализирован |
| [[План-Пикабу]] | Формула, 20 заготовок, 3 месяца | Готов |
| [[Анализ-партнёрок]] | Admitad + AdvCake офферы | Проанализированы |
| [[Раунд-2]] | 5 альтернативных бизнес-идей | Проработаны |

---

## Карта проекта: файл → что править

### Фаза 1. Быстрые SEO-победы (из [[Анализ-samogoncalc]])

| # | Проблема | Где править | Конкретный файл |
|---|---|---|---|
| 1 | Нет H1 на страницах | Проверить CalcPost.astro — есть ли `<h1>` | `src/layouts/CalcPost.astro` |
| 2 | ✅ H2/H3 структура | Все 12 калькуляторов с иерархией H2+H3 | `src/content/calcs/*.mdx` |
| 3 | Пояснительный текст | Уже есть в .mdx, но можно расширить | `src/content/calcs/*.mdx` |
| 4 | og:image | Добавить в BaseLayout.astro | `src/layouts/BaseLayout.astro` |
| 5 | Страницы тегов индексируются | Добавить noindex | `src/pages/tags/[...tag]/index.astro` |
| 6 | ✅ Кастомный 404 | Страница с юмором + ссылки на калькуляторы | `src/pages/404.astro` |
| 7 | URL в конфиге чужой | Заменить на samogoncalc.ru | `astro.config.mjs` |

### Фаза 2. Монетизация

| # | Действие | Где править | Файл |
|---|---|---|---|
| 8 | Партнёрские ссылки Яндекс.Маркета | Добавить виджет «Рекомендуемое оборудование» под результат калькулятора | `src/layouts/CalcPost.astro` или компонент |
| 9 | Форма захвата Telegram | Лид-магнит: «Подпишись → получи таблицу + рецепты» | Новый компонент + вставить в CalcPost |
| 10 | Отслеживание конверсий | Яндекс.Метрика цели | `src/layouts/BaseLayout.astro` |

### Фаза 3. SEO-усиление

| # | Действие | Где править | Файл |
|---|---|---|---|
| 11 | Schema.org HowTo | Микроразметка для калькуляторов | `src/layouts/CalcPost.astro` |
| 12 | Schema.org Recipe | Для страниц рецептов | `src/layouts/BlogPost.astro` |
| 13 | FAQ-блоки | Добавить под каждый калькулятор | `src/content/calcs/*.mdx` |
| 14 | Хлебные крошки | Навигация | `src/layouts/BaseLayout.astro` или CalcPost |
| 15 | Новые SEO-статьи | Статьи в блог | `src/content/blog/*.mdx` |

### Фаза 4. Экосистема

| # | Действие | Где править | Файл |
|---|---|---|---|
| 16 | Страница продажи гайда | Новая страница | `src/pages/guide.astro` |
| 17 | Счётчики/аналитика | Метрика, цели | `src/layouts/BaseLayout.astro` |
| 18 | Кнопка Telegram | Улучшить видимость | `src/components/` |

---

## Структура проекта (детально)

```
astroSam/
├── astro.config.mjs            ← site: заменить на samogoncalc.ru
├── package.json                ← зависимости
├── tailwind.config.cjs         ← стили
├── tsconfig.json
├── public/                     ← статика (favicon, robots.txt)
├── src/
│   ├── env.d.ts
│   ├── styles/global.css       ← глобальные стили
│   ├── assets/images/          ← картинки калькуляторов, og:image
│   │
│   ├── data/
│   │   ├── site.config.ts      ← автор, title, description
│   │   ├── categories.ts       ← категории (Настойки, Наливки)
│   │   └── disqus.config.ts    ← Disqus (комментарии)
│   │
│   ├── content/
│   │   ├── config.ts           ← схемы Zod для коллекций
│   │   ├── calcPages/home.md   ← контент главной
│   │   ├── calcs/              ← 12 калькуляторов (.mdx)
│   │   │   ├── kalkulyator-razbavleniya-samogona-vodoj.mdx
│   │   │   ├── kalkulyator-otbor-golov.mdx
│   │   │   ├── kalkulyator-drobnoj-peregonki.mdx
│   │   │   ├── kalkulyator-absolyutnogo-spirta.mdx
│   │   │   ├── kalkulyator-smeshivaniya-spirtov.mdx
│   │   │   ├── kalkulyator-sebestoimosti-samogona.mdx
│   │   │   ├── kalkulyator-saharnoj-bragi.mdx
│   │   │   ├── kalkulyator-vodki-iz-spirta.mdx
│   │   │   ├── kalkulyator-spirta-ot-temperatury.mdx
│   │   │   ├── kalkulyator-zameny-sahara-glyukozoj.mdx
│   │   │   ├── razbavlenie-samogona-vodoj-posle-pervoj-peregonki.mdx
│   │   │   └── primernaya-stoimost-samogona.mdx
│   │   └── blog/               ← статьи блога
│   │       └── belyj-plastik-pozheltel...mdx (1 статья)
│   │
│   ├── layouts/
│   │   ├── BaseLayout.astro    ← <head>, мета-теги, шапка, подвал
│   │   ├── CalcPost.astro      ← шаблон страницы калькулятора
│   │   └── BlogPost.astro      ← шаблон поста блога
│   │
│   ├── pages/
│   │   ├── index.astro         ← главная
│   │   ├── [...slug].astro     ← рендер калькуляторов
│   │   ├── post/[...slug].astro ← рендер постов блога
│   │   ├── category/[category]/[page].astro ← категории
│   │   ├── tags/[...tag]/index.astro ← теги (надо noindex!)
│   │   ├── tags/index.astro
│   │   └── rss.xml.ts          ← RSS
│   │
│   ├── components/             ← React + Astro компоненты
│   │   ├── Hero.astro          ← шапка главной
│   │   ├── ListCalcs.astro     ← список калькуляторов
│   │   ├── ListPosts.astro     ← список постов
│   │   ├── ListCategories.astro
│   │   ├── calc/               ← компоненты калькуляторов (React)
│   │   ├── TgIcon.astro        ← иконка Telegram
│   │   ├── ShareButtons.astro  ← кнопки «поделиться»
│   │   ├── ToggleTheme.astro   ← переключатель темы
│   │   ├── Title.astro         ← заголовок
│   │   └── TitlePage.astro     ← заголовок страницы
│   │
│   └── utils/
│       ├── calc.ts             ← getCalcs()
│       ├── post.ts             ← getPosts()
│       ├── readTime.ts         ← время чтения
│       ├── sluglify.ts
│       ├── cn.ts
│       └── index.ts
```

---

## План реализации: от анализа к коду

### Этап 0. Подготовка (30 мин)

- [ ] `npm install` — установить зависимости
- [ ] Исправить URL в `astro.config.mjs` → `samogoncalc.ru`
- [ ] `npm run build` — проверить что собирается
- [ ] Создать ветку `seo-improvements` для всех правок

### Этап 1. Быстрые SEO-победы (3–4 часа)

- [ ] **H1 в CalcPost.astro** — проверить/добавить `<h1>{title}</h1>`
- [ ] **og:image в BaseLayout.astro** — `<meta property="og:image" content={...}>`
- [ ] **noindex на теги** — добавить `<meta name="robots" content="noindex">` в `src/pages/tags/[...tag]/index.astro`
- [x] ~~**Кастомный 404**~~ ✅ — страница с самогонным юмором, ссылками на калькуляторы и кнопкой «Вернуться к перегонке»
- [ ] **Description уникальный** — проверить что каждый калькулятор имеет свой description

### Этап 2. Монетизация (4–6 часов)

- [ ] **Форма захвата Telegram** — новый компонент `TelegramCTA.astro`
  - Разместить в `CalcPost.astro` после результатов расчёта
  - Текст: «Получи таблицу пропорций + 5 секретных рецептов в Telegram»
  - Ссылка: @samogonco
- [ ] **Партнёрские ссылки Яндекс.Маркета** — компонент `AffiliateWidget.astro`
  - Разместить под результатами на страницах:
    - Разбавление самогона → ссылка на спиртометры
    - Сахарная брага → ссылка на дрожжи, сахар
    - Отбор голов → ссылка на уголь для очистки
- [ ] **Яндекс.Метрика** — цели на клики по партнёрским ссылкам и форме захвата

### Этап 3. SEO-усиление (6–8 часов)

- [ ] **Schema.org HowTo** — добавить JSON-LD в `CalcPost.astro` для каждого калькулятора
- [ ] **FAQ-блоки** — добавить в конец каждого .mdx (3–5 вопросов)
- [ ] **Хлебные крошки** — `<nav aria-label="breadcrumb">` в CalcPost/BlogPost
- [ ] **5 SEO-статей** — создать .mdx файлы в `src/content/blog/`:
  1. «Как выбрать самогонный аппарат»
  2. «Топ-5 ошибок начинающего»
  3. «Рецепт хреновухи»
  4. «Себестоимость самогона vs магазинная водка»
  5. «Полный цикл самогоноварения за 10 шагов»

### Этап 4. Экосистема (10–15 часов)

- [ ] **Страница гайда** — `src/pages/guide.astro`
- [ ] **Интеграция ЮKassa** — кнопка оплаты
- [ ] **Страница «спасибо за покупку»** → ссылка на скачивание PDF

---

## Приоритет: что делать прямо сейчас

### Сделано ✅
- [x] ~~Клонировать репозиторий~~ ✅ Ветка master загружена
- [x] ~~`npm install` + `npm run build`~~ ✅ Проект собирается (84 страницы)
- [x] ~~Исправить URL в astro.config.mjs~~ ✅ samogoncalc.ru
- [x] ~~H1 на всех страницах~~ ✅ Hero.astro: `<span>` → `<h1>`
- [x] ~~Восстановить поиск~~ ✅ pagefind (dev + prod)
- [x] ~~og:image~~ ✅ Уже был настроен
- [x] ~~noindex тегов~~ ✅ + категории (BaseHead.noindex)
- [x] ~~Хлебные крошки~~ ✅ Breadcrumbs.astro + Schema.org
- [x] ~~Форма Telegram~~ ✅ SubscribeTelegram.astro
- [x] ~~Автотесты~~ ✅ tests/validate.mjs: SEO + ссылки + размеры, 0 ошибок
- [x] ~~Пояснительный текст~~ 🔄 3/12 калькуляторов

### Ближайшие задачи (приоритет)
| Приоритет | Действие | Время | Эффект |
|---|---|---|---|
| 🟢 Позже | Текст для оставшихся 9 калькуляторов | 2 часа | +SEO |
| ✅ Готово | H2/H3 на страницах калькуляторов | 2 часа | +Структура |
| ✅ Готово | Кастомная страница 404 | 1 час | +UX |
| 🟢 Позже | Партнёрские ссылки Маркета | 2 часа | Монетизация |
| 🟢 Позже | Schema.org + FAQ | 4 часа | Rich Snippets |
