export class DateTimeHelper {
  static formatDate(date: string | null | undefined): string {
    if (!date) return '-';

    const parsed = new Date(`${date}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return date;

    return parsed.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

  static formatTime(time: string | null | undefined): string {
    if (!time) return '-';

    const [hours = '00', minutes = '00'] = time.split(':');
    return `${hours}:${minutes}`;
  }

  static formatDateTimeRange(date: string, start: string, end: string): string {
    return `${this.formatDate(date)} · ${this.formatTime(start)} - ${this.formatTime(end)}`;
  }

  static isPastDate(date: string): boolean {
    const today = new Date();
    const target = new Date(`${date}T00:00:00`);

    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);

    return target < today;
  }
}
