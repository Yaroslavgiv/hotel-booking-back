import { validateDateRange } from '../../utils/dateValidator';
import { ValidationError } from '../../utils/errors';

describe('dateValidator', () => {
  describe('validateDateRange', () => {
    it('должен пройти валидацию для корректных дат', () => {
      const today = new Date();
      const checkIn = new Date(today);
      checkIn.setDate(today.getDate() + 1);
      const checkOut = new Date(today);
      checkOut.setDate(today.getDate() + 5);

      expect(() => validateDateRange(checkIn, checkOut)).not.toThrow();
    });

    it('должен выбросить ошибку, если дата заезда в прошлом', () => {
      const today = new Date();
      const checkIn = new Date(today);
      checkIn.setDate(today.getDate() - 1);
      const checkOut = new Date(today);
      checkOut.setDate(today.getDate() + 5);

      expect(() => validateDateRange(checkIn, checkOut)).toThrow(ValidationError);
      expect(() => validateDateRange(checkIn, checkOut)).toThrow('Дата заезда не может быть в прошлом');
    });

    it('должен выбросить ошибку, если дата выезда раньше или равна дате заезда', () => {
      const today = new Date();
      const checkIn = new Date(today);
      checkIn.setDate(today.getDate() + 1);
      const checkOut = new Date(checkIn);

      expect(() => validateDateRange(checkIn, checkOut)).toThrow(ValidationError);
      expect(() => validateDateRange(checkIn, checkOut)).toThrow('Дата выезда должна быть позже даты заезда');
    });

    it('должен выбросить ошибку, если период бронирования превышает 365 дней', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const checkIn = new Date(today);
      checkIn.setDate(today.getDate() + 1);
      checkIn.setHours(0, 0, 0, 0);
      const checkOut = new Date(checkIn);
      checkOut.setDate(checkIn.getDate() + 366); // 366 дней от checkIn
      checkOut.setHours(0, 0, 0, 0);

      expect(() => validateDateRange(checkIn, checkOut)).toThrow(ValidationError);
      expect(() => validateDateRange(checkIn, checkOut)).toThrow('Бронирование не может превышать 365 дней');
    });

    it('должен принять период ровно 365 дней', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const checkIn = new Date(today);
      checkIn.setDate(today.getDate() + 1);
      checkIn.setHours(0, 0, 0, 0);
      const checkOut = new Date(checkIn);
      checkOut.setDate(checkIn.getDate() + 365); // ровно 365 дней от checkIn
      checkOut.setHours(0, 0, 0, 0);

      expect(() => validateDateRange(checkIn, checkOut)).not.toThrow();
    });

    it('должен выбросить ошибку для некорректного формата даты', () => {
      const invalidDate = new Date('invalid');
      const validDate = new Date();
      validDate.setDate(validDate.getDate() + 5);

      expect(() => validateDateRange(invalidDate, validDate)).toThrow(ValidationError);
      expect(() => validateDateRange(validDate, invalidDate)).toThrow(ValidationError);
    });

    it('должен принять дату заезда равную сегодняшней', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const checkOut = new Date(today);
      checkOut.setDate(today.getDate() + 5);
      checkOut.setHours(23, 59, 59, 999);

      expect(() => validateDateRange(today, checkOut)).not.toThrow();
    });
  });
});
