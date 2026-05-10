import { parse } from 'date-fns';

export function parseDDMMYYYY(dateStr: string): Date {
  return parse(dateStr, 'dd/MM/yyyy', new Date());
}
