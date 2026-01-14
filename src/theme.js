import { THEME_STORAGE_KEY } from './config.js';

export function initializeTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
        applySystemTheme();
    }

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (!localStorage.getItem(THEME_STORAGE_KEY)) {
            applySystemTheme();
        }
    });

    updateThemeToggleLabel();
}

function applySystemTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    updateThemeToggleLabel();
}

export function initializeThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);

    updateThemeToggleLabel();
}

function updateThemeToggleLabel() {
    const label = document.querySelector('.theme-toggle-label');
    if (label) {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        label.textContent = currentTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
    }
}
