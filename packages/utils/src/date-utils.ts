export const dateUtils = {
  /**
   * Format date as YYYY-MM-DD
   */
  format(date: Date, format = 'YYYY-MM-DD'): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());

    if (format === 'YYYY-MM-DD') {
      return `${year}-${month}-${day}`;
    }

    return `${year}-${month}-${day}`;
  },

  /**
   * Check if date is in the past
   */
  isPast(date: Date): boolean {
    return date.getTime() < Date.now();
  },

  /**
   * Check if date is today
   */
  isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  },

  /**
   * Get days until date
   */
  daysUntil(date: Date): number {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  },
};
