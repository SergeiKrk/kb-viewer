---
title: "TypeScript продвинутый"
date: 2026-07-07
tags: [typescript, generics, utility-types, discriminated-unions, conditional-types, template-literals]
category: concept
source_count: 0
---

# TypeScript продвинутый

Уровень Middle требует не просто «типизировать пропсы», а уверенно владеть системой типов TypeScript. Эта страница — углублённый разбор ключевых концепций с пояснениями «зачем» и «когда», а не только «как».

---

## 1. Generics (дженерики)

### Зачем
Дженерики позволяют писать **переиспользуемый код**, который работает с разными типами, не теряя типовую безопасность. Без дженериков приходится либо дублировать код для каждого типа, либо использовать `any` (теряя проверки).

**Проблема без дженериков:**
```typescript
// ❌ any — теряем информацию о типе
function getFirst(arr: any[]): any {
    return arr[0];
}
const num = getFirst([1, 2, 3]); // тип any — бесполезно
num.toUpperCase();               // ошибки нет, но будет runtime crash
```

**Решение с дженериком:**
```typescript
// ✅ Дженерик сохраняет конкретный тип
function getFirst<T>(arr: T[]): T {
    return arr[0];
}
const num = getFirst([1, 2, 3]); // тип number
num.toUpperCase();               // ❌ Ошибка компиляции — и отлично!
```

### Как читать дженерики (не бойся синтаксиса)

Когда видишь запись `type Something<T> = ...` — не пугайся. Читай её **буквально**:

> «Создай шаблон типа с именем `Something`, в котором `T` — это место, куда потом подставится конкретный тип.»

```typescript
// Сначала это шаблон:
type Box<T> = {
    value: T
}

// А потом мы его используем:
type NumberBox = Box<number>
// После подстановки получается:
// type NumberBox = { value: number }

type UserBox = Box<User>
// После подстановки:
// type UserBox = { value: User }
```

Тот же принцип с функциями:

```typescript
// «Создай шаблон функции getFirst, в котором T — место для конкретного типа»
function getFirst<T>(arr: T[]): T {
    return arr[0];
}

// getFirst<number>  →  (arr: number[]) => number
// getFirst<string>  →  (arr: string[]) => string
```

**Мнемоника:** `<T>` читай как `<ТипСюдаВставишь>`. Это не магия, это просто placeholder.

### Ограничения дженериков (constraints)

Часто мы хотим, чтобы дженерик был не «любым», а имел определённые свойства:

```typescript
// T обязан иметь поле length
function getLength<T extends { length: number }>(item: T): number {
    return item.length;
}

getLength("hello");        // ✅ 5 (строка имеет length)
getLength([1, 2, 3]);      // ✅ 3 (массив имеет length)
getLength(42);             // ❌ Ошибка: у number нет length
```

**Реальный пример — дженерик для API-ответа:**
```typescript
interface ApiResponse<T> {
    data: T;
    status: number;
    error?: string;
}

// Использование с конкретным типом
interface User { id: number; name: string; }

async function fetchUser(id: number): Promise<ApiResponse<User>> {
    const res = await fetch(`/api/users/${id}`);
    return res.json();
}

const result = await fetchUser(1);
// result.data.name — TypeScript знает, что это string ✅
```

### Дженерик-хук в React

```typescript
// Универсальный хук для любого GET-запроса
function useFetch<T>(url: string) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        fetch(url)
            .then(res => res.json())
            .then((json: T) => {
                setData(json);
                setLoading(false);
            })
            .catch(err => {
                setError(err);
                setLoading(false);
            });
    }, [url]);

    return { data, loading, error } as const;
}

// Использование:
interface Post { id: number; title: string; body: string; }
const { data, loading } = useFetch<Post[]>('/api/posts');
// data[0].title — TypeScript знает тип ✅
```

### Дженерик-компонент

```typescript
interface ListProps<T> {
    items: T[];
    renderItem: (item: T, index: number) => React.ReactNode;
    keyExtractor: (item: T) => string | number;
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
    return (
        <ul>
            {items.map((item, i) => (
                <li key={keyExtractor(item)}>{renderItem(item, i)}</li>
            ))}
        </ul>
    );
}

// Использование:
interface Product { id: number; name: string; price: number; }

<List<Product>
    items={products}
    renderItem={(product) => `${product.name} — ${product.price}₽`}
    keyExtractor={(p) => p.id}
/>
```

### Несколько дженерик-параметров

```typescript
// Типичная ситуация: маппинг одного типа в другой
function map<T, U>(arr: T[], fn: (item: T, index: number) => U): U[] {
    return arr.map(fn);
}

const nums = [1, 2, 3];
const strings = map(nums, n => `Число ${n}`); // string[]
```

---

## 2. Utility Types — швейцарский нож

TypeScript поставляет встроенные типы-утилиты, которые трансформируют существующие типы. Знать их — обязательно.

### `Partial<T>` — все поля опциональны
```typescript
interface User { id: number; name: string; email: string; }

// Частичное обновление: передаём только то, что меняем
function updateUser(id: number, changes: Partial<User>) {
    // changes может содержать любое подмножество полей
}

updateUser(1, { name: "Новое имя" });     // ✅
updateUser(1, { email: "a@b.com" });      // ✅
```

### `Pick<T, K>` — выбрать только нужные поля
```typescript
interface User { id: number; name: string; email: string; password: string; }

// Для ответа API убираем пароль
type SafeUser = Pick<User, 'id' | 'name' | 'email'>;
// { id: number; name: string; email: string }

// Альтернативный подход через Omit:
type SafeUserAlt = Omit<User, 'password'>;
```

### `Record<K, V>` — словарь с фиксированным типом значений
```typescript
// Словарь ролей пользователя
type Role = 'admin' | 'editor' | 'viewer';
type Permissions = Record<Role, string[]>;
// { admin: string[]; editor: string[]; viewer: string[] }

const permissions: Permissions = {
    admin: ['read', 'write', 'delete'],
    editor: ['read', 'write'],
    viewer: ['read'],
};
```

### `Extract<T, U>` / `Exclude<T, U>` — работа с union
```typescript
type Event = 'click' | 'focus' | 'blur' | 'keydown' | 'keyup';

// Извлечь только клавиатурные события
type KeyboardEvent = Extract<Event, `key${string}`>;
// 'keydown' | 'keyup'

// Исключить клавиатурные
type MouseEvent = Exclude<Event, `key${string}`>;
// 'click' | 'focus' | 'blur'
```

### `ReturnType<T>` и `Parameters<T>` — мета-информация о функциях
```typescript
function createUser(name: string, age: number) {
    return { name, age, createdAt: new Date() };
}

type UserFromFn = ReturnType<typeof createUser>;
// { name: string; age: number; createdAt: Date }

type CreateUserArgs = Parameters<typeof createUser>;
// [name: string, age: number]

// Полезно, когда тип функции определён где-то в библиотеке
type OnClickParams = Parameters<React.MouseEventHandler>;
// [event: MouseEvent<Element, MouseEvent>]
```

### `Awaited<T>` — развернуть Promise
```typescript
async function fetchData(): Promise<{ id: number }> {
    return { id: 1 };
}

type Data = Awaited<ReturnType<typeof fetchData>>;
// { id: number } — без Promise-обёртки
```

### Композиция utility types
```typescript
interface Config {
    apiUrl: string;
    timeout: number;
    retries: number;
    debug: boolean;
}

// Частичная конфигурация: все поля опциональны, кроме apiUrl
type PartialConfig = Partial<Omit<Config, 'apiUrl'>> & Pick<Config, 'apiUrl'>;

const config: PartialConfig = {
    apiUrl: 'https://api.example.com',
    timeout: 5000,
    // retries и debug — опциональны
};
```

---

## 3. Discriminated Unions — вместо `status: string`

**Проблема:** тип `{ status: string; data?: Data; error?: Error }` не говорит TypeScript'у, что `data` есть только когда `status === 'success'`.

**Решение — discriminated union (размеченное объединение):**
```typescript
// ❌ Junior: нет связи между status и остальными полями
type BadState = {
    status: 'idle' | 'loading' | 'success' | 'error';
    data?: Data;
    error?: Error;
};

// ✅ Middle: TypeScript понимает связь
type State =
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'success'; data: Data }
    | { status: 'error'; error: Error };
```

### Почему это важно: type narrowing (сужение типа)

> **Как читать discriminated union:** `type State = A | B | C` читай буквально: «State — это **ЛИБО** объект A, **ЛИБО** объект B, **ЛИБО** объект C». Вертикальная черта `|` = «или». TypeScript смотрит на поле-дискриминатор (`status`) и понимает, какой именно вариант сейчас активен.

```typescript
function render(state: State) {
    switch (state.status) {
        case 'idle':
            return <p>Ожидание...</p>;
        case 'loading':
            return <Spinner />;
        case 'success':
            // TypeScript ЗНАЕТ, что здесь есть state.data
            return <DataView data={state.data} />;
        case 'error':
            // TypeScript ЗНАЕТ, что здесь есть state.error
            return <ErrorView message={state.error.message} />;
        default:
            // Исчерпывающая проверка: если добавили новый status —
            // TypeScript выдаст ошибку, что не все варианты обработаны
            const _exhaustive: never = state;
            return null;
    }
}
```

### Реальный пример — хук useQuery с discriminated union

```typescript
type QueryState<T> =
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'success'; data: T }
    | { status: 'error'; error: Error }
    | { status: 'refetching'; data: T }; // есть старые данные, но идёт обновление

function useQuery<T>(url: string): QueryState<T> {
    // ... реализация
}

// Использование в компоненте:
const users = useQuery<User[]>('/api/users');

if (users.status === 'success') {
    users.data.map(u => u.name); // ✅ TypeScript знает тип
}
if (users.status === 'refetching') {
    users.data.map(u => u.name); // ✅ Тоже знает (data есть!)
}
```

---

## 4. Conditional Types и `infer`

Conditional types — это «if/else» на уровне типов. Ключевое слово `infer` позволяет «вытащить» часть типа.

### Базовый синтаксис

> **Как читать conditional type:** `T extends X ? Y : Z` читай как тернарный оператор, только на уровне типов: «если T является подтипом X, то верни тип Y, иначе — тип Z». Ничего сверхъестественного.

```typescript
type IsString<T> = T extends string ? 'да' : 'нет';

type A = IsString<'hello'>;  // 'да'
type B = IsString<42>;       // 'нет'
```

### `infer` — вытаскиваем вложенный тип

> **Как читать `infer`:** `T extends SomePattern<infer U> ? U : never` читай как: «если T соответствует шаблону, **вытащи** внутренний тип и **назови** его U, затем верни U, иначе never». `infer` = «извлеки и дай имя».

```typescript
// Извлечь тип элемента массива
type ArrayElement<T> = T extends (infer U)[] ? U : never;

type E1 = ArrayElement<string[]>;       // string
type E2 = ArrayElement<number[]>;       // number
type E3 = ArrayElement<{ id: number }[]>; // { id: number }
type E4 = ArrayElement<string>;         // never (не массив)
```

### Практические применения `infer`

**1. Тип пропсов React-компонента:**
```typescript
type ComponentProps<T> = T extends React.ComponentType<infer P> ? P : never;

import { Button } from './Button'; // допустим, Button принимает { variant: 'primary' | 'secondary' }
type ButtonProps = ComponentProps<typeof Button>;
// { variant: 'primary' | 'secondary' }
```

**2. Тип возврата асинхронной функции:**
```typescript
type AsyncReturnType<T> = T extends (...args: any[]) => Promise<infer R> ? R : never;

async function getUser() { return { id: 1, name: 'Alice' }; }
type User = AsyncReturnType<typeof getUser>; // { id: number; name: string }
```

**3. Глубокий Partial (рекурсивный):**
```typescript
type DeepPartial<T> = T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T;

interface Config { server: { host: string; port: number }; debug: boolean; }
type PartialConfig = DeepPartial<Config>;
// Все поля на всех уровнях — опциональны
```

---

## 5. Template Literal Types

Позволяют конструировать строковые типы на основе других типов — как template literals в JavaScript, но на уровне типов.

### Базовый синтаксис
```typescript
type Greeting = `Hello, ${string}!`;
const a: Greeting = 'Hello, World!';   // ✅
const b: Greeting = 'Hi!';             // ❌
```

### `Capitalize`, `Uncapitalize`, `Uppercase`, `Lowercase`
```typescript
type EventName = 'click' | 'focus' | 'blur';
type Handler = `on${Capitalize<EventName>}`;
// 'onClick' | 'onFocus' | 'onBlur'
```

### Реальный пример — типизированный роутинг
```typescript
type Route = 'users' | 'posts' | 'comments';
type ApiRoute = `/api/${Route}`;
// '/api/users' | '/api/posts' | '/api/comments'

type RouteWithId = `/api/${Route}/${number}`;
// '/api/users/1' | '/api/posts/42' | ...
```

### CSS-in-JS с типобезопасностью
```typescript
type Spacing = 0 | 4 | 8 | 12 | 16 | 20 | 24;
type Margin = `m-${Spacing}`;   // 'm-0' | 'm-4' | 'm-8' | ...
type Padding = `p-${Spacing}`;

type SpacingClass = Margin | Padding;
// Всего 12 валидных значений вместо string
```

### Извлечение частей строкового литерала через `infer`
```typescript
// Извлечь ID из строки '/users/123'
type ExtractId<T> = T extends `${string}/${infer Id}` ? Id : never;

type Id = ExtractId<'/users/123'>; // '123'
type Id2 = ExtractId<'/posts/456/comments/789'>; // '789' (последний сегмент)
```

---

## 6. Mapped Types — трансформация типов полей

> **Как читать mapped type:** `{ [K in keyof T]: T[K] }` читай буквально: «для **каждого** ключа K в типе T — создай поле с таким же типом, как у T[K]». Это цикл `for...in`, только на уровне типов. Меняй `T[K]` на что угодно, чтобы трансформировать тип каждого поля.

```typescript
interface User {
    name: string;
    age: number;
    email: string;
}

// Сделать все поля readonly
type ReadonlyUser = { readonly [K in keyof User]: User[K] };
// То же самое: type ReadonlyUser = Readonly<User>;

// Сделать все поля nullable
type Nullable<T> = { [K in keyof T]: T[K] | null };
type NullableUser = Nullable<User>;
// { name: string | null; age: number | null; email: string | null; }

// Поменять типы через as (key remapping)
type Getters<T> = {
    [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};
type UserGetters = Getters<User>;
// { getName: () => string; getAge: () => number; getEmail: () => string; }
```

---

## 7. `as const` и `satisfies`

### `as const` — точные литеральные типы
```typescript
// Без as const — тип string[]
const roles = ['admin', 'editor', 'viewer'];
// С as const — точный кортеж
const rolesConst = ['admin', 'editor', 'viewer'] as const;
// тип: readonly ['admin', 'editor', 'viewer']

// Полезно для discriminated unions:
const STATUSES = ['idle', 'loading', 'success', 'error'] as const;
type Status = (typeof STATUSES)[number]; // 'idle' | 'loading' | 'success' | 'error'
```

### `satisfies` — проверка без сужения типа (TS 4.9+)
```typescript
// satisfies проверяет, что значение соответствует типу, но сохраняет точный тип
const config = {
    api: 'https://api.example.com',
    timeout: 5000,
    retries: 3,
} satisfies Record<string, string | number>;

// config.api — тип 'https://api.example.com' (точный литерал, не string)
// config.retries — тип 3 (числовой литерал, не number)
```

---

## 8. Распространённые паттерны в React

### Типизация `useReducer`
```typescript
type Action =
    | { type: 'INCREMENT' }
    | { type: 'DECREMENT' }
    | { type: 'SET'; payload: number };

function reducer(state: number, action: Action): number {
    switch (action.type) {
        case 'INCREMENT': return state + 1;
        case 'DECREMENT': return state - 1;
        case 'SET':       return action.payload; // ✅ TypeScript знает, что payload есть
    }
}
```

### Типизация `useContext`
```typescript
interface ThemeContextType {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
}
```

### Типизация событий
```typescript
// Не надо any или угадывать тип
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value); // string
};

const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
};

const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') submit();
};
```

---

## 9. Практические задания

### Неделя 1: дженерики и utility types
- [ ] Найти в проекте `any` и заменить на строгие типы
- [ ] Написать дженерик-хук `useLocalStorage<T>(key: string, initial: T)`
- [ ] Создать тип `Nullable<T>` и `DeepReadonly<T>`

### Неделя 2: discriminated unions и conditional types
- [ ] Заменить `status: string` на discriminated union в существующем коде
- [ ] Типизировать `useReducer` с экшенами
- [ ] Написать тип `PropsOf<T>` для извлечения пропсов компонента

### Проверка понимания (ответь себе)
1. Когда использовать `extends` в дженерике?
2. Чем `Pick` отличается от `Omit`? Когда что выбрать?
3. Почему discriminated union лучше, чем `status: string` + опциональные поля?
4. Что делает `infer` и где он реально нужен?
5. Чем `as const` отличается от обычного `const`?

---

## 10. Type Guards — пользовательская проверка типов

TypeScript сам сужает типы внутри `if (typeof x === 'string')`, но для сложных объектов этого недостаточно. Type Guard — функция, возвращающая `x is Type`.

### `is` — пользовательский type guard
```typescript
interface User { id: number; name: string; email: string; }
interface Admin { id: number; name: string; role: 'admin'; permissions: string[]; }

// Type guard: говорит TypeScript'у, КАКОЙ именно тип
function isAdmin(person: User | Admin): person is Admin {
    return 'role' in person && person.role === 'admin';
}

function handlePerson(person: User | Admin) {
    if (isAdmin(person)) {
        // ✅ TypeScript знает: person = Admin
        console.log(person.permissions);
    } else {
        // ✅ TypeScript знает: person = User
        console.log(person.email);
    }
}
```

### Type guard для API-ответов
```typescript
// Частый кейс: проверка успешного ответа
type ApiResult<T> = 
    | { success: true; data: T }
    | { success: false; error: string };

function isSuccess<T>(result: ApiResult<T>): result is { success: true; data: T } {
    return result.success === true;
}
// Использование:
const res = await fetchUser();
if (isSuccess(res)) {
    console.log(res.data.name); // ✅ без as / !
}
```

### `asserts` — assertion function (TS 3.7+)
```typescript
// Вместо return true/false — бросает ошибку, если условие не выполнено
function assert(condition: unknown, message: string): asserts condition {
    if (!condition) throw new Error(message);
}

function processValue(value: unknown) {
    assert(typeof value === 'string', 'Expected string');
    // ✅ После asserts TypeScript знает: value is string
    console.log(value.toUpperCase());
}
```

---

## 11. `unknown` vs `any` — критическая разница

```typescript
// ❌ any: отключает ВСЕ проверки
let x: any = 'hello';
x.toUpperCase();  // ошибки нет, даже если x — не строка в runtime
x.nonExistent();  // ошибки нет — any разрешает всё

// ✅ unknown: «я не знаю тип, но заставлю тебя проверить»
let y: unknown = 'hello';
y.toUpperCase();  // ❌ Ошибка: Object is of type 'unknown'
// Нужно СНАЧАЛА сузить тип:
if (typeof y === 'string') {
    y.toUpperCase(); // ✅ теперь TypeScript знает
}
```

**Правило:** `unknown` — для входящих данных (API, localStorage, params). `any` — только для постепенной миграции с JS на TS.

```typescript
// Реальный пример: парсинг JSON (возвращает any!)
const raw = localStorage.getItem('user');
const user: unknown = raw ? JSON.parse(raw) : null;
// unknown заставляет проверить перед использованием:
if (user && typeof user === 'object' && 'name' in user) { ... }
```

---

## 12. `keyof` и `typeof` — операторы типов

```typescript
// keyof: получить union ключей объекта
interface User { id: number; name: string; email: string; }
type UserKey = keyof User; // 'id' | 'name' | 'email'

// Практика: типобезопасный getter
function get<T, K extends keyof T>(obj: T, key: K): T[K] {
    return obj[key];
}
const user: User = { id: 1, name: 'Alice', email: 'a@b.com' };
get(user, 'name'); // ✅ string
get(user, 'xxx');  // ❌ Ошибка: 'xxx' не ключ User
```

```typescript
// typeof: получить тип ЗНАЧЕНИЯ (не путать с runtime typeof!)
const config = { apiUrl: 'https://api.example.com', timeout: 5000 };
type Config = typeof config; // { apiUrl: string; timeout: number; }

// Часто вместе с ReturnType:
function createStore() { return { getState, dispatch, subscribe }; }
type Store = ReturnType<typeof createStore>;
```

---

## 13. Branded Types — типобезопасные идентификаторы

**Проблема:** `userId: number` и `postId: number` — TypeScript считает их одинаковыми.
```typescript
function getUser(id: number) { ... }
function getPost(id: number) { ... }
getUser(postId); // ❌ Ошибки нет, хотя передали не тот ID!
```

**Решение — брендирование:**
```typescript
type Brand<T, B> = T & { __brand: B };

type UserId = Brand<number, 'UserId'>;
type PostId = Brand<number, 'PostId'>;

function createUserId(id: number): UserId { return id as UserId; }
function createPostId(id: number): PostId { return id as PostId; }

function getUser(id: UserId) { ... }
function getPost(id: PostId) { ... }

getUser(createPostId(5)); // ❌ Ошибка: UserId !== PostId ✅
```

---

## 14. Function Overloads — разные сигнатуры

```typescript
// Разное поведение в зависимости от аргументов
function formatDate(date: Date): string;
function formatDate(date: Date, locale: string): string;
function formatDate(date: Date, format: 'short' | 'long'): string;
// Реализация — одна, принимает всё:
function formatDate(date: Date, arg?: string): string {
    if (arg === 'short') return date.toLocaleDateString();
    if (arg === 'long') return date.toLocaleString();
    return date.toISOString();
}

formatDate(new Date());             // ✅ string
formatDate(new Date(), 'ru-RU');    // ✅ string
formatDate(new Date(), 'short');    // ✅ string
formatDate(new Date(), 'invalid');  // ❌ Ошибка
```

---

## 15. `const` Type Parameters (TS 5.0+)

```typescript
// Без const: теряем точные литералы
function useState<T>(initial: T): [T, (v: T) => void] { ... }
const [name, setName] = useState('Alice');
// name: string (не литерал)

// С const type parameter:
function useState<const T>(initial: T): [T, (v: T) => void] { ... }
const [name, setName] = useState('Alice');
// name: 'Alice' (точный литерал)

// Особенно полезно с массивами:
declare function useList<const T extends readonly string[]>(items: T): T[number];
const status = useList(['idle', 'loading', 'success']);
// status: 'idle' | 'loading' | 'success' — без as const!
```

---

## 16. Enums vs `as const` — что выбрать

```typescript
// ❌ Enum: генерирует JS-код, не всегда tree-shakeable
enum Status { Idle, Loading, Success, Error }

// ✅ Предпочтительный вариант: const object + тип
const STATUS = {
    Idle: 'idle',
    Loading: 'loading',
    Success: 'success',
    Error: 'error',
} as const;

type Status = (typeof STATUS)[keyof typeof STATUS];
// 'idle' | 'loading' | 'success' | 'error'
```

**Почему `as const` лучше enum:**
- Не генерирует лишний код (tree-shakeable)
- Предсказуемее работает с `--isolatedModules`
- Проще использовать как runtime-значение И тип одновременно

---

## 17. Module Augmentation — расширение сторонних типов

```typescript
// Расширяем Window
declare global {
    interface Window {
        __APP_VERSION__: string;
        analytics: { track: (event: string) => void };
    }
}
window.__APP_VERSION__; // ✅ TypeScript знает

// Расширяем Express Request (для бэкенда)
declare namespace Express {
    interface Request {
        user?: { id: number; role: string };
    }
}
```

---

## Шпаргалка: самые частые utility types

| Тип | Что делает | Пример |
|---|---|---|
| `Partial<T>` | Все поля опциональны | `Partial<User>` |
| `Required<T>` | Все обязательны | `Required<Config>` |
| `Pick<T, K>` | Выбрать поля | `Pick<User, 'id' \| 'name'>` |
| `Omit<T, K>` | Исключить поля | `Omit<User, 'password'>` |
| `Record<K, V>` | Словарь | `Record<string, User>` |
| `ReturnType<T>` | Тип возврата функции | `ReturnType<typeof fn>` |
| `Parameters<T>` | Кортеж параметров | `Parameters<typeof fn>` |

## Связанное
- [[План обучения React Middle]]
- [[React рендеринг и производительность]]
- [[Управление состоянием]]
- [[Архитектура React компонентов]]
