import { AppDataSource } from './dataSource';
import { Hotel } from '../models/Hotel';
import { Room } from '../models/Room';
import { Booking } from '../models/Booking';
import { logger } from '../utils/logger';

// Функция сидирования предполагает, что соединение уже инициализировано снаружи
export async function seed() {
  try {
    const hotelRepository = AppDataSource.getRepository(Hotel);
    const roomRepository = AppDataSource.getRepository(Room);
    const bookingRepository = AppDataSource.getRepository(Booking);

    // Очистка существующих данных (полное удаление содержимого таблиц)
    await bookingRepository.clear();
    await roomRepository.clear();
    await hotelRepository.clear();

    // Создание отелей
    const hotel1 = hotelRepository.create({
      name: 'Гранд Отель',
      address: 'Москва, ул. Тверская, д. 1',
      description: 'Роскошный отель в центре Москвы',
    });

    const hotel2 = hotelRepository.create({
      name: 'Морской Бриз',
      address: 'Санкт-Петербург, Невский проспект, д. 28',
      description: 'Современный отель с видом на Неву',
    });

    const savedHotel1 = await hotelRepository.save(hotel1);
    const savedHotel2 = await hotelRepository.save(hotel2);

    logger.info('Отели созданы', { hotel1: savedHotel1.id, hotel2: savedHotel2.id });

    // Создание номеров для первого отеля
    const rooms1 = [
      roomRepository.create({
        number: '101',
        type: 'Стандарт',
        price: 3000,
        hotelId: savedHotel1.id,
      }),
      roomRepository.create({
        number: '102',
        type: 'Стандарт',
        price: 3000,
        hotelId: savedHotel1.id,
      }),
      roomRepository.create({
        number: '201',
        type: 'Люкс',
        price: 8000,
        hotelId: savedHotel1.id,
      }),
      roomRepository.create({
        number: '202',
        type: 'Люкс',
        price: 8000,
        hotelId: savedHotel1.id,
      }),
    ];

    // Создание номеров для второго отеля
    const rooms2 = [
      roomRepository.create({
        number: '301',
        type: 'Эконом',
        price: 2000,
        hotelId: savedHotel2.id,
      }),
      roomRepository.create({
        number: '302',
        type: 'Эконом',
        price: 2000,
        hotelId: savedHotel2.id,
      }),
      roomRepository.create({
        number: '401',
        type: 'Премиум',
        price: 10000,
        hotelId: savedHotel2.id,
      }),
    ];

    const allRooms = [...rooms1, ...rooms2];
    const savedRooms = await roomRepository.save(allRooms);

    logger.info('Номера созданы', { count: savedRooms.length });

    // Создание бронирований для демонстрации конфликтов
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const bookings = [
      // Активное бронирование на ближайшие даты (конфликт)
      bookingRepository.create({
        guestName: 'Иван Иванов',
        guestEmail: 'ivan@example.com',
        checkIn: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000), // +2 дня
        checkOut: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000), // +5 дней
        roomId: savedRooms[0].id,
        isActive: true,
      }),
      // Активное бронирование на другие даты (конфликт)
      bookingRepository.create({
        guestName: 'Петр Петров',
        guestEmail: 'petr@example.com',
        checkIn: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000), // +4 дня
        checkOut: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000), // +7 дней
        roomId: savedRooms[0].id,
        isActive: true,
      }),
      // Бронирование в другом номере (без конфликта)
      bookingRepository.create({
        guestName: 'Мария Сидорова',
        guestEmail: 'maria@example.com',
        checkIn: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000), // +3 дня
        checkOut: new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000), // +6 дней
        roomId: savedRooms[1].id,
        isActive: true,
      }),
      // Отмененное бронирование (не должно создавать конфликты)
      bookingRepository.create({
        guestName: 'Анна Смирнова',
        guestEmail: 'anna@example.com',
        checkIn: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000), // +1 день
        checkOut: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000), // +3 дня
        roomId: savedRooms[2].id,
        isActive: false,
      }),
      // Бронирование в будущем
      bookingRepository.create({
        guestName: 'Дмитрий Козлов',
        guestEmail: 'dmitry@example.com',
        checkIn: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000), // +30 дней
        checkOut: new Date(today.getTime() + 35 * 24 * 60 * 60 * 1000), // +35 дней
        roomId: savedRooms[3].id,
        isActive: true,
      }),
    ];

    const savedBookings = await bookingRepository.save(bookings);

    logger.info('Бронирования созданы', { count: savedBookings.length });
    logger.info('Seed данных завершен успешно');
  } catch (error) {
    logger.error('Ошибка при выполнении seed', error);
    throw error;
  }
}

// Для запуска seed отдельно (из CLI) инициализируем и закрываем соединение здесь
if (require.main === module) {
  AppDataSource.initialize()
    .then(async () => {
      logger.info('База данных инициализирована (standalone seed)');
      await seed();
      await AppDataSource.destroy();
      process.exit(0);
    })
    .catch(async (error) => {
      console.error(error);
      if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
      }
      process.exit(1);
    });
}
