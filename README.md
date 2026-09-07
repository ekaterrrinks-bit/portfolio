# Портфолио flaxss

Одностраничное портфолио на чистом HTML + CSS + JS.
Чёрный неоновый дизайн (никакого копирования чужих шаблонов), анимированная загрузка сайта.
Деплоится на GitHub Pages.

## Что внутри

- **Перелистывание** секций анимацией: Главная, Проекты, Навыки, Связь.
- **Фоновая музыка** — живая генерация на Web Audio API (3 трека): есть кнопка «музыка» в шапке и плавающий виджет. Никаких файлов/ап — играет прямо в браузере, легально.
- **Живые часы** (время + дата) в шапке.
- **Неоновый favicon** (SVG «F»).
- Прелоадер: «загрузка» → чёрный экран → белый → сайт.
- Шрифты и иконки (Plus Jakarta Sans, JetBrains Mono, Font Awesome) скачаны локально — работают офлайн.

## Структура

- `index.html` — вся разметка (секции `.pane`)
- `css/style.css` — стили (палитра в `:root`)
- `js/main.js` — прелоадер, перелистывание, часы, музыка (массив `TRACKS`)
- `css/all.min.css` + `webfonts/` — Font Awesome
- `fonts/` — woff2-шрифты

## Как редактировать

- Тексты/проекты/соцсети — в `index.html` (секции `.pane`).
- Палитра — `:root` в `css/style.css` (--p, --c, --r).
- Треки (темп, ноты, стиль) — массив `TRACKS` в `js/main.js`.

## Локальный просмотр

```bash
python3 -m http.server 8000
# открыть http://localhost:8000
```

## Публикация на GitHub Pages

```bash
git init
git branch -M main
git remote add origin https://github.com/ekaterrrinks-bit/portfolio.git
git add .
git commit -m "Портфолио"
git push -u origin main
```

Pages для репозитория уже включены: `https://ekaterrrinks-bit.github.io/portfolio/`.