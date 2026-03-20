# LangGacha

Прототип (Фаза 0). Поднимается одной командой через Docker Compose: PostgreSQL + Redis + Backend (Fastify/TS/Prisma) + Frontend (React/Vite/Tailwind).

## Быстрый старт

1. Создать `.env` на основе `.env.example`
2. Запустить:
   - `docker compose up --build`
3. Открыть:
   - Frontend: `http://localhost:5173`

На главной странице нажать «Сгенерировать карточку» — появится карточка и будет доступен переворот по клику.

## API

- `POST http://localhost:3000/api/cards/generate`
- `GET  http://localhost:3000/api/cards`
- `POST http://localhost:3000/api/boosters/open`
- `POST http://localhost:3000/api/battle/start`
- `POST http://localhost:3000/api/battle/:battleId/answer`

## Страницы

- `/` — бустер (открытие пака из 5 карт)
- `/collection` — коллекция (сетка, фильтры, модалка)
- `/battle` — бой (выбор колоды → квиз → пошаговый бой → награды)
