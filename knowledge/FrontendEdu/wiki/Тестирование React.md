---
title: "Тестирование React"
date: 2026-07-07
tags: [testing, react-testing-library, vitest, msw, playwright, e2e]
category: concept
source_count: 0
---

# Тестирование React

На собеседованиях Middle+ спрашивают не «умеешь ли ты писать тесты», а «КАКИЕ тесты ты пишешь и почему». Главное — понимать пирамиду тестирования и выбирать правильный инструмент под задачу.

---

## 1. Пирамида тестирования

```
     ╱  E2E  ╲          Playwright / Cypress
    ╱──────────╲         Медленные (секунды), дорогие, но проверяют реальный флоу
   ╱ Integration ╲       React Testing Library + MSW
  ╱───────────────╲      Проверяют взаимодействие компонентов
 ╱   Unit tests    ╲     Vitest / Jest
╱───────────────────╲    Быстрые (миллисекунды), дешёвые, много
```

| Уровень | Инструмент | Объём | Скорость | Что тестирует |
|---|---|---|---|---|
| **Unit** | Vitest | 60-70% | ~1ms | Чистые функции, хуки, утилиты |
| **Integration** | RTL + MSW | 20-30% | ~50-200ms | Компоненты + API + хранилище |
| **E2E** | Playwright | 5-10% | ~1-5s | Критические пользовательские сценарии |

**Правило:** если баг можно отловить уровнем ниже — тестируй уровнем ниже. E2E — только для критических путей (оплата, регистрация).

---

## 2. Unit-тесты: Vitest

### Почему Vitest, а не Jest

- Совместим с Jest API (`describe`, `it`, `expect`)
- Работает с ESM из коробки
- В 2-3 раза быстрее
- Нативная интеграция с Vite (тот же `vite.config.ts`)

### Тестирование чистых функций

```typescript
// utils/ticket.ts
export function formatPrice(price: number, currency = '₽'): string {
    return `${price.toLocaleString('ru-RU')}${currency}`;
}

export function canBuy(available: number, requested: number): boolean {
    return available >= requested && requested > 0;
}

// utils/ticket.test.ts
import { describe, it, expect } from 'vitest';

describe('formatPrice', () => {
    it('форматирует целое число', () => {
        expect(formatPrice(1500)).toBe('1 500 ₽');
    });
    it('форматирует дробное', () => {
        expect(formatPrice(1499.99)).toBe('1 499,99 ₽');
    });
    it('принимает другую валюту', () => {
        expect(formatPrice(100, '$')).toBe('100 $');
    });
});

describe('canBuy', () => {
    it('возвращает true если достаточно билетов', () => {
        expect(canBuy(10, 3)).toBe(true);
    });
    it('возвращает false если не хватает', () => {
        expect(canBuy(2, 5)).toBe(false);
    });
    it('возвращает false для нуля', () => {
        expect(canBuy(10, 0)).toBe(false);
    });
});
```

### Тестирование хуков

> **Как читать `renderHook(() => useCounter(5))` + `result.current`:** «отрендери хук в изолированной песочнице (без компонента-обёртки) и читай его текущее состояние через `result.current` — это как `ref.current`, которое обновляется после каждого `act()`». `act()` нужен, чтобы React применил все обновления состояния перед следующей проверкой.

```typescript
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

// Хук из предыдущего раздела
function useCounter(initial = 0) {
    const [count, setCount] = useState(initial);
    const increment = () => setCount(c => c + 1);
    const decrement = () => setCount(c => c - 1);
    return { count, increment, decrement };
}

describe('useCounter', () => {
    it('начинает с initial значения', () => {
        const { result } = renderHook(() => useCounter(5));
        expect(result.current.count).toBe(5);
    });

    it('увеличивает счётчик', () => {
        import { useState } from 'react';

const { result } = renderHook(() => useCounter());
        act(() => result.current.increment());
        expect(result.current.count).toBe(1);
    });

    it('уменьшает счётчик', () => {
        const { result } = renderHook(() => useCounter(3));
        act(() => result.current.decrement());
        expect(result.current.count).toBe(2);
    });
});
```

### Моки таймеров

```typescript
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('debounce', () => {
    beforeEach(() => { vi.useFakeTimers(); });

    it('вызывает функцию через указанную задержку', () => {
        const fn = vi.fn();
        const debounced = debounce(fn, 300);
        debounced();
        expect(fn).not.toHaveBeenCalled();
        vi.advanceTimersByTime(300);
        expect(fn).toHaveBeenCalledOnce();
    });
});
```

---

## 3. Интеграционные тесты: React Testing Library

### Философия RTL

Тестируй как пользователь, а не как разработчик:
- ❌ `wrapper.state().isOpen` — тест сломается при рефакторинге
- ✅ `screen.getByText('Меню')` — тест живёт, пока пользователь видит кнопку

### Тестирование компонента

```typescript
// EventCard.tsx
interface EventCardProps {
    title: string;
    date: string;
    price: number;
    available: number;
    onBuy: () => void;
}

export function EventCard({ title, date, price, available, onBuy }: EventCardProps) {
    return (
        <article>
            <h2>{title}</h2>
            <time>{date}</time>
            <p>{formatPrice(price)}</p>
            <button onClick={onBuy} disabled={available === 0}>
                {available === 0 ? 'Продано' : 'Купить'}
            </button>
        </article>
    );
}

// EventCard.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

describe('EventCard', () => {
    it('отображает название и цену', () => {
        render(<EventCard title="React Conf" date="2026-08-01" price={5000} available={10} onBuy={vi.fn()} />);
        expect(screen.getByText('React Conf')).toBeInTheDocument();
        expect(screen.getByText('5 000 ₽')).toBeInTheDocument();
    });

    it('вызывает onBuy при клике', async () => {
        const onBuy = vi.fn();
        render(<EventCard title="React Conf" date="2026-08-01" price={5000} available={10} onBuy={onBuy} />);
        const user = userEvent.setup();
        await user.click(screen.getByRole('button', { name: 'Купить' }));
        expect(onBuy).toHaveBeenCalledOnce();
    });

    it('блокирует кнопку если available = 0', () => {
        render(<EventCard title="React Conf" date="2026-08-01" price={5000} available={0} onBuy={vi.fn()} />);
        expect(screen.getByRole('button', { name: 'Продано' })).toBeDisabled();
    });
});
```

### Тестирование асинхронных операций

```typescript
import { render, screen, waitFor } from '@testing-library/react';

it('показывает список событий после загрузки', async () => {
    render(<EventsList />);
    // Сначала — индикатор загрузки
    expect(screen.getByText('Загрузка...')).toBeInTheDocument();
    // Ждём появления данных
    await waitFor(() => {
        expect(screen.getByText('React Conf')).toBeInTheDocument();
    });
    // Индикатор исчез
    expect(screen.queryByText('Загрузка...')).not.toBeInTheDocument();
});
```

### Поиск элементов — приоритет

```typescript
// 1. По роли (лучший способ)
screen.getByRole('button', { name: 'Купить' });
screen.getByRole('heading', { name: /react conf/i });

// 2. По тексту
screen.getByText('5 000 ₽');
screen.getByText(/продано/i);

// 3. По test-id (только если никак иначе)
screen.getByTestId('event-card-123');

// ❌ Никогда: по классам, по структуре DOM
```

---

## 4. Моки API: MSW (Mock Service Worker)

### Зачем MSW

Мокать `fetch` напрямую — хрупко. MSW перехватывает запросы на уровне сети (Service Worker), компонент ведёт себя как в реальности.

> **Как читать `http.get('/api/events/:id', ({ params }) => ...)`:** «перехвати GET-запрос, где `:id` — динамический сегмент URL, и получи его значение через деструктуризацию `{ params }`». Сигнатура колбэка MSW зеркалит Express.js: `:param` в пути → `params.param` в обработчике.

```typescript
// mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
    // Мок списка событий
    http.get('/api/events', () => {
        return HttpResponse.json([
            { id: '1', title: 'React Conf', price: 5000, date: '2026-08-01' },
            { id: '2', title: 'VueConf', price: 3000, date: '2026-09-15' },
        ]);
    }),

    // Мок конкретного события
    http.get('/api/events/:id', ({ params }) => {
        return HttpResponse.json({
            id: params.id,
            title: 'React Conf',
            price: 5000,
        });
    }),

    // Мок ошибки
    http.post('/api/events', () => {
        return new HttpResponse(null, { status: 500 });
    }),
];
```

```typescript
// setup.ts
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';

const server = setupServer(...handlers);
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers()); // сброс между тестами
afterAll(() => server.close());
```

### Переопределение мока в конкретном тесте

```typescript
it('показывает ошибку при падении API', async () => {
    server.use(
        http.get('/api/events', () => {
            return new HttpResponse(null, { status: 500 });
        })
    );
    render(<EventsList />);
    await waitFor(() => {
        expect(screen.getByText(/ошибка/i)).toBeInTheDocument();
    });
});
```

---

## 5. E2E-тесты: Playwright

### Когда нужны E2E

Только для критических пользовательских сценариев:
- Регистрация / логин
- Покупка билета (весь флоу от выбора до оплаты)
- Создание события организатором

```typescript
// tests/checkout.spec.ts
import { test, expect } from '@playwright/test';

test('полный флоу покупки билета', async ({ page }) => {
    // 1. Открываем каталог
    await page.goto('/events');
    await expect(page.getByRole('heading', { name: 'События' })).toBeVisible();

    // 2. Выбираем событие
    await page.getByText('React Conf').click();
    await expect(page.getByText('5 000 ₽')).toBeVisible();

    // 3. Добавляем билет
    await page.getByRole('button', { name: 'Купить' }).click();
    await expect(page.getByText('Корзина (1)')).toBeVisible();

    // 4. Оформляем заказ
    await page.getByRole('button', { name: 'Оформить' }).click();
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByRole('button', { name: 'Оплатить' }).click();

    // 5. Подтверждение
    await expect(page.getByText('Заказ подтверждён')).toBeVisible();
    await expect(page.getByText('React Conf')).toBeVisible();
});
```

### Playwright vs Testing Library

| | Testing Library | Playwright |
|---|---|---|
| **Где запускается** | Node.js (JSDOM) | Реальный браузер |
| **Скорость** | Быстро (50-200ms) | Медленно (1-5s) |
| **Для чего** | Логика компонентов, состояния, рендер | Пользовательские сценарии, кросс-браузерность |
| **Сеть** | Моки (MSW) | Можно и реальный бэкенд |
| **Запуск в CI** | Всегда | Выборочно (дорого) |

---

## 6. Что тестировать — приоритеты

### 🔴 Обязательно (без этого нельзя в продакшен)
- Критические бизнес-флоу (покупка, регистрация) — E2E
- Компоненты с условной логикой (disabled, loading, error) — RTL
- Чистые функции с бизнес-логикой (расчёт цены, валидация) — Unit

### 🟡 Желательно
- Обработка ошибок API (500, 403, network error) — RTL + MSW
- Состояния загрузки — RTL
- Кастомные хуки — Unit (renderHook)

### 🟢 Опционально
- Верстка (пиксель-пёрфект) — скриншотные тесты Playwright
- Accessibility — jest-axe
- Производительность — Lighthouse CI

---

## 7. Антипаттерны в тестах

| Антипаттерн | Почему плохо | Как исправить |
|---|---|---|
| Тестировать реализацию (`state.isOpen`) | Сломается при рефакторинге | Тестировать поведение (`getByText('Меню')`) |
| `data-testid` везде | Тест не проверяет, что видят пользователи | Кнопки — `getByRole`, текст — `getByText` |
| 100% покрытие | Дорого поддерживать, мнимая ценность | Покрывать критическое, остальное по необходимости |
| Один огромный тест | Непонятно что сломалось | Маленькие тесты: один тест = одна проверка |
| Тесты зависят друг от друга | Порядок выполнения влияет на результат | Каждый тест независим (beforeEach) |
| Мокать всё | Тест проходит, а в реальности — нет | Мокать только внешние зависимости (API) |

---

## Связанное
- [[HTML и Accessibility (a11y)]] — тестирование доступности (jest-axe, Lighthouse)

- [[React рендеринг и производительность]]
- [[Управление состоянием]]
- [[Архитектура React компонентов]]
