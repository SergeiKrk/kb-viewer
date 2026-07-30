---
title: "Вопросы на собеседовании FullStack"
date: 2026-07-07
tags: [собеседование, fullstack, архитектура, производительность, базы-данных, безопасность, отладка]
category: reference
source_count: 0
---

# Вопросы на собеседовании FullStack

Развёрнутые ответы на ключевые вопросы, проверяющие архитектурное мышление Middle+/Senior FullStack-разработчика.

---

## 1. Самый сложный фуллстэк-проект: технологии и почему

### Структура ответа (STAR: Situation → Task → Action → Result)

**О чём спрашивают на самом деле:**
- Умеешь ли ты принимать архитектурные решения, а не просто «сказали — сделал»
- Понимаешь ли компромиссы (trade-offs) между технологиями
- Видишь ли проект целиком, а не только свой кусок

### Пример развёрнутого ответа

**Situation:** Event-платформа с продажей билетов. 50K+ пользователей, пиковые нагрузки во время старта продаж (10K RPS в первые 5 минут).

**Task:** Сделать систему, которая не ляжет при наплыве, с实时-обновлением остатков билетов.

**Action — выбор технологий и обоснование:**

| Технология | Почему |
|---|---|
| **Next.js 14 (App Router)** | SSR для SEO страниц событий, ISR для каталога, Server Components для снижения JS-бандла |
| **TypeScript** (strict) | Без вариантов: типизация API-контрактов между фронтом и бэком |
| **NestJS** (бэкенд) | Модульная архитектура, DI из коробки, декораторы = читаемый код. Альтернатива: Fastify + самописная структура |
| **PostgreSQL** | ACID для билетов (деньги!), JSONB для гибких настроек событий |
| **Redis** | Кэш + очередь + блокировки билетов при бронировании. Без него — гонка за билетами |
| **BullMQ** (очереди на Redis) | Асинхронная отправка email/SMS, генерация PDF-билетов |
| **WebSocket (Socket.IO)** | Живое обновление остатков билетов на странице события |
| **Docker + k8s** | Горизонтальное масштабирование: больше подов → больше RPS |
| **tRPC или GraphQL** | Типобезопасный контракт между фронтом и бэком. tRPC если один клиент, GraphQL если мобилка + веб |

**Result:** Выдержали 12K RPS, p99 latency < 200ms, ноль овербукингов.

### Ключевое в ответе: не список, а ОБОСНОВАНИЕ каждого выбора

❌ Плохо: «Мы использовали Next.js, NestJS, PostgreSQL и Redis.»
✅ Хорошо: «Redis взяли для атомарного резервирования билетов через INCR, потому что PostgreSQL при 10K конкурентных UPDATE на одну строку даёт локи.»

---

## 2. Оптимизация при наплыве пользователей

### С чего начинать: измерять, а не гадать

Порядок действий:
1. Снимаем метрики (Grafana, DataDog, NewRelic) — CPU, memory, latency, RPS
2. Находим узкое место: база? бэкенд? фронтенд? сеть?
3. Чиним по приоритету «бутылочного горлышка»

### Типичные проблемы и решения

#### 🔴 База данных — узкое место

**Симптом:** медленные запросы, таймауты, очередь коннектов.

**Решения:**
- **Индексы:** `EXPLAIN ANALYZE` → добавить недостающие. Для event-платформы: индекс на `event_id + status` в таблице билетов
- **Партицирование:** разбить таблицу билетов по `event_id` — старые события не мешают новым
- **Репликация:** `primary` — запись, `replicas` — чтение. Список событий читаем с реплики
- **Пул соединений:** PgBouncer/Pgpool — 1000 запросов ≠ 1000 коннектов к PG
- **Кэш:** Redis. Сессии, остатки билетов, конфиг событий — всё в кэш

```typescript
// Паттерн: проверка остатка через Redis, затем списание через БД
async reserveTicket(userId: string, eventId: string) {
    // 1. Атомарно проверяем и резервируем в Redis
    const remaining = await redis.decr(`event:${eventId}:tickets`);
    if (remaining < 0) {
        await redis.incr(`event:${eventId}:tickets`); // откат
        throw new Error('Sold out');
    }
    // 2. Асинхронно списываем в БД (не блокируем пользователя!)
    await queue.add('create-ticket', { userId, eventId });
    return { success: true };
}
```

#### 🟡 Бэкенд — узкое место

**Решения:**
- **Горизонтальное масштабирование:** больше инстансов за балансировщиком
- **Rate limiting:** ограничить 1 IP = N запросов/сек. Защита от ботов и перекупов
- **Async first:** email, PDF, уведомления — только через очередь. HTTP-запрос не должен ждать генерации PDF
- **HTTP/2 + gzip/brotli:** уменьшить размер ответов

#### 🟢 Фронтенд — узкое место

- **Code splitting + lazy loading:** админка и страница события — разные бандлы
- **Виртуализация списков:** 1000 событий в каталоге ≠ 1000 DOM-узлов (react-window, TanStack Virtual)
- **Debounce/throttle:** строка поиска, скролл-ивенты
- **Optimistic UI:** показали «Билет забронирован» сразу, подтверждение — фоном

### Что точно не надо делать

- ❌ Сразу менять стек («давайте перепишем на Go»)
- ❌ Добавлять кэш везде без инвалидации («у пользователя билет есть, а мы говорим sold out»)
- ❌ Игнорировать холодный старт serverless (если Lambda — держите warm)

---

## 3. Архитектура БД: пользователи и события со множеством связей

### Требования event-платформы

- Пользователи: регистрация, роли (организатор/участник), профиль
- События: название, описание, дата, место, типы билетов, цены
- Связи: пользователь покупает билет → бронирование. Организатор создаёт событие → владение. Участник сохраняет в избранное.
- Плюс: отзывы, рейтинги, теги, категории

### Модель данных (упрощённая)

```
users
  id: UUID PK
  email: string UNIQUE
  name: string
  role: 'user' | 'organizer' | 'admin'
  created_at: timestamp

events
  id: UUID PK
  organizer_id: UUID FK → users.id
  title: string
  description: text
  venue: string
  start_date: timestamp
  end_date: timestamp
  status: 'draft' | 'published' | 'cancelled'
  config: JSONB  -- гибкие настройки (кастомные поля, галочки)
  created_at: timestamp

ticket_types
  id: UUID PK
  event_id: UUID FK → events.id
  name: string          -- 'VIP', 'Standard', 'Early Bird'
  price: decimal
  quantity: integer     -- всего мест
  available: integer    -- осталось (денормализация для скорости!)
  sale_start: timestamp
  sale_end: timestamp

bookings
  id: UUID PK
  user_id: UUID FK → users.id
  event_id: UUID FK → events.id
  ticket_type_id: UUID FK → ticket_types.id
  quantity: integer
  total_price: decimal
  status: 'pending' | 'confirmed' | 'cancelled' | 'refunded'
  created_at: timestamp
  -- Составной индекс для частых запросов:
  INDEX idx_user_event (user_id, event_id)
  INDEX idx_event_status (event_id, status)

favorites
  user_id: UUID FK → users.id
  event_id: UUID FK → events.id
  PRIMARY KEY (user_id, event_id)  -- составной ключ вместо отдельного id

reviews
  id: UUID PK
  user_id: UUID FK → users.id
  event_id: UUID FK → events.id
  rating: integer CHECK (rating >= 1 AND rating <= 5)
  comment: text
  created_at: timestamp
  UNIQUE (user_id, event_id)  -- один отзыв на событие

event_tags
  event_id: UUID FK → events.id
  tag_id: UUID FK → tags.id
  PRIMARY KEY (event_id, tag_id)
```

### Ключевые решения

**1. JSONB для `config` — почему не EAV**
EAV (Entity-Attribute-Value) даёт гибкость, но запросы — боль:
```sql
-- EAV: найти события с «бесплатной парковкой»
SELECT event_id FROM event_attributes
WHERE key = 'parking' AND value = 'free';
-- против
SELECT * FROM events WHERE config->>'parking' = 'free'; -- JSONB + GIN индекс
```

**2. Денормализация `ticket_types.available`**
Храним остаток в таблице типов билетов, а не считаем `SUM(quantity)` из bookings. Потому что при 10K бронирований в минуту `SELECT SUM()` — бутылочное горлышко.

**3. Составной PRIMARY KEY вместо автоинкремента**
`favorites(user_id, event_id)` — не нужен отдельный `id`, если связь уникальна. Экономия места + индекс.

**4. Мягкое удаление**
```sql
ALTER TABLE events ADD COLUMN deleted_at timestamp NULL;
-- Все SELECT-запросы добавляют WHERE deleted_at IS NULL
```
Пользователи хотят видеть историю купленных билетов, даже если событие отменили.

### Антипаттерны

- ❌ `MongoDB` для билетов: нет ACID-транзакций → двойная продажа
- ❌ Хранить цену только в `ticket_types`: при изменении цены ломается история покупок. Цену при покупке копируем в `bookings.total_price`
- ❌ `status` как свободная строка. Только enum/CHECK constraint

---

## 4. Безопасность фронтенд ↔ бэкенд

### Уровни защиты (defence in depth)

#### 🔐 Уровень 1: Аутентификация и авторизация

```
Браузер ──[JWT/сессия]──> Бэкенд ──[RBAC]──> Доступ
```

- **JWT:** Access Token (15 мин) + Refresh Token (7 дней, httpOnly cookie)
- **Refresh Token в httpOnly Secure SameSite Cookie** — не доступен из JS (защита от XSS)
- **Access Token в памяти (переменная JS)** — не в localStorage!
- **RBAC:** role-based access. Организатор ≠ админ ≠ пользователь

```typescript
// Middleware на бэке
@Injectable()
export class RolesGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
        const { user } = context.switchToHttp().getRequest();
        return requiredRoles.includes(user.role);
    }
}

// Контроллер
@Roles('organizer', 'admin')
@Post('events')
createEvent() { ... }
```

#### 🛡️ Уровень 2: Валидация ВСЕХ входящих данных

- **Никогда не доверять фронтенду.** Фронт может быть подменён (MitM, расширения, консоль)
- Валидация на бэке (class-validator/Zod) — обязательна
- Санитизация от XSS: `DOMPurify` на фронте, экранирование на бэке

```typescript
// Zod — валидация и тип в одном
import { z } from 'zod';

const CreateEventSchema = z.object({
    title: z.string().min(3).max(200),
    startDate: z.string().datetime(),
    price: z.number().positive().max(1000000),
    description: z.string().max(10000).transform(s => sanitizeHtml(s)),
});

// Тип автоматически выводится из схемы
type CreateEvent = z.infer<typeof CreateEventSchema>;
```

#### 🔒 Уровень 3: CORS, CSP, HTTPS

```typescript
// CORS: только наш домен
app.enableCors({
    origin: ['https://myeventplatform.com'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
});
```

```html
<!-- CSP: запрещаем inline-скрипты -->
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';">
```

- **HTTPS always** — HSTS заголовок
- **SameSite=Strict** для всех кук

#### 🧪 Уровень 4: Защита от специфичных атак

**CSRF:**
```typescript
// Если API не pure-REST (есть куки): CSRF-токен
// Если SPA с JWT в заголовке Authorization: CSRF не нужен
// (браузер не прикрепит заголовок Authorization автоматически)
```

**Rate Limiting:**
```typescript
// 100 запросов в 15 минут с одного IP
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
}));
```

**SQL Injection → не актуально при ORM:**
```typescript
// ❌ template string
db.query(`SELECT * FROM users WHERE id = ${userId}`);
// ✅ параметризованный запрос (ORM делает автоматически)
db.user.findUnique({ where: { id: userId } });
```

**IDOR (Insecure Direct Object Reference):**
```typescript
// ❌ Не проверяем принадлежность
@Get('bookings/:id')
async getBooking(@Param('id') id: string) {
    return this.db.booking.findUnique({ where: { id } });
}
// ✅ Проверяем, что бронирование принадлежит текущему пользователю
@Get('bookings/:id')
async getBooking(@Param('id') id: string, @Req() req) {
    return this.db.booking.findFirst({
        where: { id, userId: req.user.id }
    });
}
```

### Чек-лист безопасности

- [ ] JWT Refresh в httpOnly cookie, не в localStorage
- [ ] Все входные данные валидируются на бэке (Zod/class-validator)
- [ ] CORS разрешает только свой домен
- [ ] CSP-заголовки
- [ ] Rate limiting на критические эндпоинты
- [ ] Все SELECT-запросы проверяют принадлежность (userId)
- [ ] Пароли: bcrypt/argon2, никогда не plain text
- [ ] HTTPS enforced (HSTS)
- [ ] Зависимости проверены (npm audit, Snyk)

---

## 5. Отладка багов на стороне клиента

### Методология поиска

**Шаг 1: Воспроизвести**

Баги «только у клиента» — почти всегда связаны с:
- Конкретным окружением (браузер, ОС, расширения)
- Конкретными данными (у этого пользователя особый набор)
- Таймингами (гонка состояний, slow network)

Способы воспроизвести:
- Попросить **точные шаги** (не «у меня не работает», а «захожу на /events/123 → жму Купить → белый экран»)
- Собрать **окружение**: браузер + версия, ОС, расширения (попросить попробовать в инкогнито без расширений!)
- Воссоздать **состояние**: экспортировать данные пользователя в тестовое окружение

**Шаг 2: Собрать информацию**

Инструменты в порядке эффективности:

| Инструмент | Что даёт |
|---|---|
| **Sentry / Rollbar / LogRocket** | Автоматический сбор ошибок + replay сессии |
| **Кастомный логгер** | `logger.error('checkout failed', { userId, cart, step })` |
| **Chrome DevTools → Network** | Какие запросы ушли, с какими ответами |
| **Performance API** | `performance.getEntriesByType('navigation')` |
| **User Report** | Форма «Что случилось?» с авто-прикреплением скриншота и логов |

### Практический флоу отладки

```typescript
// 1. Оборачиваем критический код в try/catch с контекстом
async function checkout(cart: Cart) {
    try {
        logger.info('checkout.start', { cartId: cart.id, items: cart.items.length });
        const order = await api.createOrder(cart);
        logger.info('checkout.order_created', { orderId: order.id });
        await redirectToPayment(order.paymentUrl);
    } catch (error) {
        logger.error('checkout.failed', {
            cartId: cart.id,
            step: error.step || 'unknown',
            error: error.message,
            userAgent: navigator.userAgent, // ← контекст!
        });
        throw error;
    }
}

// 2. Sentry — автоматический сбор
Sentry.init({
    dsn: '...',
    environment: process.env.NODE_ENV,
    beforeSend(event) {
        // Добавляем версию приложения, ID пользователя
        event.user = { id: currentUser.id };
        event.tags = { app_version: APP_VERSION };
        return event;
    },
});
```

### Типичные баги «только у клиента» и их причины

| Симптом | Вероятная причина | Решение |
|---|---|---|
| **Работает в Chrome, не работает в Safari** | Нет полифила (ResizeObserver, Intl, CSS-свойство) | `browserslist` + `@babel/preset-env` + проверять caniuse |
| **Пустой экран у 1% пользователей** | AdBlock ломает код (React DevTools, Sentry-лайблери запрещены) | ErrorBoundary, загружать критическое синхронно |
| **Заказ подвис на оплате** | Пользователь закрыл вкладку, WebSocket разорвался | Idempotency key: повторный запрос не создаст дубликат заказа |
| **«У меня всё лагает»** | Расширения (Grammarly, LastPass), медленный ПК, 100+ вкладок | Проверить `performance.memory`, предложить инкогнито |
| **Форма не отправляется** | Автозаполнение браузера вставило пробел в конец email | `.trim()` на бэке + debounce на фронте |

### Продвинутые инструменты

```typescript
// 1. Feature flags: быстро отключить проблемный функционал для конкретного пользователя
if (featureFlags.isEnabled('new-checkout', user.id)) {
    return <NewCheckout />;
}
return <OldCheckout />;

// 2. Session Replay: LogRocket/FullStory записывают всё, что делал пользователь
// Видим: пользователь нажал кнопку → ушёл запрос → ответ 500 → ошибка

// 3. Кастомный ErrorBoundary в React
class CheckoutErrorBoundary extends React.Component {
    componentDidCatch(error, errorInfo) {
        logger.error('checkout.crash', {
            error: error.message,
            componentStack: errorInfo.componentStack,
            url: window.location.href,
            cart: cartStorage.get(), // сохраняем корзину
        });
        cartStorage.saveForRecovery(this.props.cart); // чтобы не потерять
    }
    render() {
        if (this.state.hasError) {
            return <CheckoutFallback onRetry={() => this.setState({ hasError: false })} />;
        }
        return this.props.children;
    }
}
```

### Что точно не надо делать

- ❌ «У меня работает» — и закрыть тикет
- ❌ Просить не-технического пользователя открыть DevTools
- ❌ Править наугад без понимания причины
- ❌ Игнорировать баги с частотой <1% (это 500 пользователей при 50K аудитории)

---

## Связанное
- [[Event Loop макротаски микротаски]] — Event Loop глубоко

- [[Интернационализация и локализация i18n]] — локализация приложений

- [[Soft skills собеседование]] — поведенческие вопросы и подготовка

- [[TypeScript продвинутый]]
- [[Архитектура React компонентов]]
- [[Управление состоянием]]
- [[Тестирование React]]
