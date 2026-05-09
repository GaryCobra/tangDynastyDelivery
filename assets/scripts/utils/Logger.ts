export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export class Logger {
  private static level: LogLevel = LogLevel.DEBUG;
  private static prefix = '[大唐外卖]';

  static setLevel(level: LogLevel): void {
    this.level = level;
  }

  static debug(tag: string, msg: string, ...args: any[]): void {
    if (this.level <= LogLevel.DEBUG) {
      console.log(`${this.prefix}[${tag}] ${msg}`, ...args);
    }
  }

  static info(tag: string, msg: string, ...args: any[]): void {
    if (this.level <= LogLevel.INFO) {
      console.log(`${this.prefix}[${tag}] ${msg}`, ...args);
    }
  }

  static warn(tag: string, msg: string, ...args: any[]): void {
    if (this.level <= LogLevel.WARN) {
      console.warn(`${this.prefix}[${tag}] ${msg}`, ...args);
    }
  }

  static error(tag: string, msg: string, ...args: any[]): void {
    if (this.level <= LogLevel.ERROR) {
      console.error(`${this.prefix}[${tag}] ${msg}`, ...args);
    }
  }
}
