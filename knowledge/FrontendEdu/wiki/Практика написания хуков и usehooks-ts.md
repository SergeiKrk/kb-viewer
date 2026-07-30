---
title: "Практика написания хуков и usehooks-ts"
date: 2026-07-16
tags: [хуки, практика, usehooks-ts, собеседование, код-руками]
category: reference
source_count: 1
---

# Практика написания хуков и usehooks-ts

**Результат собеседования 16.07.2026:** завалил техническую часть. Собеседующий рекомендовал писать код руками, в частности хуки. Рекомендованный ресурс: [usehooks-ts.com](https://usehooks-ts.com).

---

## Почему именно хуки

Хук — идеальная единица практики:
- Изолированная логика (не зависит от UI)
- Покрывает замыкания, useEffect, useRef, useCallback, чистку
- Типизируется (TypeScript)
- Компактный размер (20-60 строк)
- Можно написать за 15-30 минут

На собеседовании часто просят: «напишите useDebounce», «напишите useLocalStorage», «напишите usePrevious». Это проверяет понимание жизненного цикла React, замыканий и побочных эффектов.

---

## usehooks-ts: библиотека и учебник

[usehooks-ts](https://usehooks-ts.com) — библиотека из 33 готовых TypeScript-хуков. **Использовать не как npm-пакет, а как учебник:** открыть исходник, понять КАК работает, закрыть, написать САМОСТОЯТЕЛЬНО, сверить.

### Полный список хуков библиотеки

1. `useBoolean` — переключение true/false
2. `useClickAnyWhere` — отслеживание кликов
3. `useCopyToClipboard` — копирование текста
4. `useCountdown` — обратный отсчёт
5. `useCounter` — счётчик с min/max
6. `useDarkMode` — тёмная тема
7. `useDebounceCallback` — debounce для функций
8. `useDebounceValue` — debounce для значений
9. `useDocumentTitle` — установка title
10. `useEventCallback` — стабильная ссылка на колбэк
11. `useEventListener` — подписка на события
12. `useHover` — отслеживание наведения
13. `useIntersectionObserver` — видимость элемента
14. `useInterval` — setInterval с очисткой
15. `useIsClient` — проверка client-side
16. `useIsMounted` — проверка монтирования
17. `useIsomorphicLayoutEffect` — useLayoutEffect без SSR-ошибок
18. `useLocalStorage` — стейт в localStorage
19. `useMap` — Map как React-стейт
20. `useMediaQuery` — медиа-запросы
21. `useOnClickOutside` — клик вне элемента
22. `useReadLocalStorage` — чтение из localStorage
23. `useResizeObserver` — отслеживание размера
24. `useScreen` — размеры экрана
25. `useScript` — загрузка внешнего скрипта
26. `useScrollLock` — блокировка скролла
27. `useSessionStorage` — стейт в sessionStorage
28. `useStep` — пошаговая навигация
29. `useTernaryDarkMode` — 3-режимная тема
30. `useTimeout` — setTimeout с очисткой
31. `useToggle` — переключение с ручным управлением
32. `useUnmount` — колбэк при размонтировании
33. `useWindowSize` — размеры окна

---

## Методика практики

### Правило «открыл → понял → закрыл → написал → сверил»

1. Открыть страницу хука на usehooks-ts.com
2. Прочитать описание и сигнатуру (что принимает, что возвращает)
3. Закрыть вкладку с исходником
4. Написать свою реализацию в Codesandbox / локально
5. Открыть исходник и сверить:
   - Правильно ли обработана очистка (cleanup)?
   - Не пропущены ли edge cases?
   - Правильно ли типизировано?

### Очерёдность по сложности

**Неделя 1 — простые (useState/useEffect):**
- `useBoolean`, `useCounter`, `useToggle`
- `useDocumentTitle`, `useIsClient`, `useIsMounted`
- `useUnmount`, `useTimeout`, `useInterval`

**Неделя 2 — средние (useRef/useCallback):**
- `useDebounceValue`, `useDebounceCallback`
- `useEventListener`, `useHover`, `useOnClickOutside`
- `useLocalStorage`, `useSessionStorage`, `useReadLocalStorage`
- `useWindowSize`, `useMediaQuery`

**Неделя 3 — сложные (DOM API/браузерные API):**
- `useIntersectionObserver`, `useResizeObserver`
- `useCopyToClipboard`, `useClickAnyWhere`
- `useCountdown`, `useStep`
- `useScript`, `useScrollLock`

**Неделя 4 — комплексные:**
- `useDarkMode`, `useTernaryDarkMode`
- `useMap`, `useScreen`
- `useEventCallback`, `useIsomorphicLayoutEffect`

### Формат ежедневной практики

```
30-40 минут в день:
├── 5 мин  — повторить вчерашний хук по памяти
├── 15 мин — новый хук (открыл → закрыл → написал)
├── 5 мин  — сверил с оригиналом, записал отличия
└── 10 мин — добавил тесты (Vitest) на свой хук
```

---

## Что именно проверяет написание хуков

### 1. Понимание cleanup (очистки)

```typescript
// ❌ Частая ошибка: забыли cleanup
function useInterval(callback: () => void, delay: number) {
  useEffect(() => {
    setInterval(callback, delay);  // утечка! интервал живёт вечно
  }, [callback, delay]);
}

// ✅ Правильно: возвращаем cleanup
function useInterval(callback: () => void, delay: number | null) {
  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(callback, delay);
    return () => clearInterval(id);  // ← очистка
  }, [callback, delay]);
}
```

### 2. Проблема устаревших замыканий (stale closure)

```typescript
// ❌ callback захвачен один раз и никогда не обновляется
function useTimeout(callback: () => void, delay: number) {
  useEffect(() => {
    const id = setTimeout(callback, delay);
    return () => clearTimeout(id);
  }, [delay]); // callback не в зависимостях → stale closure
}

// ✅ useRef для хранения актуального callback
function useTimeout(callback: () => void, delay: number | null) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;  // всегда актуальный

  useEffect(() => {
    if (delay === null) return;
    const id = setTimeout(() => callbackRef.current(), delay);
    return () => clearTimeout(id);
  }, [delay]);
}
```

### 3. SSR-безопасность

```typescript
// ❌ Упадёт в Next.js при SSR
function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);  // ReferenceError на сервере!
    return stored ? JSON.parse(stored) : initialValue;
  });
}

// ✅ Проверка window
function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });
}
```

### 4. Типизация дженериками

```typescript
// ❌ Без дженерика — не знаем тип значения
function useLocalStorage(key: string, initialValue: any) {
  // ...
}

// ✅ Дженерик
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // ...
}
```

---

## Связанное
- [[React рендеринг и производительность]]
- [[Управление состоянием]]
- [[TypeScript продвинутый]]
- [[Алгоритмические задачи]]
- [[Event Loop макротаски микротаски]]
