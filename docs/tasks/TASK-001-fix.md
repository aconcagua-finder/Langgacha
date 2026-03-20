# TASK-001-fix: Git init + мелкие правки после ревью

## Цель

Инициализировать git-репозиторий, сделать первый коммит и исправить пару мелочей.

---

## 1. Git init + первый коммит

```bash
cd /Users/aleksei/Projects/Langgacha
git init
git add .
git commit -m "feat: project scaffold — Docker, Fastify+Prisma backend, React+Vite frontend, seed 30 words"
```

Перед коммитом убедись что `node_modules/` и `.env` НЕ попадают в коммит (они в .gitignore).

---

## 2. Исправить .gitignore

Убрать строку `backend/prisma/migrations` — миграции должны быть в git.

---

## 3. Убрать неиспользуемую переменную в HomePage

В файле `frontend/src/pages/HomePage.tsx` переменная `apiUrl` считывается из env и отображается в UI, но для fetch не используется (fetch идёт через `api/cards.ts`). Это не баг, но дублирование. Оставь отображение API URL в UI, но бери значение из того же источника что и `api/cards.ts` — импортируй или вынеси в общую константу.

---

## 4. Коммит правок

```bash
git add .
git commit -m "fix: gitignore allow prisma migrations, cleanup HomePage"
```

---

## Критерии готовности

1. `git log` показывает 2 коммита
2. `git status` — чистый
3. В `.gitignore` нет строки про prisma migrations
4. Проект по-прежнему запускается через `docker compose up`
