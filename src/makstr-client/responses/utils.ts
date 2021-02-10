import moment from 'moment';

export function dateStringToDate(date: string) {
  const dateRegex = /\/Date\((-?\d*\))/i;
  return moment(parseInt(date.match(dateRegex)![1]));
}
