#!/usr/bin/env python3
"""Генератор PDF-дневника болезни Паркинсона (горизонтальный А4, 30 дней)."""

import datetime
from weasyprint import HTML

PATIENT = "Крюкова М.Н."
BIRTH_DATE = "02.08.1954"
DIAGNOSIS = "G20 — Болезнь Паркинсона, 3 ст. по Хен-Яру, ригидно-дрожательная форма"
COMPLICATIONS = "Моторные флюктуации (истощение конца дозы), пиковые дискинезии"

MEDS = [
    ("08:00", "Леводопа+Карбидопа 250+25 мг", "¾ таб"),
    ("12:00", "Леводопа+Карбидопа 250+25 мг", "¾ таб"),
    ("16:00", "Леводопа+Карбидопа 250+25 мг", "¾ таб"),
    ("20:00", "Леводопа+Карбидопа 250+25 мг", "¾ таб"),
    ("02:00", "Леводопа+Карбидопа 250+25 мг", "½ таб"),
    ("08:00", "Прамипексол 0,25 мг", "2 таб"),
    ("14:00", "Прамипексол 0,25 мг", "2 таб"),
    ("20:00", "Прамипексол 0,25 мг", "2 таб"),
    ("08:00", "Амантадин 100 мг", "2 таб (посл. приём до 17:00)"),
    ("14:00", "Амантадин 100 мг", "1 таб → со 2-й нед. 2 таб"),
    ("На ночь", "Клоназепам 2 мг", "¼ таб"),
]

TIME_SLOTS = ["02:00", "08:00", "12:00", "16:00", "20:00", "Ночь"]

def css():
    return """
    @page {
        size: A4 landscape;
        margin: 8mm 10mm 8mm 10mm;
    }
    body {
        font-family: 'DejaVu Sans', Arial, sans-serif;
        font-size: 7.5pt;
        color: #222;
        line-height: 1.3;
    }
    h1 {
        font-size: 11pt;
        text-align: center;
        margin: 0 0 3mm 0;
    }
    h2 {
        font-size: 9pt;
        margin: 0 0 2mm 0;
        border-bottom: 1px solid #999;
    }
    .header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 3mm;
        padding: 2mm 3mm;
        background: #f0f0f0;
        border-radius: 3px;
    }
    .header .left { font-weight: bold; font-size: 8pt; }
    .header .right { text-align: right; font-size: 7pt; }
    .meds-ref {
        margin-bottom: 3mm;
        padding: 2mm 3mm;
        border: 1px solid #ccc;
        border-radius: 3px;
        page-break-inside: avoid;
    }
    .meds-ref table {
        width: 100%;
        border-collapse: collapse;
    }
    .meds-ref th {
        background: #e8e8e8;
        padding: 1mm 2mm;
        font-size: 6.5pt;
        text-align: left;
    }
    .meds-ref td {
        padding: 0.8mm 2mm;
        font-size: 6.5pt;
        border-bottom: 1px dotted #ddd;
    }
    .day-page {
        page-break-inside: avoid;
        margin-bottom: 3mm;
    }
    .day-title {
        font-size: 9pt;
        font-weight: bold;
        background: #4472C4;
        color: white;
        padding: 1.5mm 3mm;
        border-radius: 3px;
    }
    table.main {
        width: 100%;
        border-collapse: collapse;
        font-size: 6.5pt;
    }
    table.main th {
        background: #4472C4;
        color: white;
        padding: 1.5mm 1mm;
        text-align: center;
        font-weight: bold;
        font-size: 6pt;
    }
    table.main td {
        border: 0.5px solid #bbb;
        padding: 1mm 1mm;
        text-align: center;
        vertical-align: middle;
        height: 7mm;
    }
    table.main td.label {
        text-align: left;
        font-weight: bold;
        background: #f5f5f5;
        width: 17mm;
        font-size: 6pt;
    }
    table.main td.time-header {
        background: #d9e2f3;
        font-weight: bold;
        font-size: 6.5pt;
    }
    .progress-bar {
        display: flex;
        gap: 1px;
        justify-content: center;
    }
    .progress-bar span {
        width: 6px;
        height: 8px;
        border: 0.5px solid #999;
        border-radius: 1px;
    }
    .foot-note {
        font-size: 5.5pt;
        color: #666;
        margin-top: 1mm;
    }
    .page-break {
        page-break-before: always;
    }
    """

def meds_table():
    rows = "".join(
        f"<tr><td>{t}</td><td>{m}</td><td>{d}</td></tr>"
        for t, m, d in MEDS
    )
    return f"""
    <div class="meds-ref">
        <strong>Схема приёма лекарств (ежедневно):</strong>
        <table>
            <tr><th>Время</th><th>Препарат</th><th>Доза</th></tr>
            {rows}
        </table>
    </div>
    """

def one_day(date_str, day_num):
    """HTML-таблица на один день."""
    rows = ""
    # Строка ON/OFF
    rows += '<tr><td class="label">ON / OFF</td>'
    rows += "".join(f'<td class="time-header">{t}</td>' for t in TIME_SLOTS)
    rows += '<td class="label">Примечания</td></tr>\n'

    rows += '<tr><td class="label">Состояние</td>'
    for _ in TIME_SLOTS:
        rows += '<td>O  /  F</td>'
    rows += '<td></td></tr>\n'

    # Шкалы 0–10
    params = [
        ("Тремор (0–10)", "0…10"),
        ("Ригидность (0–10)", "0…10"),
        ("Брадикинезия (0–10)", "0…10"),
        ("Дискинезия (0–10)", "0…10"),
    ]
    for label, _ in params:
        rows += f'<tr><td class="label">{label}</td>'
        rows += "".join('<td></td>' for _ in TIME_SLOTS)
        rows += '<td></td></tr>\n'

    # Настроение
    rows += '<tr><td class="label">Настроение (1–5)</td>'
    rows += "".join('<td>1 2 3 4 5</td>' for _ in TIME_SLOTS)
    rows += '<td></td></tr>\n'

    # АД и пульс
    rows += '<tr><td class="label">АД / Пульс</td>'
    rows += "".join('<td>/</td>' for _ in TIME_SLOTS)
    rows += '<td></td></tr>\n'

    # Сон
    rows += '<tr><td class="label">Сон (часы / качество 1–5)</td>'
    rows += '<td colspan="6">Всего: ___ ч &nbsp;&nbsp; Засыпание: ___ мин &nbsp;&nbsp; Ночные пробуждения: ___ &nbsp;&nbsp; Качество: 1 2 3 4 5</td>'
    rows += '<td></td></tr>\n'

    # Еда
    rows += '<tr><td class="label">Приём пищи / Вода</td>'
    rows += '<td colspan="6">Завтрак: ___ &nbsp; Обед: ___ &nbsp; Ужин: ___ &nbsp; Перекусы: ___ &nbsp; Вода: ___ л</td>'
    rows += '<td></td></tr>\n'

    # Стул
    rows += '<tr><td class="label">Стул</td>'
    rows += '<td colspan="6">☐ норма  ☐ запор  ☐ диарея  ☐ ___</td>'
    rows += '<td></td></tr>\n'

    # Особые отметки
    specials = [
        "Заморозки (freezing): где / когда",
        "Падения: обстоятельства",
        "Судороги / спазмы",
        "Галлюцинации",
        "Нарушения глотания / речи",
        "Потливость / слюнотечение",
    ]
    for s in specials:
        rows += f'<tr><td class="label">{s}</td>'
        rows += '<td colspan="6"></td>'
        rows += '<td></td></tr>\n'

    # Примечания
    rows += '<tr><td class="label">Заметки за день</td>'
    rows += '<td colspan="7" style="text-align: left; height: 10mm;"></td></tr>\n'

    return f"""
    <div class="day-page">
        <div class="day-title">День {day_num} — {date_str}</div>
        <table class="main">
            <tr>
                <th style="width:17mm;">Параметр</th>
                {"".join(f'<th>{t}</th>' for t in TIME_SLOTS)}
                <th style="width:20mm;">Примечания</th>
            </tr>
            {rows}
        </table>
    </div>
    """

def build_html(start_date):
    """Собирает полный HTML дневника на 30 дней."""
    days_html = []
    for i in range(30):
        d = start_date + datetime.timedelta(days=i)
        date_str = d.strftime("%d.%m.%Y (%A)")
        days_html.append(one_day(date_str, i + 1))

    # Группируем по 2 дня на страницу
    pages = []
    for i in range(0, len(days_html), 2):
        chunk = days_html[i:i+2]
        page_class = ' class="page-break"' if i > 0 else ""
        pages.append(f'<div{page_class}>{"".join(chunk)}</div>')

    html = f"""<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<style>{css()}</style>
</head>
<body>
<h1>Дневник самоконтроля — Болезнь Паркинсона</h1>
<div class="header">
    <div class="left">
        Пациент: {PATIENT}<br>
        Дата рождения: {BIRTH_DATE}
    </div>
    <div class="right">
        Диагноз: {DIAGNOSIS}<br>
        {COMPLICATIONS}
    </div>
</div>
{meds_table()}
<div class="foot-note">
    <strong>Как заполнять:</strong> ON = лекарство действует (хорошая подвижность). OFF = лекарство не действует (скованность, тремор).<br>
    Шкалы 0–10: 0 = нет симптома, 10 = максимальная выраженность. Настроение: 1 = очень плохое, 5 = отличное.<br>
    Отмечайте время каждого приёма лекарств ✓. Фиксируйте эпизоды заморозок, падений и необычных симптомов сразу.
</div>
{"".join(pages)}
</body>
</html>"""
    return html

def main():
    today = datetime.date.today()
    start = today.replace(day=1) if today.day <= 15 else today

    html = build_html(start)
    html_path = "/home/ai/DewWork/dnevnikParkinson/dnevnik_parkinson.html"
    pdf_path = "/home/ai/DewWork/dnevnikParkinson/dnevnik_parkinson_30days.pdf"

    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html)

    HTML(filename=html_path).write_pdf(pdf_path)
    print(f"PDF создан: {pdf_path}")

if __name__ == "__main__":
    main()
