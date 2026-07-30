---
title: "Архитектура React компонентов"
date: 2026-07-07
tags: [architecture, components, compound, composition, headless, render-props, slots]
category: concept
source_count: 0
---

# Архитектура React компонентов

Сдвиг от «накидать пропсов» к «спроектировать API компонента». На собеседовании отличают Middle от Junior по тому, как кандидат проектирует переиспользуемые компоненты.

---

## 1. Composition over Configuration

### Проблема конфигурационного подхода

```jsx
// ❌ Junior: компонент-божество с 20 пропсами
<Modal
    isOpen={true}
    title="Удалить событие?"
    body="Вы уверены? Это действие нельзя отменить."
    confirmText="Удалить"
    cancelText="Отмена"
    onConfirm={handleDelete}
    onCancel={closeModal}
    size="medium"
    showCloseButton={true}
    closeOnOverlay={true}
    footer={<><button>Ещё что-то</button></>}
    headerIcon={<TrashIcon />}
    animation="fade"
    // ... и так далее
/>
```

Проблемы:
- Каждое новое требование → новый проп
- Невозможно кастомизировать непредусмотренное
- Типизация раздувается
- Сложно понять API без документации

### Решение: композиция

```jsx
// ✅ Middle: компонент — контейнер, собираемый из частей
<Modal isOpen={isOpen} onClose={closeModal}>
    <Modal.Header>
        <TrashIcon />
        <Modal.Title>Удалить событие?</Modal.Title>
    </Modal.Header>
    <Modal.Body>
        Вы уверены? Это действие нельзя отменить.
    </Modal.Body>
    <Modal.Footer>
        <Button variant="secondary" onClick={closeModal}>Отмена</Button>
        <Button variant="danger" onClick={handleDelete}>Удалить</Button>
    </Modal.Footer>
</Modal>
```

Реализация:

```typescript
// Modal.tsx
interface ModalProps { isOpen: boolean; onClose: () => void; children: React.ReactNode; }
interface ModalSectionProps { children: React.ReactNode; className?: string; }

function Modal({ isOpen, onClose, children }: ModalProps) {
    if (!isOpen) return null;
    return createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                {children}
            </div>
        </div>,
        document.body
    );
}

Modal.Header = ({ children }: ModalSectionProps) => <div className="modal-header">{children}</div>;
Modal.Title = ({ children }: ModalSectionProps) => <h2 className="modal-title">{children}</h2>;
Modal.Body = ({ children }: ModalSectionProps) => <div className="modal-body">{children}</div>;
Modal.Footer = ({ children }: ModalSectionProps) => <div className="modal-footer">{children}</div>;

export { Modal };
```

---

## 2. Compound Components

Compound Components — когда несколько компонентов работают вместе и разделяют неявное состояние через Context.

> **Как читать `Modal.Header = ({ children }) => ...`:** читай как «прикрепи подкомпонент Header прямо к функции Modal как свойство». Это не наследование и не класс — обычная функция, к которой «приклеили» другие функции-компоненты. `Modal.Header` живёт в модуле `Modal` и не существует отдельно от него. Мнемоника: *«точка между Modal и Header — это клей, а не иерархия»*.

### Проблема без Compound

```jsx
// ❌ Взрыв пропсов: каждый элемент табов должен знать всё
<Tabs
    items={[
        { id: 'tab1', label: 'Информация', content: <InfoPanel /> },
        { id: 'tab2', label: 'Билеты', content: <TicketsPanel /> },
    ]}
    activeTab="tab1"
    onChange={handleChange}
/>
```

### Решение: Compound Components

```jsx
// ✅ Интуитивное API, гибкая композиция
<Tabs defaultTab="info" onChange={handleChange}>
    <Tabs.List>
        <Tabs.Tab id="info">Информация</Tabs.Tab>
        <Tabs.Tab id="tickets">Билеты</Tabs.Tab>
        <Tabs.Tab id="reviews">Отзывы</Tabs.Tab>
    </Tabs.List>
    <Tabs.Panel id="info"><InfoPanel /></Tabs.Panel>
    <Tabs.Panel id="tickets"><TicketsPanel /></Tabs.Panel>
    <Tabs.Panel id="reviews"><ReviewsPanel /></Tabs.Panel>
</Tabs>
```

Реализация:

```typescript
import { createContext, useContext, useState } from 'react';

interface TabsContextValue {
    activeTab: string;
    setActiveTab: (id: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);
const useTabs = () => {
    const ctx = useContext(TabsContext);
    if (!ctx) throw new Error('Tabs.* must be used inside <Tabs>');
    return ctx;
};

function Tabs({ defaultTab, onChange, children }: {
    defaultTab: string;
    onChange?: (id: string) => void;
    children: React.ReactNode;
}) {
    const [activeTab, setActiveTab] = useState(defaultTab);
    const handleChange = (id: string) => { setActiveTab(id); onChange?.(id); };
    return (
        <TabsContext.Provider value={{ activeTab, setActiveTab: handleChange }}>
            {children}
        </TabsContext.Provider>
    );
}

Tabs.List = ({ children }: { children: React.ReactNode }) => (
    <div role="tablist" className="tabs-list">{children}</div>
);

Tabs.Tab = ({ id, children }: { id: string; children: React.ReactNode }) => {
    const { activeTab, setActiveTab } = useTabs();
    return (
        <button
            role="tab"
            aria-selected={activeTab === id}
            onClick={() => setActiveTab(id)}
            className={activeTab === id ? 'tab active' : 'tab'}
        >
            {children}
        </button>
    );
};

Tabs.Panel = ({ id, children }: { id: string; children: React.ReactNode }) => {
    const { activeTab } = useTabs();
    if (activeTab !== id) return null;
    return <div role="tabpanel">{children}</div>;
};
```

---

## 3. Headless Components

Headless компонент управляет состоянием, accessibility и логикой, но НЕ рендерит UI — он отдаёт всё через render-prop или хук.

### Когда нужен

Когда нужно переиспользовать **поведение** с разным внешним видом:
- Модалки, дропдауны, тултипы, аккордеоны
- Компоненты из дизайн-системы vs страницы лендинга — разная стилизация, одна логика

### Пример: Headless Dropdown

> **Как читать `children: (api) => ReactNode` (render-prop):** читай как «я дам тебе инструменты (api), а ты реши как это будет выглядеть». `children` здесь — не JSX, а ФУНКЦИЯ, которая получает объект с методами и возвращает JSX. Это позволяет одному компоненту отдавать логику, а другому — внешний вид. Мнемоника: *«children-функция — это курьер: приносит инструменты, а рисуешь ты сам»*.

```typescript
// useDropdown.ts — хук с логикой, без UI
function useDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    const toggle = () => setIsOpen(o => !o);
    const close = () => { setIsOpen(false); setActiveIndex(0); };

    // Закрытие по клику снаружи
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: MouseEvent) => {
            if (!triggerRef.current?.contains(e.target as Node) &&
                !listRef.current?.contains(e.target as Node)) {
                close();
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [isOpen]);

    // Клавиатурная навигация
    const handleKeyDown = (e: React.KeyboardEvent, itemCount: number) => {
        switch (e.key) {
            case 'ArrowDown': setActiveIndex(i => (i + 1) % itemCount); break;
            case 'ArrowUp': setActiveIndex(i => (i - 1 + itemCount) % itemCount); break;
            case 'Enter': /* выбрать активный элемент */ close(); break;
            case 'Escape': close(); break;
        }
    };

    return { isOpen, activeIndex, triggerRef, listRef, toggle, close, handleKeyDown };
}

// HeadlessDropdown.tsx — render-prop
function HeadlessDropdown({ children }: { children: (api: ReturnType<typeof useDropdown>) => ReactNode }) {
    const api = useDropdown();
    return <>{children(api)}</>;
}

// Использование: разная стилизация — одно поведение
<HeadlessDropdown>
    {({ isOpen, toggle, close }) => (
        <>
            <button onClick={toggle}>Меню {isOpen ? '▲' : '▼'}</button>
            {isOpen && <div className="dropdown-menu" onClick={close}>...</div>}
        </>
    )}
</HeadlessDropdown>
```

### Headless UI (библиотека Tailwind)

```jsx
import { Listbox } from '@headlessui/react';

// Headless UI даёт accessibility из коробки (ARIA-атрибуты, клавиатура, focus trap)
function EventCategorySelect({ value, onChange }) {
    return (
        <Listbox value={value} onChange={onChange}>
            <Listbox.Button>{value || 'Выбрать категорию'}</Listbox.Button>
            <Listbox.Options>
                {categories.map(c => (
                    <Listbox.Option key={c} value={c}>
                        {({ active, selected }) => (
                            <li className={`${active ? 'bg-blue-100' : ''} ${selected ? 'font-bold' : ''}`}>
                                {c}
                            </li>
                        )}
                    </Listbox.Option>
                ))}
            </Listbox.Options>
        </Listbox>
    );
}
```

---

## 4. Slots Pattern (подход Next.js / shadcn/ui)

Идея от Radix UI и shadcn/ui: компонент принимает «слоты» — фрагменты JSX как пропсы.

```typescript
interface CardProps {
    header?: ReactNode;
    footer?: ReactNode;
    children: ReactNode;
}

function Card({ header, footer, children }: CardProps) {
    return (
        <div className="card">
            {header && <div className="card-header">{header}</div>}
            <div className="card-body">{children}</div>
            {footer && <div className="card-footer">{footer}</div>}
        </div>
    );
}

// Использование
<Card
    header={<><EventIcon /><span>React Conf</span></>}
    footer={<Button>Купить билет</Button>}
>
    <p>Описание события...</p>
    <p>Дата: 01.08.2026</p>
</Card>
```

---

## 5. Custom Hooks — вынос логики из компонентов

### Принцип: компонент — только UI

```jsx
// ❌ Вся логика в компоненте
function EventPage({ eventId }) {
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fetch(`/api/events/${eventId}`).then(r => r.json()).then(setEvent).finally(() => setLoading(false));
    }, [eventId]);
    const handleBuy = () => { /* логика покупки */ };
    if (loading) return <Spinner />;
    return <EventView event={event} onBuy={handleBuy} />;
}

// ✅ Логика в хуке, компонент чистый
function useEvent(eventId: string) {
    return useQuery({
        queryKey: ['events', eventId],
        queryFn: () => fetchEvent(eventId),
    });
}

function EventPage({ eventId }) {
    const { data: event, isLoading } = useEvent(eventId);
    if (isLoading) return <Spinner />;
    return <EventView event={event} onBuy={() => buyTicket(eventId)} />;
}
```

### Хуки должны быть атомарными

```typescript
// ❌ Монолитный хук
function useEventDashboard() {
    // смешано: запрос, фильтрация, пагинация, WebSocket
}

// ✅ Разделение ответственности
function useEventList(filter: Filter) { ... }       // только загрузка списка
function useEventFilters() { ... }                   // только фильтры из URL
function useEventSubscription(eventId: string) { ... } // только WebSocket
function usePagination() { ... }                     // только пагинация
```

---

## 6. Принцип единственной ответственности в компонентах

```jsx
// ❌ God Component: 300+ строк, делает всё
function EventDashboard() {
    // запрос данных
    // фильтрация
    // сортировка
    // графики
    // таблица
    // кнопки действий
    // WebSocket
}

// ✅ Разделение на маленькие компоненты
function EventDashboard() {
    return (
        <DashboardLayout>
            <EventStats />
            <EventFilters />
            <EventTable />
            <EventActions />
        </DashboardLayout>
    );
}
```

**Правило:** если компонент не помещается на одном экране (150-200 строк) — его пора разбивать.

---

## 7. Render Props vs Hooks — эволюция

```jsx
// 2016: HOC (Higher-Order Components)
const withAuth = (Component) => (props) => {
    const user = useAuth();
    if (!user) return <Login />;
    return <Component {...props} user={user} />;
};
export default withAuth(Dashboard);

// 2018: Render Props
<Auth>{user => user ? <Dashboard user={user} /> : <Login />}</Auth>

// 2020+: Hooks (победили)
function Dashboard() {
    const user = useAuth();
    if (!user) return <Login />;
    return <DashboardView user={user} />;
}
```

**Hooks — текущий стандарт.** Render Props и HOC — знать для чтения старого кода.

---

## 8. Server Components (React 19 / Next.js 14+)

Новый ментальный сдвиг: не все компоненты выполняются в браузере.

> **Как читать `'use client'`:** читай как «внимание, сборщик! Этот компонент — островок интерактивности, его нужно отправить в браузер». Без этой директивы компонент выполняется на сервере, его JavaScript НЕ попадает в бандл, а в разметку попадает только готовый HTML. Мнемоника: *«'use client' — это штамп 'в браузер' на компоненте»*.

```
┌─────────────────────────┐
│  Server Components      │
│  - Нет useState/useEffect│
│  - Прямой доступ к БД   │
│  - Нет JS в бандле      │
│  - async/await          │
└──────────┬──────────────┘
           │ только для интерактивности
┌──────────▼──────────────┐
│  Client Components      │
│  - 'use client'         │
│  - onClick, useState    │
│  - Браузерные API       │
└─────────────────────────┘
```

```typescript
// Server Component — выполняется на сервере, JS не доходит до клиента
async function EventPage({ params }: { params: { id: string } }) {
    const event = await db.event.findUnique({ where: { id: params.id } });
    return (
        <div>
            <h1>{event.title}</h1>
            <p>{event.description}</p>
            {/* Клиентский островок для кнопки покупки */}
            <BuyButton eventId={event.id} price={event.price} />
        </div>
    );
}

// Client Component — только там, где нужна интерактивность
'use client';
function BuyButton({ eventId, price }: { eventId: string; price: number }) {
    const { mutate, isPending } = useBuyTicket();
    return (
        <button onClick={() => mutate(eventId)} disabled={isPending}>
            {isPending ? 'Покупаю...' : `Купить за ${price}₽`}
        </button>
    );
}
```

---

## 9. Чек-лист хорошего API компонента

- [ ] Можно использовать без чтения исходников (понятные названия пропсов)
- [ ] Компонуемость: части можно собрать по-разному
- [ ] Нет «пропсов на все случаи» (признак: >10 пропсов)
- [ ] Accessibility из коробки (role, aria, keyboard)
- [ ] Типизация через TypeScript, а не PropTypes
- [ ] ForwardRef для возможности повесить ref
- [ ] displayName для Compound Components

---

## Связанное
- [[CSS и стилизация]] — стилизация компонентов

- [[Интернационализация и локализация i18n]] — адаптация компонентов под языки

- [[React рендеринг и производительность]]
- [[TypeScript продвинутый]]
- [[Управление состоянием]]
