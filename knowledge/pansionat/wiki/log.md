# Лог базы знаний — Пансионат «СимбирскЪ»

> Append-only хронология всех операций. `grep "^## \[" log.md | tail -10` — последние 10 событий.

---

## [2026-07-29] source  | Keys.so: заказана выгрузка через Kwork (Антон Елистратов), 10 сайтов, 500₽
## [2026-07-29] source  | Keys.so: получены данные на Яндекс.Диске (папка «29.07.2026»)
## [2026-07-30] ingest  | Keys.so: все 196 файлов (175 МБ) скачаны через API Яндекс.Диска в raw/keysso/
## [2026-07-30] query   | Систематизация: создан keysso_analysis.md — сводка по 10 сайтам
## [2026-07-30] query   | Кросс-анализ: keysso_cross_analysis.md — федералы vs Ульяновск, 124K blue-ocean ключей
## [2026-07-30] schema  | AGENTS.md: создан schema-файл (паттерн Karpathy LLM Wiki, адаптирован под Hermes Agent)
## [2026-07-30] init    | Структура wiki/ создана, index.md + log.md инициализированы
## [2026-07-30] ingest  | Competitors: созданы страницы всех 10 конкурентов на основе данных Keys.so + skill-анализа
## [2026-07-30] query   | Insights: создан blue-ocean.md — 124K ключей, рекомендации по категориям
## [2026-07-30] lint    | Первый lint: проверка связности index.md → все ссылки ведут на существующие страницы
## [2026-07-30] create  | Competitors: созданы детальные страницы 6 федеральных конкурентов (sgc-opeca, seniorgroup, sm-pension, teplye-besedy, vremya-zhizni, pansion-zabota) на основе keysso_analysis + keysso_cross_analysis
## [2026-07-30] ingest  | Competitors: пересозданы страницы 4 конкурентов (voshod73, domdolgoletie, ramily, pansionat-dobro) с SEO-данными Keys.so, обновлены summary в index.md
## [2026-07-30] lint   | Проверка: 13 файлов, 138 кросс-ссылок, 0 orphan'ов. 86 forward-refs к ещё не созданным страницам (diseases, care, prices...) — запланировано, будет заполняться по мере ingest
