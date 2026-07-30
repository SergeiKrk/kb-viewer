# AGENTS.md — Пансионат «СимбирскЪ»: Knowledge Base Schema

> Основано на паттерне [LLM Wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) Андрея Карпати.
> Ты — Hermes Agent, твоя задача: инкрементально строить и поддерживать эту БЗ.
> Человек (Сергей) — редактор и источник данных. Ты — автор и maintainer.

---

## Три слоя

```
pansionat-kb/
├── raw/          # 📥 Immutable sources (ты читаешь, не меняешь)
├── wiki/         # 🧠 LLM-generated markdown (ты пишешь и поддерживаешь)
└── AGENTS.md     # 🔑 Этот файл — schema (говорит тебе КАК работать)
```

---

## Скиллы (всегда загружай перед работой)

При любом ingest/query/lint в этой БЗ сначала загрузи оба скилла:

```
skill_view(name='pansionaty-competitor-analysis')
skill_view(name='competitor-analysis')
```

**`pansionaty-competitor-analysis`** — основной скилл проекта. Содержит:
- Полный разбор 7 конкурентов (UX, CRO, SEO, блоки, цены)
- Топ-10 жемчужин (чек-лист, калькулятор, письмо основателя...)
- Market Standard (что есть у 70%+) и Голубой океан (чего нет ни у кого)
- Идеальная структура сайта (18 блоков)
- `references/keysso-workflow.md` — полный воркфлоу анализа Keys.so
- `references/keysso-seo-analysis.md` — структура CSV, методология, выводы
- `references/full-report.md` — детальный разбор каждого конкурента

**`competitor-analysis`** — общий скилл конкурентной разведки:
- `references/kwork-keys-so.md` — заказ данных через Kwork
- `references/receiving-keysso-data.md` — скачивание с Яндекс.Диска

---

## Структура wiki/

Основана на Step 3 из `references/keysso-workflow.md`:

```
wiki/
├── index.md              # Плоский каталог ВСЕХ страниц (ссылка + 1 строка summary)
├── log.md                # Хронология (append-only, формат: ## [DATE] ACTION | Description)
│
├── competitors/           # 🏢 Страницы конкурентов (entity pages)
│   ├── pansionat-dobro.md
│   ├── ramily.md
│   ├── domdolgoletie.md
│   ├── voshod73.md
│   ├── sgc-opeca.md
│   ├── seniorgroup.md
│   ├── sm-pension.md
│   ├── teplye-besedy.md
│   ├── vremya-zhizni.md
│   └── pansion-zabota.md
│
├── diseases/              # 🩺 Болезни и состояния
│   ├── dementia.md
│   ├── alzheimer.md
│   ├── stroke.md
│   ├── parkinson.md
│   ├── fractures.md       # Перелом шейки бедра
│   ├── bedsores.md        # Пролежни
│   ├── diabetes.md
│   ├── hypertension.md
│   ├── gout.md
│   └── incontinence.md
│
├── care/                  # 🏥 Виды ухода
│   ├── bedridden.md       # Лежачие больные
│   ├── palliative.md      # Паллиативный уход
│   ├── postsurgical.md    # После операций
│   └── temporary.md       # Временное пребывание
│
├── choice/                # 🤔 Принятие решения
│   ├── checklist.md       # Чек-лист «6 признаков, что пора»
│   ├── nurse-vs-pansionat.md
│   ├── government-vs-private.md
│   ├── how-to-choose.md
│   └── red-flags.md       # «Серые» пансионаты
│
├── prices/                # 💰 Цены и финансы
│   ├── ulyanovsk.md       # Цены в Ульяновске
│   ├── breakdown.md       # Что входит в стоимость
│   ├── benefits.md        # Льготы и субсидии
│   └── tax-deduction.md
│
├── documents/             # 📄 Оформление
│   ├── disability.md      # Инвалидность: как оформить
│   ├── check-in.md        # Документы для заезда
│   ├── contract.md        # Договор
│   ├── guardianship.md    # Опека
│   └── pension.md         # Пенсия и пансионат
│
├── psychology/            # 🧠 Психология
│   ├── how-to-convince.md
│   ├── first-days.md
│   ├── guilt.md           # Чувство вины
│   └── aggression.md      # Агрессия при деменции
│
├── daily/                 # 🍽️ Быт и распорядок
│   ├── menu.md
│   ├── schedule.md        # Распорядок дня (по часам)
│   ├── activities.md      # Досуг и занятия
│   ├── room-types.md
│   └── safety.md
│
├── legal/                 # ⚖️ Юридические вопросы
│   ├── rights.md
│   ├── complaints.md
│   └── licensing.md
│
├── faq.md                 # ❓ FAQ (единый файл с Schema-разметкой)
│
├── insights/              # 💡 Синтез и выводы (query results filed back)
│   ├── blue-ocean.md      # Голубой океан: 124K ключей без конкуренции
│   ├── seo-strategy.md    # SEO-стратегия для Ульяновска
│   └── content-priority.md # Приоритеты контента по семантике
│
└── ulyanovsk.md           # 📍 Ульяновск — гео-контекст (entity page)
```

---

## Конвенции страниц

### Entity page (конкурент, болезнь, гео-локация)
```markdown
# Название сущности
> One-liner: что это и почему важно для проекта

## Ключевые факты
- факт 1
- факт 2

## Связь с пансионатом
Как эта сущность влияет на услуги, маркетинг, SEO.

## Связанные страницы
- [[другая-страница]] — причина связи
```

### Concept page (вид ухода, цены, оформление)
```markdown
# Название концепта
> One-liner

## Что это
## Как это работает у нас
## Частые вопросы
## Связанные страницы
```

### Insight page (вывод, анализ, стратегия)
```markdown
# Название инсайта
> Ключевой вывод в одном предложении

## Данные
## Анализ
## Рекомендации
## Связанные страницы
```

### Обязательные элементы каждой страницы
- **YAML frontmatter:** `tags: [tag1, tag2]`, `updated: YYYY-MM-DD`, `sources: [source1, source2]`
- **Блок «Связанные страницы»** с wiki-ссылками `[[page]]` — КАЖДАЯ страница
- **Обратная ссылка** из index.md — при создании страницы ОБЯЗАТЕЛЬНО добавить в index.md

---

## index.md (каталог)

Поддерживается в актуальном состоянии. Формат:
```markdown
# Индекс базы знаний
*Обновлено: YYYY-MM-DD*

## 🏢 Конкуренты
- [[competitors/pansionat-dobro.md]] — «Добро» (Ростов), лучший по доверию, 66/90
- [[competitors/ramily.md]] — «РЭМЕЛИ» (Tilda, 6 городов), калькулятор

## 🩺 Болезни
- [[diseases/dementia.md]] — Деменция: стадии, уход, питание

## ... (все категории)
```

---

## log.md (хронология)

Append-only. Каждая запись с префиксом для grep:
```markdown
## [2026-07-30] ingest | Keys.so: domdolgoletie.ru, ramily.ru
## [2026-07-30] query  | Кросс-анализ федералы vs Ульяновск → filed to insights/blue-ocean.md
## [2026-07-30] lint   | Проверка связности — OK, orphan'ов нет
```

---

## Операции

### Ingest (добавление источника)

Когда Сергей даёт новые данные (Keys.so, статью, снапшот сайта, расшифровку):

1. Загрузи скиллы: `pansionaty-competitor-analysis`, `competitor-analysis`
2. Помести источник в `raw/` (если ещё не там)
3. Прочитай источник
4. Обсуди с Сергеем ключевые takeaways
5. Создай/обнови затронутые wiki-страницы (может быть 5-15 страниц за один ingest!)
6. Обнови `wiki/index.md` (новые страницы + изменённые summary)
7. Добавь запись в `wiki/log.md`
8. Если данные Keys.so — следуй воркфлоу из `references/keysso-workflow.md`

### Query (вопрос по БЗ)

Когда Сергей задаёт вопрос, требующий синтеза:

1. Прочитай `wiki/index.md` → найди релевантные страницы
2. Прочитай найденные страницы
3. Синтезируй ответ со ссылками на wiki-страницы
4. **Важно:** хороший ответ = новая страница в `wiki/insights/` — зафайли его обратно

### Lint (проверка здоровья)

Периодически (или по запросу):
1. Проверь связность: все ли `[[ссылки]]` ведут на существующие страницы?
2. Проверь orphan'ы: есть ли страницы без входящих ссылок из index.md?
3. Проверь противоречия: разные страницы утверждают разное об одном и том же?
4. Найди пробелы: важные концепты без своей страницы?
5. Предложи новые вопросы для исследования

---

## Инструменты

- **Obsidian** — IDE для просмотра wiki (graph view, backlinks, Dataview)
- **Git** — вся БЗ это git-репозиторий: `git init && git add -A && git commit -m "..."` после каждой сессии
- **grep/rg** — быстрый поиск: `grep -r "запрос" wiki/`
- **qmd** — локальный поисковик по markdown (опционально, когда БЗ перевалит за 500 страниц)

---

## Связанные файлы проекта

| Файл | Описание |
|------|---------|
| `/root/pansionat/keysso_raw/` | Сырые данные Keys.so (175 МБ, 196 файлов) |
| `/root/pansionat/keysso_analysis.md` | Систематизированный SEO-отчёт |
| `/root/pansionat/keysso_cross_analysis.md` | Кросс-анализ федералы vs Ульяновск |
| `/root/pansionat/knowledge-base-tree.txt` | Иерархия БЗ (этот документ — её спецификация) |
