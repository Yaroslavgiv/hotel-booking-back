import { ValidationError } from './errors';

export function validateDateRange(checkIn: Date, checkOut: Date): void {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const checkInDate = new Date(checkIn);
  checkInDate.setHours(0, 0, 0, 0);

  const checkOutDate = new Date(checkOut);
  checkOutDate.setHours(0, 0, 0, 0);

  if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
    throw new ValidationError('Некорректный формат даты');
  }

  if (checkInDate < today) {
    throw new ValidationError('Дата заезда не может быть в прошлом');
  }

  if (checkOutDate <= checkInDate) {
    throw new ValidationError('Дата выезда должна быть позже даты заезда');
  }

  const daysDiff = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
  if (daysDiff > 365) {
    throw new ValidationError('Бронирование не может превышать 365 дней');
  }
}
