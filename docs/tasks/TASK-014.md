# TASK-014: Авторизация — регистрация, логин, JWT, защита API

## Цель

Добавить систему авторизации. Сейчас один "дефолтный" игрок без логина. Нужно: регистрация по username+password, логин, JWT-токен, защита всех API-эндпоинтов.

**Это крупная задача. Порядок:**
1. Зависимости + Prisma-схема
2. Auth-сервис (бэкенд)
3. Auth-middleware (бэкенд)
4. Рефакторинг всех сервисов — убрать getOrCreateDefaultPlayer
5. Auth UI (фронтенд)
6. Привязка к PlayerContext

---

## 1. Зависимости

Установить в backend:
```bash
npm install @fastify/jwt bcryptjs
npm install -D @types/bcryptjs
```

`@fastify/jwt` — JWT-плагин для Fastify (генерация + верификация токенов).
`bcryptjs` — хэширование паролей (чистый JS, без нативных зависимостей — проще в Docker).

---

## 2. Prisma-схема

### Новая модель User

Добавить в `backend/src/db/prisma/schema.prisma`:

```prisma
model User {
  id        String   @id @default(uuid())
  username  String   @unique
  password  String   // bcrypt hash
  createdAt DateTime @default(now())
  player    Player?
}
```

### Связь Player → User

Добавить в модель Player:
```prisma
userId    String?  @unique
user      User?    @relation(fields: [userId], references: [id])
```

`userId` nullable — для обратной совместимости с существующим "дефолтным" игроком, который создан без юзера.

После изменений: `npx prisma db push`.

---

## 3. Конфиг

В `backend/src/config/index.ts` добавить:
```typescript
jwtSecret: process.env.JWT_SECRET ?? "dev-secret-change-in-production",
```

В `docker-compose.yml` добавить переменную окружения для backend:
```yaml
JWT_SECRET: "${JWT_SECRET:-dev-secret-change-in-production}"
```

---

## 4. Auth-сервис (бэкенд)

Создать `backend/src/modules/auth/auth.service.ts`:

### register(username, password)
1. Проверить: username непустой, длина 3–20 символов, только латиница+цифры+underscore
2. Проверить: username не занят → иначе ошибка "Username already taken"
3. Хэшировать пароль: `bcrypt.hash(password, 10)`
4. Создать User
5. Создать Player с `userId = user.id`, `dust = STARTING_DUST`
6. Сгенерировать JWT-токен (payload: `{ userId: user.id }`)
7. Вернуть `{ token, user: { id, username }, player: PlayerDto }`

### login(username, password)
1. Найти User по username → иначе "Invalid credentials"
2. Проверить пароль: `bcrypt.compare(password, user.password)` → иначе "Invalid credentials"
3. Найти связанного Player
4. Сгенерировать JWT-токен
5. Вернуть `{ token, user: { id, username }, player: PlayerDto }`

### Типы

Создать `backend/src/modules/auth/auth.types.ts`:
```typescript
export type AuthResponse = {
  token: string;
  user: { id: string; username: string };
};
```

### Роуты

Создать `backend/src/modules/auth/auth.routes.ts`:
- `POST /api/auth/register` — body: `{ username, password }` → AuthResponse
- `POST /api/auth/login` — body: `{ username, password }` → AuthResponse

Зарегистрировать в `app.ts` как `/api/auth`.

---

## 5. Auth-middleware (бэкенд)

### JWT-плагин

В `app.ts` зарегистрировать `@fastify/jwt`:
```typescript
await app.register(fastifyJwt, { secret: config.jwtSecret });
```

### Декоратор authenticate

Добавить Fastify-декоратор `authenticate`:
```typescript
app.decorate("authenticate", async (request, reply) => {
  try {
    await request.jwtVerify();
  } catch {
    reply.code(401).send({ error: "Unauthorized" });
  }
});
```

### Хелпер getCurrentPlayer

Создать `backend/src/modules/auth/auth.helpers.ts`:

```typescript
export const getCurrentPlayer = async (request: FastifyRequest): Promise<Player> => {
  const payload = request.user as { userId: string };
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: { player: true },
  });
  if (!user?.player) throw new Error("Player not found");
  return user.player;
};
```

### Защита роутов

Все роуты кроме `/api/auth/*`, `/health` и `/api/dev/*` должны требовать JWT.

Способ: добавить `onRequest: [app.authenticate]` хук на уровне каждого prefix-роута, **или** использовать глобальный хук с исключениями.

Рекомендуемый подход — **на уровне роутов**: в каждом routes-файле (cards, boosters, craft, battle, player) добавить:
```typescript
app.addHook("onRequest", app.authenticate);
```

НЕ добавлять этот хук в auth.routes.ts и dev.routes.ts.

---

## 6. Рефакторинг сервисов

### Главное изменение

**Убрать `getOrCreateDefaultPlayer()`** из всех сервисов. Вместо этого — передавать `playerId` из контроллера (routes), который получает его через `getCurrentPlayer(request)`.

### Что менять

1. **`player.service.ts`**:
   - `getPlayerDto()` → принимает `playerId: string` вместо вызова `getOrCreateDefaultPlayer()`
   - `getOrCreateDefaultPlayer()` — оставить только для dev.routes.ts (backward compat) или удалить
   - `addDust()` — уже принимает playerId, не менять
   - `ensureCardsHavePlayer()` — не нужна при авторизации (карты создаются с playerId сразу), но оставить для безопасности

2. **`boosters.service.ts`**:
   - `openBooster()` → принимает `playerId: string`
   - Внутри: `getPlayerDto(playerId)` вместо `getPlayerDto()`

3. **`boosters.recharge.ts`**:
   - Уже принимает `playerId` — не менять

4. **`craft.service.ts`**:
   - `craftCard()` → принимает `playerId: string`

5. **`battle.service.ts`**:
   - `startBattle()` → принимает `playerId: string`
   - `answerRound()` — нужно сохранять playerId в BattleState, чтобы при ответе знать чей бой
   - Добавить `playerId` в `BattleState` тип

6. **`cards.service.ts`**:
   - `generateCard()`, `listCards()`, `disintegrateCard()` → принимают `playerId: string`

7. **`cards.generator.ts`**:
   - `generateCardFromPool()` — уже принимает `playerId` в params, не менять

8. **Все routes-файлы**:
   - В каждом хэндлере: `const player = await getCurrentPlayer(request)`
   - Передавать `player.id` в сервисы

### dev.routes.ts

Dev-эндпоинт: если есть JWT — использовать текущего игрока. Если нет — `getOrCreateDefaultPlayer()` (для обратной совместимости при первом запуске).

---

## 7. Фронтенд

### API

Создать `frontend/src/api/auth.ts`:
```typescript
export type AuthResponse = {
  token: string;
  user: { id: string; username: string };
};

export const register = async (username: string, password: string): Promise<AuthResponse>;
export const login = async (username: string, password: string): Promise<AuthResponse>;
```

### Хранение токена

Создать `frontend/src/shared/token.ts`:
```typescript
const TOKEN_KEY = "lg_token";

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = (): void => localStorage.removeItem(TOKEN_KEY);
```

### Авторизованные запросы

Обновить **все API-функции** — добавить заголовок `Authorization: Bearer <token>`.

Лучший подход: создать общий fetch-хелпер `frontend/src/api/fetcher.ts`:
```typescript
export const apiFetch = async (url: string, options?: RequestInit): Promise<Response> => {
  const token = getToken();
  const headers: Record<string, string> = {
    ...options?.headers as Record<string, string>,
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (options?.body) headers["Content-Type"] = "application/json";

  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    clearToken();
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }
  return res;
};
```

Заменить все `fetch(...)` в api-файлах на `apiFetch(...)`.

### AuthContext

Создать `frontend/src/contexts/AuthContext.tsx`:
```typescript
type AuthState = {
  user: { id: string; username: string } | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
};
```

- При монтировании: проверить наличие токена в localStorage. Если есть — вызвать `/api/player` для проверки валидности (если 401 — очистить токен).
- `login` / `register` — вызвать API, сохранить токен, обновить состояние
- `logout` — очистить токен, перенаправить на /login

### Страница логина/регистрации

Создать `frontend/src/pages/AuthPage.tsx`:
- Два таба: "Вход" / "Регистрация"
- Поля: username, password
- Кнопка submit
- Ошибки валидации
- После успеха — редирект на `/` (бустер)

### Роутинг

В `App.tsx`:
- `/login` → AuthPage
- Все остальные роуты — обернуть в проверку: если нет токена → redirect на `/login`
- Если есть токен → показать приложение (TopNav + Routes)

### TopNav

Добавить имя пользователя + кнопку "Выйти" (вызывает `logout()`).

### PlayerContext

`PlayerContext` остаётся как есть — он загружает данные текущего (авторизованного) игрока. Просто теперь API `/api/player` вернёт данные конкретного юзера на основе JWT.

---

## 8. Git

Два коммита:
```
feat: auth backend (User model, register/login, JWT, route protection)
feat: auth frontend (login/register page, token storage, protected routes)
```

---

## Критерии готовности

1. Модель User в Prisma, связь User → Player
2. `POST /api/auth/register` создаёт User + Player, возвращает JWT
3. `POST /api/auth/login` проверяет credentials, возвращает JWT
4. Все API-эндпоинты (кроме auth, health, dev) требуют JWT → 401 без токена
5. Все сервисы получают playerId из JWT, а не из getOrCreateDefaultPlayer()
6. Фронтенд: страница логина/регистрации
7. Токен сохраняется в localStorage, отправляется в каждом запросе
8. 401 ответ → автоматический logout + редирект на /login
9. TopNav показывает username + кнопка "Выйти"
10. Незалогиненный пользователь не видит основное приложение
11. `docker compose up` — всё работает (JWT_SECRET в docker-compose)
