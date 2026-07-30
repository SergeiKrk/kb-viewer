# Создание tailored резюме на HH.ru

_Оптимизированный процесс на основе реального опыта (2026-06-04)_

## Цель

Создание резюме, оптимизированного под конкретную вакансию, с уникальным заголовком, навыками и описанием опыта работы.

## Уровни опыта

См. [[Jobs/Experience Levels]] для分类 вакансий по уровням:
- **Junior** (0-1 год): Resume v0
- **Middle** (1-3 года): Resume v1
- **Middle+** (3-6 лет): Resume v2
- **Senior** (6+ лет): Resume v3
- **Lead/Principal** (10+ лет): Resume v4

## Предусловия

- Авторизован на hh.ru
- Есть `[[Jobs/Tailored Resumes — Middle Tier]]` с параметрами для каждого резюме
- Знаем ID вакансии и ключевые требования
- Определили уровень вакансии (см. [[Jobs/Experience Levels]])

## Алгоритм (3 этапа)

### Этап 1: Создание резюме через wizard

**URL:** `https://hh.ru/applicant/resumes/new`

1. Открыть страницу создания резюме
2. Дождаться загрузки (3 сек)
3. Удалить modal overlays: `document.querySelectorAll('[data-qa="modal-overlay"]').forEach(el => el.remove())`
4. Нажать **"Укажу профессию"** (div с текстом "Укажу профессию")
5. Дождаться перехода на страницу выбора профессии (3 сек)
6. Ввести **"Программист"** в поле `[data-qa="resume-profile-position-input"]` (по одному символу, delay 100ms)
7. Дождаться появления suggestions (2 сек)
8. Кликнуть по **"Программист 1С"** (`[data-qa="suggest-item-cell"]` с текстом "Программист 1С")
9. Нажать **"Сохранить и продолжить"** (`[data-qa="resume-profile-next-screen"]`)
10. **Скопировать resume ID** из URL: `https://hh.ru/profile/resume/common?resume={RESUME_ID}`

**Важно:** Радиокнопки профессий НЕ работают через UI (перехватываются overlay). Используем suggestions через input.

### Этап 2: Обновление данных через API

**Endpoint:** `POST https://hh.ru/applicant/resume/edit?resume={RESUME_ID}&hhtmSource=resume_partial_edit`

**Headers:**
```
accept: application/json
content-type: application/json
x-requested-with: XMLHttpRequest
x-xsrftoken: {из cookie _xsrf}
x-hhtmfrom: resume
x-hhtmsource: resume_partial_edit
```

**Body (все поля сразу):**
```json
{
  "title": [{ "string": "Заголовок из Tailored Resumes" }],
  "salary": [{ "amount": 150000, "currency": "RUR" }],
  "professionalRole": [{ "string": 96 }],
  "travelTime": [{ "string": "any" }],
  "businessTripReadiness": [{ "string": "never" }],
  "workFormats": [{ "string": "REMOTE" }],
  "employmentForms": [{ "string": "FULL" }],
  "keySkills": [
    { "string": "Навык1" },
    { "string": "Навык2" }
  ],
  "advancedKeySkills": [
    { "name": "Навык1", "general": true },
    { "name": "Навык2", "general": false }
  ],
  "experience": [
    {
      "companyName": "Название компании",
      "position": "Должность",
      "startDate": "2025-03-01",
      "endDate": "2026-06-01",
      "description": "Описание опыта работы"
    }
  ]
}
```

**Критически важно:**
- `workFormats` — УСТАНАВЛИВАТЬ ЧЕРЕЗ API! UI dropdown НЕ обновляет React state
- `advancedKeySkills` — required для сохранения навыков с уровнями
- `experience` — **НЕ ИСПОЛЬЗОВАТЬ ДЛЯ TAILORED-РЕЗЮМЕ!** Опыт работы — **общий для всех резюме**. Любое добавление, удаление или изменение description/position/company в одном резюме немедленно отражается во ВСЕХ остальных резюме. Нельзя иметь разные описания одного места работы для разных резюме. При создании tailored-резюме меняем ТОЛЬКО: title, salary, keySkills, workFormats, employmentForms. Описания опыта редактируются только вручную через UI и применяются глобально.

### Этап 3: Публикация через wizard

**URL:** `https://hh.ru/profile/resume?resume={RESUME_ID}&hhtmFrom=my_resumes`

1. Открыть URL публикации
2. Пропустить все шаги wizard:
   ```javascript
   for (let i = 0; i < 5; i++) {
     // Удалить overlays
     document.querySelectorAll('[data-qa="modal-overlay"]').forEach(el => el.remove());
     // Нажать "Сохранить и продолжить"
     document.querySelector('[data-qa="resume-profile-next-screen"]')?.click();
     await new Promise(r => setTimeout(r, 3000));
   }
   ```
3. Проверить URL: `?published=true` = успех

## Шаблон скрипта (единый вызов)

```javascript
// Этап 1: Создание
await page.goto('https://hh.ru/applicant/resumes/new');
await page.waitForTimeout(3000);
await page.evaluate(() => {
  document.querySelectorAll('[data-qa="modal-overlay"]').forEach(el => el.remove());
  const el = [...document.querySelectorAll('div, span')].find(e => e.textContent?.trim() === 'Укажу профессию');
  if (el) el.click();
});
await page.waitForTimeout(3000);
const input = page.locator('[data-qa="resume-profile-position-input"]');
await input.click({ force: true });
for (const char of 'Программист') await input.type(char, { delay: 100 });
await page.waitForTimeout(2000);
await page.evaluate(() => {
  [...document.querySelectorAll('[data-qa="suggest-item-cell"]')]
    .find(e => e.textContent?.trim() === 'Программист 1С')?.click();
});
await page.waitForTimeout(1000);
await page.locator('[data-qa="resume-profile-next-screen"]').click({ force: true });
await page.waitForTimeout(5000);
const resumeId = page.url().match(/resume=([a-f0-9]+)/)?.[1];

// Этап 2: API обновление
await page.evaluate(async (id) => {
  const xsrf = document.cookie.split(';').find(c => c.startsWith('_xsrf='))?.split('=')[1];
  await fetch(`/applicant/resume/edit?resume=${id}&hhtmSource=resume_partial_edit`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'accept': 'application/json',
      'content-type': 'application/json',
      'x-requested-with': 'XMLHttpRequest',
      'x-xsrftoken': xsrf,
      'x-hhtmfrom': 'resume',
      'x-hhtmsource': 'resume_partial_edit'
    },
    body: JSON.stringify({ /* данные из Tailored Resumes */ })
  });
}, resumeId);

// Этап 3: Публикация
await page.goto(`https://hh.ru/profile/resume?resume=${resumeId}&hhtmFrom=my_resumes`);
await page.waitForTimeout(3000);
for (let i = 0; i < 5; i++) {
  await page.evaluate(() => {
    document.querySelectorAll('[data-qa="modal-overlay"]').forEach(el => el.remove());
    document.querySelector('[data-qa="resume-profile-next-screen"]')?.click();
  });
  await page.waitForTimeout(3000);
}
```

## Известные проблемы

| Проблема | Решение |
|----------|---------|
| Radio buttons не кликаются (overlay) | Удалять `[data-qa="modal-overlay"]` перед каждым кликом |
| Work format не сохраняется через UI | Использовать API напрямую |
| Resume card disabled | Пройти wizard публикации |
| Input suggestions не появляются | Type по одному символу с delay 100ms |
| **Опыт работы — общий для всех резюме** | **НЕ отправлять `experience` в API для tailored-резюме.** Любое изменение description/position в одном резюме дублируется во все остальные. Менять только title, salary, skills. |
| Отправка `experience` через API создаёт дубликаты | При несовпадении position/company с существующими записями hh.ru создаёт новые записи опыта вместо обновления. Они появятся во ВСЕХ резюме. |

## Чек-лист перед откликом

- [ ] Заголовок совпадает с требованием вакансии
- [ ] Зарплата в пределах диапазона вакансии
- [ ] Формат работы: Удалённо
- [ ] Навыки включают ключевые требования вакансии
- [ ] Опыт работы описывает релевантные проекты
- [ ] Резюме опубликовано (.published=true)

## Связанные файлы

- [[Jobs/Tailored Resumes — Middle Tier]] — параметры для создания резюме
- [[Jobs/Cover Letters — Middle Tier]] — сопроводительные письма
- [[HH-Auto Memory]] — общая память проекта
