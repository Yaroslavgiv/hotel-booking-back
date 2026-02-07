# Hotel Booking GraphQL API

Система бронирования отелей с GraphQL API на Node.js + Apollo Server + TypeScript.

## Технологии

- **Node.js** + **TypeScript**
- **Apollo Server v4** (GraphQL)
- **TypeORM** (ORM)
- **SQLite** (better-sqlite3) - база данных
- **Winston** (логирование)
- **Express** (HTTP сервер)
- **Jest** (тестирование)

## Архитектура

Проект следует принципам чистой архитектуры и использует следующие паттерны:

- **Repository Pattern** - абстракция работы с базой данных
- **Service Layer** - бизнес-логика приложения
- **Dependency Injection** - через конструкторы
- **Error Handling** - централизованная обработка ошибок с типизированными кодами ошибок
- **Logging** - логирование всех ключевых операций

## Структура проекта

```
src/
├── models/          # TypeORM модели (Hotel, Room, Booking)
├── repositories/    # Репозитории для работы с БД
├── services/        # Бизнес-логика
├── resolvers/       # GraphQL резолверы
├── schema/          # GraphQL схема
├── database/        # Конфигурация БД и seed
├── utils/           # Утилиты (logger, errors, validators)
└── __tests__/       # Тесты (Jest)
    ├── resolvers/   # Тесты резолверов
    ├── services/    # Тесты сервисов
    └── utils/       # Тесты утилит
```

## Установка

```bash
npm install
```

## Запуск

### Разработка

```bash
npm run dev
```

Сервер автоматически запустится на `http://localhost:4001/graphql` (порт можно изменить через переменную окружения `PORT`).

### Продакшн

```bash
npm run build
npm start
```

### Seed данных

При первом запуске (`npm run dev`) автоматически создаются:
- **2 отеля:**
  - "Гранд Отель" (Москва) - 4 номера (2 стандарта, 2 люкса)
  - "Морской Бриз" (Санкт-Петербург) - 3 номера (2 эконом, 1 премиум)
- **5 бронирований** (все для отеля "Гранд Отель"):
  - 2 активных конфликтующих бронирования в номере 101
  - 1 активное бронирование в номере 102
  - 1 отмененное бронирование в номере 201
  - 1 активное бронирование в номере 202

Для повторного заполнения данных (очистка и создание заново):

```bash
npm run seed
```

## Тестирование

Проект включает полное покрытие тестами с использованием Jest.

### Запуск тестов

```bash
# Запустить все тесты
npm test

# Запустить тесты в режиме watch (автоматический перезапуск при изменениях)
npm run test:watch

# Запустить тесты с покрытием кода
npm run test:coverage
```

### Покрытие тестами

Проект включает **52 теста**, покрывающие:

#### Resolvers (GraphQL)
- ✅ `BookingResolver` - создание, отмена бронирований, проверка доступности
- ✅ `HotelResolver` - получение отелей и номеров

#### Services (Бизнес-логика)
- ✅ `BookingService` - валидация дат, проверка конфликтов, создание/отмена бронирований
- ✅ `HotelService` - получение отелей и номеров

#### Utils (Утилиты)
- ✅ `dateValidator` - валидация диапазонов дат (прошлое, порядок дат, максимальный период)
- ✅ `errors` - форматирование ошибок для GraphQL (VALIDATION_ERROR, CONFLICT_ERROR, NOT_FOUND)

### Структура тестов

Тесты используют моки для изоляции компонентов:
- Репозитории мокируются для тестирования сервисов
- Сервисы мокируются для тестирования резолверов
- Логирование отключено в тестах для чистоты вывода

### Примеры тестов

```typescript
// Тест валидации дат
describe('validateDateRange', () => {
  it('должен выбросить ошибку, если дата заезда в прошлом', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    expect(() => validateDateRange(pastDate, futureDate))
      .toThrow(ValidationError);
  });
});

// Тест создания бронирования
describe('createBooking', () => {
  it('должен успешно создать бронирование', async () => {
    const result = await bookingService.createBooking(validInput);
    expect(result).toHaveProperty('id');
    expect(mockRepository.create).toHaveBeenCalled();
  });
});
```

## Подключение с мобильных устройств

### Android Emulator

Используйте специальный адрес для доступа к localhost хоста:

```
http://10.0.2.2:4001/graphql
```

### Реальное устройство / Другие эмуляторы

Используйте IP-адрес вашего компьютера в локальной сети:

```
http://<ваш_IP>:4001/graphql
```

Например: `http://192.168.1.100:4001/graphql`

> **Примечание:** Убедитесь, что сервер запущен и порт не заблокирован файрволом.

## GraphQL API

Сервер запускается на `http://localhost:4001/graphql` (по умолчанию)

### Запросы (Queries)

#### Получить все отели
```graphql
query {
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

#### Получить отель по ID
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
    }
  }
}
```

#### Получить все номера
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

#### Получить номера по отелю
```graphql
query {
  roomsByHotel(hotelId: "1") {
    id
    number
    type
    price
  }
}
```

#### Проверить доступность номера
```graphql
query {
  checkAvailability(
    roomId: "1"
    checkIn: "2024-01-15"
    checkOut: "2024-01-20"
  ) {
    available
    conflictingBookings {
      id
      guestName
      checkIn
      checkOut
    }
  }
}
```

### Мутации (Mutations)

#### Создать бронирование
```graphql
mutation {
  createBooking(input: {
    roomId: "1"
    guestName: "Иван Иванов"
    guestEmail: "ivan@example.com"
    checkIn: "2024-01-25"
    checkOut: "2024-01-30"
  }) {
    id
    guestName
    guestEmail
    checkIn
    checkOut
    room {
      id
      number
      type
    }
    isActive
  }
}
```

#### Отменить бронирование
```graphql
mutation {
  cancelBooking(id: "1") {
    id
    isActive
    guestName
  }
}
```

## Валидация

Система проверяет:
- Дата заезда не может быть в прошлом
- Дата выезда должна быть позже даты заезда
- Бронирование не может превышать 365 дней
- Конфликты с существующими активными бронированиями
- Существование номера и отеля

## Обработка ошибок

API возвращает следующие типы ошибок через `extensions.code`:
- `VALIDATION_ERROR` - ошибки валидации данных (некорректные даты, диапазон превышает 365 дней и т.д.)
- `CONFLICT_ERROR` - конфликты (номер уже занят на указанные даты, попытка отменить уже отмененное бронирование)
- `NOT_FOUND` - ресурс не найден (отель, номер или бронирование с указанным ID не существует)

Формат ошибки:
```json
{
  "errors": [{
    "message": "Номер недоступен на указанные даты...",
    "extensions": {
      "code": "CONFLICT_ERROR"
    }
  }]
}
```

## Логирование

Все ключевые операции логируются с использованием Winston:
- Создание бронирования (с входными данными)
- Отмена бронирования
- Ошибки валидации и конфликты
- Инициализация базы данных
- Запуск сервера

Логи сохраняются в файлы:
- `error.log` - только ошибки
- `combined.log` - все логи
- Консоль - форматированный цветной вывод с timestamp

Уровень логирования настраивается через переменную окружения `LOG_LEVEL` (по умолчанию: `info`).

## Примеры использования

### Проверка доступности перед бронированием

```graphql
# 1. Проверить доступность
query {
  checkAvailability(
    roomId: "1"
    checkIn: "2024-01-15"
    checkOut: "2024-01-20"
  ) {
    available
    conflictingBookings {
      id
      guestName
      checkIn
      checkOut
    }
  }
}

# 2. Если available = true, создать бронирование
mutation {
  createBooking(input: {
    roomId: "1"
    guestName: "Тестовый Гость"
    guestEmail: "test@example.com"
    checkIn: "2024-01-15"
    checkOut: "2024-01-20"
  }) {
    id
    guestName
  }
}
```

### Демонстрация конфликтов

В seed данных создаются конфликтующие бронирования для первого номера отеля "Гранд Отель":
- Бронирование Иван Иванов: с +2 до +5 дней от текущей даты
- Бронирование Петр Петров: с +4 до +7 дней от текущей даты

Эти бронирования перекрываются (4-5 дни), поэтому попытка создать новое бронирование на даты с 2 по 7 день вернет ошибку `CONFLICT_ERROR`.

### Получение всех бронирований отеля

```graphql
query {
  hotel(id: "1") {
    name
    rooms {
      id
      number
      bookings {
        id
        guestName
        checkIn
        checkOut
        isActive
      }
    }
  }
}
```

## Переменные окружения

Создайте файл `.env` в корне проекта (опционально):

```env
PORT=4001
DATABASE_PATH=./hotel_booking.db
LOG_LEVEL=info
```

## Устранение проблем

### Порт уже занят (EADDRINUSE)

Если получаете ошибку `EADDRINUSE: address already in use :::4001`:

1. Найдите процесс, занимающий порт:
   ```powershell
   netstat -ano | findstr :4001
   ```

2. Завершите процесс по PID:
   ```powershell
   taskkill /PID <PID> /F
   ```

3. Или измените порт через переменную окружения `PORT`.

### База данных не создается

Убедитесь, что у приложения есть права на запись в директорию проекта (для создания файла `hotel_booking.db`).

## Лицензия

ISC
