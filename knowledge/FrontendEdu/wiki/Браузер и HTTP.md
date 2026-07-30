---
title: "Браузер и HTTP"
date: 2026-07-15
tags: [браузер, http, critical-rendering-path, reflow, repaint, cors, cookies, кэширование, http2]
category: concept
source_count: 0
---

# Браузер и HTTP

Базовые вопросы, которые проверяют понимание платформы, а не фреймворка. Спрашивают на 90% собеседований Middle+.

---

## 1. Critical Rendering Path (критический путь рендеринга)

**Что делает браузер от получения HTML до первого пикселя:**

```
HTML → DOM Tree
CSS  → CSSOM Tree
       ↓
     Render Tree (объединение DOM + CSSOM, только видимые элементы)
       ↓
     Layout (расчёт размеров и позиций, «reflow»)
       ↓
     Paint (отрисовка пикселей)
       ↓
     Composite (слои: GPU-ускорение)
```

**Что блокирует рендеринг:**
- **Синхронный `<script>` без defer/async** — блокирует DOM-построение, пока не загрузится и выполнится
- **CSS** — блокирует Render Tree, но не DOM (браузер может строить DOM параллельно)
- **`<script>` с `defer`** — скачивается параллельно, выполняется ПОСЛЕ DOM, до DOMContentLoaded
- **`<script>` с `async`** — скачивается параллельно, выполняется СРАЗУ как загрузился, порядок не гарантирован

**Как ускорить First Contentful Paint:**
```html
<!-- Критический CSS — инлайн в <head> -->
<style>/* только стили для первого экрана */</style>
<!-- Некритический CSS — отложенная загрузка -->
<link rel="preload" href="styles.css" as="style" onload="this.rel='stylesheet'">
<!-- Скрипты — defer чтобы не блокировали парсинг -->
<script src="app.js" defer></script>
```

---

## 2. Reflow vs Repaint

| | Reflow (Layout) | Repaint |
|---|---|---|
| **Что делает** | Пересчитывает размеры и позиции | Перерисовывает пиксели без изменения геометрии |
| **Стоимость** | Дорого (каскадный эффект) | Дешевле |
| **Триггеры** | `offsetWidth`, `getBoundingClientRect()`, изменение DOM, resize, изменение шрифта | `color`, `background`, `visibility`, `box-shadow` |

**Layout Trashing** — частая ошибка: чтение геометрии → запись стилей → снова чтение в одном кадре:

```javascript
// ❌ Layout thrashing: чтение → запись → чтение → запись
elements.forEach(el => {
  const height = el.offsetHeight; // чтение → вызывает reflow
  el.style.height = height + 10 + 'px'; // запись → делает layout dirty
});

// ✅ Пакетное чтение, потом пакетная запись
const heights = elements.map(el => el.offsetHeight); // все чтения
elements.forEach((el, i) => {
  el.style.height = heights[i] + 10 + 'px'; // все записи
});

// ✅ Или requestAnimationFrame
requestAnimationFrame(() => {
  elements.forEach(el => {
    el.style.transform = 'translateY(10px)'; // composite-only, без reflow!
  });
});
```

**Свойства, которые не вызывают reflow (composite-only):** `transform`, `opacity`, `filter` (на отдельном слое).

---

## 3. CORS (Cross-Origin Resource Sharing)

**Когда срабатывает:** браузер блокирует запрос из `https://mysite.com` к `https://api.other.com`, если сервер не разрешил.

**Механика:**
- **Простые запросы** (GET, POST с определёнными Content-Type): браузер добавляет `Origin` и проверяет `Access-Control-Allow-Origin` в ответе
- **Preflight** (OPTIONS-запрос перед основным): для «сложных» запросов (PUT, DELETE, кастомные заголовки, `Content-Type: application/json`)

> **Как читать preflight-диалог:** «браузер спрашивает OPTIONS: "Можно мне DELETE с заголовком X-Custom-Header с источника mysite.com?" — сервер отвечает: "Разрешаю DELETE, заголовок X-Custom-Header, кэшируй ответ на 24 часа"». Это невидимый для JS диалог: `fetch()` делает OPTIONS автоматически, и только если сервер разрешил — sends основной запрос.

```http
# Preflight-запрос от браузера
OPTIONS /api/users HTTP/1.1
Origin: https://mysite.com
Access-Control-Request-Method: DELETE
Access-Control-Request-Headers: X-Custom-Header

# Ответ сервера
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://mysite.com
Access-Control-Allow-Methods: GET, POST, DELETE
Access-Control-Allow-Headers: X-Custom-Header
Access-Control-Max-Age: 86400  # кэшировать preflight на 24ч
```

**Почему `Access-Control-Allow-Origin: *` не работает с `credentials: 'include'`?**
Спецификация запрещает: если запрос с куками (credentials), `*` невалиден. Сервер должен явно указать конкретный origin.

**Решение на практике:**
```typescript
// Фронт: fetch с credentials (если нужны куки)
fetch('https://api.example.com/data', {
  credentials: 'include', // отправлять куки
});

// Бэк (NestJS):
app.enableCors({
  origin: ['https://mysite.com'], // не *!
  credentials: true,
});
```

---

## 4. Cookie / localStorage / sessionStorage

| | Cookie | localStorage | sessionStorage |
|---|---|---|---|
| **Объём** | 4 KB | ~5 MB | ~5 MB |
| **Срок жизни** | Устанавливается (`Expires`/`Max-Age`) | Пока не удалят | До закрытия вкладки |
| **Доступ** | JS (`document.cookie`) + сервер (автоматически в каждом запросе) | Только JS | Только JS |
| **Область** | Domain + Path | Origin | Origin + вкладка |

**Почему JWT не хранят в localStorage:**
- Любой XSS-скрипт получает доступ к localStorage → токен украден
- **Правильно:** Refresh Token в httpOnly Secure SameSite Cookie (недоступен из JS), Access Token в памяти JS-переменной (уязвим только пока открыта вкладка)

```
Access Token   → в памяти (переменная JS, не localStorage)
Refresh Token  → httpOnly Secure SameSite=Strict cookie
```

**Атрибуты cookie:**
- **HttpOnly** — JS не может прочитать (защита от XSS)
- **Secure** — только по HTTPS
- **SameSite=Strict** — не отправляется при переходе с другого сайта (защита от CSRF)
- **SameSite=Lax** — отправляется только для безопасных методов (GET) при переходе

---

## 5. HTTP-кэширование

**Заголовки ответа (сервер → браузер):**

```
Cache-Control: max-age=3600        # кэшировать 1 час
Cache-Control: no-cache            # кэшировать, но всегда перепроверять (ETag)
Cache-Control: no-store            # НЕ кэшировать вообще (платёжные данные)
Cache-Control: public, max-age=86400 # можно кэшировать даже CDN
Cache-Control: private, max-age=60   # только браузеру, не CDN
```

**ETag / If-None-Match:**
```
# Первый запрос
GET /api/user HTTP/1.1
# Ответ:
HTTP/1.1 200 OK
ETag: "abc123"

# Повторный запрос
GET /api/user HTTP/1.1
If-None-Match: "abc123"
# Ответ:
HTTP/1.1 304 Not Modified  # данные не изменились — не передаём тело
```

**Last-Modified / If-Modified-Since:**
То же самое, но по дате (менее точно, чем ETag — секундная точность).

**Стратегия для SPA:**

> **Как читать `Cache-Control: public, max-age=31536000, immutable`:** «этот файл можно кэшировать везде (CDN + браузер) целый год (`31536000` секунд), и он НИКОГДА не изменится (`immutable`) — даже не делай повторный 304-запрос». Применяется только к бандлам с хешем в имени (`app.a3f8.js`): хеш поменялся → имя файла поменялось → это другой URL, старый кэш не используется.

```nginx
# index.html — никогда не кэшируем (точка входа, меняется с каждым деплоем)
location = /index.html {
    add_header Cache-Control "no-cache";
}

# Бандлы с хешем — кэшируем навсегда (имя файла меняется при изменении содержимого)
location /assets/ {
    add_header Cache-Control "public, max-age=31536000, immutable";
}
```

**Immutable:** говорит браузеру «этот файл никогда не изменится, не делай даже 304-запрос».

---

## 6. HTTP/2 и HTTP/3

**Что HTTP/2 даёт на практике:**

- **Мультиплексирование:** несколько запросов в одном TCP-соединении без head-of-line blocking. Не нужно объединять файлы в бандлы и делать спрайты
- **Приоритеты:** можно указать, какой ресурс важнее (критический CSS > изображения)
- **Server Push:** сервер может отправить ресурс до того, как клиент попросит (устаревает, заменяется Early Hints 103)
- **Сжатие заголовков (HPACK):** экономия на повторяющихся заголовках (Cookie, User-Agent)

**Вывод:** при HTTP/2 не нужно конкатенировать JS/CSS файлы — лучше много маленьких бандлов (code splitting), которые загружаются параллельно.

**HTTP/3 (QUIC):**
- Вместо TCP — UDP (быстрее handshake, нет блокировки при потере пакета)
- Миграция соединения (переключение WiFi → 4G без разрыва)
- Встроенное шифрование (TLS 1.3)

---

## Связанное
- [[HTML и Accessibility (a11y)]] — семантический HTML и accessibility tree

- [[CSS и стилизация]] — влияние CSS на Critical Rendering Path

- [[Event Loop макротаски микротаски]] — асинхронность и порядок выполнения

- [[Вопросы на собеседовании FullStack]]
- [[Вопросы на собеседовании FullStack]]
