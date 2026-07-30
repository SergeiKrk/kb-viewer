---
title: "HTML и Accessibility (a11y)"
date: 2026-07-19
tags: [html, accessibility, a11y, aria, wcag, семантика, screen-reader, клавиатура, контраст, accessibility-tree]
category: concept
source_count: 0
---

# HTML и Accessibility (a11y)

Доступность — это не «фича для незрячих», а базовая характеристика качественного веба. ~15% населения имеют ту или иную форму инвалидности, и почти каждый временно оказывается в контексте ограниченных возможностей (сломанная мышь, яркое солнце, шумное окружение).

---

## 🧒 Уровень 1: Объясни ребёнку (10 лет)

Представь, что ты строишь дом из LEGO. У тебя есть кубики разной формы:

- **Красный длинный** — это крыша
- **Синий квадратный** — это стена
- **Жёлтый маленький** — это окно
- **Зелёный плоский** — это дверь

Если ты построишь дом из одинаковых серых кубиков, никто не поймёт, где дверь, а где окно. Даже ты сам через неделю запутаешься!

**HTML-теги — это как цветные кубики LEGO.** Когда ты используешь `<nav>` — ты говоришь браузеру: «Это меню, здесь ссылки для навигации». Когда `<button>` — «Это кнопка, на неё можно нажать». Когда `<main>` — «Это самое важное на странице».

**А теперь представь, что твой друг не видит.** Он «смотрит» сайт не глазами, а ушами — специальная программа читает ему всё вслух. Если сайт собран из серых кубиков (`<div>`), программа не знает, что важно, а что нет. Она просто говорит: «блок, блок, блок, блок». Скучно и непонятно!

**Но если использовать правильные теги**, программа говорит: «Заголовок: Новости спорта. Кнопка: Подписаться. Ссылка: Контакты». Так сайт становится понятным для всех.

**Главное правило:** всегда выбирай правильный «кубик» (тег), а не лепи всё из серого `<div>`.

---

## 🟢 Уровень 2: Junior-разработчик

На этом уровне ты должен знать базовые правила и применять их в повседневной вёрстке.

### Семантический HTML — фундамент доступности

Каждый тег имеет встроенную **роль** (role), которую понимают скринридеры и браузеры:

| Тег | Роль | Когда использовать |
|---|---|---|
| `<header>` | `banner` | Шапка сайта |
| `<nav>` | `navigation` | Навигационное меню |
| `<main>` | `main` | Основной контент (только один на странице!) |
| `<section>` | `region` | Тематическая секция с заголовком |
| `<article>` | `article` | Самодостаточный контент (пост, карточка) |
| `<aside>` | `complementary` | Боковая панель, дополнительная информация |
| `<footer>` | `contentinfo` | Подвал сайта |
| `<h1>`–`<h6>` | `heading` | Заголовки с уровнем |
| `<button>` | `button` | Кнопка действия |
| `<a>` | `link` | Ссылка для перехода |

```html
<!-- ❌ Див-суп: скринридер не понимает структуру -->
<div class="header">
  <div class="nav">
    <div class="link" onclick="...">Главная</div>
  </div>
</div>
<div class="content">...</div>

<!-- ✅ Семантически: скринридер озвучит роли -->
<header>
  <nav aria-label="Главное меню">
    <a href="/">Главная</a>
  </nav>
</header>
<main>
  <article>
    <h1>Заголовок статьи</h1>
    <p>Содержание...</p>
  </article>
</main>
```

### Заголовки: иерархия h1–h6

Правильная структура заголовков — это **оглавление** для скринридера:

```html
<!-- ❌ Пропуск уровней -->
<h1>Мой сайт</h1>
<h3>Раздел</h3>      <!-- где h2? -->
<h5>Подраздел</h5>    <!-- где h4? -->

<!-- ✅ Правильная иерархия -->
<h1>Мой сайт</h1>
  <h2>Раздел 1</h2>
    <h3>Подраздел 1.1</h3>
    <h3>Подраздел 1.2</h3>
  <h2>Раздел 2</h2>
    <h3>Подраздел 2.1</h3>
```

Скринридеры позволяют навигировать по заголовкам — пользователь нажимает клавишу `H` и прыгает между ними. Это как содержание книги.

### Доступность форм

```html
<!-- ❌ Placeholder вместо label -->
<input type="email" placeholder="Введите email">

<!-- ✅ Явная связь label-input -->
<label for="email">Ваш email</label>
<input type="email" id="email" name="email">

<!-- ✅ Оборачивание label (работает без for/id) -->
<label>
  <input type="checkbox"> Я согласен с условиями
</label>

<!-- ✅ Группировка с fieldset/legend -->
<fieldset>
  <legend>Способ оплаты</legend>
  <label><input type="radio" name="payment" value="card"> Карта</label>
  <label><input type="radio" name="payment" value="cash"> Наличные</label>
</fieldset>
```

### Изображения: alt-текст

```html
<!-- Содержательное изображение — описываем -->
<img src="chart.png" alt="Рост продаж на 25% в третьем квартале 2026">

<!-- Декоративное (иконка, разделитель) — пустой alt -->
<img src="decorative-wave.svg" alt="">

<!-- Сложная инфографика — краткий alt + ссылка на описание -->
<img src="infographic.png" alt="Схема архитектуры приложения" aria-describedby="desc">
<p id="desc">Подробное описание: микросервисная архитектура из 5 сервисов...</p>
```

### Базовое ARIA

**Первое правило ARIA (First Rule of ARIA):** Если можно использовать нативный HTML-элемент со встроенной семантикой — **НЕ используй ARIA**. Нативный `<button>` всегда лучше, чем `<div role="button">`.

```html
<!-- ❌ Не делай так -->
<div role="button" tabindex="0" onclick="...">Нажми меня</div>

<!-- ✅ Делай так -->
<button type="button">Нажми меня</button>
```

Когда ARIA оправдано: кастомные виджеты, которых нет в HTML (вкладки/tabs, древовидные списки/tree, живые регионы).

---

## 🟡 Уровень 3: Middle-разработчик

На Middle ты понимаешь, КАК это работает под капотом, и можешь осознанно выбирать инструменты.

### Accessibility Tree

Браузер строит **Accessibility Tree** параллельно с DOM. Это упрощённая версия DOM, содержащая только семантическую информацию:

> **Как читать Accessibility Tree:** DOM — это что видит браузер (все `<div>`, `<span>`, атрибуты). Accessibility Tree — это что «слышит» скринридер (только смысл: «заголовок», «кнопка», «ссылка»). Визуальный мусор вроде `<div>`-обёрток исчезает, остаётся чистая структура страницы.

```
DOM Tree                    Accessibility Tree
─────────                   ──────────────────
<html>                      WebArea
  <body>                      └── banner (header)
    <header>                       ├── navigation (nav)
      <nav>                        │     ├── link "Главная"
        <a>Главная</a>             │     └── link "О нас"
        <a>О нас</a>               └── main
      </nav>                            ├── heading "Мой сайт" (h1)
    </header>                           ├── article
    <main>                              │     ├── heading "Статья" (h2)
      <h1>Мой сайт</h1>                 │     └── paragraph "..."
      <article>                         └── button "Подписаться"
        <h2>Статья</h2>
        <p>Текст...</p>
      </article>
    </main>
    <button>Подписаться</button>
```

Важные моменты:
- `display: none` и `visibility: hidden` убирают элемент из Accessibility Tree
- `aria-hidden="true"` убирает элемент ТОЛЬКО из Accessibility Tree (остаётся видимым зрячим)
- CSS `content` (псевдоэлементы) **попадает** в Accessibility Tree — осторожно с `::before` на интерактивных элементах
- Порядок в Accessibility Tree определяется DOM-порядком, а не визуальным (flexbox `order`, `position: absolute` не меняют его)

### ARIA: роли, свойства, состояния

ARIA — это контракт между разработчиком и скринридером. Ты обещаешь определённое поведение через роли и свойства.

#### Роли (roles) — «что это такое»

```html
<!-- Виджет-роли: интерактивные элементы -->
<div role="tablist">
  <button role="tab" aria-selected="true">Первая</button>
  <button role="tab" aria-selected="false">Вторая</button>
</div>
<div role="tabpanel">Содержимое первой вкладки</div>

<!-- Структурные роли -->
<div role="alert">Важно! Ошибка сохранения.</div>
<div role="status">Загрузка завершена.</div>
<div role="dialog" aria-modal="true" aria-labelledby="dlg-title">
  <h2 id="dlg-title">Подтверждение</h2>
</div>
```

#### Свойства (properties) — «какой он»

- `aria-label="Закрыть меню"` — текст для скринридера (переопределяет видимый текст)
- `aria-labelledby="id1 id2"` — ссылается на другие элементы как на заголовок
- `aria-describedby="error-msg"` — связывает с описанием/подсказкой
- `aria-controls="panel1"` — указывает, чем управляет элемент

#### Состояния (states) — «что с ним сейчас»

- `aria-expanded="true/false"` — раскрыто/свёрнуто
- `aria-selected="true/false"` — выбрано
- `aria-disabled="true"` — заблокировано
- `aria-hidden="true"` — скрыто от screen reader
- `aria-current="page"` — текущая страница в навигации

```html
<!-- Аккордеон с ARIA -->
<button
  aria-expanded="false"
  aria-controls="faq-1"
  id="faq-btn-1"
>
  Как мне вернуть деньги?
</button>
<div
  role="region"
  id="faq-1"
  aria-labelledby="faq-btn-1"
  hidden
>
  Откройте раздел «Мои заказы» и нажмите «Возврат».
</div>
```

### ARIA Live Regions

**Живые регионы** (live regions) сообщают скринридеру об изменениях в DOM без фокуса:

> **Как читать `aria-live="polite" aria-atomic="true"`:** «скринридер, когда в этом блоке что-то изменится — вежливо дождись паузы в речи и прочитай ВЕСЬ блок целиком, а не только изменившийся кусочек». `polite` = «не перебивай», `assertive` = «перебей и прочитай немедленно», `atomic` = «читай блок как единое целое».

```html
<!-- aria-live="polite" — объявит, когда пользователь закончит текущее действие -->
<div aria-live="polite" aria-atomic="true">
  <!-- Динамически обновляется через JS -->
  Найдено: <span id="search-count">0</span> результатов
</div>

<!-- aria-live="assertive" — прервёт текущую речь и объявит немедленно -->
<div aria-live="assertive" role="alert">
  <!-- Сообщения об ошибках -->
</div>

<!-- role="alert" — эквивалент aria-live="assertive" + aria-atomic="true" -->
<div role="alert">Форма не отправлена: проверьте email.</div>
```

Правила live regions:
- **Элемент ДОЛЖЕН быть в DOM при загрузке** (пустым), иначе не работает
- `aria-atomic="true"` — читать весь регион целиком (не только изменившуюся часть)
- `aria-relevant="additions removals"` — что именно отслеживать
- **Не злоупотребляй** `assertive` — это как кричать на пользователя

### Клавиатурная навигация

Веб должен быть полностью управляем с клавиатуры: `Tab`, `Shift+Tab`, `Enter`, `Space`, стрелки.

#### Skip Links (пропускные ссылки)

Первая интерактивная ссылка на странице — «перейти к содержимому»:

```html
<!-- В самом начале body, ДО хедера -->
<a href="#main-content" class="skip-link">
  Перейти к содержимому
</a>

<style>
.skip-link {
  position: absolute;
  top: -100%;
  left: 0;
  background: #000;
  color: #fff;
  padding: 8px 16px;
  z-index: 10000;
}
.skip-link:focus {
  top: 0;
}
</style>

<header>...</header>
<main id="main-content">...</main>
```

#### Tabindex

```html
<!-- tabindex="0" — добавить в порядок табуляции (порядок = DOM-порядок) -->
<div tabindex="0" role="button">Кликни меня</div>

<!-- tabindex="-1" — убрать из табуляции, но можно фокусировать через JS -->
<div tabindex="-1" id="modal-content">...</div>
<script>
  document.getElementById('modal-content').focus(); // программный фокус
</script>

<!-- ❌ tabindex > 0 — НИКОГДА. Ломает естественный порядок табуляции -->
<div tabindex="3">Сначала я</div>
<div tabindex="1">Нет, я!</div>
```

#### Focus Management

После действий важно управлять фокусом:
- Открытие модалки → фокус на первом интерактивном элементе
- Закрытие модалки → фокус обратно на кнопку, которая её открыла
- SPA-навигация → переместить фокус на `<h1>` новой страницы или в `<main>`
- Удаление элемента → фокус на предыдущий/следующий логичный элемент

```javascript
// Пример: фокус-менеджмент для модального окна
function openModal() {
  modal.showModal();
  const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  firstFocusable?.focus();
  // Ловушка фокуса внутри модалки — использовать inert или focus-trap библиотеку
}

function closeModal() {
  modal.close();
  // Возвращаем фокус на кнопку-триггер
  triggerButton.focus();
}
```

### Цветовой контраст (WCAG)

| Уровень | Обычный текст | Крупный текст (18px+ жирный / 24px+) |
|---|---|---|
| **AA** (минимум) | 4.5:1 | 3:1 |
| **AAA** (улучшенный) | 7:1 | 4.5:1 |

**Инструменты:**
- Chrome DevTools → Elements → Styles → клик на цвет → калькулятор контраста
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Axe DevTools — автоматическая проверка в DevTools
- Плагин Stark для Figma — проверка на этапе дизайна

```css
/* ❌ Серый текст на белом — нечитаемый */
.error { color: #ccc; background: #fff; } /* контраст 1.6:1 */

/* ✅ Тёмно-красный — контраст 4.6:1 (проходит AA) */
.error { color: #d32f2f; background: #fff; }
```

**Важно:** цвет НЕ должен быть единственным способом передачи информации:

```html
<!-- ❌ Только цвет — незрячий не поймёт -->
<span class="error">Ошибка</span>
<span class="success">Успешно</span>

<!-- ✅ Цвет + иконка + текст -->
<span class="error" role="alert">
  <span aria-hidden="true">❌</span> Ошибка: неверный пароль
</span>
<span class="success">
  <span aria-hidden="true">✅</span> Успешно: данные сохранены
</span>
```

### Тестирование доступности

#### Автоматическое (ловит ~30% проблем)

```bash
# Axe-core в браузере (Chrome DevTools → Lighthouse → Accessibility)
# Axe DevTools — плагин для Chrome/Firefox

# jest-axe для unit-тестов
npm install --save-dev jest-axe
```

```typescript
// jest-axe в React-тестах
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

it('форма логина не имеет a11y-нарушений', async () => {
  const { container } = render(<LoginForm />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

```bash
# Lighthouse CI — встроить в пайплайн
npx lighthouse https://mysite.com --only-categories=accessibility
```

#### Ручное тестирование (обязательно!)

1. **Клавиатура:** отключи мышь. Пройди весь флоу с `Tab`/`Shift+Tab`/`Enter`/`Space`. Виден ли фокус? Не застревает ли? Логичен ли порядок?
2. **Скринридер:**
   - **macOS:** VoiceOver (встроен, `Cmd+F5`)
   - **Windows:** NVDA (бесплатно), JAWS (платно)
   - **Linux:** Orca
3. **Увеличение:** приблизь страницу до 200% — ничего не ломается?
4. **Цвета:** включи эмуляцию цветовой слепоты в DevTools (Rendering → Emulate vision deficiencies)
5. **Семантика:** инспектируй Accessibility Tree в DevTools (Elements → Accessibility)

---

## 🔴 Уровень 4: Senior-разработчик

На Senior ты проектируешь систему доступности, выстраиваешь процессы и обучаешь команду.

### WCAG 2.1/2.2 — полный обзор

WCAG построен на 4 принципах **POUR**:

| Принцип | Значение | Примеры критериев |
|---|---|---|
| **P**erceivable (Воспринимаемость) | Информация должна быть доступна органам чувств | Альтернативный текст (1.1.1), субтитры (1.2.2), контраст (1.4.3) |
| **O**perable (Управляемость) | Интерфейсом можно управлять | Клавиатура (2.1.1), достаточно времени (2.2.1), нет мигания >3 раз/сек (2.3.1) |
| **U**nderstandable (Понятность) | Информация и интерфейс понятны | Язык страницы (3.1.1), предсказуемость (3.2), помощь при ошибках (3.3) |
| **R**obust (Надёжность) | Контент интерпретируется разными agent'ами | Валидный HTML (4.1.1), правильные name/role/value (4.1.2) |

**Уровни соответствия:**

- **A** (минимальный) — базовые требования. Невыполнение = барьер для некоторых пользователей. Пример: у изображений есть alt.
- **AA** (средний) — индустриальный стандарт. Большинство законов требуют AA. Пример: контраст 4.5:1, видимый фокус.
- **AAA** (максимальный) — не всегда достижим для всего контента. Пример: контраст 7:1, язык жестов для видео.

**Что нового в WCAG 2.2 (октябрь 2023):**
- **2.4.11 Focus Not Obscured (AA):** фокус не должен быть скрыт другим контентом (sticky header!)
- **2.5.7 Dragging Movements (AA):** альтернатива жесту перетаскивания
- **2.5.8 Target Size (AA):** размер цели ≥ 24×24px
- **3.2.6 Consistent Help (A):** помощь (чат, телефон) в одном месте на всех страницах
- **3.3.7 Accessible Authentication (A):** без CAPTCHA и когнитивных тестов

### Проектирование дизайн-системы с a11y

Доступность закладывается на уровне дизайн-токенов и компонентов:

```typescript
// Дизайн-токены с гарантированным контрастом
const colors = {
  text: {
    primary: '#1a1a1a',    // на белом: контраст ~16:1 (AAA)
    secondary: '#595959',  // на белом: контраст ~5.2:1 (AA)
    disabled: '#949494',   // использовать ТОЛЬКО с aria-disabled
  },
  interactive: {
    focus: '#0066CC',      // видимый outline 3px
  },
};

// Компонент кнопки с полным a11y
interface ButtonProps {
  children: React.ReactNode;
  isLoading?: boolean;
  'aria-label'?: string;
  // ...
}

function Button({ children, isLoading, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      aria-busy={isLoading}
      aria-disabled={isLoading || props.disabled}
    >
      {isLoading && (
        <span role="status" aria-label="Загрузка">
          <Spinner aria-hidden="true" />
        </span>
      )}
      <span aria-hidden={isLoading}>{children}</span>
    </button>
  );
}
```

### Сложные виджеты: паттерны ARIA Authoring Practices

WAI-ARIA Authoring Practices Guide (APG) — это проверенные паттерны для сложных виджетов: tabs, accordion, combobox, tree, grid, dialog.

```html
<!-- Пример: autocomplete/combobox по паттерну APG -->
<label for="city-input">Город</label>
```

> **Как читать ARIA-атрибуты combobox (расшифровка каждого):**  
> `role="combobox"` — «я — выпадающий список с автодополнением».  
> `aria-expanded="true"` — «список сейчас раскрыт».  
> `aria-controls="city-listbox"` — «я управляю элементом с id `city-listbox`».  
> `aria-activedescendant="city-2"` — «сейчас подсвечен вариант с id `city-2`».  
> `aria-autocomplete="list"` — «я предлагаю варианты из выпадающего списка».  
> `aria-haspopup="listbox"` — «при активации появится список для выбора».  
> Каждый атрибут — это предложение, которое ты говоришь скринридеру.

```html
<input
  type="text"
  id="city-input"
  role="combobox"
  aria-expanded="true"
  aria-controls="city-listbox"
  aria-activedescendant="city-2"
  aria-autocomplete="list"
  aria-haspopup="listbox"
>
<ul id="city-listbox" role="listbox" aria-label="Города">
  <li role="option" id="city-1">Москва</li>
  <li role="option" id="city-2" aria-selected="true">Минск</li>
  <li role="option" id="city-3">Киев</li>
</ul>
```

**Ключевые паттерны (изучи обязательно):**
- Disclosure (аккордеон)
- Tabs с ручным/автоматическим переключением
- Modal Dialog с ловушкой фокуса
- Grid с навигацией стрелками
- Tree View с вложенностью и expand/collapse

### Интеграция в CI/CD

```yaml
# Пример: GitHub Actions
name: Accessibility Checks
on: [pull_request]

jobs:
  axe:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install
        run: npm ci
      - name: Run axe (unit)
        run: npx jest --testPathPattern="a11y"
      - name: Lighthouse CI
        run: |
          npx lhci autorun --config=.lighthouserc.js
```

```javascript
// .lighthouserc.js
module.exports = {
  ci: {
    assert: {
      preset: 'lighthouse:no-pwa',
      assertions: {
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'color-contrast': 'error',
      },
    },
  },
};
```

### Процесс в команде

Как Senior ты выстраиваешь культуру:

1. **Definition of Done включает a11y:** у каждого компонента в Storybook есть вкладка Accessibility (addon-a11y).
2. **Линтинг на этапе написания кода:** `eslint-plugin-jsx-a11y` ловит отсутствие label, alt, неправильные роли:

```javascript
// .eslintrc.js
module.exports = {
  extends: ['plugin:jsx-a11y/recommended'],
  rules: {
    'jsx-a11y/anchor-is-valid': 'error',
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/label-has-associated-control': 'error',
    'jsx-a11y/no-autofocus': 'warn',
    'jsx-a11y/tabindex-no-positive': 'error',
  },
};
```

3. **A11y-роудмап:** не пытайся исправить всё сразу. Приоритизируй:
   - Блокирующие проблемы (невозможно использовать клавиатуру)
   - Критический пользовательский путь (логин, покупка, поиск)
   - Второстепенные страницы
4. **Обучение:** проведи воркшоп по скринридерам. Разработчики должны хотя бы раз пройти свой сайт с выключенным экраном и VoiceOver/NVDA.

### Серверный рендеринг и a11y

При SSR/SSG важно:
- Заголовки корректно отрендерены на сервере (скринридер парсит HTML до гидрации)
- Skip-link видна без JavaScript
- `<html lang="ru">` установлен на сервере
- Мета-теги `<title>` уникальны для каждой страницы

### Инструменты аудита (сравнение)

| Инструмент | Тип | Что находит | Точность |
|---|---|---|---|
| **axe-core** | Автоматический | ~30-50% проблем | Высокая (мало ложных срабатываний) |
| **Lighthouse** | Автоматический | ~30% + best practices | Средняя |
| **WAVE** | Автоматический + визуальный | Контраст, структура, ARIA | Высокая |
| **Ручное тестирование** | — | ~70-80% проблем | Зависит от экспертизы |
| **Юзер-тесты с людьми** | — | UX-проблемы, неудобство | Максимальная |

**Главный вывод:** автоматика — необходимый минимум, но никогда не достаточна. Только реальный пользователь скринридера скажет, удобно это или нет.

---

## Связанное
- [[Браузер и HTTP]] — Critical Rendering Path, как браузер строит DOM (основа для понимания Accessibility Tree)
- [[Тестирование React]] — jest-axe, интеграция a11y-тестов в юнит/интеграционные тесты
- [[Безопасность фронтенда]] — XSS через innerHTML и безопасная работа с пользовательским вводом (пересекается с a11y)
- [[Web API]] — ARIA, Accessibility Object Model (AOM)
- [[Сборщики и инструменты]] — ESLint, плагины для a11y-линтинга
