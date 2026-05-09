export class TimeUtils {
  static formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  static formatDate(timestamp: number): string {
    const d = new Date(timestamp);
    return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`;
  }

  static formatDateTime(timestamp: number): string {
    const d = new Date(timestamp);
    return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
  }

  static isNewDay(lastTimestamp: number): boolean {
    return this.formatDate(lastTimestamp) !== this.formatDate(Date.now());
  }

  static getTodayDateString(): string {
    return this.formatDate(Date.now());
  }

  static secondsSince(timestamp: number): number {
    return (Date.now() - timestamp) / 1000;
  }

  static hoursSince(timestamp: number): number {
    return this.secondsSince(timestamp) / 3600;
  }
}
