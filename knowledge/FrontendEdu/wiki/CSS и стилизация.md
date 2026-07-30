---
title: "CSS и стилизация"
date: 2026-07-19
tags: [css, стилизация, специфичность, flexbox, grid, анимации, производительность, tailwind, css-in-js, адаптивность]
category: concept
source_count: 0
---

# CSS и стилизация

CSS — это язык, который превращает HTML-разметку в визуальный интерфейс. Без него любое веб-приложение выглядит как белый лист с чёрным текстом. Эта страница охватывает весь спектр: от базовых механик до продвинутых стратегий стилизации в 2026 году.

---

## 🔵 Объяснение для ребёнка

Представь, что HTML — это скелет дома: стены, двери, окна. А CSS — это отделка: какого цвета стены, какие занавески, где стоит мебель, насколько большие окна.

CSS говорит браузеру:
- Сделай эту кнопку **синей и круглой**
- Расположи картинки **в ряд, а не друг под другом**
- Когда наводишь мышку — кнопка **немного увеличивается**

Без CSS интернет выглядел бы как текст в блокноте. С CSS — сайты становятся красивыми, удобными и «живыми»: кнопки реагируют на нажатия, меню выезжает, картинки плавно появляются.

Самое простое правило CSS выглядит так:

```css
/* КТО — ЧТО ДЕЛАЕМ — КАК */
button {
  background: blue;
  color: white;
  border-radius: 8px;
}
```

Браузер читает это и понимает: «все кнопки должны быть синими с белым текстом и скруглёнными углами». Это как давать инструкции художнику, который рисует страницу.

---

## 🟢 Junior-уровень

### Базовые механики CSS

#### Каскад и специфичность

CSS расшифровывается как Cascading Style Sheets. **Каскад** означает, что стили применяются по порядку: если два правила конфликтуют, побеждает то, которое «последнее по порядку чтения» — но только при равной специфичности.

**Специфичность** — это система весов селекторов. Представь счёт (a, b, c, d):

| Селектор | Вес | Пример |
|----------|-----|--------|
| `style=""` (inline) | (1,0,0,0) | `<div style="color:red">` |
| `#id` | (0,1,0,0) | `#header` |
| `.class`, `[attr]`, `:hover` | (0,0,1,0) | `.button`, `[type="text"]` |
| `div`, `span`, `::before` | (0,0,0,1) | `div`, `::after` |

```css
/* Специфичность (0,0,0,1) */
div { color: blue; }

/* Специфичность (0,0,1,0) — побеждает! */
.button { color: green; }
```

**Важные правила:**
- `!important` ломает каскад — используй только для переопределения сторонних стилей
- Селекторы по тегам — минимальный вес, их легко переопределить
- Вложенность через пробел (`div p`) суммирует вес

#### Наследование

Некоторые свойства передаются от родителя к потомкам автоматически, другие — нет:

```css
/* Наследуются: */
/* color, font-family, font-size, text-align, line-height, visibility, cursor */

/* НЕ наследуются: */
/* margin, padding, border, width, height, background, position */
```

Ключевые слова для управления наследованием:
- `inherit` — принудительно наследовать от родителя
- `initial` — сбросить до значения по умолчанию (спецификация)
- `unset` — если свойство наследуемое → `inherit`, иначе → `initial`
- `revert` — откатить до стилей браузера (user-agent stylesheet)

#### Box Model (блочная модель)

Каждый HTML-элемент — это прямоугольник, состоящий из слоёв (изнутри наружу):

```
┌─────────────────────────────┐
│           margin            │
│  ┌───────────────────────┐  │
│  │        border         │  │
│  │  ┌─────────────────┐  │  │
│  │  │     padding     │  │  │
│  │  │  ┌───────────┐  │  │  │
│  │  │  │  content  │  │  │  │
│  │  │  └───────────┘  │  │  │
│  │  └─────────────────┘  │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
```

**`box-sizing: border-box`** — самое важное правило для Junior:

```css
/* Без него: width = только контент */
/* С ним:    width = контент + padding + border */
*, *::before, *::after {
  box-sizing: border-box;
}
```

С `border-box` легче управлять размерами: задал `width: 200px` — получил 200px вместе с padding и border'ом.

#### Единицы измерения

| Единица | Значение | Когда использовать |
|---------|----------|-------------------|
| `px` | Абсолютный пиксель | Точные размеры, border |
| `rem` | Размер шрифта `<html>` | Типографика, отступы (доступность) |
| `em` | Размер шрифта родителя | Отступы внутри компонента |
| `%` | Процент от родителя | Ширина колонок |
| `vh` / `vw` | % от высоты / ширины viewport | Полноэкранные секции |
| `dvh` / `svh` / `lvh` | Динамический viewport height | Мобильные (учитывают адресную строку) |

**Ключевое правило: `rem` для типографики, `px` для границ, избегай абсолютных `px` для шрифтов.**

```css
html {
  /* По умолчанию 16px, но НЕ трогай — пользователь может настроить */
  font-size: 100%;
}

h1 { font-size: 2rem; }      /* 32px при стандартных настройках */
p  { font-size: 1rem; }      /* 16px */
.button { padding: 0.75rem 1.5rem; }
```

#### Расположение элементов: Flow, Position, Display

Базовые значения `display`:
- `block` — занимает всю ширину родителя, перенос строки (div, p, h1)
- `inline` — ведёт себя как текст, нельзя задать width/height (span, a)
- `inline-block` — внешне inline, но можно задать размеры
- `none` — элемент скрыт, не занимает места

`position`:
- `static` — по умолчанию, в потоке
- `relative` — сдвиг относительно своего места в потоке
- `absolute` — вынимается из потока, позиционируется от ближайшего позиционированного предка
- `fixed` — от viewport, не скроллится
- `sticky` — скроллится до границы, потом «прилипает»

---

## 🟡 Middle-уровень

### Методологии CSS и архитектура

На Middle-уровне ты уже не просто пишешь стили — ты проектируешь систему. Ключевой вопрос: **как организовать CSS, чтобы через год не было больно?**

#### Методология BEM (Block Element Modifier)

BEM — конвенция именования, делающая CSS предсказуемым и изолированным:

```css
/* Блок */
.card { }
/* Элемент */
.card__title { }
.card__body { }
/* Модификатор */
.card--featured { }
.card__title--large { }
```

Плюсы: плоская специфичность, самодокументирование, нет конфликтов.
Минусы: длинные имена, boilerplate, вручную.

#### Современный CSS: Flexbox

Flexbox — одномерная модель раскладки (строка ИЛИ колонка):

```css
.container {
  display: flex;
  /* Главная ось */
  justify-content: space-between; /* start | center | end | space-between | space-around | space-evenly */
  /* Поперечная ось */
  align-items: center;           /* stretch | start | center | end | baseline */
  /* Перенос */
  flex-wrap: wrap;
  /* Промежутки */
  gap: 1rem;                     /* row-gap + column-gap */
}

/* Дочерние элементы */
.item {
  flex: 1;        /* grow */
}
.item-fixed {
  flex: 0 0 200px; /* grow shrink basis */
}
```

**Ключевые моменты:**
- `margin: auto` во flex-контейнере «съедает» свободное пространство
- `flex-shrink: 0` предотвращает сжатие элемента
- `gap` работает и во Flexbox, и в Grid

#### Современный CSS: Grid

Grid — двумерная модель (строки И колонки одновременно):

```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

/* Размещение по линиям */
.header  { grid-column: 1 / -1; }          /* на всю ширину */
.sidebar { grid-column: 1; grid-row: 2 / 4; }
.content { grid-column: 2 / -1; }

/* Именованные области */

> **Как читать `grid-template-areas`:** читай как ASCII-рисунок твоего макета — каждая строка в кавычках это ряд, каждое слово внутри — ячейка. Одинаковые имена объединяются в одну область. `"header header"` значит «header занимает две ячейки в первом ряду». Мнемоника: *«grid-template-areas — рисуешь макет текстом, как смайлик»*.

.layout {
  display: grid;
  grid-template-areas:
    "header  header"
    "sidebar content"
    "footer  footer";
  grid-template-columns: 250px 1fr;
}
.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
```

**Главное отличие от Flexbox:** Grid управляет и строками, и колонками одновременно. Flexbox — только одной осью. Grid — для страничных раскладок. Flexbox — для компонентов (навигация, карточки, кнопки).

### Адаптивность и responsive-дизайн

#### Mobile-first

Начинай с мобильной версии, расширяй через `min-width` (а не `max-width`):

```css
/* ❌ Desktop-first: сложнее переопределять */
.sidebar { width: 300px; }
@media (max-width: 768px) {
  .sidebar { width: 100%; }
}

/* ✅ Mobile-first: меньше кода, естественное расширение */
.sidebar { width: 100%; }
@media (min-width: 768px) {
  .sidebar { width: 300px; }
}
```

#### Fluid Typography с clamp()

`clamp(MIN, PREFERRED, MAX)` — один из самых полезных инструментов:

> **Как читать `clamp(MIN, PREFERRED, MAX)`:** читай как «возьми значение PREFERRED, но не меньше MIN и не больше MAX». Средний параметр — обычно `vw` (процент от ширины экрана), который плавно растёт/уменьшается, а крайние значения не дают шрифту стать слишком мелким или огромным. Мнемоника: *«clamp — это min и max в одной функции: гуляй между ними, но за забор не выходи»*.

```css
h1 {
  /* Минимум 1.5rem, максимум 3rem, между ними — fluid */
  font-size: clamp(1.5rem, 4vw, 3rem);
}

p {
  /* 16px на маленьких экранах, 20px на больших, без breakpoint'ов */
  font-size: clamp(1rem, 0.5rem + 1vw, 1.25rem);
}
```

Формула для плавного масштабирования между двумя точками:

```css
/* 
 * font-size: clamp(
 *   min-font-size,
 *   min-font-size + (max-font-size - min-font-size) * (100vw - min-viewport) / (max-viewport - min-viewport),
 *   max-font-size
 * )
 */
```

#### Container Queries

В отличие от Media Queries (смотрят на ширину viewport), Container Queries смотрят на ширину **родительского контейнера**. Это революция для переиспользуемых компонентов:

> **Как читать `@container`:** читай как «если мой КОНТЕЙНЕР (не весь экран!) стал уже 400px — перестрой меня». В отличие от `@media`, который смотрит на ширину окна браузера, `@container` смотрит на ближайшего родителя с `container-type`. Мнемоника: *«@container — спроси не у окна, а у родителя»*.

```css
/* Определяем контейнер */
.card-wrapper {
  container-type: inline-size;
  container-name: card;
}

/* Стили зависят от ширины контейнера, а не viewport! */
@container card (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 200px 1fr;
  }
}

@container card (max-width: 399px) {
  .card {
    display: flex;
    flex-direction: column;
  }
}
```

**Container Queries решают проблему:** один и тот же компонент в узком сайдбаре выглядит иначе, чем в широкой основной области — без JavaScript и без привязки к глобальным breakpoint'ам.

#### Новые viewport-единицы

На мобильных устройствах адресная строка браузера «съедает» часть viewport. `100vh` игнорирует это:

```css
.hero {
  /* ❌ На iOS Safari 100vh = высота с учётом скрытой адресной строки → скролл */
  height: 100vh;

  /* ✅ dvh динамически учитывает видимую область */
  height: 100dvh;

  /* svh — Small Viewport Height (когда адресная строка показана) */
  /* lvh — Large Viewport Height (когда адресная строка скрыта) */
}
```

### CSS-препроцессоры и PostCSS

#### Sass/SCSS

Препроцессор, который добавляет в CSS возможности языков программирования:

```scss
// Переменные
$primary: #3b82f6;
$spacing: 1rem;

// Вложенность
.card {
  background: white;
  &__title { font-size: 1.5rem; }  // .card__title
  &:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }

  &--featured {
    border-color: $primary;
    .card__title { color: $primary; }
  }
}

// Миксины
@mixin flex-center($direction: row) {
  display: flex;
  flex-direction: $direction;
  justify-content: center;
  align-items: center;
}

// Функции
@function rem($px) { @return calc($px / 16) + rem; }

// Циклы — генерация utility-классов
@for $i from 1 through 4 {
  .mt-#{$i} { margin-top: $i * $spacing; }
}
```

#### PostCSS

Это **не препроцессор**, а постпроцессор — плагин-система, манипулирующая уже валидным CSS:

- **Autoprefixer** — добавляет вендорные префиксы (`-webkit-`, `-moz-`)
- **cssnano** — минификация CSS
- **postcss-nesting** — вложенность по стандарту CSS Nesting
- **postcss-preset-env** — полифилы для будущих фич CSS

```css
/* Пишешь современный CSS: */
.card {
  & .title { font-size: 1.5rem; }  /* CSS Nesting — станет стандартом */

  &:has(img) { padding: 0; }      /* :has() — уже в современных браузерах */
}

/* PostCSS конвертирует для старых браузеров: */
/* .card .title { font-size: 1.5rem; } */
/* Добавляет -webkit- префиксы где нужно */
```

### CSS Modules — scoping без рантайма

CSS Modules решают главную проблему глобального CSS: **конфликт имён**. Файл `Button.module.css`:

```css
/* Button.module.css */
.root { padding: 8px 16px; }
.primary { background: var(--color-primary); }
```

Импорт в компоненте React:

```tsx
import styles from './Button.module.css';

function Button({ variant = 'primary' }) {
  return <button className={`${styles.root} ${styles[variant]}`}>Click</button>;
}
```

**Что происходит под капотом (сборщик, например Vite/webpack):**

```
.root    → .Button_root_abc123
.primary → .Button_primary_abc123
```

- Каждый класс получает **уникальный хеш** (обычно `[filename]_[classname]_[hash]`)
- Глобальных конфликтов имён не существует
- `composes:` позволяет переиспользовать стили внутри модуля:

```css
.base { padding: 8px; }
.primary { composes: base; background: blue; }
```

**Плюсы:** нулевой рантайм, tree-shaking (неиспользуемые классы удаляются сборщиком), TypeScript-поддержка через `*.module.css.d.ts`.
**Минусы:** динамические стили требуют inline styles или CSS-переменных; стили — отдельные файлы, а не colocated с компонентом.

### Анимации

#### CSS Transitions

Для простых переходов между двумя состояниями:

```css
.button {
  background: #3b82f6;
  transition: background 0.2s ease, transform 0.15s ease;
}
.button:hover {
  background: #2563eb;
  transform: scale(1.05);
}
```

Функции сглаживания (`easing`):
- `ease` — плавный старт, быстрая середина, плавный конец (по умолчанию)
- `linear` — равномерная скорость
- `ease-in` / `ease-out` — ускорение / замедление
- `cubic-bezier(0.4, 0, 0.2, 1)` — кастомная кривая

#### CSS Keyframe Animations

Для сложных, повторяющихся или многоэтапных анимаций:

```css
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}
```

**Управление анимацией:**
- `animation-fill-mode: forwards` — сохраняет последний кадр
- `animation-play-state: paused` — ставит на паузу (полезно для `prefers-reduced-motion`)
- `animation-composition: add` — комбинирует трансформации вместо перезаписи

#### Анимации и accessibility

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

#### Framer Motion против CSS-анимаций

| | CSS Animations/Transitions | Framer Motion |
|---|---|---|
| **Сложность** | Простые переходы, keyframes | Сложные жесты, layout-анимации, exit-анимации |
| **Контроль** | Декларативный | Императивный (animate(), useAnimationControls()) |
| **Unmount** | ❌ Нельзя анимировать размонтирование | ✅ `AnimatePresence` |
| **Жесты** | ❌ Только `:hover`, `:active` | ✅ drag, tap, hover, pan, whileInView |
| **Производительность** | GPU-ускорение из коробки | layout-анимации через FLIP, иногда дорого |
| **Бандл** | 0 KB | ~30 KB gzipped |
| **Когда использовать** | Простые UI-переходы, скелетоны, hover | Сложные интерактивные анимации, drag&drop, page transitions |

**Правило выбора:** начинай с CSS. Если нужны exit-анимации, жесты или layout-анимации — подключай Framer Motion.

---

## 🔴 Senior-уровень

### Стратегия стилизации: обзор подходов

Senior выбирает подход к стилизации для **всей команды**, а не для одного компонента. Каждый вариант имеет компромиссы.

#### Tailwind CSS — utility-first

Tailwind — это набор атомарных utility-классов. Вместо написания CSS ты составляешь стили из готовых «кирпичиков»:

```html
<button class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
               transition-colors duration-200 font-medium">
  Click me
</button>
```

**Настройка (`tailwind.config.ts`):**

```typescript
export default {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a5f',
        }
      },
      spacing: {
        '4.5': '1.125rem',
      }
    }
  },
  // Оптимизация для production
  content: ['./src/**/*.{ts,tsx}'],
}
```

**Как Tailwind работает под капотом (сборка):**
1. Сканирует `content`-файлы на наличие классов
2. Генерирует CSS **только для используемых классов** (tree-shaking)
3. Итоговый бандл CSS — 3-10 KB gzipped (после очистки)

**Критика Tailwind:**
- 👎 Захламляет JSX — много классов в разметке
- 👎 Динамические классы не работают без конфига (нельзя `bg-${color}-500`)
- 👎 Отрыв от реального CSS — разработчик забывает, как писать CSS
- 👎 При одинаковых стилях — дублирование (решается компонентами)
- 👍 Мгновенный прототип — не переключаешься между файлами
- 👍 Дизайн-система из коробки (spacing, colors, breakpoints)
- 👍 Консистентность в команде — нет 50 оттенков серого
- 👍 Предсказуемый бандл — растёт линейно с количеством уникальных классов

#### CSS-in-JS: эволюция

**Styled-components (runtime CSS-in-JS):**

Первопроходец. Стили — это tagged template literals. Генерация CSS происходит в рантайме:

```tsx
import styled from 'styled-components';

const Button = styled.button<{ $variant: 'primary' | 'secondary' }>`
  padding: 8px 16px;
  border-radius: 8px;
  background: ${props => props.$variant === 'primary' ? '#3b82f6' : '#e5e7eb'};
  color: ${props => props.$variant === 'primary' ? 'white' : '#1f2937'};

  &:hover {
    opacity: 0.9;
  }
`;
```

**Проблемы runtime CSS-in-JS (styled-components, Emotion):**
- **Бандл вырастает** на 12-15 KB gzipped (библиотека)
- **JavaScript-накладные расходы** при SSR — стили нужно «вытянуть» из JS в CSS перед отправкой HTML
- **RSC (React Server Components) несовместимость** — серверные компоненты не могут использовать runtime CSS-in-JS
- **FOUC (Flash of Unstyled Content)** при неправильном SSR

**Vanilla Extract — zero-runtime CSS-in-JS:**

Стили пишутся в TypeScript, но **компилируются в статический CSS на этапе сборки**:

```ts
// styles.css.ts
import { style } from '@vanilla-extract/css';

export const button = style({
  padding: '8px 16px',
  background: 'blue',
  ':hover': { opacity: 0.9 }
});

export const primary = style({
  background: '#3b82f6',
  color: 'white'
});
```

```tsx
// Button.tsx
import * as styles from './styles.css';

<button className={`${styles.button} ${styles.primary}`}>Click</button>
```

Zero-runtime означает: **в production нет JS-библиотеки стилизации**. Vanilla Extract компилируется в CSS-файлы на этапе сборки.

**Panda CSS — compile-time, utility-first + целостность типов:**

```tsx
import { css } from '../styled-system/css';

<button className={css({ bg: 'blue.500', px: '4', py: '2', rounded: 'lg' })}>
  Click
</button>
```

Panda CSS генерирует статический CSS с атомарными классами, как Tailwind, но с type-safe API. `bg: 'blue.500'` проверяется TypeScript'ом на этапе компиляции.

**Сравнительная таблица подходов:**

| Подход | Рантайм | Бандл | RSC | TypeScript | Динамика |
|--------|---------|-------|-----|-----------|----------|
| CSS Modules | 0 KB | ✅ | ✅ | `*.module.css.d.ts` | CSS-переменные |
| Tailwind | 0 KB (CSS) | ✅ | ✅ | ❌ (строка класса) | `data-[state=open]:flex` |
| styled-components | ~14 KB | ✅ | ❌ | ✅ | Полная (props) |
| Vanilla Extract | 0 KB | ✅ | ✅ | ✅ (типы) | `styleVariants`, recipes |
| Panda CSS | 0 KB | ✅ | ✅ | ✅ | `cva`, recipes |

**Совет Senior:** в 2025-2026 индустрия движется к **zero-runtime** решениям. Tailwind доминирует по простоте. Panda CSS и Vanilla Extract — компромисс между type-safety и производительностью. Styled-components и Emotion уходят в legacy.

### CSS-архитектура: @layer и :has()

#### @layer — управление каскадом

`@layer` позволяет **явно задать порядок приоритета стилей**, независимо от порядка в коде:

```css
/* Порядок приоритета: чем позже объявлен слой, тем выше его приоритет */
@layer reset, base, components, utilities;

@layer reset {
  *, *::before, *::after { box-sizing: border-box; margin: 0; }
}

@layer base {
  a { color: var(--color-link); }
}

@layer components {
  .card { padding: 1rem; }
}

@layer utilities {
  .mt-0 { margin-top: 0 !important; } /* !important в низкоприоритетном слое — ок */
}
```

**Зачем:** utility-классы всегда перебивают компоненты, компоненты — базу, база — reset. Без `!important` и магии специфичности. Tailwind использует `@layer` для этого же.

#### :has() — «родительский селектор»

`:has()` позволяет стилизовать родителя на основе содержимого:

```css
/* Карточка с картинкой стилизуется иначе */
.card:has(img) {
  padding: 0;
}

/* Форма с ошибкой — красная рамка */
.form-group:has(input:invalid) {
  border-color: red;
}

/* Hover на всей карточке при наведении на кнопку */
.card:has(.card__button:hover) {
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

/* Соседний элемент изменился */
.label:has(+ input:focus) {
  color: var(--color-primary);
}
```

**:has() + Grid — мощный тандем:**

```css
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}

/* Если в галерее всего 1 элемент — растяни на весь ряд */
.gallery:has(> :only-child) {
  grid-template-columns: 1fr;
}

/* Если 2 элемента — два столбца */
.gallery:has(> :nth-child(2):last-child) {
  grid-template-columns: 1fr 1fr;
}
```

### Производительность CSS

#### Что дорого в CSS

Не все CSS-свойства одинаковы. Браузер выполняет рендеринг в несколько этапов:

```
Style → Layout → Paint → Composite
```

Чем раньше этап, тем дороже изменение:

| Этап | Свойства | Стоимость |
|------|----------|-----------|
| **Layout** (reflow) | `width`, `height`, `margin`, `padding`, `top`, `left`, `display`, `font-size` | 💰💰💰💰💰 Максимальная |
| **Paint** (repaint) | `color`, `background`, `box-shadow`, `outline`, `border-color` | 💰💰💰 Средняя |
| **Composite** | `transform`, `opacity` | 💰 Минимальная |

**Лучшие практики:**

```css
/* ❌ Дорого: анимация width/height вызывает layout на каждом кадре */
.bad-animation {
  transition: width 0.3s;
}

/* ✅ Дешево: transform запускает только composite */
.good-animation {
  transition: transform 0.3s;
}
.good-animation:hover {
  transform: scale(1.05); /* ← только composite */
}

/* ❌ Дорого: box-shadow при скролле */
.card { box-shadow: 0 4px 20px rgba(0,0,0,0.15); }

/* ✅ Дешево: filter на отдельном слое */
.card { filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1)); }
```

#### will-change — предупреждение браузеру

`will-change` говорит браузеру заранее подготовить GPU-слой:

```css
.animated-element {
  will-change: transform, opacity;
}
```

**Правила использования:**
- Применяй **незадолго до** анимации и **убирай после**
- НЕ вешай на всё подряд — каждый слой потребляет GPU-память
- Не используй для исправления производительности «на всякий случай»

```tsx
// Правильный паттерн в React
function AnimatedCard() {
  const [animating, setAnimating] = useState(false);

  return (
    <div
      style={{ willChange: animating ? 'transform' : 'auto' }}
      onMouseEnter={() => setAnimating(true)}
      onMouseLeave={() => setAnimating(false)}
    >
      Content
    </div>
  );
}
```

#### content-visibility — пропуск рендеринга вне экрана

`content-visibility: auto` говорит браузеру: «не рендерь содержимое этого элемента, пока он не появится в viewport»:

```css
.list-item {
  content-visibility: auto;
  /* Браузеру нужна оценка высоты — иначе скроллбар будет дёргаться */
  contain-intrinsic-size: 0 200px; /* ширина высота */
}
```

**Эффект:** на странице с 1000+ элементов рендеринг ускоряется в 5-10 раз. Браузер пропускает layout и paint для невидимых элементов.

**Осторожно:** `content-visibility: auto` ломает `scrollIntoView()`, поиск по странице (Ctrl+F) и accessibility-дерево для скрытых элементов. Не применяй на критическом контенте.

#### CSS Containment

```css
.widget {
  contain: layout style paint;
}
```

Говорит браузеру, что изменения внутри `.widget` не влияют на внешний layout. Позволяет браузеру пропускать перерасчёт остальной страницы.

### CSS-переменные (Custom Properties) — продвинутое использование

```css
:root {
  /* Базовый дизайн-токен */
  --color-primary: #3b82f6;
  --color-primary-light: color-mix(in srgb, var(--color-primary), white 20%);
  --color-primary-dark:  color-mix(in srgb, var(--color-primary), black 20%);

  /* Типографика */
  --font-size-base: clamp(1rem, 0.5rem + 1vw, 1.25rem);
  --line-height: 1.5;

  /* Анимации */
  --transition-base: 200ms ease;
}

/* Переопределение в контексте */
.dark-theme {
  --color-primary: #60a5fa;
}

/* Динамика через JavaScript */
/* element.style.setProperty('--mouse-x', e.clientX + 'px'); */
```

`color-mix()` — новая функция в CSS, позволяющая смешивать цвета без препроцессора:

```css
.button {
  background: var(--color-primary);
}
.button:hover {
  background: color-mix(in srgb, var(--color-primary), black 15%);
}
```

### Style Queries (новое)

Style Queries — дополнение к Container Queries, реагирующее на значения CSS-переменных:

```css
@container style(--theme: dark) {
  .card {
    background: #1e293b;
    color: #e2e8f0;
  }
}
```

Позволяет менять стили компонента в зависимости от CSS-переменной родителя, а не только от класса или контекста React.

### Логические свойства (Logical Properties)

Для поддержки RTL (right-to-left) и мультиязычности:

```css
/* ❌ Физические */
.element {
  margin-left: 1rem;
  padding-right: 1rem;
  border-top: 1px solid;
}

/* ✅ Логические */
.element {
  margin-inline-start: 1rem;
  padding-inline-end: 1rem;
  border-block-start: 1px solid;
}
```

| Физическое | Логическое |
|-----------|------------|
| `margin-left` | `margin-inline-start` |
| `margin-right` | `margin-inline-end` |
| `margin-top` | `margin-block-start` |
| `margin-bottom` | `margin-block-end` |
| `text-align: left` | `text-align: start` |
| `width` / `height` | `inline-size` / `block-size` |

### CSS Nesting (нативный)

С 2023-2024 — встроенная вложенность в CSS без препроцессоров:

```css
.card {
  background: white;

  & .title {
    font-size: 1.5rem;
  }

  &:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);

    & .title {
      color: var(--color-primary);
    }
  }

  @media (width >= 768px) {
    padding: 2rem;
  }
}
```

Поддержка браузерами: 90%+. Для продакшена — PostCSS Nesting для старых браузеров.

### Когда что использовать — итоговая матрица Senior

| Задача | Решение |
|--------|---------|
| Быстрый прототип, стартап | Tailwind CSS |
| Enterprise, несколько команд, дизайн-система | Tailwind + конфиг + компоненты ИЛИ Panda CSS |
| Type-safe стили, строгая типизация | Vanilla Extract / Panda CSS |
| Переиспользуемые компоненты в разных контекстах | Container Queries + Style Queries |
| Микросервисный фронтенд (Module Federation) | CSS Modules (изоляция на уровне сборки) |
| RSC + Next.js App Router | Tailwind / CSS Modules / Vanilla Extract / Panda CSS |
| Анимации | CSS Animations + Framer Motion для сложных сценариев |
| RTL / мультиязычность | Logical Properties + `dir="rtl"` |

---

## Связанное

- [[Архитектура React компонентов]] — как стилизация связана с композицией компонентов
- [[Сборщики и инструменты]] — как Vite/webpack обрабатывают CSS, PostCSS, CSS Modules
- [[Браузер и HTTP]] — Critical Rendering Path, reflow/repaint, как CSS влияет на скорость загрузки
- [[React рендеринг и производительность]] — влияние стилизации на рендеринг React
- [[Интернационализация и локализация i18n]] — RTL, Logical Properties в CSS
- [[Feature-sliced design и Atomic Design]] — как организовать стили в масштабе приложения
- [[Виртуализация рендеринга]] — content-visibility и contain-intrinsic-size как CSS-альтернативы
