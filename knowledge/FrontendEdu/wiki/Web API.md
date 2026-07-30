---
title: "Web API"
date: 2026-07-15
tags: [web-api, service-workers, pwa, websocket, sse, history-api, spa-роутинг]
category: concept
source_count: 0
---

# Web API

Браузерные API, выходящие за рамки DOM. Проверяют понимание платформы на глубоком уровне.

---

## 1. Service Workers и PWA

**Service Worker (SW)** — JavaScript-файл, который браузер запускает в фоне, отдельно от страницы. Это прокси между приложением и сетью.

### Жизненный цикл

```
Register → Install → Waiting → Activate → Fetch/Message
                                ↑
                          skipWaiting()
```

1. **Register:** `navigator.serviceWorker.register('/sw.js')`

> **Как читать `navigator.serviceWorker.register()`:** читай как «установи фонового агента, который будет перехватывать ВСЕ сетевые запросы с этой страницы». Service Worker — это не рабочий, это *прокси-сервер внутри браузера*, который живёт отдельно от страницы. Мнемоника: *«зарегистрировал SW — поставил шлагбаум между страницей и интернетом»*.

2. **Install:** событие `install` — кэшируем статику для офлайна
3. **Waiting:** SW ждёт, пока закроются все вкладки со старым SW
4. **Activate:** событие `activate` — чистим старые кэши
5. **Fetch:** перехватывает ВСЕ сетевые запросы страницы

```javascript
// sw.js
const CACHE_NAME = 'app-v1';
const ASSETS = ['/', '/styles.css', '/app.js', '/logo.png'];

// Install: кэшируем статику
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

// Activate: чистим старые кэши
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});

// Fetch: стратегия «сначала кэш, потом сеть»
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached =>
      cached || fetch(event.request)
    )
  );
});
```

**Почему SW не имеет доступа к DOM:**
SW живёт в отдельном потоке и может работать, когда страница закрыта (push-уведомления, фоновая синхронизация). Доступа к DOM нет, общение со страницей — через `postMessage`.

**Стратегии кэширования:**
- **Cache First:** кэш → если нет, то сеть (для статики)
- **Network First:** сеть → если нет, то кэш (для API)
- **Stale While Revalidate:** кэш сразу, потом обновить из сети (для баланса скорости и свежести)

---

## 2. WebSocket vs SSE vs Long Polling

| | WebSocket | SSE (Server-Sent Events) | Long Polling |
|---|---|---|---|
| **Направление** | Двустороннее | Сервер → клиент (одностороннее) | Клиент → сервер → ответ |
| **Протокол** | `ws://` / `wss://` | HTTP | HTTP |
| **Переподключение** | Вручную | Автоматически (встроено) | Вручную |
| **Бинарные данные** | Да | Нет (только текст) | Нет |
| **Сложность** | Средняя | Низкая | Низкая |

**Когда что выбирать:**
- **WebSocket:** чат, real-time коллаборация, биржевые котировки (нужен двусторонний поток)
- **SSE:** лента уведомлений, прогресс загрузки, логи сервера (только сервер → клиент)
- **Long Polling:** когда WebSocket заблокирован корпоративным прокси (fallback)

```javascript
// SSE — на удивление просто
const source = new EventSource('/api/events/stream');
source.onmessage = (event) => {
  console.log('Новое событие:', JSON.parse(event.data));
};
// Автоматически переподключается при разрыве!
source.onerror = () => console.log('Соединение потеряно, идёт переподключение...');
```

**Почему WebSocket может быть избыточен:**
Если нужно только получать уведомления, SSE проще: не нужен heartbeat, авто-реконнект из коробки, работает через HTTP/2 (мультиплексирование), не требует отдельной инфраструктуры.

---

## 3. History API (SPA-роутинг)

**Как работает роутинг без хешей (`#/page`):**

```javascript
// Переход на новую страницу БЕЗ перезагрузки
history.pushState({ page: 'catalog' }, '', '/catalog?sort=price');

// Замена текущей записи (не создаёт новую)
history.replaceState({ page: 'catalog' }, '', '/catalog');

// Кнопка «Назад» в браузере
window.addEventListener('popstate', (event) => {
  console.log('Вернулись на:', document.location.href);
  console.log('Состояние:', event.state); // { page: 'catalog' }
  // Тут перерисовываем UI под новый URL
});
```

**Почему `pushState`, а не `location.hash`:**
- Чистые URL (`/catalog` вместо `/#/catalog`)
- Работает SSR (сервер видит путь и может отрендерить страницу)
- Не ломает якорные ссылки (`#section`)
- SEO: поисковики индексируют пути, но не хеши

**Обязанности SPA-роутера:**
```typescript
// Роутер должен:
// 1. Перехватывать клики по <a> (чтобы не было перезагрузки)
document.addEventListener('click', (e) => {
  const link = (e.target as Element).closest('a');
  if (link?.origin === location.origin) {
    e.preventDefault();
    history.pushState(null, '', link.href);
    renderRoute(link.pathname);
  }
});

// 2. Реагировать на popstate (кнопки Назад/Вперёд)
window.addEventListener('popstate', () => renderRoute(location.pathname));

// 3. При прямом заходе — сервер должен отдать index.html (Nginx try_files)
```

**Nginx для SPA:**
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

---

## 4. Web Workers

**Зачем:** вынести тяжёлые вычисления в отдельный поток, чтобы не блокировать UI.

```javascript
// main.js
const worker = new Worker('/worker.js');
worker.postMessage({ numbers: [1, 2, 3, 4, 5] });
worker.onmessage = (event) => {
  console.log('Результат:', event.data); // не блокирует UI во время вычислений
};

// worker.js
self.onmessage = (event) => {
  const { numbers } = event.data;
  const result = heavyComputation(numbers); // может занять секунды
  self.postMessage(result);
};
```

**Ограничения Workers:**
- Нет доступа к DOM
- Нет доступа к `window`, `document`, `localStorage`
- Общение только через `postMessage` (сериализация: structured clone)
- Для передачи больших данных — Transferable Objects (ArrayBuffer без копирования)

---

## 5. Intersection Observer и Resize Observer

**Intersection Observer** — наблюдение за видимостью элемента (ленивая загрузка, infinite scroll, аналитика):

> **Как читать `new IntersectionObserver(callback, options)`:** читай как «создай датчик движения для элемента — он сработает когда элемент появится или исчезнет из видимой области». Колбэк получает массив `entries` — это не один элемент, а ВСЕ элементы, которые изменили видимость в этом кадре. Мнемоника: *«IntersectionObserver — это датчик: вижу / не вижу»*.

```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      console.log('Элемент появился в viewport!');
      loadLazyImage(entry.target);
      observer.unobserve(entry.target); // больше не следим
    }
  });
}, { threshold: 0.1 }); // 10% элемента видимо

observer.observe(document.querySelector('.lazy-image'));
```

**Почему это лучше, чем scroll-событие:**
- Не вызывает reflow при чтении позиций
- Браузер оптимизирует проверки на compositor-потоке
- Не нужно debounce/throttle

**Resize Observer** — отслеживание изменения размеров элемента (контейнерные запросы без CSS):

```javascript
const ro = new ResizeObserver(entries => {
  for (const entry of entries) {
    const { width } = entry.contentRect;
    entry.target.classList.toggle('compact', width < 400);
  }
});
ro.observe(document.querySelector('.sidebar'));
```

---

## Fetch API и AbortController

### AbortController

Отмена fetch-запроса при размонтировании компонента или смене параметров:

> **Как читать `new AbortController()` + `signal`:** читай как «создай пульт дистанционного управления запросом». `signal` — это провод от пульта к `fetch`, а `controller.abort()` — это красная кнопка «отмена». Если нажал — `fetch` выбросит ошибку `AbortError`, которую ты просто глотаешь. Мнемоника: *«AbortController — это выключатель для fetch»*.

```ts
const controller = new AbortController();

useEffect(() => {
  fetch('/api/data', { signal: controller.signal })
    .then(res => res.json())
    .then(setData)
    .catch(err => {
      if (err.name === 'AbortError') return; // нормально
      throw err;
    });
  
  return () => controller.abort();
}, []);
```

### Fetch Streaming

Чтение ответа по мере поступления (потоковая загрузка):

```ts
const response = await fetch('/api/stream');
const reader = response.body.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  // value — Uint8Array с очередной порцией данных
}
```

### IndexedDB

Клиентская NoSQL-база в браузере. Полезна для:
- Офлайн-данных (PWA)
- Кэширования больших объёмов (аналитика, логи)
- Работы с бинарными данными

---

## Связанное
- [[Браузер и HTTP]]
- [[Вопросы на собеседовании FullStack]]
- [[React рендеринг и производительность]]
