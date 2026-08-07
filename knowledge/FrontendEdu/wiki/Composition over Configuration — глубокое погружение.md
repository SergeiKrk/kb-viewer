---
title: "Composition over Configuration — глубокое погружение"
date: 2026-08-07
tags: [composition, architecture, react, компоненты, проектирование-API]
category: concept
parent: [[Архитектура React компонентов]]
---

# Composition over Configuration — глубокое погружение

## Интуиция и аналогия

Представь конструктор LEGO. У тебя есть набор деталей: балки, окна, двери, колёса. Ты НЕ говоришь фабрике: «сделай мне машинку с красным кузовом, четырьмя колёсами и лобовым стеклом» (это конфигурация). Ты берёшь детали и собираешь машинку сам (это композиция).

**Конфигурация** = «я опишу все хотелки пропсами, а ты внутри разберись как это отрендерить».
**Композиция** = «я даю тебе готовые куски JSX, ты просто размести их в правильные слоты».

В React эта философия звучит так:

> **Не проектируй компонент с пропсами на все случаи жизни — проектируй компонент-контейнер, внутрь которого можно положить что угодно.**

---

## Проблема конфигурационного («пропсового») подхода

### Пример: Modal, в котором всё решается пропсами

```tsx
// ❌ Компонент-божество: 20+ пропсов
<Modal
    isOpen={true}
    title="Удалить событие?"
    body="Вы уверены? Это действие нельзя отменить."
    confirmText="Удалить"
    cancelText="Отмена"
    onConfirm={handleDelete}
    onCancel={closeModal}
    size="medium"                  // small | medium | large | fullscreen
    showCloseButton={true}         // boolean
    closeOnOverlay={true}          // boolean
    closeOnEscape={true}           // boolean
    footer={<><button>Ещё</button></>}  // уже композиция, но несистемная
    headerIcon={<TrashIcon />}     // попытка композиции через проп
    animation="fade"               // fade | slide | none
    position="center"              // center | top | bottom
    overlayClassName="custom-bg"   // кастомизация через className пропы
    contentClassName="custom-modal"
    // ... ещё 10 пропсов через месяц
/>
```

### Что идёт не так

| Проблема | Последствия |
|----------|-------------|
| Каждое новое требование → новый проп | Нет конца расширению API |
| Типизация раздувается | `ModalProps` превращается в 60 строк неподдерживаемого кода |
| Невозможно кастомизировать непредусмотренное | Нельзя добавить произвольный элемент в неожиданное место |
| Сложность изучения API | Нужна документация, автокомплит не спасает |
| Нарушение Open/Closed Principle | Модифицируешь компонент каждый раз |
| Условный рендеринг разрастается | Внутри компонента: `if (size === 'fullscreen')`, `if (animation === 'fade')` → 300+ строк |

### Как это выглядит изнутри

```tsx
// Внутри «конфигурационного» Modal — лапша из условий
function Modal({
    isOpen, title, body, confirmText, cancelText,
    onConfirm, onCancel, size, showCloseButton,
    closeOnOverlay, headerIcon, animation, footer,
    position, overlayClassName, contentClassName
}: ModalProps) {
    if (!isOpen) return null;

    // Определение размера через switch/case
    const sizeClass = {
        small: 'modal-sm',
        medium: 'modal-md',
        large: 'modal-lg',
        fullscreen: 'modal-fullscreen',
    }[size];

    // Определение анимации
    const animationClass = animation === 'fade' ? 'animate-fade'
        : animation === 'slide' ? 'animate-slide'
        : '';

    // Условный рендеринг кнопки закрытия
    const closeButton = showCloseButton
        ? <button className="modal-close" onClick={onCancel}>×</button>
        : null;

    // Условный рендеринг заголовка
    const headerContent = title || headerIcon ? (
        <div className="modal-header">
            {headerIcon && <span className="modal-icon">{headerIcon}</span>}
            {title && <h2>{title}</h2>}
            {closeButton}
        </div>
    ) : null;

    // Условный рендеринг футера
    const footerContent = footer || confirmText ? (
        <div className="modal-footer">
            {footer || (
                <>
                    {cancelText && <button onClick={onCancel}>{cancelText}</button>}
                    {confirmText && <button onClick={onConfirm}>{confirmText}</button>}
                </>
            )}
        </div>
    ) : null;

    return createPortal(
        <div
            className={`modal-overlay ${overlayClassName ?? ''}`}
            onClick={closeOnOverlay ? onCancel : undefined}
        >
            <div
                className={`modal-content ${sizeClass} ${animationClass} ${contentClassName ?? ''}`}
                onClick={e => e.stopPropagation()}
                style={position === 'top' ? { marginTop: 20 } : undefined}
            >
                {headerContent}
                <div className="modal-body">{body}</div>
                {footerContent}
            </div>
        </div>,
        document.body
    );
}
```

Это НЕ поддерживаемо. Каждое изменение — риск сломать один из 10 вариантов использования.

---

## Решение: композиционный подход

### Философия

> Компонент = контейнер с предсказуемыми зонами (Header, Body, Footer). Пользователь САМ решает, что в них положить.

### Внешнее API

```tsx
// ✅ Композиционный Modal: пользователь собирает как LEGO
<Modal isOpen={isOpen} onClose={closeModal}>
    <Modal.Header>
        <Modal.Icon><TrashIcon /></Modal.Icon>
        <Modal.Title>Удалить событие?</Modal.Title>
        <Modal.CloseButton />
    </Modal.Header>

    <Modal.Body>
        <p>Вы уверены? Это действие нельзя отменить.</p>
        <InfoBanner>Событие «ReactConf 2026» будет удалено безвозвратно</InfoBanner>
    </Modal.Body>

    <Modal.Footer>
        <Button variant="secondary" onClick={closeModal}>Отмена</Button>
        <Button variant="danger" onClick={handleDelete}>Удалить</Button>
        {/* Можно добавить что угодно */}
        <Tooltip text="Зажмите Shift чтобы удалить без подтверждения">
            <Button variant="ghost">?</Button>
        </Tooltip>
    </Modal.Footer>
</Modal>
```

### Реализация

```tsx
// Modal.tsx
import { createPortal } from 'react-dom';
import React from 'react';

// === Пропсы для корневого Modal ===
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    /** Если false, клик по оверлею НЕ закрывает */
    closeOnOverlay?: boolean;
}

// === Пропсы для секций (Header, Body, Footer) ===
interface ModalSectionProps {
    children: React.ReactNode;
    className?: string;
    // Дополнительно: можно пробрасывать любые div-пропсы
}

// ── КОРНЕВОЙ КОМПОНЕНТ ──
function Modal({ isOpen, onClose, children, closeOnOverlay = true }: ModalProps) {
    // Не рендерим ничего если закрыто — экономим DOM-узлы
    if (!isOpen) return null;

    // Escape key handler
    // Используем useEffect с cleanup чтобы не висеть когда закрыто
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // Focus trap для accessibility (упрощённо)
    const contentRef = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
        // При открытии — фокус на контент
        contentRef.current?.focus();
    }, []);

    return createPortal(
        <div
            className="modal-overlay"
            onClick={closeOnOverlay ? onClose : undefined}
            role="presentation"
        >
            <div
                ref={contentRef}
                className="modal-content"
                role="dialog"
                aria-modal="true"
                tabIndex={-1}   // нужно для focus()
                onClick={e => e.stopPropagation()}  // клик внутри не закрывает
            >
                {children}
            </div>
        </div>,
        document.body
    );
}

// ── ПОДКОМПОНЕНТЫ: «приклеиваем» к функции Modal ──

Modal.Header = ({ children, className = '' }: ModalSectionProps) => (
    <div className={`modal-header ${className}`}>{children}</div>
);

Modal.Title = ({ children, className = '' }: ModalSectionProps) => (
    <h2 className={`modal-title ${className}`}>{children}</h2>
);

Modal.Body = ({ children, className = '' }: ModalSectionProps) => (
    <div className={`modal-body ${className}`}>{children}</div>
);

Modal.Footer = ({ children, className = '' }: ModalSectionProps) => (
    <div className={`modal-footer ${className}`}>{children}</div>
);

Modal.CloseButton = ({ className = '' }: { className?: string }) => {
    // Используем Context для получения onClose без проброса пропсов
    return null; // См. реализацию с Context в статье Compound Components
};

// Иконка — простой контейнер, стилизация на совести CSS
Modal.Icon = ({ children, className = '' }: ModalSectionProps) => (
    <span className={`modal-icon ${className}`}>{children}</span>
);

export { Modal };
```

### Что произошло

- **Количество пропсов ядра:** 3 (`isOpen`, `onClose`, `children`) вместо 15+
- **Расширяемость:** пользователь кладёт ЛЮБОЙ JSX в Header/Body/Footer
- **Открытость-закрытость:** добавление нового элемента не меняет код Modal
- **Читаемость:** JSX сам документирует структуру

---

## Под капотом: как React обрабатывает `children`

### Как React хранит children

```tsx
// Это:
<Modal>
    <Modal.Header>Заголовок</Modal.Header>
    <Modal.Body>Тело</Modal.Body>
</Modal>

// React превращает в объект (упрощённо):
{
    type: Modal,
    props: {
        children: [
            { type: Modal.Header, props: { children: 'Заголовок' } },
            { type: Modal.Body,   props: { children: 'Тело' } },
        ]
    }
}
```

**Ключевой инсайт:** `children` — это не просто «внутренности тега». Это полноценные React-элементы (объекты со всей информацией), которые будут рекурсивно обработаны React-рендерером. Когда ты пишешь `{children}` в компоненте, ты говоришь: «вставь сюда всё, что передали между открывающим и закрывающим тегами».

### Почему композиция через children дешевле конфигурации через пропсы

```
Конфигурация:
    render Modal → проверить 15 пропсов → условный JSX → VDOM → diff → DOM

Композиция:
    render Modal → просто {children} → VDOM уже содержит готовые элементы
```

Композиция **не вызывает дополнительных ре-рендеров**: `{children}` — это просто ссылка на уже созданные React-элементы. Если родитель Modal не ре-рендерится, children не пересоздаются (при правильном поднятии состояния).

---

## Типичные ошибки и антипаттерны

### 1. Композиция + пропсы одновременно (размазанная ответственность)

```tsx
// ❌ Смесь: часть через children, часть через пропсы
<Modal isOpen={isOpen} onClose={closeModal} title="Заголовок" footer={<Btn />}>
    <p>А тело через children...</p>
</Modal>
```

Либо ВСЁ через children, либо ВСЁ через пропсы. Гибриды запутывают.

### 2. Слишком глубокая композиция без необходимости

```tsx
// ❌ Избыточно: Button не нужно разбивать на части
<Button>
    <Button.Icon><Check /></Button.Icon>
    <Button.Label>Сохранить</Button.Label>
</Button>

// ✅ Достаточно: Button принимает icon как проп
<Button icon={<Check />}>Сохранить</Button>
```

**Правило:** если части НЕ переиспользуются независимо, разбивка избыточна. Паттерн стоит применять к компонентам-контейнерам (Modal, Card, Layout, Tabs), а не к атомарным.

### 3. Забыли про stopPropagation

```tsx
// ❌ Клик по контенту закрывает модалку (баг!)
<div className="overlay" onClick={onClose}>
    <div className="content">
        {children}   {/* Клик по children тоже вызовет onClose! */}
    </div>
</div>

// ✅ Останавливаем всплытие
<div className="overlay" onClick={onClose}>
    <div className="content" onClick={e => e.stopPropagation()}>
        {children}
    </div>
</div>
```

### 4. Нестабильные ссылки на функции в children

```tsx
// ❌ При каждом рендере Parent создаётся новый children —
//     даже если Modal не ре-рендерится, children пересоздаются
function Parent() {
    return (
        <Modal>
            <ExpensiveComponent />  {/* Новый объект каждый рендер */}
        </Modal>
    );
}

// ✅ Поднимай children ВЫШЕ или мемоизируй
function Parent() {
    const modalContent = useMemo(() => (
        <ExpensiveComponent />
    ), []);  // стабильная ссылка

    return <Modal>{modalContent}</Modal>;
}
```

---

## Когда ИСПОЛЬЗОВАТЬ композицию, а когда НЕТ

### ✅ Используй композицию когда:

- Компонент — **контейнер** (Modal, Card, Drawer, PageLayout, Panel)
- Пользователь должен свободно комбинировать секции (заголовок, тело, футер)
- Количество возможных вариаций НЕ ограничено
- Разные экраны приложения стилизуют компонент по-разному
- Accessible компоненты: нужны aria-атрибуты на разных уровнях

### ❌ НЕ используй композицию когда:

- Компонент атомарный (Button, Input, Badge) — достаточно пропсов
- Есть ровно 1 способ использования (нет вариаций)
- Команда не готова к сложности (композиция требует дисциплины)
- Производительность критична и каждый уровень вложенности на счету

---

## Связь с другими паттернами

| Паттерн | Как связан |
|---------|------------|
| [[Compound Components — глубокое погружение]] | Композиция + Context = Compound Components |
| [[Slots Pattern в React]] | Slots — это композиция через пропсы, не через children |
| [[Headless Components — глубокое погружение]] | Headless-компоненты используют children-как-функцию (render-prop) |
| [[Принцип единственной ответственности в React]] | Композиция помогает разделить God-компонент |

---

## Связанное

- [[Архитектура React компонентов]] — родительская статья
- [[Compound Components — глубокое погружение]] — развитие идей композиции через Context
- [[Slots Pattern в React]] — slots как альтернативный взгляд на композицию
- [[Принцип единственной ответственности в React]] — композиция как инструмент соблюдения SRP
- [[Headless Components — глубокое погружение]] — композиция поведения (не UI)
- [[React рендеринг и производительность]] — влияние children на ре-рендеры
- [[TypeScript продвинутый]] — типизация композиционных компонентов
