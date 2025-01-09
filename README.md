# Сокращатель ссылок

Для запуска - `docker compose -f docker-compose.dev.yml up`. После первого запуска необходимо применить миграции - `docker exec app npm run prisma:migrate`.

## Роуты

## POST /shorten

Создает укороченный URL для ссылки.

### Request

- **Method**: POST
- **Route**: `/shorten`

#### Request Body

- **originalUrl** (string, required): Сокращаемый URL.
- **alias** (string, optional): Кастомный алиас для URL, если не указан, генерируется рандомно. Минимальная длинна - 6 символов, максимальная - 20.
- **expiresAt** (string, optional): Дата, до которой ссылка будет действительна в ISO 8601 формате.
- **expiresIn** (number, optional): Время жизни ссылки в секундах, минимум 10 секунд, альтернатива `expiresAt`.

#### Response

- **Status code**: 201 Created

- **originalUrl** (string): Оригинальный URL, на который будет редирект.
- **shortUrl** (string): Полный сокращенный URL, включая домен.
- **shortUrlPath** (string): Алиас или сгенерированный path.
- **createdAt** (string): Дата создания в ISO 8601 формате.
- **clicksCount** (number): Количество переходов по сокращенной ссылке.

#### Exception

Если поле `alias` пересекается с уже существующей ссылкой, возвращает 409 (Conflict)

Возвращает 400 (Bad Request) при ошибках в заполнении полей

### Example

#### Request

```json
{
  "originalUrl": "https://example.com",
  "alias": "example",
  "expiresAt": "2025-12-31T23:59:59Z"
}
```

#### Response

```json
{
  "originalUrl": "https://example.com",
  "shortUrl": "https://short.ly/example",
  "shortUrlPath": "example",
  "createdAt": "2025-01-09T16:53:00Z",
  "clicksCount": 0
}
```

## GET /:shortUrl

Этот эндпоинт перенаправляет на оригинальный URL, связанный с указанным сокращённым путём.

### Request

- **Method**: GET
- **Route**: `/:shortUrl`
  - `:shortUrl` (строка): Путь или alias сокращённого URL.

### Response

- **Status code**: 301 Moved Permanently
  - Перенаправляет клиента на оригинальный URL, связанный с `:shortUrl`.

### Поведение

При запросе на этот эндпоинт сервер ищет оригинальный URL, используя предоставленный путь `:shortUrl`. Если он найден, сервер отвечает перенаправлением 301, отправляя клиента на оригинальный URL, если не найден - возвращает 404, если срок действия истек - 410

#### Example

- **Request**: `GET /example`
- **Response**: 301 Redirect на `https://example.com`

## GET /info/:shortUrl

Этот эндпоинт предоставляет информацию о сокращённом URL, аналогичную ответу при создании.

### Request

- **Method**: GET
- **Route**: `/info/:shortUrl`
  - `:shortUrl` (строка): Путь или alias сокращённого URL.

### Ответ

- **Status Code**: 200 OK
- **Body**: Объект JSON, содержащий:
  - `originalUrl` (number): Оригинальный URL.
  - `shortUrl` (string): Полный сокращённый URL.
  - `shortUrlPath` (string): Сокращённый путь или alias.
  - `createdAt` (string): Время создания URL в формате ISO 8601.
  - `clickCount` (number): Количество обращений к сокращённому URL.

### Поведение

При запросе на этот эндпоинт сервер возвращает подробную информацию о сокращённом URL, включая оригинальный URL, время создания и статистику использования, возвращает 404, если ссылка не найдена.

#### Example

- **Request**: `GET /info/example`
- **Response**:

  ```json
  {
    "originalUrl": "https://example.com",
    "shortUrl": "https://short.ly/example",
    "path": "example",
    "createdAt": "2023-10-01T12:00:00Z",
    "clickCount": 42
  }
  ```

## DELETE /delete/:shortUrl

Этот эндпоинт удаляет сокращённый URL из системы.

### Запрос

- **Метод**: DELETE
- **Маршрут**: `/delete/:shortUrl`
  - `:shortUrl` (строка): Путь или псевдоним сокращённого URL.

### Ответ

- **Код состояния**: 204 No Content

### Поведение

При удалении сокращённого URL сервер возвращает код состояния 204.

#### Пример

- **Запрос**: `DELETE /delete/example`
- **Ответ**: Код состояния 204, без тела ответа.

## GET /analytics/:shortUrl

Этот эндпоинт предоставляет аналитику по сокращённому URL.

### Запрос

- **Метод**: GET
- **Маршрут**: `/analytics/:shortUrl`
  - `:shortUrl` (строка): Путь или псевдоним сокращённого URL.

### Ответ

- **Код состояния**: 200 OK
- **Тело**: Объект JSON, содержащий:
  - `clicksCount` (number): Общее количество кликов по сокращённому URL.
  - `visitors` (array): Информация о посетителях, включая:
    - `ip` (string): IP-адрес посетителя.
    - `visitedAt` (string): Время визита в формате ISO 8601.

### Поведение

Эндпоинт возвращает статистику использования сокращённого URL, включая количество кликов и информацию о каждом посетителе (последние 5) или 404 если информация не найдена.

#### Пример

- **Запрос**: `GET /analytics/example`
- **Ответ**:
  ```json
  {
    "clicksCount": 6,
    "visitors": [
      {
        "ip": "::ffff:172.19.0.1",
        "visitedAt": "2025-01-09T20:32:07.535Z"
      }
    ]
  }
  ```
