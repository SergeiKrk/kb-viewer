#!/usr/bin/env python3
"""Генерация 4 графиков для статьи о рынке fullstack-разработки в РФ."""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import numpy as np
import os

# ── Output directory ──────────────────────────────────────────────
OUT_DIR = os.path.dirname(os.path.abspath(__file__))

# ── Global style: dark theme ──────────────────────────────────────
BG_COLOR   = '#1a1a2e'
GRID_COLOR = '#2a2a4a'
TEXT_COLOR = '#e0e0e0'
BAR_EDGE   = 'none'

plt.rcParams.update({
    'figure.facecolor': BG_COLOR,
    'axes.facecolor':   BG_COLOR,
    'axes.edgecolor':   '#4a4a6a',
    'axes.labelcolor':  TEXT_COLOR,
    'axes.titlecolor':  '#ffffff',
    'xtick.color':      TEXT_COLOR,
    'ytick.color':      TEXT_COLOR,
    'grid.color':       GRID_COLOR,
    'grid.alpha':       0.6,
    'text.color':       TEXT_COLOR,
    'font.size':        11,
    'axes.titlesize':   14,
    'axes.titleweight': 'bold',
    'axes.grid':        True,
    'grid.linestyle':   '--',
    'grid.linewidth':   0.5,
    'savefig.facecolor': BG_COLOR,
    'savefig.edgecolor': 'none',
    'savefig.dpi':      150,
    'savefig.bbox':     'tight',
    'figure.dpi':       150,
})

# ── Color palette ─────────────────────────────────────────────────
PALETTE = {
    'Node.js':    '#4caf50',
    'Python':     '#2196f3',
    'PHP':        '#9c27b0',
    'Go':         '#00bcd4',
    'Java':       '#ff9800',
    'C#/.NET':    '#e91e63',
    '.NET':       '#e91e63',
    'Ruby':       '#f44336',
    'Kotlin':     '#ff5722',
    'TypeScript': '#3178c6',
}

ANNOT_COLOR = '#ffcc00'


def get_color(label):
    return PALETTE.get(label, '#607d8b')


# ═══════════════════════════════════════════════════════════════════
# 1. ГОРИЗОНТАЛЬНАЯ ДИАГРАММА — Общий рынок бэкенд-языков
# ═══════════════════════════════════════════════════════════════════
def chart_horiz_bar():
    labels = ['Python', 'Java', 'C#/.NET', 'PHP', 'Go', 'Node.js', 'Kotlin', 'TypeScript', 'Ruby']
    values = [519, 468, 227, 207, 141, 62, 58, 53, 15]

    # Sort descending
    pairs = sorted(zip(values, labels), reverse=True)
    values, labels = zip(*pairs)

    colors = [get_color(l) for l in labels]

    fig, ax = plt.subplots(figsize=(10, 6))
    bars = ax.barh(labels, values, color=colors, height=0.65, edgecolor=BAR_EDGE)

    # Value labels on bars
    for bar, val in zip(bars, values):
        ax.text(bar.get_width() + 8, bar.get_y() + bar.get_height()/2,
                str(val), va='center', fontsize=11, color='#ffffff', fontweight='bold')

    ax.set_title('Вакансии по бэкенд-языкам (РФ, hh.ru)', pad=16)
    ax.set_xlabel('Количество вакансий')
    ax.invert_yaxis()  # highest on top
    ax.set_xlim(0, max(values) * 1.15)
    ax.tick_params(axis='both', colors=TEXT_COLOR, labelsize=10)

    fig.tight_layout()
    fig.savefig(os.path.join(OUT_DIR, 'horiz_bar.png'))
    plt.close(fig)
    print('[✓] horiz_bar.png')


# ═══════════════════════════════════════════════════════════════════
# 2. FULLSTACK-ВАКАНСИИ ПО БЭКЕНД-ЯЗЫКУ
# ═══════════════════════════════════════════════════════════════════
def chart_fullstack_bar():
    labels = ['PHP', 'Python', 'Java', 'C#/.NET', 'Node.js', 'TypeScript', 'Go', 'Ruby']
    values = [30, 29, 28, 21, 15, 10, 2, 1]

    colors = [get_color(l) for l in labels]

    fig, ax = plt.subplots(figsize=(10, 6))
    x = np.arange(len(labels))
    bars = ax.bar(x, values, color=colors, width=0.6, edgecolor=BAR_EDGE)

    # Value labels atop bars
    for bar, val in zip(bars, values):
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.5,
                str(val), ha='center', va='bottom', fontsize=11, color='#ffffff', fontweight='bold')

    # Annotation for Node.js
    node_idx = labels.index('Node.js')
    ax.annotate('Node.js занижен —\nсм. связки',
                xy=(node_idx, values[node_idx]),
                xytext=(node_idx + 1.1, values[node_idx] + 12),
                fontsize=9, color=ANNOT_COLOR, fontweight='bold',
                arrowprops=dict(arrowstyle='->', color=ANNOT_COLOR, lw=1.5),
                ha='center', va='bottom',
                bbox=dict(boxstyle='round,pad=0.3', facecolor='#2a2a4a', edgecolor=ANNOT_COLOR, alpha=0.9))

    ax.set_title('Fullstack-вакансии по бэкенд-языку', pad=16)
    ax.set_xticks(x)
    ax.set_xticklabels(labels, rotation=30, ha='right', fontsize=10)
    ax.set_ylabel('Количество вакансий')
    ax.set_ylim(0, max(values) * 1.4)
    ax.tick_params(axis='both', colors=TEXT_COLOR, labelsize=10)

    fig.tight_layout()
    fig.savefig(os.path.join(OUT_DIR, 'fullstack_bar.png'))
    plt.close(fig)
    print('[✓] fullstack_bar.png')


# ═══════════════════════════════════════════════════════════════════
# 3. СВЯЗКИ REACT + БЭКЕНД
# ═══════════════════════════════════════════════════════════════════
def chart_react_combos():
    labels = ['React +\nNode.js', 'React +\nPHP', 'React +\nPython',
              'React +\nJava', 'React +\n.NET', 'React +\nGo']
    values = [16, 9, 8, 6, 5, 1]

    # Colors by backend component
    be_colors = ['Node.js', 'PHP', 'Python', 'Java', '.NET', 'Go']
    colors = [get_color(c) for c in be_colors]

    fig, ax = plt.subplots(figsize=(10, 6))
    x = np.arange(len(labels))
    bars = ax.bar(x, values, color=colors, width=0.55, edgecolor=BAR_EDGE)

    for bar, val in zip(bars, values):
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.3,
                str(val), ha='center', va='bottom', fontsize=12, color='#ffffff', fontweight='bold')

    # Annotation for React + Node.js
    ax.annotate('Лидер: JS на фронте\nи бэке',
                xy=(0, 16),
                xytext=(1.2, 20),
                fontsize=9, color=ANNOT_COLOR, fontweight='bold',
                arrowprops=dict(arrowstyle='->', color=ANNOT_COLOR, lw=1.5),
                ha='center', va='bottom',
                bbox=dict(boxstyle='round,pad=0.3', facecolor='#2a2a4a', edgecolor=ANNOT_COLOR, alpha=0.9))

    ax.set_title('Связка React + бэкенд (hh.ru)', pad=16)
    ax.set_xticks(x)
    ax.set_xticklabels(labels, fontsize=9)
    ax.set_ylabel('Количество вакансий')
    ax.set_ylim(0, max(values) * 1.55)
    ax.tick_params(axis='both', colors=TEXT_COLOR, labelsize=10)

    fig.tight_layout()
    fig.savefig(os.path.join(OUT_DIR, 'react_combos.png'))
    plt.close(fig)
    print('[✓] react_combos.png')


# ═══════════════════════════════════════════════════════════════════
# 4. ЗАРПЛАТЫ ПО ГРЕЙДАМ
# ═══════════════════════════════════════════════════════════════════
def chart_salaries():
    labels = ['Intern', 'Junior', 'Middle', 'Senior', 'Lead']
    values = [66, 95, 177, 303, 378]

    grade_colors = ['#78909c', '#26a69a', '#42a5f5', '#ff9800', '#e91e63']

    fig, ax = plt.subplots(figsize=(10, 6))
    x = np.arange(len(labels))
    bars = ax.bar(x, values, color=grade_colors, width=0.55, edgecolor=BAR_EDGE)

    for bar, val in zip(bars, values):
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 5,
                str(val), ha='center', va='bottom', fontsize=13, color='#ffffff', fontweight='bold')

    # Horizontal line: average
    avg = 203
    ax.axhline(y=avg, color='#ffd54f', linestyle='--', linewidth=2, alpha=0.9)
    ax.text(len(labels) - 0.35, avg + 7, f'Средняя по IT — {avg} тыс. ₽',
            fontsize=10, color='#ffd54f', fontweight='bold', ha='right',
            bbox=dict(boxstyle='round,pad=0.3', facecolor='#1a1a2e', edgecolor='#ffd54f', alpha=0.9))

    ax.set_title('Медианные зарплаты IT (Хабр Карьера, тыс. ₽)', pad=16)
    ax.set_xticks(x)
    ax.set_xticklabels(labels, fontsize=12)
    ax.set_ylabel('Тыс. ₽')
    ax.set_ylim(0, max(values) * 1.3)
    ax.tick_params(axis='both', colors=TEXT_COLOR, labelsize=10)

    fig.tight_layout()
    fig.savefig(os.path.join(OUT_DIR, 'salaries.png'))
    plt.close(fig)
    print('[✓] salaries.png')


# ── Run all ────────────────────────────────────────────────────
if __name__ == '__main__':
    print(f'Output dir: {OUT_DIR}')
    chart_horiz_bar()
    chart_fullstack_bar()
    chart_react_combos()
    chart_salaries()
    print('\n✅ All 4 charts generated successfully!')
