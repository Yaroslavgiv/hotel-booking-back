# GraphQL Запросы для тестирования API

Все запросы выполняются на endpoint: `http://localhost:4001/graphql`

## 📋 Содержание
- [Queries (Запросы)](#queries-запросы)
- [Mutations (Мутации)](#mutations-мутации)
- [Примеры использования](#примеры-использования)

---

## Queries (Запросы)

### 1. Получить все отели с номерами

```graphql
query GetAllHotels {
  hotels {
    id
    name
    address
    description
    rooms {
      id
      number
      type
      price
    }
  }
}
```

**Ожидаемый результат:** Список всех отелей (2 отеля из seed данных) с их номерами.

---

### 2. Получить отель по ID

```graphql
query GetHotelById {
  hotel(id: "1") {
    id
    name
    address
    description
    rooms {
      id
      number
      type
      price
    }
  }
}
```

**Ожидаемый результат:** Данные отеля "Гранд Отель" с 4 номерами.

---

### 3. Получить все номера

```graphql
query GetAllRooms {
  rooms {
    id
    number
    type
    price
    hotel {
      id
      name
      address
    }
  }
}
```

**Ожидаемый результат:** Список всех номеров (7 номеров) с информацией об отелях.

---

### 4. Получить номера по отелю

```graphql
query GetRoomsByHotel {
  roomsByHotel(hotelId: "1") {
    id
    number
    type
    price
  }
}
```

**Ожидаемый результат:** Список номеров отеля "Гранд Отель" (4 номера).

---

### 5. Проверить доступность номера

```graphql
query CheckAvailability {
  checkAvailability(
    roomId: "1"
    checkIn: "2026-02-15"
    checkOut: "2026-02-20"
  ) {
    available
    conflictingBookings {
      id
      guestName
      checkIn
      checkOut
      isActive
    }
  }
}
```

**Ожидаемый результат:** 
- `available: false` если есть конфликты
- `available: true` если номер свободен
- Список конфликтующих бронирований

**Пример для свободного номера:**
```graphql
query CheckAvailabilityFree {
  checkAvailability(
    roomId: "5"
    checkIn: "2026-02-15"
    checkOut: "2026-02-20"
  ) {
    available
    conflictingBookings {
      id
      guestName
    }
  }
}
```

---

## Mutations (Мутации)

### 6. Создать бронирование

```graphql
mutation CreateBooking {
  createBooking(input: {
    roomId: "5"
    guestName: "Тестовый Гость"
    guestEmail: "test@example.com"
    checkIn: "2026-02-25"
    checkOut: "2026-02-28"
  }) {
    id
    guestName
    guestEmail
    checkIn
    checkOut
    isActive
    room {
      id
      number
      type
      price
      hotel {
        id
        name
      }
    }
    createdAt
  }
}
```

**Ожидаемый результат:** Созданное бронирование с полной информацией.

**Примечание:** Используйте свободные даты и номер без активных бронирований.

---

### 7. Отменить бронирование

```graphql
mutation CancelBooking {
  cancelBooking(id: "1") {
    id
    guestName
    isActive
    checkIn
    checkOut
  }
}
```

**Ожидаемый результат:** Бронирование с `isActive: false`.

---

## Примеры использования

### Тестирование через curl

#### 1. Получить все отели
```bash
curl -X POST http://localhost:4001/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ hotels { id name address rooms { id number type price } } }"
  }'
```

#### 2. Создать бронирование
```bash
curl -X POST http://localhost:4001/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { createBooking(input: { roomId: \"5\" guestName: \"Иван Тестов\" guestEmail: \"ivan@test.com\" checkIn: \"2026-03-01\" checkOut: \"2026-03-05\" }) { id guestName isActive } }"
  }'
```

#### 3. Проверить доступность
```bash
curl -X POST http://localhost:4001/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ checkAvailability(roomId: \"1\" checkIn: \"2026-02-15\" checkOut: \"2026-02-20\") { available conflictingBookings { id guestName } } }"
  }'
```

---

### Тестирование через Postman/Insomnia

1. **Метод:** POST
2. **URL:** `http://localhost:4001/graphql`
3. **Headers:**
   ```
   Content-Type: application/json
   ```
4. **Body (raw JSON):**
   ```json
   {
     "query": "{ hotels { id name } }"
   }
   ```

---

### Тестирование через GraphQL Playground

Если используете GraphQL Playground или Apollo Studio:

1. Откройте `http://localhost:4001/graphql`
2. Вставьте любой запрос из списка выше
3. Нажмите "Play"

---

## Сценарии тестирования

### Сценарий 1: Полный цикл бронирования

1. **Проверить доступность:**
```graphql
query {
  checkAvailability(
    roomId: "5"
    checkIn: "2026-03-10"
    checkOut: "2026-03-15"
  ) {
    available
  }
}
```

2. **Создать бронирование (если available = true):**
```graphql
mutation {
  createBooking(input: {
    roomId: "5"
    guestName: "Петр Сидоров"
    guestEmail: "petr@example.com"
    checkIn: "2026-03-10"
    checkOut: "2026-03-15"
  }) {
    id
    guestName
    isActive
  }
}
```

3. **Проверить конфликт (попытка создать второе бронирование на те же даты):**
```graphql
mutation {
  createBooking(input: {
    roomId: "5"
    guestName: "Конфликтный Гость"
    guestEmail: "conflict@example.com"
    checkIn: "2026-03-12"
    checkOut: "2026-03-16"
  }) {
    id
  }
}
```
**Ожидаемый результат:** Ошибка `CONFLICT_ERROR`

4. **Отменить бронирование:**
```graphql
mutation {
  cancelBooking(id: "6") {
    id
    isActive
  }
}
```

---

### Сценарий 2: Тестирование валидации

#### Ошибка: Дата в прошлом
```graphql
mutation {
  createBooking(input: {
    roomId: "1"
    guestName: "Тест"
    guestEmail: "test@example.com"
    checkIn: "2020-01-01"
    checkOut: "2020-01-05"
  }) {
    id
  }
}
```
**Ожидаемый результат:** Ошибка `VALIDATION_ERROR` - "Дата заезда не может быть в прошлом"

#### Ошибка: Неправильный порядок дат
```graphql
mutation {
  createBooking(input: {
    roomId: "1"
    guestName: "Тест"
    guestEmail: "test@example.com"
    checkIn: "2026-03-10"
    checkOut: "2026-03-05"
  }) {
    id
  }
}
```
**Ожидаемый результат:** Ошибка `VALIDATION_ERROR` - "Дата выезда должна быть позже даты заезда"

#### Ошибка: Номер не найден
```graphql
mutation {
  createBooking(input: {
    roomId: "999"
    guestName: "Тест"
    guestEmail: "test@example.com"
    checkIn: "2026-03-10"
    checkOut: "2026-03-15"
  }) {
    id
  }
}
```
**Ожидаемый результат:** Ошибка `NOT_FOUND` - "Номер с id 999 не найден"

---

### Сценарий 3: Получение данных отеля с бронированиями

```graphql
query {
  hotel(id: "1") {
    id
    name
    address
    rooms {
      id
      number
      type
      price
      bookings {
        id
        guestName
        guestEmail
        checkIn
        checkOut
        isActive
      }
    }
  }
}
```

**Примечание:** В текущей схеме поле `bookings` не реализовано напрямую, но можно получить через отдельные запросы.

---

## Проверка ошибок

Все ошибки возвращаются в формате:

```json
{
  "errors": [
    {
      "message": "Номер недоступен на указанные даты...",
      "extensions": {
        "code": "CONFLICT_ERROR"
      }
    }
  ]
}
```

**Коды ошибок:**
- `VALIDATION_ERROR` - ошибки валидации данных
- `CONFLICT_ERROR` - конфликты (номер занят, бронирование уже отменено)
- `NOT_FOUND` - ресурс не найден

---

## Полезные запросы для отладки

### Получить информацию о конкретном номере
```graphql
query {
  rooms {
    id
    number
    type
    price
    hotel {
      id
      name
    }
  }
}
```
Затем используйте полученный `id` для дальнейших запросов.

### Проверить доступность на разные даты
```graphql
query {
  check1: checkAvailability(roomId: "1", checkIn: "2026-02-10", checkOut: "2026-02-15") {
    available
  }
  check2: checkAvailability(roomId: "1", checkIn: "2026-03-01", checkOut: "2026-03-05") {
    available
  }
}
```

---

## Примечания

1. **Даты:** Используйте формат `YYYY-MM-DD` (ISO 8601)
2. **ID:** Все ID в GraphQL передаются как строки (`"1"`, а не `1`)
3. **Seed данные:** При первом запуске создаются 2 отеля и 5 бронирований
4. **Конфликты:** Номер 1 (id=1) имеет конфликтующие бронирования в seed данных
5. **Свободные номера:** Номера 5, 6, 7 (отель "Морской Бриз") изначально без бронирований

---

## Быстрая проверка работоспособности

Минимальный запрос для проверки, что API работает:

```graphql
query {
  hotels {
    id
    name
  }
}
```

Если получаете список отелей - API работает корректно! ✅
