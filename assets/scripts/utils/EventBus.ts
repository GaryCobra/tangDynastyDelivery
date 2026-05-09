type EventHandler = (...args: any[]) => void;

export class EventBus {
  private static handlers: Map<string, Set<EventHandler>> = new Map();
  private static onceHandlers: Map<string, Set<EventHandler>> = new Map();

  static on(event: string, handler: EventHandler): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
  }

  static off(event: string, handler: EventHandler): void {
    this.handlers.get(event)?.delete(handler);
    this.onceHandlers.get(event)?.delete(handler);
  }

  static once(event: string, handler: EventHandler): void {
    if (!this.onceHandlers.has(event)) {
      this.onceHandlers.set(event, new Set());
    }
    this.onceHandlers.get(event)!.add(handler);
  }

  static emit(event: string, ...args: any[]): void {
    this.handlers.get(event)?.forEach(handler => {
      try { handler(...args); } catch (e) { console.error(e); }
    });
    this.onceHandlers.get(event)?.forEach(handler => {
      try { handler(...args); } catch (e) { console.error(e); }
    });
    this.onceHandlers.delete(event);
  }

  static removeAll(event?: string): void {
    if (event) {
      this.handlers.delete(event);
      this.onceHandlers.delete(event);
    } else {
      this.handlers.clear();
      this.onceHandlers.clear();
    }
  }
}
