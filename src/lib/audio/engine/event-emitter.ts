import type { EventCallback } from "@/types/audio";

export class EventEmitter {
  private events: { [key: string]: EventCallback[] } = {};

  on(event: string, callback: EventCallback): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  off(event: string, callback: EventCallback): void {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }

  emit(event: string, ...args: any[]): void {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => callback(...args));
  }

  removeAllListeners(): void {
    this.events = {};
  }
} 