# Портфолио flaxss

Многостраничное портфолио на чистом HTML + CSS в стиле тёмного AMOLED,
со шрифтом **Plus Jakarta Sans** и анимированной загрузкой сайта.
Деплоится на GitHub Pages.

## Структура

- `index.html` — главная (обо мне)
- `projects.html` — проекты
- `skills.html` — навыки
- `contacts.html` — контакты
- `css/style.css` — стили (AMOLED-тема, переменные в `:root`)
- `js/main.js` — прелоадер, ripple-эффект, анимации появления, прогресс-бары
- `fonts/` — локальные woff2-шрифты Plus Jakarta Sans (работают без интернета/CDN)

## Локальный просмотр

```bash
python3 -m http.server 8000
# открыть http://localhost:8000
```

## Редактирование

- Палитра и шрифт — переменные в `css/style.css` (`:root`).
- Чтобы добавить проект — добавь блок `<article class="project">...` в `projects.html`.
- Пробег загрузки: увеличи/уменьши тайминги в `js/main.js` (функция `timeline`).
- Уровни навыков — атрибут `data-level` у `<span>` внутри `.bar`.

## Как опубликовать на GitHub Pages

### Вариант 1: как сайт пользователя (`https://ekaterrrinks-git.github.io`)

Нужен репозиторий с именем ровно `ekaterrrinks-git.github.io` и сайт в корне:

```bash
# в корне репозитория должен лежать index.html (т.е. сами файлы сайта)
git init
git branch -M main
git remote add origin https://github.com/ekaterrrinks-git/ekaterrrinks-git.github.io.git
git add .
git commit -m "Портфолио"
git push -u origin main
```

GitHub Pages автоматически включится для `main` ветки.

### Вариант 2: как страница проекта (в любом репозитории)

1. Залей эти файлы в обычный репозиторий.
2. В репозитории: **Settings → Pages**.
3. В разделе **Branch** выбери `main` (или `gh-pages`) и корень `/`.
4. Сайт будет на `https://ekaterrrinks-git.github.io/<имя-репозитория>/`.
