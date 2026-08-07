---
title: "MVC во фронтенде — истоки"
date: 2026-08-07
tags: [mvc, архитектура, паттерны, история, smalltalk, backbone, angular]
category: concept
parent: [[Архитектурные паттерны]]
---

# MVC во фронтенде — истоки

Почему мы вообще заговорили об архитектуре на клиенте? Чтобы понять Flux и Redux, нужно вернуться к корням — паттерну, которому уже больше 40 лет.

---

## История и мотивация

### Trygve Reenskaug, 1979

MVC (Model-View-Controller) придумал норвежский учёный Трюгве Ринскауг (Trygve Reenskaug), когда работал в Xerox PARC над языком Smalltalk. Он заметил, что код графических приложений превращается в кашу: логика, данные и отображение смешаны так, что изменить одно — значит сломать всё остальное.

**Проблема до MVC:** представьте программу на Visual Basic 1990-х. Нажатие кнопки «Сохранить» вызывает событие `Button1_Click`, которое и валидирует поля, и пишет в базу, и меняет цвет кнопки. Всё в одном обработчике. Это невозможно тестировать, невозможно переиспользовать.

**Идея Ринскауга:** разделить ответственность на три части так, чтобы каждую можно было разрабатывать и тестировать независимо:

```
Пользователь → Controller → Model
                  ↑            ↓
                  ←←←←←←←←←←←←
               View ←←←←←←←←←←
```

- **Model** — данные и бизнес-логика. Не знает ничего о View и Controller.
- **View** — отображение. Наблюдает за Model, перерисовывается при изменениях.
- **Controller** — принимает ввод пользователя, обновляет Model. Не рисует ничего сам.

### Как MVC попал во фронтенд

1. **2004–2006: Ruby on Rails.** Фреймворк сделал MVC мейнстримом в вебе. Но это был серверный MVC: Model = ActiveRecord, View = ERB-шаблоны, Controller = контроллер Rails. Браузер был «глупым» терминалом, который только рендерил HTML.

2. **2010: Backbone.js.** Первый серьёзный фронтенд-фреймворк, который перенёс MVC на клиент. Model = Backbone.Model, View = Backbone.View (одновременно и шаблон, и контроллер), Collections = управление списками моделей.

3. **2012: AngularJS.** Двусторонняя привязка данных (two-way binding) и $scope. Изменил поле ввода → изменилась модель → обновились все привязанные места. Магия, но цена —watchers.

---

## Интуиция: аналогия из реального мира

**Ресторан:**
- **Model (кухня)** — ингредиенты, рецепты, запасы. Кухня не знает, как выглядит зал или кто принимает заказы.
- **View (зал, меню на столе)** — показывает, что можно заказать, и как выглядят блюда.
- **Controller (официант)** — принимает заказ от гостя, передаёт на кухню, приносит готовое блюдо.

Гость не идёт на кухню сам. Кухня не бегает в зал спрашивать, что готовить. Официант — единственный канал связи.

---

## Классический MVC на чистом JavaScript

Напишем MVC-приложение «Счётчик» с нуля, чтобы увидеть каждый слой:

```javascript
// ============================================================
// MODEL — данные и бизнес-логика
// Ничего не знает о DOM, событиях, контроллере
// ============================================================
class CounterModel {
  constructor(initialValue = 0) {
    this._value = initialValue;          // приватное состояние
    this._listeners = [];                // список подписчиков (View)
  }

  get value() {
    return this._value;                  // геттер — только чтение
  }

  // Единственный способ изменить модель — через этот метод
  increment() {
    this._value += 1;                    // мутируем состояние
    this._notify();                      // оповещаем всех подписчиков
  }

  decrement() {
    this._value -= 1;
    this._notify();
  }

  // Observer: подписка на изменения
  subscribe(listener) {
    this._listeners.push(listener);      // добавляем View в список
  }

  _notify() {
    // Вызываем всех подписчиков — они сами перерисуются
    this._listeners.forEach(fn => fn(this._value));
  }
}

// ============================================================
// VIEW — отображение и DOM
// Читает из Model, обновляет DOM. Не меняет Model напрямую
// ============================================================
class CounterView {
  constructor(model, element) {
    this.model = model;                  // ссылка на модель (только чтение!)
    this.element = element;              // DOM-элемент, куда рендерим

    // Подписываемся на изменения модели
    this.model.subscribe(value => this.render(value));

    // Первый рендер
    this.render(this.model.value);
  }

  render(value) {
    // ВСЁ отображение — здесь. Контроллер не трогает DOM
    this.element.querySelector('.counter-value').textContent = value;
  }

  // Метод для привязки событий (вызывается контроллером)
  bindIncrement(handler) {
    this.element.querySelector('.btn-inc')
      .addEventListener('click', handler);
  }

  bindDecrement(handler) {
    this.element.querySelector('.btn-dec')
      .addEventListener('click', handler);
  }
}

// ============================================================
// CONTROLLER — обработка пользовательского ввода
// Принимает события от View, вызывает методы Model
// ============================================================
class CounterController {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    // Связываем события View с методами Model
    // Контроллер — единственный, кто «знает» и View, и Model
    this.view.bindIncrement(() => this.model.increment());
    this.view.bindDecrement(() => this.model.decrement());
  }
}

// ============================================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================================
const counterModel = new CounterModel(0);
const counterView = new CounterView(counterModel, document.getElementById('app'));
const counterController = new CounterController(counterModel, counterView);
// Всё. Приложение работает. Каждый слой можно тестировать отдельно.
```

**Разбор по строкам:**
- `this._value` с подчёркиванием — соглашение: «это приватное, не трогай снаружи».
- `this._listeners` — классический Observer внутри Model. View подписывается на изменения.
- `subscribe()` / `_notify()` — Model уведомляет View, но не знает, ЧТО это за View (может быть DOM, может Canvas, может тест).
- Контроллер — самая тонкая часть: только клей между View и Model.

---

## Под капотом: как это работает в Backbone.js

Backbone.js (2010) — первый фронтенд-фреймворк, который массово использовал MVC на клиенте:

```javascript
// Backbone.Model — события через .on()/.trigger()
const User = Backbone.Model.extend({
  defaults: { name: '', age: 0 },
  validate(attrs) {
    if (!attrs.name) return 'Имя обязательно';  // валидация в модели
  }
});

// Backbone.View — и шаблон, и контроллер (нарушение чистого MVC!)
const UserView = Backbone.View.extend({
  el: '#user-form',                        // привязка к DOM

  events: {
    'click .save': 'onSave',               // события прямо во View!
    'input .name': 'onNameChange'
  },

  initialize() {
    // View подписывается на изменения Model
    this.listenTo(this.model, 'change', this.render);
  },

  render() {
    this.$('.name').val(this.model.get('name'));
    return this;
  },

  onSave() {
    this.model.set('name', this.$('.name').val()); // View меняет Model
    this.model.save();                               // Model шлёт на сервер
  }
});
```

**Нарушение чистого MVC в Backbone:**
- View обрабатывает события (`events: {}`) — это работа Controller.
- View напрямую вызывает `model.set()` — минуя Controller.
- Поэтому Backbone чаще называют MV* (звёздочка), а не чистым MVC.

---

## Почему MVC ломается в большом фронтенде

### Проблема 1: N×M связей

В классическом MVC одна Model может иметь много View. Одна View может слушать много Model. При 50+ компонентах получается граф, в котором невозможно отследить поток данных:

```
ModelA ←→ View1 ←→ ModelB
  ↕         ↕         ↕
View2  ←→ ModelC  ←→ View3
  ↕                    ↕
ModelD ←←←←←←←←←← ModelE
```

**Реальный баг из Facebook (2013):** непрочитанные сообщения. У вас 3 непрочитанных. Вы читаете одно. Счётчик показывает 2. Но через секунду снова 3, потому что другая View перезаписала Model старым значением из своего кэша. Двусторонние связи создают гонки данных.

### Проблема 2: Каскадные обновления

```javascript
// Model A меняется → View 1 перерисовывается → View 1 меняет Model B
// → View 2 перерисовывается → View 2 меняет Model A → бесконечный цикл
```

AngularJS «защищался» от этого через `$digest` — проходил все watchers несколько раз, пока значения не стабилизируются. Если после 10 проходов всё ещё меняется — ошибка `$digest() iterations reached`.

### Проблема 3: Неявные зависимости

```javascript
// Компонент где-то глубоко в дереве делает:
this.model.set('user.name', 'Alice');
// Кто ещё подписан на 'user.name'? Сюрприз!
```

---

## Когда ИСПОЛЬЗОВАТЬ vs НЕ использовать

### ✅ Используйте MVC когда:

- **Серверный рендеринг** (Rails, Django, Laravel, Spring). На сервере один запрос — один ответ. Нет проблемы «50 компонентов в реальном времени».
- **Маленькое SPA без сложного состояния.** Если у вас 3-5 экранов и минимум общего состояния, MVC (через Backbone-style или самописный) проще, чем тащить Redux.
- **Игры на Canvas.** Model — игровая логика, View — отрисовка на Canvas, Controller — ввод с клавиатуры. Классический MVC здесь идеален.

### ❌ НЕ используйте когда:

- **Большое SPA с глубокой вложенностью компонентов.** Используйте Flux/Redux/Zustand с однонаправленным потоком.
- **Много перекрёстных зависимостей.** Одна модель меняет другую → хаос.
- **Нужна предсказуемость** (time-travel debugging, undo/redo). Двусторонние связи делают отладку кошмаром — вы не знаете, КТО изменил состояние.

---

## Как MVC проявляется в React

React сам по себе — это V в MVC. Но вот как части MVC проявляются в React-экосистеме:

| Часть MVC | Что это в React |
|-----------|-----------------|
| **Model** | useState, useReducer, Zustand store, Context value |
| **View** | JSX, React-компоненты (чистая функция от пропсов и стейта) |
| **Controller** | Обработчики событий (`onClick`, `onChange`), кастомные хуки |

```jsx
// «MVC в одном компоненте» (для простых случаев — ок)
function Counter() {
  // Model
  const [count, setCount] = useState(0);

  // Controller (обработчик)
  const increment = () => setCount(c => c + 1);

  // View
  return <button onClick={increment}>{count}</button>;
}
```

### AngularJS-style two-way binding в React

React избегает двустороннего связывания, но можно эмулировать:

```jsx
// ❌ Имитация two-way binding (обычно плохая идея)
function Form() {
  const [name, setName] = useState('');
  return (
    <input
      value={name}                    // Model → View
      onChange={e => setName(e.target.value)} // View → Model
    />
  );
}
```

В React это controlled component — и это ОДНОнаправленный поток, просто разбитый на две строчки. Настоящий two-way binding — когда изменение в DOM автоматически меняет переменную без явного обработчика.

---

## Антипаттерны и современные альтернативы

### Антипаттерн 1: God Model (Божественная модель)

```javascript
// ❌ Одна модель на всё приложение
class AppModel {
  users = [];
  currentUser = null;
  cart = [];
  filters = {};
  theme = 'light';
  notifications = [];
  // ... 50 других полей
}
```

**Почему плохо:** изменение `cart` вызывает перерисовку ВСЕХ подписчиков, включая те, что следят за `theme`.

**Альтернатива:** слайсы (Zustand slices, Redux Toolkit slices) — разделяйте состояние по доменам.

### Антипаттерн 2: View, который меняет Model другой View

```javascript
// ❌ View A вызывает modelB.set() потому что «ну type="hidden" же»
```

**Альтернатива:** однонаправленный поток (Flux) — View только диспатчит Action.

### Антипаттерн 3: Controller на 5000 строк

Когда в контроллер сваливают и валидацию, и форматирование, и запросы к API.

**Альтернатива:** кастомные хуки + сервисный слой.

---

## Эволюция от MVC к современному стеку

```
1979 ─ MVC (Smalltalk)
  │
2004 ─ Server-side MVC (Rails, Django)
  │
2010 ─ Client-side MV* (Backbone, Knockout)
  │
2012 ─ Two-way binding (AngularJS) ── проблема: $digest, watchers
  │
2014 ─ Flux (Facebook) ── однонаправленный поток
  │
2015 ─ Redux ── единый Store, чистые редьюсеры
  │
2020+ ─ Zustand / TanStack Query ── серверное vs клиентское состояние
```

---

## Связанное

- [[Flux и Redux — эволюция управления состоянием]] — что пришло на смену MVC
- [[Observer и PubSub паттерны]] — Observer внутри Model
- [[Архитектура React компонентов]] — Composition over MVC
- [[Управление состоянием]] — современный подход: TanStack Query + Zustand
- [[Event Loop макротаски микротаски]] — $digest и асинхронность в AngularJS
