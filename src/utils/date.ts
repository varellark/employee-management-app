import moment from 'moment';
import 'moment/locale/id';

moment.updateLocale('id', {
  months: [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ],
  monthsShort: [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
  ],
  weekdays: ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
  weekdaysShort: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'],
});

export const dateFormat = (date: string | Date, format: string) => {
  return moment(date).format(format);
};

export const dateNow = (format = 'YYYY-MM-DD') => {
  return moment.utc().format(format);
};

export const yearNow = (format = 'YYYY') => {
  return moment.utc().format(format);
};
