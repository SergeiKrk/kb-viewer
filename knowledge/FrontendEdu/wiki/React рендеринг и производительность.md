---
title: "React рендеринг и производительность"
date: 2026-07-07
tags: [react, fiber, reconciliation, rendering, useMemo, useCallback, profiling]
category: concept
source_count: 0
---

# React рендеринг и производительность

Понимание того, как React решает ЧТО перерисовать — ключевой маркер Middle-разработчика. На собеседовании спросят не «как использовать useMemo», а «когда он НЕ нужен и почему».

---

## 1. Reconciliation — как React понимает, что менять

### Проблема

При каждом изменении состояния React вызывает рендер компонента. Но менять весь DOM целиком — медленно. React должен понять: что именно изменилось и какие DOM-операции минимально необходимы.

### Алгоритм reconciliation (сверки)

React строит **виртуальное дерево** (Virtual DOM) — легковесное JS-представление реального DOM. При обновлении:

1. Создаётся **новое** виртуальное дерево
2. Сравнивается с **предыдущим** (diffing)
3. Вычисляется **минимальный набор изменений**
4. Применяется к реальному DOM (commit)

**Алгоритм diffing (два допущения):**

1. **Элементы разных типов** → полная замена поддерева
2. **Ключи (`key`)** → React считает элементы с одинаковым ключом «теми же», даже если их порядок изменился

```jsx
// ❌ Без key: React пересоздаст все <li> при изменении порядка
{items.map(item => <li>{item.name}</li>)}

// ✅ С key: React переместит DOM-узлы, а не пересоздаст
{items.map(item => <li key={item.id}>{item.name}</li>)}
```

### Почему `index` как key — плохо

```jsx
// Исходный список: [A, B, C] → key: [0, 1, 2]
// Добавили в начало: [D, A, B, C] → key: [0, 1, 2, 3]
// React думает: элемент с key=0 теперь D (а был A), key=1 теперь A (а был B)...
// Результат: пересоздаёт ВСЕ элементы, теряет состояние (фокус, анимации)
```

**Всегда используй стабильные ID из данных.** `crypto.randomUUID()` в рендере — тоже плохо (новый key каждый рендер = пересоздание).

---

## 2. Fiber — переписанный движок (React 16+)

### Что такое Fiber

> **Как читать «Fiber»:** читай Fiber как «лёгкая заметка о том, что нужно сделать компоненту» — React создаёт дерево таких заметок вместо реального DOM. Каждая заметка знает: какой это компонент, что изменилось, и можно ли прервать работу над ней. Мнемоника: *«Fiber — это не дерево, а список дел, который можно отложить»*.

Fiber — это **переписанный reconciliation-движок**, решающий главную проблему старого React: **блокировка главного потока**.

**Старый React (Stack Reconciler):**
- Рекурсивный обход дерева — синхронный
- Пока React считает diff — страница не отвечает на клики
- На большом дереве — заметные фризы

**Fiber:**
- Дерево обрабатывается **инкрементально** — по кусочкам
- React может **прервать** работу, обработать срочное событие и **продолжить**
- Приоритеты: пользовательский ввод > анимация > загрузка данных

### Две фазы

| Фаза | Название | Что делает | Можно прервать? |
|---|---|---|---|
| **Render** | Reconciliation | Строит новое дерево, вычисляет изменения | ✅ Да |
| **Commit** | Применение к DOM | Меняет реальный DOM, вызывает useEffect | ❌ Нет |

```jsx
// Render-фаза может быть прервана — поэтому:
// - Не делай side-effect'ов в теле компонента
// - Не мутируй переменные
// - Не делай fetch в render

// ❌ Side-effect в render
function Bad() {
    analytics.track('page_view'); // вызовется несколько раз!
    return <div>...</div>;
}

// ✅ Side-effect — в useEffect
function Good() {
    useEffect(() => { analytics.track('page_view'); }, []);
    return <div>...</div>;
}
```

### Приоритеты в Fiber (Lane Model)

React назначает обновлениям «полосы» (lanes) — чем выше приоритет, тем раньше обработается:

- **Синхронный** (SyncLane): `useLayoutEffect`, `componentDidMount`
- **Высокий**: пользовательский ввод, анимации
- **По умолчанию**: `useEffect`, `setState`
- **Низкий**: загрузка данных, ленивая загрузка
- **Idle**: `useTransition`, отложенные обновления

---

## 3. Что вызывает ререндер

### 1. Изменение state

```jsx
function Counter() {
    const [count, setCount] = useState(0);
    // setCount(1) → ререндер Counter
}
```

### 2. Изменение props (от родителя)

```jsx
function Parent() {
    const [count, setCount] = useState(0);
    return <Child count={count} />; // Ререндер Parent → ререндер Child
}
```

### 3. Изменение контекста

```jsx
const ThemeContext = createContext('light');
// Провайдер изменил value → все потребители ререндерятся
```

### 4. Ререндер родителя (даже без изменения props!)

```jsx
function Parent() {
    const [, force] = useState(0);
    return (
        <>
            <button onClick={() => force(x => x + 1)}>Ререндер</button>
            <Child /> {/* ← тоже ререндерится! Даже без пропсов */}
        </>
    );
}
```

---

## 4. Инструменты предотвращения ререндеров

### `React.memo` — поверхностное сравнение пропсов

```jsx
// Без memo: ререндерится всегда при ререндере родителя
function ExpensiveChild({ data }) {
    return <div>{/* рендер стоит дорого */}</div>;
}

// С memo: ререндерится только при изменении пропсов
const ExpensiveChild = React.memo(({ data }) => {
    return <div>{/* рендер стоит дорого */}</div>;
});

ExpensiveChild.displayName = 'ExpensiveChild';
```

**Важно:** `React.memo` сравнивает пропсы через `Object.is`. Объекты и функции — новые ссылки каждый рендер → memo НЕ помогает.

```jsx
// ❌ memo бесполезен — handleClick и style новые каждый рендер
<MemoChild
    onClick={() => doSomething(id)}     // новая ссылка
    style={{ color: 'red' }}            // новый объект
/>

// ✅ useCallback + useMemo делают memo рабочим
const handleClick = useCallback(() => doSomething(id), [id]);
const style = useMemo(() => ({ color: 'red' }), []);
<MemoChild onClick={handleClick} style={style} />
```

### `useMemo` — кэширование вычислений

> **Как читать `useMemo(() => вычисление, [зависимости])`:** читай как «запомни результат этого вычисления и пересчитай только когда что-то из списка зависимостей изменится». Массив `[deps]` — это НЕ «выполнить когда изменится», а «НЕ пересчитывать ПОКА не изменится». Мнемоника: *«useMemo — запомни и не трогай, пока я не скажу»*.

```jsx
// ❌ Тяжёлое вычисление при КАЖДОМ ререндере
function List({ items, filter }) {
    const filtered = items.filter(i => i.category === filter); // каждый раз!
    return filtered.map(i => <Item key={i.id} {...i} />);
}

// ✅ Пересчитываем только при изменении зависимостей
function List({ items, filter }) {
    const filtered = useMemo(
        () => items.filter(i => i.category === filter),
        [items, filter]
    );
    return filtered.map(i => <Item key={i.id} {...i} />);
}
```

**Когда useMemo НЕ нужен:**
- Вычисление дешёвое (`arr.length`, конкатенация строк)
- Зависимости меняются каждый рендер (мемоизация бесполезна)
- Мемоизация дороже самого вычисления

### `useCallback` — стабильная ссылка на функцию

```jsx
// ❌ Новая функция каждый рендер — memo-компоненты ререндерятся
function Parent() {
    const handleClick = () => doSomething(id);
    return <MemoChild onClick={handleClick} />;
}

// ✅ Та же ссылка при тех же зависимостях
function Parent() {
    const handleClick = useCallback(() => doSomething(id), [id]);
    return <MemoChild onClick={handleClick} />;
}
```

**useCallback != useMemo для функций:**
```jsx
useCallback(fn, deps)   // ≡ useMemo(() => fn, deps)
```

---

## 5. Три закона оптимизации React

### Закон 1: Не оптимизируй преждевременно

Напиши работающий код → измерь → оптимизируй ТОЛЬКО узкие места. Большинство приложений не имеют проблем с производительностью React.

### Закон 2: Двигай состояние вниз

```jsx
// ❌ Состояние в родителе → ререндерится ВСЁ дерево
function App() {
    const [count, setCount] = useState(0);
    return (
        <>
            <Header />
            <Sidebar />
            <Counter count={count} onInc={() => setCount(c => c + 1)} />
            <Footer />
        </>
    );
}
// Каждый setCount → ререндер Header, Sidebar, Footer (они не изменились!)

// ✅ Состояние там, где используется
function App() {
    return (
        <>
            <Header />
            <Sidebar />
            <CounterSection /> {/* состояние внутри */}
            <Footer />
        </>
    );
}
function CounterSection() {
    const [count, setCount] = useState(0);
    return <Counter count={count} onInc={() => setCount(c => c + 1)} />;
}
// setCount → ререндер только CounterSection и Counter
```

### Закон 3: Children как паттерн

```jsx
// ❌ Ререндер родителя → ререндер детей (через props)
function Parent() {
    const [count, setCount] = useState(0);
    return (
        <ExpensiveChild count={count} />
    );
}

// ✅ Children не ререндерятся при изменении состояния родителя!
function Parent({ children }) {
    const [count, setCount] = useState(0);
    return (
        <div>
            <button onClick={() => setCount(c => c + 1)}>+1 ({count})</button>
            {children} {/* ← Не ререндерится! */}
        </div>
    );
}
function App() {
    return (
        <Parent>
            <ExpensiveChild /> {/* создан ДО рендера Parent, ссылка та же */}
        </Parent>
    );
}
```

---

## 6. Инструменты профилирования

### React DevTools Profiler

1. Открой React DevTools → вкладка Profiler
2. Нажми запись → выполни действие → останови
3. **Flamegraph:** видно, какие компоненты рендерились и сколько времени заняли
4. **Ranked:** сортировка по времени — сразу видны самые дорогие

**На что смотреть:**
- Компоненты с серым фоном — не рендерились (хорошо)
- Компоненты с жёлтым/красным — долгий рендер
- **Commit:** каждый commit — это одно обновление DOM

### Почему компонент ререндерился?

В Profiler нажми на компонент → «Why did this render?» — React покажет, какое свойство изменилось.

### Performance API в коде

```typescript
// Измерение конкретного рендера
function ExpensiveComponent() {
    const start = performance.now();
    // ... рендер ...
    useEffect(() => {
        const duration = performance.now() - start;
        if (duration > 16) { // больше одного кадра (60fps)
            console.warn(`Slow render: ${duration.toFixed(1)}ms`);
        }
    });
}
```

---

## 7. `useTransition` и `useDeferredValue` (React 18+)

### Проблема: дорогой рендер блокирует UI

```jsx
function App() {
    const [query, setQuery] = useState('');
    const filtered = heavyFilter(items, query); // может занять >100ms

    return (
        <>
            <input value={query} onChange={e => setQuery(e.target.value)} />
            {/* Пока фильтруется — input не отвечает! */}
            <List items={filtered} />
        </>
    );
}
```

### Решение: `useTransition` — пометить обновление как низкоприоритетное

> **Как читать `startTransition(() => ...)`:** читай как «React, это обновление не срочное — если пользователь кликнет или начнёт печатать, брось это и займись клиентом». Внутри `startTransition` ты МЕНЯЕШЬ состояние, но React может отложить, прервать или перезапустить этот рендер. Мнемоника: *«startTransition — это фоновый режим для setState»*.

```jsx
function App() {
    const [query, setQuery] = useState('');
    const [deferredQuery, setDeferredQuery] = useState('');
    const [isPending, startTransition] = useTransition();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);                      // высокий приоритет — input обновляется сразу
        startTransition(() => {
            setDeferredQuery(e.target.value);          // низкий приоритет — фильтрация может подождать
        });
    };

    const filtered = useMemo(
        () => heavyFilter(items, deferredQuery),
        [items, deferredQuery]
    );

    return (
        <>
            <input value={query} onChange={handleChange} />
            {isPending && <Spinner />}
            <List items={filtered} />
        </>
    );
}
```

### `useDeferredValue` — проще, когда нет контроля над setState

```jsx
function App() {
    const [query, setQuery] = useState('');
    const deferredQuery = useDeferredValue(query); // React сам решит, когда обновить

    const filtered = useMemo(
        () => heavyFilter(items, deferredQuery),
        [items, deferredQuery]
    );

    return (
        <>
            <input value={query} onChange={e => setQuery(e.target.value)} />
            <List items={filtered} style={{ opacity: query !== deferredQuery ? 0.5 : 1 }} />
        </>
    );
}
```

---

## 8. Распространённые ошибки

| Ошибка | Почему плохо | Как исправить |
|---|---|---|
| `useMemo` везде | Мемоизация не бесплатна — память + сравнение | Только для реально дорогих вычислений |
| `useCallback` без `memo` | Дочерний компонент всё равно ререндерится | `memo` на дочернем компоненте |
| Состояние в корне | Ререндер всего приложения | Двигать состояние вниз |
| Анонимные компоненты в рендере | `function Child() { ... }` внутри Parent — новый тип каждый рендер | Вынести наружу или использовать `useMemo` |
| `key={Math.random()}` | Каждый рендер — новый key → пересоздание DOM | Стабильный ID из данных |
| `useEffect` без зависимостей | `useEffect(() => { ... })` — на каждый рендер | Явно указать `[deps]` |
| `new Date()` в зависимостях | Каждый рендер — новый объект → бесконечный useEffect | `useMemo` или вынести за компонент |

---

## 9. Чек-лист: когда реально нужна оптимизация

Только если:
- [ ] Есть измеримый фриз (>100ms) при взаимодействии
- [ ] Профилировщик React DevTools показывает жёлтые/красные компоненты
- [ ] Пользователи жалуются на лаги

Оптимизировать надо саму причину, а не симптомы:
1. Сначала — архитектура (двигать состояние вниз, children-паттерн)
2. Потом — `memo` + `useCallback`/`useMemo`
3. В последнюю очередь — `useTransition`

---

## 🔮 React 19 и React Compiler

### React Forget (Compiler)

React Compiler (ранее React Forget) — компилятор, который **автоматически** применяет мемоизацию. Он анализирует код на этапе сборки и добавляет `useMemo`, `useCallback`, `React.memo` там, где это действительно нужно.

**Что компилятор делает:**
- Автоматически мемоизирует значения и коллбэки
- Определяет, где нужен `React.memo`
- Не требует ручного указания зависимостей
- Работает с правилами хуков (ESLint-плагин react-compiler)

**Что компилятор НЕ делает:**
- Не оптимизирует дорогие вычисления без мемоизации
- Не трогает `useRef` (он вне модели мемоизации)
- Не мемоизирует значения, передаваемые в нативные DOM-элементы

**Что станет не нужно:**
- `useCallback` — в 90% случаев
- `useMemo` — в 80% случаев  
- `React.memo` — почти полностью

**Что останется нужным:**
- `useMemo` для действительно дорогих вычислений (сортировка 10000 элементов)
- `useCallback` при передаче в сторонние библиотеки, не знающие о компиляторе
- `useRef` — компилятор не заменяет refs

### Новые хуки React 19

- **`useOptimistic`** — оптимистичные обновления UI (форма «комментарий появился сразу»)
- **`useActionState`** — управление состоянием Server Actions
- **`useFormStatus`** — статус отправки формы (pending, data)

### Что изменилось в рендеринге

- **Document Metadata:** `<title>`, `<meta>`, `<link>` теперь работают в любом компоненте (не только в `<head>`)
- **Pre-rendering API:** `prerender()` и `prerenderToNodeStream()` для статической генерации

---

## Связанное
- [[TypeScript продвинутый]]
- [[Управление состоянием]]
- [[Архитектура React компонентов]]
- [[Тестирование React]]
- [[Виртуализация рендеринга]]
- [[Браузер и HTTP]]
