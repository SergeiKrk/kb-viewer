---
title: "DevOps для фронтендера"
date: 2026-07-15
tags: [devops, docker, ci-cd, nginx, деплой]
category: concept
source_count: 0
---

# DevOps для фронтендера

На Middle+ собеседованиях всё чаще спрашивают базовый DevOps: Docker, CI/CD, Nginx. Не нужно быть админом, но понимать, как твой код попадает в продакшен — обязательно.

---

## 1. Docker

**Docker** — контейнеризация: упаковка приложения со всеми зависимостями в изолированное окружение. «Работает на моей машине» → «Работает везде одинаково».

### Ключевые понятия

- **Image** — слепок файловой системы (как ISO-образ). Неизменяемый
- **Container** — запущенный экземпляр образа. Изолирован, имеет свою ФС, сеть, процессы
- **Layer** — каждый `RUN`/`COPY`/`ADD` в Dockerfile создаёт новый слой
- **Dockerfile** — инструкция по сборке образа

### Dockerfile для React SPA

> **Как читать многоэтапный Dockerfile:** `FROM ... AS builder` — «это первый этап, сборочный цех с Node.js, исходниками и node_modules». `FROM nginx:alpine` — «это второй этап, чистый лист с одним Nginx». `COPY --from=builder` — «возьми из сборочного цеха только готовый результат ( dist/) и положи в боевой контейнер». Весь мусор ( node_modules, исходники, кэш) остаётся в builder и в итоговый образ не попадает. Поэтому образ весит 20 MB, а не 500.

```dockerfile
# === STAGE 1: Сборка ===
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# === STAGE 2: Production (только статика) ===
FROM nginx:alpine
# Копируем собранную статику в Nginx
COPY --from=builder /app/dist /usr/share/nginx/html
# Копируем конфиг Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Почему `COPY . .` после `npm install` убивает кэш

```dockerfile
# ❌ Плохо: любое изменение кода → npm ci выполняется заново
COPY . .
RUN npm ci

# ✅ Хорошо: кэшируем слои по частоте изменений
COPY package*.json ./     # ← меняется РЕДКО
RUN npm ci                # ← кэшируется
COPY . .                  # ← меняется ЧАСТО, но слои выше уже в кэше!
```

Docker кэширует слои: если `package.json` не изменился, слой с `npm ci` берётся из кэша.

### Multi-stage build

Первый этап (`builder`) содержит Node.js, исходники, `node_modules` — большой образ (~500 MB). Второй этап (`nginx:alpine`) — только собранная статика, итоговый образ ~20 MB.

### Основные команды

```bash
docker build -t my-app .          # Собрать образ
docker run -p 8080:80 my-app       # Запустить контейнер
docker ps                          # Список запущенных контейнеров
docker logs container_id           # Логи контейнера
docker exec -it container_id sh    # Зайти в контейнер
```

---

## 2. CI/CD Pipeline

**CI/CD** — автоматизация от пуша до продакшена.

### Типичный пайплайн для фронтенда

```
Push в GitHub
  ↓
[CI] Установка зависимостей (npm ci)
  ↓
[CI] Линтинг (ESLint)          ← параллельно
[CI] Проверка типов (tsc)      ← параллельно
[CI] Unit-тесты (Vitest)       ← параллельно
  ↓
[CI] Сборка (npm run build)
  ↓
[CI] Интеграционные тесты (RTL)
  ↓
[CI] E2E-тесты (Playwright) — опционально
  ↓
[CD] Деплой
  ├── staging: автоматически из main
  └── production: manual approve (кнопка)
```

### Пример GitHub Actions

> **Как читать YAML пайплайна GitHub Actions:** `on: push: branches: [main]` — «запускай этот пайплайн, когда кто-то делает push в ветку main». `jobs:` — список задач. `needs: lint-and-test` — «эта задача ждёт, пока завершится `lint-and-test`». `if: github.ref == 'refs/heads/main'` — «выполняй только если пуш был именно в main». `runs-on: ubuntu-latest` — «запусти виртуальную машину с Ubuntu».

```yaml
# .github/workflows/ci.yml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'npm' }

      - run: npm ci

      # Параллельно:
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test -- --coverage

      - run: npm run build

      # Артефакт для деплоя
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/

  deploy-staging:
    needs: lint-and-test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with: { name: dist }
      - run: rsync -avz ./ user@staging-server:/var/www/
```

### Git Flow (упрощённый)

```
main ─────────────────────●──●── production
  └── develop ──●──●──●──●──●── staging
       └── feature/payment ──●──●──
```

- **feature/** → создаём от develop, мёржим в develop (через PR)
- **develop** → CI прогоняет тесты, деплоит на staging
- **main** → manual approve, деплой на production

---

## 3. Nginx для SPA

**Nginx** — веб-сервер, который отдаёт статику и проксирует API-запросы.

### Базовая конфигурация

```nginx
server {
    listen 80;
    server_name mysite.com;
    root /usr/share/nginx/html;
    index index.html;

    # SPA: все пути → index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Статика с долгим кэшем (файлы с хешем)
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Проксирование API
    location /api/ {
        proxy_pass http://backend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Gzip сжатие
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    gzip_min_length 1000;
}
```

### `try_files` — магия SPA

> **Как читать `try_files $uri $uri/ /index.html;`:** «Nginx, когда приходит запрос — попробуй отдать файл по запрошенному пути; если файла нет — попробуй отдать папку; если и папки нет — плюнь на всё и отдай index.html, пусть React Router внутри браузера сам разбирается, что показывать». Без этой строки любой прямой заход на `/events/123` вернёт 404.

```
Запрос: /events/123

try_files $uri $uri/ /index.html;

1. Ищем файл /events/123      → нет такого
2. Ищем папку /events/123/     → нет такой
3. Отдаём /index.html          → React Router разберётся
```

Без `try_files` — 404 на всех маршрутах кроме `/`.

### Кэширование

```nginx
# index.html — никогда не кэшируем
location = /index.html {
    add_header Cache-Control "no-cache, must-revalidate";
}

# Бандлы с хешем (main.a1b2c3.js) — кэшируем навсегда
location ~* \.(js|css|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

**Почему index.html нельзя кэшировать:** имя бандла меняется → index.html должен ссылаться на новый бандл. Если браузер закэширует index.html — пользователь будет получать старую версию приложения.

---

## 4. Переменные окружения

```bash
# .env.production
VITE_API_URL=https://api.example.com
VITE_SENTRY_DSN=https://xxx@sentry.io/123

# В коде:
const apiUrl = import.meta.env.VITE_API_URL; // Vite
const apiUrl = process.env.REACT_APP_API_URL; // CRA/Webpack
```

**Важно:** переменные окружения в `VITE_*` или `REACT_APP_*` вшиваются в бандл НА МОМЕНТ СБОРКИ. Нельзя поменять их после сборки (статический хостинг). Для runtime-конфигурации: загружать `config.json` при старте приложения или использовать Server-Side конфигурацию.

---

## 5. Мониторинг и алертинг

| Инструмент | Для чего |
|---|---|
| **Sentry** | Отлов ошибок на фронте (стек-трейс, breadcrumbs, replay) |
| **LogRocket / FullStory** | Session Replay: запись того, что делал пользователь |
| **Google Analytics / Plausible** | Аналитика посещений |
| **Lighthouse CI** | Проверка производительности в CI |
| **UptimeRobot / Grafana** | Мониторинг доступности и метрик |

---

## Связанное
- [[Сборщики и инструменты]]
- [[Безопасность фронтенда]]
- [[Web API]]
