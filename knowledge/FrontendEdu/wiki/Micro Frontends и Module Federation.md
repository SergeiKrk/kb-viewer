---
title: "Micro Frontends и Module Federation"
date: 2026-07-16
tags: [микрофронтенды, module-federation, webpack, архитектура]
category: concept
source_count: 0
---

# Micro Frontends и Module Federation

## Что это и зачем

**Micro Frontends** — архитектурный подход, при котором фронтенд разбивается на независимые микро-приложения, каждое со своим стеком, репозиторием и командой. Аналог микросервисов на бэкенде.

**Когда применять:**
- Большая команда (20+ фронтендеров)
- Несколько независимых потоков разработки
- Разные части приложения обновляются с разной скоростью
- Постепенная миграция с легаси-стека

**Когда НЕ применять:**
- Команда из 3-5 человек — избыточно
- Нет проблем с масштабированием команд
- Приложение монолитное и стабильное

---

## Module Federation (Webpack 5)

**Сборка во время выполнения (runtime), а не на этапе билда.** Один микрофронтенд (host) загружает другой (remote) прямо в браузере.

### Базовая конфигурация

**Remote (микрофронтенд, который ОТДАЁТ):**

> **Как читать `exposes`:** ключ слева (`'./Button'`) — это «витрина», имя, по которому другие будут запрашивать твой модуль. Значение справа (`'./src/Button'`) — где этот модуль реально лежит у тебя в проекте. Грубо: «по запросу Button отдай файл из src/Button».

```javascript
// webpack.config.js (remote)
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'remote_app',              // уникальное имя
      filename: 'remoteEntry.js',       // точка входа для host'а
      exposes: {
        './Button': './src/Button',     // что отдаём наружу
        './Header': './src/Header',
      },
      shared: {                         // общие зависимости
        react: { singleton: true, eager: true },
        'react-dom': { singleton: true, eager: true },
      },
    }),
  ],
};
```

**Host (приложение-оболочка, которое ПРИНИМАЕТ):**

> **Как читать `remotes`:** `remote: 'remote_app@http://localhost:3001/remoteEntry.js'` — «создай переменную `remote`, которая ссылается на приложение с именем `remote_app`, загрузив его точку входа с этого URL». После этого `import('remote/Button')` будет работать как обычный импорт, но код прилетит по сети.

```javascript
// webpack.config.js (host)
new ModuleFederationPlugin({
  name: 'host',
  remotes: {
    remote: 'remote_app@http://localhost:3001/remoteEntry.js',
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
  },
}),
```

**Использование в коде:**

> **Как читать `React.lazy(() => import('remote/Button'))`:** «React, не загружай код этой кнопки сразу при старте. Когда она реально понадобится в первый раз — сходи по сети, загрузи микрофронтенд, и только потом отрендери». `Suspense` — это заглушка «Загрузка…», которую пользователь видит, пока летит сетевой запрос.

```typescript
// Ленивая загрузка микрофронтенда
const RemoteButton = React.lazy(() => import('remote/Button'));

// В компоненте — обязательно Suspense!
function App() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <RemoteButton />
    </Suspense>
  );
}
```

---

## Shared-зависимости: ключевой момент

`singleton: true` гарантирует, что React загрузится ОДИН раз, а не по копии на каждый микрофронтенд.

> **Как читать `shared: { react: { singleton: true, eager: true } }`:** «React — общая библиотека. `singleton: true` — пусть будет только одна её копия на всё приложение, иначе сломаются хуки. `eager: true` — загрузи её прямо сейчас, не жди первого импорта (нужно для host-приложения, которое рендерит React с первой секунды)».

```
❌ Без singleton:
  host/react (версия 18.2) + remote/react (версия 18.2) = 2 копии → ошибка хуков

✅ С singleton:
  host/react → общий экземпляр → оба используют одну версию
```

**Eager vs non-eager:**
- `eager: true` — загружается СРАЗУ при старте (нужно для host, который всегда рендерит React)
- `eager: false` — загружается по требованию (для remote — загрузится при первом `import()`)

---

## Module Federation 2 (Rspack / ByteDance)

Module Federation 2 — эволюция от создателей Webpack (Zack Jackson, теперь в ByteDance). Ключевые отличия:

| | MF 1 (Webpack) | MF 2 (Rspack) |
|---|---|---|
| **Рантайм** | Только Webpack | Webpack, Rspack, Vite (через плагин) |
| **Типы** | Нет встроенной типизации | Генерация `.d.ts` для remote |
| **Динамические remote** | Через `__webpack_init_sharing__` | Нативный API |
| **Версионирование** | Ручное управление | Manifest-файл с версиями |
| **Dev-режим** | Медленная сборка | HMR между микрофронтами |

### MF2: динамическая загрузка remote

```typescript
// MF2 — динамический remote без правки webpack.config
import { loadRemote } from '@module-federation/runtime';

const RemoteApp = React.lazy(() =>
  loadRemote({
    url: 'http://localhost:3001/remoteEntry.js',
    scope: 'remote_app',
    module: './App',
  })
);
```

---

## Роутинг между микрофронтендами

**Два подхода:**

### 1. Роутинг на уровне оболочки (Shell)
```typescript
// Host (оболочка) управляет ВСЕМИ маршрутами
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/dashboard/*" element={<DashboardMicroFrontend />} />
  <Route path="/settings/*" element={<SettingsMicroFrontend />} />
</Routes>
```

### 2. Децентрализованный роутинг
Каждый микрофронтенд объявляет свои маршруты:
```typescript
// dashboard-mf
export const routes = [
  { path: '/dashboard', component: Dashboard },
  { path: '/dashboard/analytics', component: Analytics },
];

// host собирает все маршруты
const allRoutes = microFrontends.flatMap(mf => mf.routes);
```

**Рекомендация:** оболочка + децентрализованные объявления. Оболочка знает дерево, микрофронтенды — свои листья.

---

## Коммуникация между микрофронтендами

**Правило:** микрофронтенды НЕ импортируют код друг друга напрямую. Только через контракты:

### 1. Custom Events (для редких событий)
```typescript
// MF1: отправляет
window.dispatchEvent(new CustomEvent('cart:updated', { detail: { items: 3 } }));

// MF2: слушает
window.addEventListener('cart:updated', (e) => updateCartBadge(e.detail.items));
```

### 2. Shared Store (через оболочку)
```typescript
// Оболочка предоставляет EventEmitter или Zustand-store
// MF1: обновляет
shellStore.set('user', newUser);

// MF2: подписывается
shellStore.subscribe('user', (user) => updateUI(user));
```

### 3. URL (для состояния навигации)
```typescript
// MF1: устанавливает
navigate('/search?q=react');

// MF2: читает
const [searchParams] = useSearchParams();
const query = searchParams.get('q');
```

---

## Версионирование и деплой

```
Оболочка (Host) ← всегда загружает актуальную версию Remote
                    через remoteEntry.js

Развёртывание:
  Remote v1.0 на http://cdn/remote/v1.0/remoteEntry.js
  Remote v1.1 на http://cdn/remote/v1.1/remoteEntry.js

Host знает актуальную версию → бесшовное обновление
```

---

## Антипаттерны

- ❌ Общий стейт-менеджер на ВСЁ приложение — микрофронтенды должны быть независимы
- ❌ Прямой импорт из другого микрофронтенда — нарушает изоляцию
- ❌ Слишком много микрофронтендов (50+) — управление версиями становится адом
- ❌ Забыть про `Suspense` — `React.lazy()` без `Suspense` → белый экран
- ❌ Разные версии React без `singleton` — хуки ломаются

---

## Что отвечать на собеседовании

**«Работали с микрофронтендами?»**
> Да, использовали Module Federation в Webpack 5. Host-приложение загружало 3 микрофронтенда: дашборд, настройки и профиль. Настроили `singleton` для React, чтобы избежать дублирования. Роутинг — децентрализованный: каждый MF объявлял свои маршруты, оболочка собирала в дерево. Коммуникация через кастомные события и URL-параметры.

**«Какие проблемы решали?»**
> Основная — версионирование. Когда host и remote используют одну версию библиотеки, а remote её обновляет — нужен механизм согласования. Решили через `shared` с `requiredVersion` и CI-проверкой совместимости.

**«MF1 vs MF2 — отличие?»**
> MF2 работает на уровне runtime-API, не привязан к Webpack. Можно микшировать Webpack, Rspack, Vite. Плюс встроенная типизация для remote-модулей — host получает автокомплит.

---

## Связанное
- [[Сборщики и инструменты]]
- [[Архитектурные паттерны]]
- [[Архитектура React компонентов]]
